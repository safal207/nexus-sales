(ns nexus.api.handlers.payments.stripe
  (:require [clojure.java.io :as io]
            [muuntaja.core :as m]
            [ring.util.request :as req]
            [nexus.api.db.core :as db])
  (:import (com.stripe Stripe)
           (com.stripe.model.checkout Session)
           (com.stripe.param.checkout SessionCreateParams)
           (com.stripe.net Webhook)))

;; Инициализация ключа
(def ^:private stripe-key (or (System/getenv "STRIPE_SECRET") ""))
(def ^:private webhook-secret (System/getenv "STRIPE_WEBHOOK_SECRET"))
(def ^:private public-base (or (System/getenv "PUBLIC_BASE_URL") "http://localhost:3000"))

(when (seq stripe-key) (set! (. Stripe apiKey) stripe-key))

(defn create-checkout-session! [{:keys [body-params]}]
  ;; We expect: {:orderId "ord_123", :currency "usd"}
  ;; We will get the amount from the DB to be safe.
  (let [{:keys [orderId currency]} body-params]
    (when-not (and orderId currency)
      (throw (ex-info "Invalid payload: orderId and currency are required." {:status 400})))

    (let [order (first (db/query "SELECT product_id FROM orders WHERE id = ?" orderId))]
      (if-not order
        (throw (ex-info "Order not found" {:status 404}))
        (let [product (first (db/query "SELECT price, title FROM products WHERE id = ?" (:product_id order)))
              amount-from-db (long (:price product))]
          (let [success-url (str public-base "/checkout/" (:product_id order) "/success?orderId=" orderId)
                cancel-url  (str public-base "/checkout/" (:product_id order) "?canceled=1")
                params (-> (SessionCreateParams/builder)
                     (.setMode SessionCreateParams$Mode/PAYMENT)
                     (.addLineItem (-> (SessionCreateParams$LineItem/builder)
                                       (.setQuantity (long 1))
                                       (.setPriceData (-> (SessionCreateParams$LineItem$PriceData/builder)
                                                          (.setCurrency currency)
                                                          (.setUnitAmount amount-from-db)
                                                          (.setProductData (-> (SessionCreateParams$LineItem$PriceData$ProductData/builder)
                                                                               (.setName (:title product))
                                                                               .build))
                                                          .build))
                                       .build))
                     (.setSuccessUrl success-url)
                     (.setCancelUrl cancel-url)
                     (.putMetadata "orderId" orderId)
                     .build)
          session (Session/create params)]
      {:status 201
       :body {:success true
              :checkout {:id (.getId session)
                         :url (.getUrl session)}}})))

(defn webhook! [req]
  (let [payload (slurp (io/reader (:body req)))
        sig (get-in req [:headers "stripe-signature"])]
    (if (and (seq webhook-secret) (seq sig))
      (try
        (let [event (Webhook/constructEvent payload sig webhook-secret)
              t (.getType event)
              data (.. event getData getObject)]
          ;; Простейшая обработка двух кейсов
          (case t
            "checkout.session.completed"
            (let [order-id (.. data getMetadata (get "orderId"))]
              ;; TODO: UPDATE orders SET status='paid' WHERE id = ?
              (db/exec! "UPDATE orders SET status='paid' WHERE id = ?" order-id)
              {:status 200 :body {:received true}})

            "charge.failed"
            {:status 200 :body {:received true}}

            ;; default
            {:status 200 :body {:received true}}))
        (catch Exception _
          {:status 400 :body {:success false :message "Invalid signature"}}))
      ;; Если webhook-secret не задан — делаем noop для локалки
      {:status 200 :body {:received true}})))
