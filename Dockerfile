# Zoldify Admin (Next.js 14) — build hai tầng, output: standalone.
#
# NEXT_PUBLIC_API_ORIGIN nhúng cứng lúc build (Next inline biến này). Admin
# không có thư mục public nên tầng chạy không copy public.
FROM node:24-bookworm-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG NEXT_PUBLIC_API_ORIGIN=https://api.zoldify.com
ENV NEXT_PUBLIC_API_ORIGIN=$NEXT_PUBLIC_API_ORIGIN
ENV NODE_OPTIONS=--max-old-space-size=1536
RUN npm run build

FROM node:24-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
ENV PORT=3002 HOSTNAME=0.0.0.0
EXPOSE 3002
CMD ["node", "server.js"]
