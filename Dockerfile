FROM node:lts-alpine
RUN apk add --no-cache nginx
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
COPY nginx.conf /etc/nginx/http.d/default.conf
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
EXPOSE 80
ENTRYPOINT ["/entrypoint.sh"]
