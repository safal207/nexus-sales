(ns nexus.api.datomic.core
  (:require [datomic.client.api :as d]
            [clojure.string :as str]
            [cheshire.core :as json]
            [clj-time.core :as t]
            [clj-time.format :as tf]))

;; Datomic connection configuration
(def ^:private datomic-config
  {:server-type :cloud
   :region "us-east-1"
   :system "consciousfunnels"
   :db-name "consciousfunnels"
   :endpoint (or (System/getenv "DATOMIC_ENDPOINT") "https://consciousfunnels.datomic.net")
   :proxy-port 8182})

(def ^:private client (d/client datomic-config))
(def ^:private conn (d/connect client {:db-name "consciousfunnels"}))

;; Schema definition
(def schema
  [
   ;; User schema
   {:db/ident :user/id
    :db/valueType :db.type/uuid
    :db/cardinality :db.cardinality/one
    :db/unique :db.unique/identity}
   
   {:db/ident :user/email
    :db/valueType :db.type/string
    :db/cardinality :db.cardinality/one
    :db/unique :db.unique/identity}
   
   {:db/ident :user/consciousness-level
    :db/valueType :db.type/keyword
    :db/cardinality :db.cardinality/one
    :db/doc "Consciousness level: :seeker, :practitioner, :guardian"}
   
   {:db/ident :user/created-at
    :db/valueType :db.type/instant
    :db/cardinality :db.cardinality/one}
   
   ;; Emotion schema
   {:db/ident :emotion/id
    :db/valueType :db.type/uuid
    :db/cardinality :db.cardinality/one
    :db/unique :db.unique/identity}
   
   {:db/ident :emotion/type
    :db/valueType :db.type/keyword
    :db/cardinality :db.cardinality/one
    :db/doc "Emotion type: :joy, :sadness, :fear, :anger, :surprise, :disgust, :trust"}
   
   {:db/ident :emotion/intensity
    :db/valueType :db.type/double
    :db/cardinality :db.cardinality/one
    :db/doc "Emotion intensity from 0.0 to 1.0"}
   
   {:db/ident :emotion/confidence
    :db/valueType :db.type/double
    :db/cardinality :db.cardinality/one
    :db/doc "AI confidence in emotion detection from 0.0 to 1.0"}
   
   {:db/ident :emotion/timestamp
    :db/valueType :db.type/instant
    :db/cardinality :db.cardinality/one}
   
   {:db/ident :emotion/user
    :db/valueType :db.type/ref
    :db/cardinality :db.cardinality/one}
   
   {:db/ident :emotion/metadata
    :db/valueType :db.type/string
    :db/cardinality :db.cardinality/one
    :db/doc "JSON string with additional emotion data"}
   
   ;; Action schema
   {:db/ident :action/id
    :db/valueType :db.type/uuid
    :db/cardinality :db.cardinality/one
    :db/unique :db.unique/identity}
   
   {:db/ident :action/type
    :db/valueType :db.type/keyword
    :db/cardinality :db.cardinality/one
    :db/doc "Action type: :page_view, :click, :scroll, :hover, :form_submit, :purchase"}
   
   {:db/ident :action/element
    :db/valueType :db.type/string
    :db/cardinality :db.cardinality/one
    :db/doc "UI element identifier"}
   
   {:db/ident :action/timestamp
    :db/valueType :db.type/instant
    :db/cardinality :db.cardinality/one}
   
   {:db/ident :action/duration
    :db/valueType :db.type/long
    :db/cardinality :db.cardinality/one
    :db/doc "Action duration in milliseconds"}
   
   {:db/ident :action/user
    :db/valueType :db.type/ref
    :db/cardinality :db.cardinality/one}
   
   {:db/ident :action/emotion
    :db/valueType :db.type/ref
    :db/cardinality :db.cardinality/one}
   
   {:db/ident :action/metadata
    :db/valueType :db.type/string
    :db/cardinality :db.cardinality/one
    :db/doc "JSON string with additional action data"}
   
   ;; Product schema
   {:db/ident :product/id
    :db/valueType :db.type/uuid
    :db/cardinality :db.cardinality/one
    :db/unique :db.unique/identity}
   
   {:db/ident :product/name
    :db/valueType :db.type/string
    :db/cardinality :db.cardinality/one}
   
   {:db/ident :product/price
    :db/valueType :db.type/double
    :db/cardinality :db.cardinality/one}
   
   {:db/ident :product/category
    :db/valueType :db.type/keyword
    :db/cardinality :db.cardinality/one}
   
   {:db/ident :product/consciousness-target
    :db/valueType :db.type/keyword
    :db/cardinality :db.cardinality/one}
   
   {:db/ident :product/created-at
    :db/valueType :db.type/instant
    :db/cardinality :db.cardinality/one}
   
   ;; Purchase schema
   {:db/ident :purchase/id
    :db/valueType :db.type/uuid
    :db/cardinality :db.cardinality/one
    :db/unique :db.unique/identity}
   
   {:db/ident :purchase/user
    :db/valueType :db.type/ref
    :db/cardinality :db.cardinality/one}
   
   {:db/ident :purchase/product
    :db/valueType :db.type/ref
    :db/cardinality :db.cardinality/one}
   
   {:db/ident :purchase/amount
    :db/valueType :db.type/double
    :db/cardinality :db.cardinality/one}
   
   {:db/ident :purchase/timestamp
    :db/valueType :db.type/instant
    :db/cardinality :db.cardinality/one}
   
   {:db/ident :purchase/triggering-emotions
    :db/valueType :db.type/ref
    :db/cardinality :db.cardinality/many
    :db/doc "Emotions that influenced this purchase"}
   
   {:db/ident :purchase/payment-method
    :db/valueType :db.type/string
    :db/cardinality :db.cardinality/one}
   
   {:db/ident :purchase/status
    :db/valueType :db.type/keyword
    :db/cardinality :db.cardinality/one
    :db/doc "Purchase status: :pending, :completed, :failed, :refunded"}
   ])

;; Initialize database with schema
(defn init-database! []
  (when (empty? (d/q '[:find ?e :where [?e :db/ident :user/id]] (d/db conn)))
    (d/transact conn {:tx-data schema})))

;; Helper functions for time operations
(defn get-hour [timestamp]
  (-> timestamp
      (tf/unparse (tf/formatter "HH"))
      Integer/parseInt))

(defn get-day-of-week [timestamp]
  (-> timestamp
      (tf/unparse (tf/formatter "E"))
      str/lower-case
      keyword))

(defn get-month [timestamp]
  (-> timestamp
      (tf/unparse (tf/formatter "MM"))
      Integer/parseInt))

;; User operations
(defn create-user! [user-data]
  (let [user-id (java.util.UUID/randomUUID)
        tx-data [{:user/id user-id
                  :user/email (:email user-data)
                  :user/consciousness-level (:consciousness-level user-data)
                  :user/created-at (java.time.Instant/now)}]]
    (d/transact conn {:tx-data tx-data})
    user-id))

(defn get-user [user-id]
  (d/q '[:find (pull ?u [*])
         :in $ ?user-id
         :where [?u :user/id ?user-id]]
       (d/db conn) user-id))

;; Emotion operations
(defn create-emotion! [emotion-data]
  (let [emotion-id (java.util.UUID/randomUUID)
        tx-data [{:emotion/id emotion-id
                  :emotion/type (:type emotion-data)
                  :emotion/intensity (:intensity emotion-data)
                  :emotion/confidence (:confidence emotion-data)
                  :emotion/timestamp (:timestamp emotion-data)
                  :emotion/user [:user/id (:user-id emotion-data)]
                  :emotion/metadata (json/generate-string (:metadata emotion-data))}]]
    (d/transact conn {:tx-data tx-data})
    emotion-id))

;; Action operations
(defn create-action! [action-data]
  (let [action-id (java.util.UUID/randomUUID)
        tx-data [{:action/id action-id
                  :action/type (:type action-data)
                  :action/element (:element action-data)
                  :action/timestamp (:timestamp action-data)
                  :action/duration (:duration action-data)
                  :action/user [:user/id (:user-id action-data)]
                  :action/emotion [:emotion/id (:emotion-id action-data)]
                  :action/metadata (json/generate-string (:metadata action-data))}]]
    (d/transact conn {:tx-data tx-data})
    action-id))

;; Purchase operations
(defn create-purchase! [purchase-data]
  (let [purchase-id (java.util.UUID/randomUUID)
        tx-data [{:purchase/id purchase-id
                  :purchase/user [:user/id (:user-id purchase-data)]
                  :purchase/product [:product/id (:product-id purchase-data)]
                  :purchase/amount (:amount purchase-data)
                  :purchase/timestamp (:timestamp purchase-data)
                  :purchase/payment-method (:payment-method purchase-data)
                  :purchase/status (:status purchase-data)
                  :purchase/triggering-emotions (mapv #(vector :emotion/id %) (:emotion-ids purchase-data))}]]
    (d/transact conn {:tx-data tx-data})
    purchase-id))

;; Temporal analysis queries
(defn emotion-sequence-before-purchase [user-id hours-before]
  (d/q '[:find ?emotion-type ?intensity ?timestamp
         :in $ ?user-id ?hours-before
         :where
         [?purchase :purchase/user [:user/id ?user-id]]
         [?purchase :purchase/timestamp ?purchase-time]
         [?emotion :emotion/user [:user/id ?user-id]]
         [?emotion :emotion/type ?emotion-type]
         [?emotion :emotion/intensity ?intensity]
         [?emotion :emotion/timestamp ?timestamp]
         [(< ?timestamp ?purchase-time)]
         [(> ?timestamp (- ?purchase-time ?hours-before))]
         ]
       (d/db conn) user-id (* hours-before 3600000)))

(defn successful-purchase-patterns [consciousness-level]
  (d/q '[:find ?emotion-type (avg ?intensity) (count ?purchase)
         :in $ ?consciousness-level
         :where
         [?user :user/consciousness-level ?consciousness-level]
         [?purchase :purchase/user ?user]
         [?purchase :purchase/triggering-emotions ?emotion]
         [?emotion :emotion/type ?emotion-type]
         [?emotion :emotion/intensity ?intensity]
         ]
       (d/db conn) consciousness-level))

(defn optimal-purchase-timing [consciousness-level]
  (d/q '[:find ?hour ?day-of-week (avg ?intensity) (count ?purchase)
         :in $ ?consciousness-level
         :where
         [?user :user/consciousness-level ?consciousness-level]
         [?purchase :purchase/user ?user]
         [?purchase :purchase/triggering-emotions ?emotion]
         [?emotion :emotion/intensity ?intensity]
         [?emotion :emotion/timestamp ?timestamp]
         [(get-hour ?timestamp) ?hour]
         [(get-day-of-week ?timestamp) ?day-of-week]
         ]
       (d/db conn) consciousness-level))

(defn seasonal-emotion-analysis []
  (d/q '[:find ?month ?emotion-type (avg ?intensity) (count ?emotion)
         :where
         [?emotion :emotion/type ?emotion-type]
         [?emotion :emotion/intensity ?intensity]
         [?emotion :emotion/timestamp ?timestamp]
         [(get-month ?timestamp) ?month]
         ]
       (d/db conn)))

(defn emotion-conversion-correlation []
  (d/q '[:find ?emotion-type ?intensity-range (count ?purchase) (count ?emotion)
         :where
         [?emotion :emotion/type ?emotion-type]
         [?emotion :emotion/intensity ?intensity]
         [(>= ?intensity 0.0) (< ?intensity 0.3) (identity "low")]
         [(>= ?intensity 0.3) (< ?intensity 0.7) (identity "medium")]
         [(>= ?intensity 0.7) (<= ?intensity 1.0) (identity "high")]
         [(or (identity "low") (identity "medium") (identity "high")) ?intensity-range]
         [?purchase :purchase/triggering-emotions ?emotion]
         ]
       (d/db conn)))

(defn user-journey-timeline [user-id days-back]
  (d/q '[:find ?event-type ?timestamp ?intensity ?confidence
         :in $ ?user-id ?days-back
         :where
         [?user :user/id ?user-id]
         [?emotion :emotion/user ?user]
         [?emotion :emotion/timestamp ?timestamp]
         [?emotion :emotion/intensity ?intensity]
         [?emotion :emotion/confidence ?confidence]
         [(> ?timestamp (- (java.util.Date.) (* ?days-back 24 60 60 1000)))]
         [(identity "emotion") ?event-type]
         ]
       (d/db conn) user-id days-back))

;; Advanced analytics
(defn conversion-funnel-analysis []
  (d/q '[:find ?consciousness-level ?emotion-type ?conversion-rate
         :where
         [?user :user/consciousness-level ?consciousness-level]
         [?emotion :emotion/user ?user]
         [?emotion :emotion/type ?emotion-type]
         [(count ?emotion) ?total-emotions]
         [?purchase :purchase/user ?user]
         [?purchase :purchase/triggering-emotions ?emotion]
         [(count ?purchase) ?conversions]
         [(/ ?conversions ?total-emotions) ?conversion-rate]
         ]
       (d/db conn)))

(defn emotional-cohort-analysis []
  (d/q '[:find ?emotion-type ?cohort-size ?avg-lifetime-value
         :where
         [?emotion :emotion/type ?emotion-type]
         [(count ?emotion) ?cohort-size]
         [?purchase :purchase/triggering-emotions ?emotion]
         [(avg ?purchase) ?avg-lifetime-value]
         ]
       (d/db conn)))

(defn predictive-purchase-model [user-id current-emotion]
  (let [user-history (user-journey-timeline user-id 30)
        similar-patterns (successful-purchase-patterns 
                         (get-in (get-user user-id) [[:user/consciousness-level]]))
        current-intensity (:intensity current-emotion)
        current-type (:type current-emotion)]
    
    ;; Simple prediction algorithm
    (let [historical-conversion-rate 
          (if (empty? user-history) 0.1 
              (/ (count (filter #(= (:event-type %) "purchase") user-history))
                 (count user-history)))
          
          emotion-boost (case current-type
                          :joy 1.2
                          :excitement 1.3
                          :trust 1.1
                          :fear -0.5
                          :anger -0.7
                          :sadness -0.3
                          1.0)
          
          predicted-likelihood 
          (-> historical-conversion-rate
              (* emotion-boost)
              (* current-intensity)
              (min 1.0)
              (max 0.0))]
      
      {:predicted-likelihood predicted-likelihood
       :confidence (min 0.9 (* (:confidence current-emotion) 1.1))
       :factors {:historical-rate historical-conversion-rate
                 :emotion-boost emotion-boost
                 :current-intensity current-intensity}
       :recommendations (if (> predicted-likelihood 0.7)
                         ["show_upsell" "create_urgency" "add_social_proof"]
                         ["build_trust" "provide_value" "reduce_risk"])})))

;; Dashboard metrics
(defn get-dashboard-metrics []
  (let [total-users (d/q '[:find (count ?u) :where [?u :user/id]] (d/db conn))
        total-emotions (d/q '[:find (count ?e) :where [?e :emotion/id]] (d/db conn))
        total-purchases (d/q '[:find (count ?p) :where [?p :purchase/id]] (d/db conn))
        conversion-rates (conversion-funnel-analysis)
        seasonal-data (seasonal-emotion-analysis)]
    
    {:total-users (first (first total-users))
     :total-emotions (first (first total-emotions))
     :total-purchases (first (first total-purchases))
     :conversion-rates conversion-rates
     :seasonal-patterns seasonal-data
     :last-updated (java.time.Instant/now)}))

;; Data export for analytics
(defn export-emotional-data [start-date end-date]
  (d/q '[:find ?user-id ?emotion-type ?intensity ?confidence ?timestamp ?action-type
         :in $ ?start-date ?end-date
         :where
         [?emotion :emotion/user [:user/id ?user-id]]
         [?emotion :emotion/type ?emotion-type]
         [?emotion :emotion/intensity ?intensity]
         [?emotion :emotion/confidence ?confidence]
         [?emotion :emotion/timestamp ?timestamp]
         [(>= ?timestamp ?start-date)]
         [(<= ?timestamp ?end-date)]
         [?action :action/emotion ?emotion]
         [?action :action/type ?action-type]
         ]
       (d/db conn) start-date end-date))

;; Cleanup operations
(defn cleanup-old-data [days-old]
  (let [cutoff-date (- (java.util.Date.) (* days-old 24 60 60 1000))
        old-emotions (d/q '[:find ?emotion
                            :in $ ?cutoff-date
                            :where
                            [?emotion :emotion/timestamp ?timestamp]
                            [(< ?timestamp ?cutoff-date)]
                            ]
                          (d/db conn) cutoff-date)]
    (when (seq old-emotions)
      (d/transact conn {:tx-data (mapv (fn [[emotion-id]]
                                        [:db/retractEntity emotion-id])
                                      old-emotions)}))
    (count old-emotions)))
