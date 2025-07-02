FROM --platform=linux/amd64 nvidia/cuda:12.2.0-base-ubuntu20.04

ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=Etc/UTC

RUN apt-get update && apt-get install -y \
    curl wget gnupg2 software-properties-common \
    libgl1-mesa-dri \
    libglx-mesa0 \
    mesa-utils \
    libxshmfence1 \
    libdrm2 \
    libasound2 \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libxtst6 \
    xdg-utils \
    fonts-liberation \
    ca-certificates \
    unzip \
    gnupg \
    tzdata \
    xorg \
    xserver-xorg \
    xvfb \
    libx11-dev \
    libxext-dev \
    vulkan-tools \
    libvulkan1 \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get update && apt-get install -y nodejs && \
    npm install -g npm

WORKDIR /app

COPY package.json ./
RUN npm install

RUN npm install puppeteer && \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false npx puppeteer install

COPY . .

CMD ["npm", "start"]