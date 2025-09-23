# For Production
# FROM node:22-slim
# For Development
FROM node:22

# Install Babel CLI globally
RUN npm install -g @babel/cli

# Install Puppeteer + libvips deps (Chromium runtime)
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    chromium \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libglib2.0-0 \
    libnspr4 \
    libnss3 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libxshmfence1 \
    libxrender1 \
    wget \
    xdg-utils \
    #Convert document → PDF
    libreoffice \
    poppler-utils \
    # sharp / vips deps
    libvips-dev \
    libvips-tools \
    libheif-dev \
    libde265-dev \
    libjpeg-dev \
    libpng-dev \
    libwebp-dev \
    imagemagick \
    # Needed for building native node modules
    build-essential \
    git \
    pkg-config \
    curl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Optional check
RUN vips --version && chromium --version || true

# Use system chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# App directory
WORKDIR /app

# Install dependencies only (better layer caching)
COPY package*.json ./

# Disable Husky during Docker builds
ENV HUSKY=0

#RUN npm ci --only=production
RUN npm install

# Copy source
COPY . .

# Fix permissions for node user
RUN chown -R node:node /app
USER node

EXPOSE 3001

# Use it as part of the entrypoint to wait for DB
CMD ["npm", "start"]
