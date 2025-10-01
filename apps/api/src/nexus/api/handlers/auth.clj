(ns nexus.api.handlers.auth
  (:require [buddy.sign.jwt :as jwt]
            [buddy.hashers :as hashers]
            [nexus.api.db.core :as db]
            [clojure.string :as str]))

(defn ->now-str [] (str (java.time.Instant/now)))

(defn register! [{:keys [body-params]}]
  (let [{:keys [email password]} body-params]
    (if (or (not (string? email)) (not (re-find #"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$" email)) (not (string? password)) (< (count password) 8))
      {:status 400 :body {:success false :message "Invalid payload. Email must be valid and password at least 8 characters."}}
      (if (seq (db/query "SELECT id FROM users WHERE email = ?" email))
        {:status 409 :body {:success false :message "User with this email already exists."}}
        (let [user-id (str "usr_" (random-uuid))
              now (->now-str)
              user {:id user-id
                    :email email
                    :createdAt now}]
          (db/query "INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)"
                    user-id email (hashers/encrypt password) now)
          (let [token (jwt/sign {:sub user-id :email email} (System/getenv "JWT_SECRET"))]
            {:status 201 :body {:success true :token token :user user}}))))))

(defn login! [{:keys [body-params]}]
  (let [{:keys [email password]} body-params
        user-from-db (first (db/query "SELECT id, email, password_hash, created_at FROM users WHERE email = ?" email))]
    (if (and user-from-db (hashers/check password (:password_hash user-from-db)))
      (let [user {:id (:id user-from-db)
                  :email (:email user-from-db)
                  :createdAt (:created_at user-from-db)}
            token (jwt/sign {:sub (:id user)} (System/getenv "JWT_SECRET"))]
        {:status 200 :body {:success true :token token :user user}})
      {:status 401 :body {:success false :message "Invalid email or password."}})))
