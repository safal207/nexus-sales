(ns nexus.api.middleware
  (:require [buddy.sign.jwt :as jwt]))

(defn unauthorized [] {:status 401 :body {:success false :message "Unauthorized"}})

(defn require-jwt [handler]
  (fn [req]
    (let [auth (get-in req [:headers "authorization"])
          token (if (and auth (clojure.string/starts-with? auth "Bearer "))
                  (subs auth 7)
                  auth)]
      (if-not token
        (unauthorized)
        (try
          (let [claims (jwt/unsign token (System/getenv "JWT_SECRET"))]
            (handler (assoc req :claims claims)))
          (catch Exception _
            (unauthorized)))))))
