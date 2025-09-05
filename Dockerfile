FROM node:22-bookworm AS base

# Install Playwright and system dependencies
RUN apt-get update && apt-get install -y \
    dumb-init \
    curl \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm globally
RUN npm install -g pnpm@10.15.0

# Install Playwright
RUN npx playwright install --with-deps

WORKDIR /app

# Copy package files first for better caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY suites/api-idp-e2e/package.json ./suites/api-idp-e2e/
COPY suites/api-backend-e2e/package.json ./suites/api-backend-e2e/
COPY suites/web-idp-e2e/package.json ./suites/web-idp-e2e/
COPY suites/web-investor-e2e/package.json ./suites/web-investor-e2e/
COPY suites/web-admin-e2e/package.json ./suites/web-admin-e2e/

# Install dependencies
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy all source files
COPY . .

# Create production image
FROM node:22-bookworm AS production

# Install system dependencies and pnpm
RUN apt-get update && apt-get install -y \
    dumb-init \
    curl \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm@10.15.0

# Install Playwright browsers
RUN npx playwright install --with-deps

# Create non-root user
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs testrunner

WORKDIR /app

# Copy built application from base
COPY --from=base --chown=testrunner:nodejs /app ./

# Set environment variables
ENV CI=true
ENV PORT=9323

# Expose Playwright debugging port
EXPOSE 9323

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:9323/health || exit 1

# Create entrypoint script
COPY --chown=testrunner:nodejs docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

USER testrunner

ENTRYPOINT ["dumb-init", "--", "/app/docker-entrypoint.sh"]
CMD ["pnpm", "run", "test:e2e"]