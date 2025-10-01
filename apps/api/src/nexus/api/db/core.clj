(ns nexus.api.db.core
  (:require [next.jdbc :as jdbc]
            [hikari-cp.core :refer [make-datasource]]))

(defonce ^:private ds*
  (delay
    (make-datasource {:jdbcUrl (or (System/getenv "JDBC_URL")
                                   "jdbc:sqlite:./var/sqlite.db")})))

(defn ds [] @ds*)

(defn query [sql & params] (jdbc/execute! (ds) (into [sql] params)))
(defn exec! [sql] (jdbc/execute! (ds) [sql]))
