# NAVI web app — API URL comes from .env.production in the repo (or override: docker build --build-arg VITE_API_URL=...).
FROM node:22-bookworm-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Optional CapRover build arg; if unset, Vite uses `.env.production` from the repo.
ARG VITE_API_URL
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
