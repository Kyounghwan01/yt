FROM node:20-alpine

WORKDIR /app

# yt-dlp 설치 (Python 불필요한 단독 실행 바이너리)
RUN apk add --no-cache curl \
    && curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux \
       -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp

# 의존성 먼저 설치 (레이어 캐시 활용)
COPY package*.json ./
RUN npm ci

# 소스 복사 및 빌드
COPY . .
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "start"]
