FROM node:16-alpine AS builder
WORKDIR /app
COPY . .
RUN npm i serve
RUN npm ci
RUN npm run build
# ARG REACT_API_HOST
# ENV REACT_API_HOST=$REACT_API_HOST

# nginx state for serving content
FROM nginx:alpine
# Set working directory to nginx asset directory
WORKDIR /usr/share/nginx/html
# Remove default nginx static assets
RUN rm -rf ./*
# Copy static assets from builder stage
COPY --from=builder /app/build .
# Containers run nginx with global directives and daemon off
EXPOSE 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]
