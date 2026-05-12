FROM node:20-slim

WORKDIR /app

# yt-dlp 설치 (pip 방식이 바이너리 직접 다운로드보다 안정적)
RUN apt-get update && apt-get install -y --no-install-recommends python3 python3-pip \
    && pip3 install --no-cache-dir --break-system-packages yt-dlp \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# 의존성 먼저 설치 (레이어 캐시 활용)
COPY package*.json ./
RUN npm ci

# 소스 복사 및 빌드
COPY . .
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "start"]
