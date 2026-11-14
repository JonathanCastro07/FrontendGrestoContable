FROM node:22 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx ng build

FROM caddy:2
COPY --from=build /app/dist/GestroContableFrontend/browser /usr/share/caddy
COPY Caddyfile /etc/caddy/Caddyfile