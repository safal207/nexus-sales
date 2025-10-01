(ns nexus.api.ai.huggingface
  (:require [cheshire.core :as json]
            [clj-http.client :as http]
            [clojure.string :as str])
  (:import [java.time Instant]))

(def ^:private default-model "cardiffnlp/twitter-roberta-base-emotion")

(defn- now [] (str (Instant/now)))

(defn- normalize-labels [predictions]
  (->> predictions
       (map (fn [{:keys [label score]}]
              {:label (-> label (or "unknown") (str/replace #"^label_" ""))
               :score (double (or score 0.0))}))
       (sort-by :score >)))

(defn- heuristic-analysis [text provider-tag metadata]
  (let [terms {:joy ["joy" "happy" "delight" "smile" "grateful" "uplift"]
               :trust ["trust" "safe" "reliable" "support" "guided" "mindful"]
               :anticipation ["soon" "ready" "journey" "transformation" "discover"]
               :fear ["fear" "worry" "anxious" "risk" "concern"]
               :sadness ["sad" "tired" "stuck" "alone" "struggle"]
               :anger ["angry" "frustrated" "hate" "upset"]
               :disgust ["disgust" "avoid" "toxic" "negative"]}
        lowered (str/lower-case (or text ""))
        counts (reduce-kv (fn [acc emotion words]
                            (assoc acc emotion
                                   (reduce (fn [n term]
                                             (+ n (if (str/includes? lowered term) 1 0)))
                                           0
                                           words)))
                          {}
                          terms)
        total (double (max 1 (reduce + (vals counts))))
        labels (->> counts
                    (map (fn [[emotion cnt]]
                           {:label (name emotion)
                            :score (/ cnt total)}))
                    (sort-by :score >)
                    (map (fn [{:keys [label score]}]
                           {:label label
                            :score (double score)}))
                    (map-indexed (fn [idx {:keys [label score]}]
                                   {:label label
                                    :score (if (zero? (reduce + (vals counts)))
                                             (double (/ 1.0 (count terms)))
                                             score)
                                    :rank (inc idx)})))]
    {:provider provider-tag
     :model default-model
     :labels (map #(dissoc % :rank) labels)
     :dominant-label (:label (first labels))
     :confidence (:score (first labels))
     :metadata metadata
     :processed-at (now)
     :strategy "heuristic"}))

(defn analyze-text
  "Run emotion analysis against Hugging Face Inference API.
   Falls back to heuristic scoring when the API token is missing or the call fails."
  [{:keys [text model metadata] :as payload}]
  (when (str/blank? (str text))
    (throw (ex-info "text is required for analysis" {:payload payload})))
  (let [model-id (or model (System/getenv "HF_MODEL_ID") default-model)
        token (some-> (System/getenv "HF_TOKEN") str/trim not-empty)
        base-request {:headers {"Content-Type" "application/json"
                                "User-Agent" "nexus-api/ai-integrator"}
                      :body (json/generate-string {:inputs text})
                      :socket-timeout 15000
                      :conn-timeout 10000
                      :as :string}]
    (if token
      (try
        (let [response (http/post (str "https://api-inference.huggingface.co/models/" model-id)
                                  (assoc-in base-request [:headers "Authorization"]
                                            (str "Bearer " token)))
              parsed (json/parse-string (:body response) true)
              predictions (cond
                             (vector? parsed)
                             (let [first-item (first parsed)]
                               (cond
                                 (map? first-item) parsed
                                 (vector? first-item) first-item
                                 :else []))
                             (map? parsed) [parsed]
                             :else [])
              labels (normalize-labels predictions)
              dominant (first labels)]
          {:provider "huggingface"
           :model model-id
           :labels labels
           :dominant-label (:label dominant "unknown")
           :confidence (:score dominant 0.0)
           :metadata metadata
           :processed-at (now)
           :strategy "api"})
        (catch Exception ex
          (let [fallback (heuristic-analysis text "huggingface-fallback" metadata)]
            (assoc fallback :error (ex-message ex)))))
      (heuristic-analysis text "heuristic-offline" metadata))))

