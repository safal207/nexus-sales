(ns nexus.api.ai.queue
  (:require [cheshire.core :as json]
            [clojure.string :as str]
            [nexus.api.ai.huggingface :as hf]
            [nexus.api.db.core :as db])
  (:import [java.time Instant]
           [java.util.concurrent Executors LinkedBlockingQueue TimeUnit ScheduledExecutorService]))

(def ^:private max-attempts 3)
(def ^:private queue-size 256)

(defonce ^:private job-queue (LinkedBlockingQueue. queue-size))
(defonce ^:private worker-executor (atom nil))
(defonce ^:private scheduler (delay (Executors/newScheduledThreadPool 1)))

(defn- now [] (str (Instant/now)))

(defn- status->pending? [status]
  (contains? #{"pending" "processing" "retrying"} status))

(defn- parse-json-safe [value]
  (when (and value (not (str/blank? value)))
    (json/parse-string value true)))

(defn- persist-job! [{:keys [id kind payload] :as job}]
  (let [job-id (or id (str "job_" (random-uuid)))
        created-at (now)
        payload-json (json/generate-string payload)]
    (db/query "INSERT INTO ai_jobs (id, kind, payload, status, attempts, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
              job-id kind payload-json "pending" 0 created-at created-at)
    (assoc job :id job-id :status "pending" :attempts 0 :created-at created-at :updated-at created-at)))

(defn- update-job-status! [job-id status & [{:keys [attempts result error completed-at]}]]
  (let [updated-at (now)
        result-json (when result (json/generate-string result))]
    (db/query "UPDATE ai_jobs SET status = ?, attempts = COALESCE(?, attempts), result = COALESCE(?, result), error = COALESCE(?, error), updated_at = ?, completed_at = COALESCE(?, completed_at) WHERE id = ?"
              status attempts result-json error updated-at completed-at job-id)
    {:id job-id :status status :attempts attempts :result result :error error :updated-at updated-at}))

(defn- save-insight! [job-id {:keys [text source metadata]} analysis]
  (let [insight-id (str "ins_" (random-uuid))
        created-at (now)
        labels-json (json/generate-string (:labels analysis))
        metadata-json (json/generate-string (merge {:job_id job-id
                                                    :source source}
                                                   (or metadata {})))]
    (db/query "INSERT INTO emotion_insights (id, job_id, source, content, labels_json, metadata_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
              insight-id job-id (or source "unknown") text labels-json metadata-json created-at created-at)
    insight-id))

(defn- schedule-retry! [{:keys [attempts id] :as job}]
  (let [delay-seconds (long (min 60 (Math/pow 2 attempts)))]
    (.schedule ^ScheduledExecutorService @scheduler
               ^Runnable
               (fn []
                 (update-job-status! id "pending")
                 (.put job-queue job))
               delay-seconds TimeUnit/SECONDS)))

(defn- process-job! [{:keys [id payload attempts] :as job}]
  (let [attempt-number (inc (or attempts 0))]
    (update-job-status! id "processing" {:attempts attempt-number})
    (try
      (let [analysis (hf/analyze-text payload)
            completed-at (now)]
        (update-job-status! id "completed" {:attempts attempt-number
                                             :result analysis
                                             :completed-at completed-at})
        (save-insight! id payload analysis)
        (assoc job :attempts attempt-number :result analysis :status "completed"))
      (catch Exception ex
        (let [error-msg (ex-message ex)
              should-retry (< attempt-number max-attempts)]
          (update-job-status! id (if should-retry "retrying" "failed")
                              {:attempts attempt-number :error error-msg})
          (when should-retry
            (schedule-retry! (assoc job :attempts attempt-number)))
          (assoc job :attempts attempt-number :error error-msg :status (if should-retry "retrying" "failed")))))))

(defn- start-worker! []
  (when-not @worker-executor
    (let [executor (Executors/newSingleThreadExecutor)]
      (.submit executor
               ^Runnable
               (fn []
                 (loop []
                   (when-let [job (.take job-queue)]
                     (process-job! job)
                     (recur)))))
      (reset! worker-executor executor))))

(defn enqueue-analysis!
  "Add a new emotion analysis job to the queue. Returns the persisted job map."
  [{:keys [text] :as payload}]
  (when (str/blank? (str text))
    (throw (ex-info "text is required" {:payload payload})))
  (start-worker!)
  (let [job (persist-job! {:kind "emotion-analysis"
                           :payload payload})]
    (.put job-queue job)
    job))

(defn restore-pending-jobs!
  "Requeue jobs that were pending or retrying before the server restarted."
  []
  (start-worker!)
  (let [rows (db/query "SELECT id, kind, payload, status, attempts FROM ai_jobs WHERE status IN ('pending', 'retrying', 'processing')")]
    (doseq [{:keys [id payload status attempts]} rows]
      (when-let [parsed (parse-json-safe payload)]
        (let [job {:id id
                   :kind "emotion-analysis"
                   :payload parsed
                   :status status
                   :attempts (or attempts 0)}]
          (update-job-status! id "pending")
          (.put job-queue job))))
    (count rows)))

(defn pending-count []
  (->> (db/query "SELECT status, COUNT(*) AS count FROM ai_jobs GROUP BY status")
       (reduce (fn [acc {:keys [status count]}]
                 (if (status->pending? status)
                   (+ acc (long count))
                   acc))
               0)))

(defn jobs-summary []
  (map (fn [{:keys [status count]}]
         {:status status :count (long count)})
       (db/query "SELECT status, COUNT(*) AS count FROM ai_jobs GROUP BY status")))


