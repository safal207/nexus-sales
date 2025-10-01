(ns test-db
  (:require [nexus.api.db.core :as db]))

(defn -main []
  (println "Testing database connection...")
  (try
    (let [result (db/exec! "SELECT 1")]
      (println "Database connection successful:" result))
    (catch Exception e
      (println "Database connection failed:" (.getMessage e))))
  (println "Test completed."))
