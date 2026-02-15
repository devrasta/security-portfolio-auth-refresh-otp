# =========================================
# Stage 1: Build the Vue.js Application
# =========================================
ARG NODE_VERSION=22.12.0-alpine
ARG NGINX_VERSION=alpine3.22

# Use a lightweight Node.js image for building (customizable via ARG)
FROM node:${NODE_VERSION} AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package-related files first to leverage Docker's caching mechanism
COPY package.json yarn.lock ./

# Install project dependencies using yarn (ensures a clean, reproducible install)
RUN --mount=type=cache,target=/root/.yarn yarn install --frozen-lockfile

# Copy the rest of the application source code into the container
COPY . .

# Accept build argument for Vite API URL
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Debug: Show environment variables
RUN echo "Building with VITE_API_URL=${VITE_API_URL}"

# Build the Vue.js application
RUN yarn build || (cat /tmp/yarn-error.log 2>/dev/null && exit 1)

# =========================================
# Stage 2: Prepare Nginx to Serve Static Files
# =========================================

FROM nginxinc/nginx-unprivileged:${NGINX_VERSION} AS runner

# Use a built-in non-root user for security best practices
USER nginx

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/nginx.conf


# Copy the static build output from the build stage to Nginx's default HTML serving directory
COPY --chown=nginx:nginx --from=builder /app/dist /usr/share/nginx/html

# Expose port 8080 to allow HTTP traffic
# Note: The default NGINX container now listens on port 8080 instead of 80
EXPOSE 8080

# Start Nginx directly with custom config
ENTRYPOINT ["nginx", "-c", "/etc/nginx/nginx.conf"]
CMD ["-g", "daemon off;"]
