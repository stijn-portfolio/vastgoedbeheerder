# Multi-stage build voor Angular
FROM node:18-alpine AS build

WORKDIR /app

# Installeer python en build tools voor native dependencies
RUN apk add --no-cache python3 make g++

# Kopieer package.json bestanden
COPY package*.json ./

# Verwijder package-lock.json om npm bug te omzeilen
RUN rm -f package-lock.json

# Installeer dependencies met npm install (niet ci)
RUN npm install

# Kopieer source code
COPY . .

# Build de Angular applicatie
RUN npm run build

# Production stage met Nginx
FROM nginx:alpine AS production

# Installeer OpenSSL voor self-signed certificate
RUN apk add --no-cache openssl

# Maak SSL directory en genereer self-signed certificate
RUN mkdir -p /etc/nginx/ssl && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/nginx.key \
    -out /etc/nginx/ssl/nginx.crt \
    -subj "/C=BE/ST=Flanders/L=Brussels/O=Vastgoed/CN=localhost"

# Kopieer de gebouwde Angular app (nieuwere Angular versie gebruikt browser subdirectory)
COPY --from=build /app/dist/vastgoedbeheerder/browser /usr/share/nginx/html

# Kopieer aangepaste nginx configuratie
COPY nginx.conf /etc/nginx/nginx.conf

# Expose poort 443 voor HTTPS
EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]