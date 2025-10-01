(defproject nexus-api "0.1.0-SNAPSHOT"
  :description "Nexus Sales API"
  :dependencies [[org.clojure/clojure "1.11.3"]
                 [metosin/reitit-ring "0.7.0"]
                 [metosin/muuntaja "0.6.10"]
                 [ring/ring-jetty-adapter "1.11.0"]
                 [ring-cors/ring-cors "0.1.13"]
                 [com.github.seancorfield/next.jdbc "1.3.939"]
                 [hikari-cp/hikari-cp "3.1.0"]
                 [ch.qos.logback/logback-classic "1.5.6"]
                 [buddy/buddy-sign "3.5.351"]
                 [com.stripe/stripe-java "24.0.0"]
                 [aero/aero "1.1.6"]
                 [cheshire/cheshire "5.11.0"]
                 [clj-http/clj-http "3.12.3"]
                 [datomic/client-api "1.0.295"]
                 [clj-time/clj-time "0.15.2"]]
  :main nexus.api.server
  :aot [nexus.api.server]
  :source-paths ["src"]
  :resource-paths ["resources"])
