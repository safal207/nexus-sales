(ns nexus.api.handlers.events
  (:require [nexus.api.db.core :as db]))

(defn- record! [e]
  (let [{:keys [name ts sessionId productId orderId referrer abVariant]} e]
    (db/query "INSERT INTO events (id, name, ts, session_id, product_id, order_id, referrer, ab_variant) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
              (str "evt_" (random-uuid))
              (clojure.core/name name) ; Convert keyword to string if needed
              ts sessionId productId orderId referrer abVariant)))

(defn track! [{:keys [body-params]}]
  (when (not (contains? body-params :ts))
    (throw (ex-info "ts required" {:status 400})))
  (record! body-params)
  {:status 202 :body {:success true :accepted true}})

(defn track-batch! [{:keys [body-params]}]
  (doseq [e (:events body-params)] (record! e))
  {:status 202 :body {:success true :accepted true}})
