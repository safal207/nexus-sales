(ns nexus.api.neo4j.core
  (:require [clojure.string :as str]
            [cheshire.core :as json]
            [clj-http.client :as http]))

(def ^:private neo4j-uri (or (System/getenv "NEO4J_URI") "bolt://localhost:7687"))
(def ^:private neo4j-user (or (System/getenv "NEO4J_USER") "neo4j"))
(def ^:private neo4j-password (or (System/getenv "NEO4J_PASSWORD") "password"))

;; Neo4j HTTP API client
(defn neo4j-request [query params]
  (let [url (str neo4j-uri "/db/data/transaction/commit")
        auth (str neo4j-user ":" neo4j-password)
        headers {"Authorization" (str "Basic " (-> auth .getBytes java.util.Base64/getEncoder (.encodeToString)))
                 "Content-Type" "application/json"
                 "Accept" "application/json"}]
    (http/post url
               {:headers headers
                :body (json/generate-string
                       {:statements [{:statement query
                                      :parameters params}]})})))

;; Graph operations
(defn create-user-node [user-data]
  (neo4j-request
   "CREATE (u:User {
     id: $id,
     email: $email,
     consciousness_level: $consciousness_level,
     created_at: datetime()
   }) RETURN u"
   user-data))

(defn create-emotion-node [emotion-data]
  (neo4j-request
   "CREATE (e:Emotion {
     id: $id,
     type: $type,
     intensity: $intensity,
     confidence: $confidence,
     timestamp: datetime(),
     metadata: $metadata
   }) RETURN e"
   emotion-data))

(defn create-action-node [action-data]
  (neo4j-request
   "CREATE (a:Action {
     id: $id,
     type: $type,
     element: $element,
     timestamp: datetime(),
     duration: $duration,
     metadata: $metadata
   }) RETURN a"
   action-data))

(defn create-product-node [product-data]
  (neo4j-request
   "CREATE (p:Product {
     id: $id,
     name: $name,
     price: $price,
     category: $category,
     consciousness_target: $consciousness_target,
     created_at: datetime()
   }) RETURN p"
   product-data))

;; Relationship operations
(defn create-emotion-relationship [user-id emotion-id]
  (neo4j-request
   "MATCH (u:User {id: $user_id}), (e:Emotion {id: $emotion_id})
    CREATE (u)-[:FEELS {timestamp: datetime()}]->(e)
    RETURN u, e"
   {:user_id user-id :emotion_id emotion-id}))

(defn create-action-relationship [user-id action-id]
  (neo4j-request
   "MATCH (u:User {id: $user_id}), (a:Action {id: $action_id})
    CREATE (u)-[:PERFORMS {timestamp: datetime()}]->(a)
    RETURN u, a"
   {:user_id user-id :action_id action-id}))

(defn create-emotion-influences-action [emotion-id action-id]
  (neo4j-request
   "MATCH (e:Emotion {id: $emotion_id}), (a:Action {id: $action_id})
    CREATE (e)-[:INFLUENCES {strength: $strength, timestamp: datetime()}]->(a)
    RETURN e, a"
   {:emotion_id emotion-id :action_id action-id :strength 0.8}))

(defn create-purchase-relationship [user-id product-id amount]
  (neo4j-request
   "MATCH (u:User {id: $user_id}), (p:Product {id: $product_id})
    CREATE (u)-[:PURCHASES {amount: $amount, timestamp: datetime()}]->(p)
    RETURN u, p"
   {:user_id user-id :product_id product-id :amount amount}))

;; Advanced queries
(defn get-emotional-journey [user-id product-id]
  (neo4j-request
   "MATCH (u:User {id: $user_id})-[:FEELS]->(e:Emotion)-[:INFLUENCES]->(a:Action)
    WHERE a.type = 'purchase' OR a.type = 'view_product'
    WITH e, a, u
    MATCH (u)-[:PURCHASES]->(p:Product {id: $product_id})
    RETURN e.type as emotion, e.intensity as intensity, a.type as action, 
           e.timestamp as timestamp, e.confidence as confidence
    ORDER BY e.timestamp"
   {:user_id user-id :product_id product-id}))

(defn get-emotional-patterns [consciousness-level]
  (neo4j-request
   "MATCH (u:User {consciousness_level: $consciousness_level})-[:PURCHASES]->(p:Product)
    MATCH (u)-[:FEELS]->(e:Emotion)-[:INFLUENCES]->(a:Action)-[:LEADS_TO]->(p)
    WHERE e.timestamp < datetime() - duration('PT1H')
    RETURN e.type as emotion, avg(e.intensity) as avg_intensity, 
           count(*) as frequency, count(DISTINCT u) as unique_users
    ORDER BY frequency DESC"
   {:consciousness_level consciousness-level}))

(defn get-conversion-triggers []
  (neo4j-request
   "MATCH (u:User)-[:FEELS]->(e:Emotion)-[:INFLUENCES]->(a:Action)
    WHERE a.type = 'purchase'
    WITH e.type as emotion, count(*) as conversions
    RETURN emotion, conversions
    ORDER BY conversions DESC"))

(defn get-emotional-blockers []
  (neo4j-request
   "MATCH (u:User)-[:FEELS]->(e:Emotion)-[:INFLUENCES]->(a:Action)
    WHERE a.type = 'exit' OR a.type = 'bounce'
    WITH e.type as emotion, count(*) as exits
    RETURN emotion, exits
    ORDER BY exits DESC"))

(defn get-optimal-emotional-sequence []
  (neo4j-request
   "MATCH path = (start:Emotion)-[:INFLUENCES*1..5]->(end:Action)
    WHERE end.type = 'purchase'
    WITH [e in nodes(path) WHERE e:Emotion | e.type] as sequence, count(*) as success_rate
    RETURN sequence, success_rate
    ORDER BY success_rate DESC
    LIMIT 10"))

;; Real-time emotion tracking
(defn track-user-emotion [user-id emotion-data]
  (let [emotion-id (str (java.util.UUID/randomUUID))
        action-id (str (java.util.UUID/randomUUID))]
    
    ;; Create emotion node
    (create-emotion-node (assoc emotion-data :id emotion-id))
    
    ;; Create action node if action exists
    (when (:action emotion-data)
      (create-action-node {:id action-id
                           :type (:action emotion-data)
                           :element (:element emotion-data)
                           :duration (:duration emotion-data)
                           :metadata (json/generate-string (:metadata emotion-data))}))
    
    ;; Create relationships
    (create-emotion-relationship user-id emotion-id)
    
    (when (:action emotion-data)
      (create-action-relationship user-id action-id)
      (create-emotion-influences-action emotion-id action-id))
    
    {:emotion_id emotion-id
     :action_id action-id
     :timestamp (java.time.Instant/now)}))

;; Predictive analytics
(defn predict-purchase-likelihood [user-id current-emotion]
  (let [emotion-history (get-emotional-journey user-id nil)
        similar-patterns (get-emotional-patterns (:consciousness_level current-emotion))]
    
    ;; Simple prediction logic (can be enhanced with ML)
    (let [positive-emotions #{"joy" "excitement" "confidence" "trust"}
          negative-emotions #{"fear" "anger" "sadness" "disgust"}
          current-type (:type current-emotion)
          current-intensity (:intensity current-emotion)]
      
      {:likelihood (cond
                     (contains? positive-emotions current-type) 
                     (min 1.0 (* current-intensity 1.2))
                     
                     (contains? negative-emotions current-type)
                     (max 0.0 (* (- 1.0 current-intensity) 0.3))
                     
                     :else (* current-intensity 0.8))
       
       :confidence (if (> (:confidence current-emotion) 0.8) 0.9 0.6)
       :recommended_actions (cond
                              (contains? positive-emotions current-type)
                              ["show_upsell" "add_social_proof" "create_urgency"]
                              
                              (contains? negative-emotions current-type)
                              ["add_guarantees" "show_testimonials" "reduce_risk"]
                              
                              :else
                              ["provide_more_info" "show_benefits" "build_trust"])})))

;; Analytics dashboard data
(defn get-dashboard-metrics []
  (let [conversion-triggers (get-conversion-triggers)
        emotional-blockers (get-emotional-blockers)
        optimal-sequences (get-optimal-emotional-sequence)]
    
    {:conversion_triggers conversion-triggers
     :emotional_blockers emotional-blockers
     :optimal_sequences optimal-sequences
     :total_users (neo4j-request "MATCH (u:User) RETURN count(u) as total" {})
     :total_emotions (neo4j-request "MATCH (e:Emotion) RETURN count(e) as total" {})
     :total_purchases (neo4j-request "MATCH ()-[r:PURCHASES]->() RETURN count(r) as total" {})}))

;; Cleanup and maintenance
(defn cleanup-old-emotions [days-old]
  (neo4j-request
   "MATCH (e:Emotion)
    WHERE e.timestamp < datetime() - duration({days: $days})
    DETACH DELETE e
    RETURN count(e) as deleted"
   {:days days-old}))

(defn optimize-graph []
  (neo4j-request
   "CALL db.index.fulltext.createNodeIndex('emotionSearch', ['Emotion'], ['type', 'metadata'])
    RETURN 'Index created' as result" {}))
