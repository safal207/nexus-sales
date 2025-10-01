migrate:
	sudo docker run --rm \
	  -e JDBC_URL="jdbc:sqlite:./var/sqlite.db" \
	  -v "$$(pwd)":/app -w /app \
	  clojure:temurin-21-tools-deps \
	  clojure -X nexus.api.db.migrate/up!

run:
	sudo docker run --rm -p 3001:3001 \
	  -e JWT_SECRET=devsecret \
	  -e JDBC_URL="jdbc:sqlite:./var/sqlite.db" \
	  -e PUBLIC_BASE_URL="http://localhost:3000" \
	  -v "$$(pwd)":/app -w /app \
	  clojure:temurin-21-tools-deps \
	  clojure -M:run
