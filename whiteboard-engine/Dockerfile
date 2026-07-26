# LME whiteboard-video-motor — produksjonsbilde (Node + hodeløs Chrome for Remotion)
FROM node:20-bookworm-slim

# Chrome/Chromium-avhengigheter som Remotion trenger for å rendre video.
RUN apt-get update && apt-get install -y --no-install-recommends \
    libnss3 libdbus-1-3 libatk1.0-0 libgbm-dev libasound2 libxrandr2 \
    libxkbcommon-dev libxfixes3 libxcomposite1 libxdamage1 libatk-bridge2.0-0 \
    libpango-1.0-0 libcairo2 libcups2 libx11-6 libxcb1 libxext6 \
    fonts-liberation fonts-noto-color-emoji ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Installer avhengigheter først (bedre cache)
COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund

# Kopier resten av motoren
COPY . .

# Last ned Remotion sin hodeløse Chrome allerede i bygget (raskere første render).
# Bruker @remotion/renderer direkte, så det virker uten dev-avhengigheter (CLI-en).
RUN node -e "import('@remotion/renderer').then(m=>m.ensureBrowser()).then(()=>console.log('Chrome klar')).catch(e=>{console.error(e);process.exit(1)})"

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node", "server.js"]
