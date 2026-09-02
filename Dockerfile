# Stage 1: build the static site
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: serve with nginx
FROM nginx:1.27-alpine
# Patch base-image OS packages (musl, zlib, nghttp2, libxml2, ...) so the runtime
# image picks up Alpine security fixes not yet baked into the pinned base tag.
RUN apk upgrade --no-cache
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY security-headers.conf /etc/nginx/conf.d/security-headers.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
