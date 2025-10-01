(ns nexus.api.handlers.products
  (:require [nexus.api.db.core :as db]
            [clojure.string :as str]))

(defn ->now-str [] (str (java.time.Instant/now)))

(defn list [{:keys [claims]}]
  (let [seller-id (:sub claims)
        products (db/query "SELECT * FROM products WHERE seller_id = ?" seller-id)]
    {:status 200
     :body {:success true :products products}}))

(defn create! [{:keys [body-params claims]}]
  (let [{:keys [title price description active]} body-params
        seller-id (:sub claims)]
    (if (or (not (string? title)) (not (number? price)))
      {:status 400 :body {:success false :message "Invalid product data. Title and price are required."}}
      (let [now (->now-str)
            product-id (str "prd_" (random-uuid))
            product {:id product-id :seller_id seller-id :title title :price price :description description
                     :active (boolean active) :created_at now :updated_at now}]
        (db/query "INSERT INTO products (id, seller_id, title, description, price, active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
                  product-id seller-id title description price (if active 1 0) now now)
        {:status 201 :body {:success true :product product}}))))

(defn get [{:keys [path-params claims]}]
  (let [id (:id path-params)
        seller-id (:sub claims)
        product (first (db/query "SELECT * FROM products WHERE id = ? AND seller_id = ?" id seller-id))]
    (if product
      {:status 200 :body {:success true :product product}}
      {:status 404 :body {:success false :message "Product not found."}})))

(defn update! [{:keys [path-params body-params claims]}]
  (let [id (:id path-params)
        seller-id (:sub claims)
        {:keys [title description price active]} body-params
        now (->now-str)]
    (let [updated-count (first (db/query "UPDATE products SET title = ?, description = ?, price = ?, active = ?, updated_at = ? WHERE id = ? AND seller_id = ?"
                                          title description price (if active 1 0) now id seller-id))]
      (if (= 1 (val (first updated-count)))
        (get {:path-params {:id id} :claims claims}) ; Fetch and return updated product
        {:status 404 :body {:success false :message "Product not found or you do not have permission to update it."}}))))

(defn delete! [{:keys [path-params claims]}]
  (let [id (:id path-params)
        seller-id (:sub claims)]
    (let [deleted-count (first (db/query "DELETE FROM products WHERE id = ? AND seller_id = ?" id seller-id))]
      (if (= 1 (val (first deleted-count)))
        {:status 204 :body nil}
        {:status 404 :body {:success false :message "Product not found or you do not have permission to delete it."}}))))
