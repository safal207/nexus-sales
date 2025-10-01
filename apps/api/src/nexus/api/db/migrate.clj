(ns nexus.api.db.migrate
  (:require [nexus.api.db.core :as db]))

(def migration-sql
  ["CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT UNIQUE, password_hash TEXT, created_at TEXT);"
   "CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY, seller_id TEXT, title TEXT, description TEXT, price REAL, active INTEGER, created_at TEXT, updated_at TEXT);"
   "CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, product_id TEXT, email TEXT, status TEXT, created_at TEXT);"
   "CREATE TABLE IF NOT EXISTS events (id TEXT PRIMARY KEY, name TEXT, ts TEXT, session_id TEXT, product_id TEXT, order_id TEXT, referrer TEXT, ab_variant TEXT);"
   "CREATE TABLE IF NOT EXISTS ai_jobs (id TEXT PRIMARY KEY, kind TEXT, payload TEXT, status TEXT, result TEXT, error TEXT, attempts INTEGER DEFAULT 0, created_at TEXT, updated_at TEXT, completed_at TEXT);"
   "CREATE TABLE IF NOT EXISTS emotion_insights (id TEXT PRIMARY KEY, job_id TEXT, source TEXT, content TEXT, labels_json TEXT, metadata_json TEXT, created_at TEXT, updated_at TEXT);"])

(defn up! []
  (println "Running database migrations...")
  (doseq [sql migration-sql]
    (db/exec! sql))
  (println "Migrations complete."))

(defn -main [& _]
  (up!))
