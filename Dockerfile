FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app
# Copy package files
COPY package*.json ./

# Install dependencies (termasuk devDependencies untuk build)
RUN npm ci  && \
    npm cache clean --force && \
    rm -rf /root/.npm && \
    rm -rf node_modules

# Production stage    
FROM node:22-alpine AS production

# Install dumb-init untuk proper signal handling
RUN apk add --no-cache dumb-init

#Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

#Set working directory
WORKDIR /app

#Copy node_modules from builder stage
COPY --from=builder --chown=nodejs:nodejs /app/node_modules/ ./node_modules

#Copy application code
COPY --chown=nodejs:nodejs . .

#Remove unnecessary files for reduce size
RUN rm -rf .git .gitignore README.md .env.example

#Switch to non-root user

USER nodejs

#Expose port
EXPOSE 3006

#Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node healthcheck.js || exit 1


#Use dumb-init as entrypoint
ENTRYPOINT [ "dumb-init", "--" ]

#Start app
CMD [ "node", "app.js" ]