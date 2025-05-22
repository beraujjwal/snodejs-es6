FROM node:22-alpine

# Install Babel CLI globally
RUN npm install -g @babel/cli

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Give execute permission to wait-for-it.sh (MUST happen as root)
#RUN chmod +x ./app/wait-for-it.sh

RUN chown -R node /app/node_modules

USER node

EXPOSE 4060

# Use it as part of the entrypoint to wait for DB
#CMD ["sh", "./wait-for-it.sh", "postgres:5432", "--", "npm", "start"]
CMD ["npm", "start"]
