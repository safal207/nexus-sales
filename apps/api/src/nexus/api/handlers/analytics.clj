(ns nexus.api.handlers.analytics
  (:require [cheshire.core :as json]
            [clojure.string :as str]
            [nexus.api.ai.queue :as ai-queue]
            [nexus.api.db.core :as db]))

(def ^:private positive-emotions
  #{"joy" "trust" "anticipation" "excitement" "surprise" "gratitude" "love" "calm"})

(def ^:private negative-emotions
  #{"fear" "anger" "sadness" "disgust" "frustration" "anxiety" "stress"})

(defn- parse-json [value]
  (when (and value (not (str/blank? value)))
    (json/parse-string value true)))

(defn- fetch-event-counts []
  (->> (db/query "SELECT name, COUNT(*) AS count FROM events GROUP BY name")
       (reduce (fn [acc {:keys [name count]}]
                 (assoc acc name (long count)))
               {})))

(defn- fetch-revenue []
  (let [row (first (db/query "SELECT SUM(p.price) AS revenue
                               FROM orders o
                               JOIN products p ON o.product_id = p.id
                               WHERE o.status IN ('created', 'paid', 'completed')"))]
    (double (or (:revenue row) 0.0))))

(defn- parse-insight-row [{:keys [id job_id source content labels_json metadata_json created_at updated_at]}]
  (let [labels (or (parse-json labels_json) [])
        metadata (or (parse-json metadata_json) {})
        dominant (first (sort-by (comp - :score) labels))]
    {:id id
     :job-id job_id
     :source source
     :content content
     :labels labels
     :dominant (or dominant {:label "unknown" :score 0.0})
     :metadata metadata
     :created-at created_at
     :updated-at updated_at}))

(defn- aggregate-labels [insights]
  (let [all-labels (mapcat :labels insights)
        grouped (group-by :label all-labels)]
    (->> grouped
         (map (fn [[label entries]]
                {:label label
                 :count (count entries)
                 :average-score (double (/ (reduce + (map :score entries)) (max 1 (count entries))))}))
         (sort-by :count >))))

(defn- build-conversion-triggers [label-stats]
  (->> label-stats
       (filter (comp positive-emotions :label))
       (map (fn [{:keys [label count average-score]}]
              {:emotion label
               :conversions count
               :average_score (double average-score)}))
       (take 5)))

(defn- build-emotional-blockers [label-stats]
  (->> label-stats
       (filter (comp negative-emotions :label))
       (map (fn [{:keys [label count average-score]}]
              {:emotion label
               :exits count
               :average_score (double average-score)}))
       (take 5)))

(defn- fetch-successful-sequences []
  (let [rows (db/query "SELECT session_id, name, ts FROM events WHERE session_id IS NOT NULL AND session_id != '' ORDER BY session_id, ts")
        grouped (->> rows
                     (remove #(str/blank? (:session_id %)))
                     (group-by :session_id))
        sequences (->> grouped
                       (map (fn [[_ events]]
                              (let [ordered (sort-by :ts events)
                                    labels (map (comp str/lower-case str :name) ordered)]
                                (when (some #{"checkout_success"} labels)
                                  (vec labels)))))
                       (remove nil?))
        total (double (count sequences))
        frequencies (frequencies sequences)]
    (->> frequencies
         (sort-by val >)
         (map (fn [[sequence cnt]]
                {:sequence sequence
                 :success_rate (if (pos? total) (/ cnt total) 0.0)
                 :count cnt}))
         (take 5))))

(defn- ensure-product-insights! []
  (let [products (db/query "SELECT id, title, description FROM products WHERE description IS NOT NULL AND description != ''")
        existing (->> (db/query "SELECT metadata_json FROM emotion_insights WHERE source = 'product:description'")
                      (map parse-json)
                      (keep (fn [metadata]
                              (when-let [pid (:product_id metadata)]
                                [pid (:field metadata)])))
                      set)
        pending (->> (db/query "SELECT payload FROM ai_jobs WHERE kind = 'emotion-analysis' AND status IN ('pending', 'processing', 'retrying')")
                     (map parse-json)
                     (keep (fn [payload]
                             (when-let [pid (get-in payload [:metadata :product_id])]
                               [pid (get-in payload [:metadata :field])])))
                     set)]
    (reduce (fn [scheduled {:keys [id title description]}]
              (let [key [id "description"]]
                (if (or (contains? existing key)
                        (contains? pending key)
                        (str/blank? (str description)))
                  scheduled
                  (try
                    (ai-queue/enqueue-analysis!
                     {:text description
                      :source "product:description"
                      :metadata {:product_id id
                                 :product_title title
                                 :field "description"
                                 :queued_via "analytics.ensure-product-insights"}})
                    (inc scheduled)
                    (catch Exception _ scheduled)))))
            0
            products)))

(defn get-insights [_]
  (let [scheduled (ensure-product-insights!)
        event-counts (fetch-event-counts)
        checkout-start (double (get event-counts "checkout_start" 0))
        checkout-success (double (get event-counts "checkout_success" 0))
        conversion-rate (if (pos? checkout-start)
                          (/ checkout-success checkout-start)
                          0.0)
        orders-total (long (or (:count (first (db/query "SELECT COUNT(*) AS count FROM orders"))) 0))
        revenue (fetch-revenue)
        insights-raw (map parse-insight-row
                          (db/query "SELECT id, job_id, source, content, labels_json, metadata_json, created_at, updated_at
                                      FROM emotion_insights ORDER BY created_at DESC LIMIT 50"))
        label-stats (aggregate-labels insights-raw)
        conversion-triggers (build-conversion-triggers label-stats)
        emotional-blockers (build-emotional-blockers label-stats)
        sequences (fetch-successful-sequences)
        pending (ai-queue/pending-count)
        jobs (ai-queue/jobs-summary)
        recent (->> insights-raw
                    (take 5)
                    (map (fn [{:keys [id source dominant content created-at metadata]}]
                           {:id id
                            :source source
                            :dominant (:label dominant)
                            :confidence (:score dominant)
                            :content (let [txt (or content "")]
                                       (if (> (count txt) 180)
                                         (str (subs txt 0 177) "...")
                                         txt))
                            :metadata metadata
                            :created_at created-at}))))
    {:status 200
     :body {:success true
            :insights {:conversion_triggers conversion-triggers
                       :emotional_blockers emotional-blockers
                       :optimal_sequences sequences
                       :kpis {:page_views (long (get event-counts "page_view" 0))
                              :leads (long (get event-counts "form_submit" 0))
                              :checkout_start checkout-start
                              :checkout_success checkout-success
                              :conversion_rate conversion-rate
                              :orders orders-total
                              :revenue revenue
                              :average_order_value (if (pos? orders-total)
                                                     (/ revenue (double orders-total))
                                                     0.0)
                              :pending_ai_jobs pending
                              :scheduled_during_request scheduled}
                       :emotion_summary {:distribution label-stats
                                         :top_positive (take 3 conversion-triggers)
                                         :top_negative (take 3 emotional-blockers)}
                       :recent_insights recent
                       :jobs jobs}
            :queued_jobs scheduled}}))

