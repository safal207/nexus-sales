(ns nexus.api.handlers.emotions
  (:require [nexus.api.neo4j.core :as neo4j]
            [nexus.api.datomic.core :as datomic]
            [cheshire.core :as json]
            [clojure.string :as str]))

;; Real-time emotion tracking
(defn track-emotion [{:keys [body-params claims]}]
  (let [user-id (:sub claims)
        {:keys [type intensity confidence metadata action]} body-params
        
        ;; Validate emotion data
        valid-emotions #{"joy" "sadness" "fear" "anger" "surprise" "disgust" "trust"}
        emotion-data {:type (keyword type)
                      :intensity (double intensity)
                      :confidence (double confidence)
                      :timestamp (java.time.Instant/now)
                      :user-id user-id
                      :metadata metadata
                      :action action}]
    
    (if (and (contains? valid-emotions type)
             (>= intensity 0.0)
             (<= intensity 1.0)
             (>= confidence 0.0)
             (<= confidence 1.0))
      
      (try
        ;; Save to Neo4j for graph analysis
        (neo4j/track-user-emotion user-id emotion-data)
        
        ;; Save to Datomic for temporal analysis
        (datomic/create-emotion! emotion-data)
        
        ;; Predict purchase likelihood
        (let [prediction (neo4j/predict-purchase-likelihood user-id emotion-data)]
          {:status 200
           :body {:success true
                  :emotion-tracked true
                  :prediction prediction
                  :timestamp (java.time.Instant/now)}})
        
        (catch Exception e
          {:status 500
           :body {:success false
                  :message "Failed to track emotion"
                  :error (.getMessage e)}}))
      
      {:status 400
       :body {:success false
              :message "Invalid emotion data. Type must be one of: joy, sadness, fear, anger, surprise, disgust, trust. Intensity and confidence must be between 0.0 and 1.0"}})))

;; Get user's emotional journey
(defn get-emotional-journey [{:keys [path-params claims query-params]}]
  (let [user-id (:sub claims)
        product-id (:product-id query-params)
        hours-back (or (Integer/parseInt (:hours-back query-params "24")) 24)]
    
    (try
      (let [;; Get journey from Neo4j
            neo4j-journey (neo4j/get-emotional-journey user-id product-id)
            
            ;; Get temporal data from Datomic
            datomic-sequence (datomic/emotion-sequence-before-purchase user-id hours-back)
            
            ;; Combine and analyze
            journey-data {:neo4j-journey neo4j-journey
                          :temporal-sequence datomic-sequence
                          :analysis (analyze-emotional-journey neo4j-journey datomic-sequence)}]
        
        {:status 200
         :body {:success true
                :journey journey-data
                :user-id user-id
                :product-id product-id}})
      
      (catch Exception e
        {:status 500
         :body {:success false
                :message "Failed to get emotional journey"
                :error (.getMessage e)}}))))

;; Get emotional patterns for consciousness level
(defn get-emotional-patterns [{:keys [query-params]}]
  (let [consciousness-level (keyword (:consciousness-level query-params))]
    
    (try
      (let [neo4j-patterns (neo4j/get-emotional-patterns consciousness-level)
            datomic-patterns (datomic/successful-purchase-patterns consciousness-level)
            timing-analysis (datomic/optimal-purchase-timing consciousness-level)]
        
        {:status 200
         :body {:success true
                :patterns {:neo4j neo4j-patterns
                           :datomic datomic-patterns
                           :timing timing-analysis}
                :consciousness-level consciousness-level}})
      
      (catch Exception e
        {:status 500
         :body {:success false
                :message "Failed to get emotional patterns"
                :error (.getMessage e)}}))))

;; Get conversion triggers and blockers
(defn get-conversion-insights []
  (try
    (let [conversion-triggers (neo4j/get-conversion-triggers)
          emotional-blockers (neo4j/get-emotional-blockers)
          optimal-sequences (neo4j/get-optimal-emotional-sequence)
          funnel-analysis (datomic/conversion-funnel-analysis)
          cohort-analysis (datomic/emotional-cohort-analysis)]
      
      {:status 200
       :body {:success true
              :insights {:conversion-triggers conversion-triggers
                         :emotional-blockers emotional-blockers
                         :optimal-sequences optimal-sequences
                         :funnel-analysis funnel-analysis
                         :cohort-analysis cohort-analysis}}})
    
    (catch Exception e
      {:status 500
       :body {:success false
              :message "Failed to get conversion insights"
              :error (.getMessage e)}})))

;; Predictive analytics
(defn predict-purchase [{:keys [body-params claims]}]
  (let [user-id (:sub claims)
        current-emotion (:current-emotion body-params)]
    
    (try
      (let [neo4j-prediction (neo4j/predict-purchase-likelihood user-id current-emotion)
            datomic-prediction (datomic/predictive-purchase-model user-id current-emotion)
            
            ;; Combine predictions
            combined-prediction {:likelihood (/ (+ (:likelihood neo4j-prediction)
                                                   (:predicted-likelihood datomic-prediction))
                                                2.0)
                                :confidence (/ (+ (:confidence neo4j-prediction)
                                                  (:confidence datomic-prediction))
                                               2.0)
                                :recommended-actions (concat (:recommended_actions neo4j-prediction)
                                                            (:recommendations datomic-prediction))
                                :factors {:neo4j neo4j-prediction
                                         :datomic datomic-prediction}}]
        
        {:status 200
         :body {:success true
                :prediction combined-prediction
                :user-id user-id
                :timestamp (java.time.Instant/now)}})
      
      (catch Exception e
        {:status 500
         :body {:success false
                :message "Failed to predict purchase"
                :error (.getMessage e)}}))))

;; Dashboard analytics
(defn get-dashboard-analytics [{:keys [query-params]}]
  (let [timeframe (or (:timeframe query-params) "7d")
        consciousness-level (keyword (:consciousness-level query-params))]
    
    (try
      (let [neo4j-metrics (neo4j/get-dashboard-metrics)
            datomic-metrics (datomic/get-dashboard-metrics)
            seasonal-data (datomic/seasonal-emotion-analysis)
            
            ;; Combine metrics
            combined-metrics {:overview {:total-users (:total-users datomic-metrics)
                                        :total-emotions (:total-emotions datomic-metrics)
                                        :total-purchases (:total-purchases datomic-metrics)}
                             :conversion-rates (:conversion-rates datomic-metrics)
                             :seasonal-patterns seasonal-data
                             :neo4j-insights neo4j-metrics
                             :last-updated (:last-updated datomic-metrics)}}]
        
        {:status 200
         :body {:success true
                :analytics combined-metrics
                :timeframe timeframe
                :consciousness-level consciousness-level}})
      
      (catch Exception e
        {:status 500
         :body {:success false
                :message "Failed to get dashboard analytics"
                :error (.getMessage e)}}))))

;; Export emotional data
(defn export-emotional-data [{:keys [query-params claims]}]
  (let [user-id (:sub claims)
        start-date (or (:start-date query-params) 
                       (str (- (java.time.Instant/now) (* 30 24 60 60 1000))))
        end-date (or (:end-date query-params) 
                     (str (java.time.Instant/now)))
        format (or (:format query-params) "json")]
    
    (try
      (let [exported-data (datomic/export-emotional-data 
                           (java.time.Instant/parse start-date)
                           (java.time.Instant/parse end-date))]
        
        (case format
          "json" {:status 200
                  :headers {"Content-Type" "application/json"}
                  :body (json/generate-string {:success true
                                               :data exported-data
                                               :user-id user-id
                                               :start-date start-date
                                               :end-date end-date})}
          
          "csv" (let [csv-data (convert-to-csv exported-data)]
                  {:status 200
                   :headers {"Content-Type" "text/csv"
                            "Content-Disposition" (str "attachment; filename=emotional-data-" user-id ".csv")}
                   :body csv-data})
          
          {:status 400
           :body {:success false
                  :message "Invalid format. Supported formats: json, csv"}}))
      
      (catch Exception e
        {:status 500
         :body {:success false
                :message "Failed to export emotional data"
                :error (.getMessage e)}}))))

;; Helper functions
(defn analyze-emotional-journey [neo4j-journey datomic-sequence]
  (let [emotion-counts (frequencies (map :emotion neo4j-journey))
        intensity-avg (if (seq neo4j-journey)
                        (/ (reduce + (map :intensity neo4j-journey))
                           (count neo4j-journey))
                        0.0)
        
        ;; Analyze temporal patterns
        temporal-patterns (group-by :emotion-type datomic-sequence)
        
        ;; Calculate emotional progression
        progression (if (> (count neo4j-journey) 1)
                      (let [first-emotion (first neo4j-journey)
                            last-emotion (last neo4j-journey)]
                        {:from (:type first-emotion)
                         :to (:type last-emotion)
                         :intensity-change (- (:intensity last-emotion) (:intensity first-emotion))})
                      {:from "unknown" :to "unknown" :intensity-change 0.0})]
    
    {:emotion-distribution emotion-counts
     :average-intensity intensity-avg
     :temporal-patterns temporal-patterns
     :emotional-progression progression
     :journey-length (count neo4j-journey)}))

(defn convert-to-csv [data]
  (let [headers ["user-id" "emotion-type" "intensity" "confidence" "timestamp" "action-type"]
        rows (map (fn [[user-id emotion-type intensity confidence timestamp action-type]]
                    [user-id emotion-type intensity confidence timestamp action-type])
                  data)]
    (str (str/join "," headers) "\n"
         (str/join "\n" (map #(str/join "," %) rows)))))

;; Real-time emotion streaming
(defn stream-emotions [{:keys [query-params]}]
  (let [user-id (:user-id query-params)
        consciousness-level (keyword (:consciousness-level query-params))]
    
    ;; This would typically use WebSocket or Server-Sent Events
    {:status 200
     :headers {"Content-Type" "text/event-stream"
              "Cache-Control" "no-cache"
              "Connection" "keep-alive"}
     :body (str "data: " (json/generate-string {:type "connection"
                                               :message "Emotion stream started"
                                               :timestamp (java.time.Instant/now)}) "\n\n")}))

;; Emotional health monitoring
(defn get-emotional-health [{:keys [query-params claims]}]
  (let [user-id (:sub claims)
        days-back (or (Integer/parseInt (:days-back query-params) 7) 7)]
    
    (try
      (let [user-journey (datomic/user-journey-timeline user-id days-back)
            emotional-stats (calculate-emotional-health user-journey)]
        
        {:status 200
         :body {:success true
                :emotional-health emotional-stats
                :user-id user-id
                :period-days days-back}})
      
      (catch Exception e
        {:status 500
         :body {:success false
                :message "Failed to get emotional health"
                :error (.getMessage e)}}))))

(defn calculate-emotional-health [journey]
  (let [emotions (map :event-type journey)
        intensities (map :intensity journey)
        confidences (map :confidence journey)
        
        ;; Calculate health metrics
        positive-emotions #{"joy" "excitement" "trust" "satisfaction"}
        negative-emotions #{"fear" "anger" "sadness" "frustration"}
        
        positive-count (count (filter positive-emotions emotions))
        negative-count (count (filter negative-emotions emotions))
        total-count (count emotions)
        
        emotional-balance (if (> total-count 0)
                           (/ (- positive-count negative-count) total-count)
                           0.0)
        
        average-intensity (if (seq intensities)
                           (/ (reduce + intensities) (count intensities))
                           0.0)
        
        average-confidence (if (seq confidences)
                            (/ (reduce + confidences) (count confidences))
                            0.0)
        
        health-score (min 1.0 (max 0.0 
                                 (+ (* emotional-balance 0.4)
                                    (* average-intensity 0.3)
                                    (* average-confidence 0.3))))]
    
    {:health-score health-score
     :emotional-balance emotional-balance
     :average-intensity average-intensity
     :average-confidence average-confidence
     :positive-emotions positive-count
     :negative-emotions negative-count
     :total-events total-count
     :recommendations (generate-health-recommendations health-score emotional-balance)}))

(defn generate-health-recommendations [health-score emotional-balance]
  (cond
    (> health-score 0.8) ["User is in excellent emotional state" "Consider upselling opportunities" "Maintain current approach"]
    (> health-score 0.6) ["User emotional state is good" "Monitor for any changes" "Continue engagement"]
    (> health-score 0.4) ["User shows mixed emotions" "Provide more reassurance" "Address potential concerns"]
    (> health-score 0.2) ["User is experiencing stress" "Offer support and guarantees" "Simplify the process"]
    :else ["User is in distress" "Provide immediate support" "Consider pausing sales efforts"]))
