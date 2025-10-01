(ns nexus.api.server
  (:require [reitit.ring :as ring]
            [reitit.ring.middleware.muuntaja :as muuntaja]
            [muuntaja.core :as m]
            [ring.adapter.jetty :as jetty]
            [ring.middleware.cors :refer [wrap-cors]]
            [nexus.api.ai.queue :as ai-queue]
            [nexus.api.routes :refer [app-routes]]))

(def m-instance (m/create (assoc m/default-options :default-format "application/json")))

(def app
  (-> (ring/ring-handler
        (ring/router app-routes
                     {:data {:muuntaja m-instance
                             :middleware [muuntaja/format-middleware]}}))
      (wrap-cors :access-control-allow-origin [#".*"]
                 :access-control-allow-methods [:get :post :patch :delete :options]
                 :access-control-allow-headers ["content-type" "authorization"])))

(defn -main [& _]
  (let [port (Integer/parseInt (or (System/getenv "PORT") "3001"))]
    (ai-queue/restore-pending-jobs!)
    (jetty/run-jetty app {:port port :join? true})))
