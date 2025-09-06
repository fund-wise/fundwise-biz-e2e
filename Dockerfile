FROM node:22-bookworm AS base

# Install Playwright and system dependencies
RUN apt-get update && apt-get install -y \
    dumb-init \
    curl \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm globally
RUN npm install -g pnpm@10.15.0

WORKDIR /app

# Copy package files first for better caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy package.json files from packages directory
COPY packages/test-utils/package.json ./packages/test-utils/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/eslint-config/package.json ./packages/eslint-config/

# Copy package.json files from suites directory
COPY suites/api-idp-e2e/package.json ./suites/api-idp-e2e/
COPY suites/api-backend-e2e/package.json ./suites/api-backend-e2e/
COPY suites/web-idp-e2e/package.json ./suites/web-idp-e2e/
COPY suites/web-investor-e2e/package.json ./suites/web-investor-e2e/
COPY suites/web-admin-e2e/package.json ./suites/web-admin-e2e/

# Install dependencies including dev dependencies
RUN pnpm install --frozen-lockfile

# Install Playwright globally and install system dependencies
RUN npm install -g playwright@1.55.0 && \
    playwright install-deps

# Create non-root user with home directory
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs --create-home testrunner

# Copy all source files with ownership
COPY --chown=testrunner:nodejs . .

# Create turbo cache and logs directories with proper permissions
RUN mkdir -p /app/.turbo/cache /app/.turbo/logs /app/node_modules/.cache && \
    chmod -R 755 /app/.turbo /app/node_modules/.cache

# Install Playwright browsers as testrunner user (without deps since we installed them above)
USER testrunner
RUN playwright install chromium firefox webkit

# Set environment variables
ENV CI=true
ENV PORT=9323

# Expose Playwright debugging port
EXPOSE 9323

# Create entrypoint script (already running as testrunner)
COPY --chown=testrunner:nodejs docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

ENTRYPOINT ["dumb-init", "--", "/app/docker-entrypoint.sh"]
CMD ["pnpm", "run", "test:e2e"]