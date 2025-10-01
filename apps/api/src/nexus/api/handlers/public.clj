(ns nexus.api.handlers.public
  (:require [nexus.api.db.core :as db]
            [clojure.string :as str]))

(defn get-product [{:keys [path-params]}]
  (let [id (:id path-params)
        product (first (db/query "SELECT id, title, description, price, active FROM products WHERE id = ? AND active = 1" id))]
    (if product
      {:status 200 :body {:success true :product product}}
      {:status 404 :body {:success false :message "Product not found or is not active."}})))

(defonce ^:private rl (atom {})) ; primitive rate-limit by email

(defn create-order! [{:keys [body-params]}]
  (let [{:keys [productId email name abVariant]} body-params
        now (System/currentTimeMillis)]
    (cond
      (not (and (string? productId) (string? email) (re-find #"@" email)))
      {:status 400 :body {:success false :message "Invalid payload"}}

      (< (- now (get @rl email 0)) 3000) ; 3s throttle
      {:status 409 :body {:success false :message "Rate limited"}}

      :else
      (let [order-id (str "ord_" (random-uuid))
            now-iso (str (java.time.Instant/now))]
        (db/query "INSERT INTO orders (id, product_id, email, status, created_at) VALUES (?, ?, ?, ?, ?)"
                  order-id productId email "created" now-iso)
        (swap! rl assoc email now)
        {:status 201
         :body {:success true
                :order {:id order-id :productId productId :email email
                        :status "created" :createdAt now-iso}}}))))
