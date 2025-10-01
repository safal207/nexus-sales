(ns nexus.api.routes
  (:require [nexus.api.handlers.auth :as auth]
            [nexus.api.handlers.products :as products]
            [nexus.api.handlers.public :as public]
            [nexus.api.handlers.events :as events]
            [nexus.api.handlers.emotions :as emotions]
            [nexus.api.handlers.analytics :as analytics]
            [nexus.api.handlers.payments.stripe :as payments.stripe]
            [nexus.api.middleware :as mw]))

(def app-routes
  ["/api"
   ["/health" {:get {:handler (fn [_] {:status 200 :body {:ok true}})}}]

   ["/auth"
    ["/register" {:post {:handler auth/register!}}]
    ["/login"    {:post {:handler auth/login!}}]]

   ["/products"
    {:middleware [mw/require-jwt]}
    ["" {:get  {:handler products/list}
         :post {:handler products/create!}}]
    ["/:id"
     {:get {:handler products/get}
      :patch {:handler products/update!}
      :delete {:handler products/delete!}}]]

   ["/payments"
    ["/stripe"
     ["/checkout-session" {:post {:handler payments.stripe/create-checkout-session!}}]
     ["/webhook"          {:post {:handler payments.stripe/webhook!}}]]]

   ["/public"
    ["/products/:id" {:get {:handler public/get-product}}]
    ["/orders"       {:post {:handler public/create-order!}}]]

   ["/events"
    [""       {:post {:handler events/track!}}]
    ["/batch" {:post {:handler events/track-batch!}}]]

   ;; Emotional Analytics Routes
   ["/emotions"
    {:middleware [mw/require-jwt]}
    ["/track" {:post {:handler emotions/track-emotion}}]
    ["/journey" {:get {:handler emotions/get-emotional-journey}}]
    ["/patterns" {:get {:handler emotions/get-emotional-patterns}}]
    ["/predict" {:post {:handler emotions/predict-purchase}}]
    ["/health/:user-id" {:get {:handler emotions/get-emotional-health}}]]

   ["/analytics"
    {:middleware [mw/require-jwt]}
    ["/insights" {:get {:handler analytics/get-insights}}]
    ["/dashboard" {:get {:handler emotions/get-dashboard-analytics}}]
    ["/export" {:get {:handler emotions/export-emotional-data}}]
    ["/stream" {:get {:handler emotions/stream-emotions}}]]])


