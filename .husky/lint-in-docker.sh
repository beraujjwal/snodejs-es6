#!/bin/bash

# echo "🧼 Linting inside admin docker container..."

# # Run ESLint using the Docker container (adjust container name and path)
# docker exec admin npx eslint .

# if [ $? -ne 0 ]; then
#   echo "❌ ESLint failed! Commit blocked."
#   exit 1
# fi

# echo "✅ Lint passed. Proceeding."



# Name of your running container, e.g., from docker-compose
CONTAINER_NAME=admin

echo "🚀 Linting with ESLint inside Docker container: $CONTAINER_NAME"

docker exec "$CONTAINER_NAME" npx eslint .

if [ $? -ne 0 ]; then
  echo "❌ Lint errors found. Commit aborted."
  exit 1
fi

echo "✅ Lint passed!"
