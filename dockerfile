# Use the official n8n image as base
FROM docker.n8n.io/n8nio/n8n:1.79.3

# Set working directory
WORKDIR /home/node/.n8n

# Create a volume for persistent data
VOLUME /home/node/.n8n

# Expose port 5678
EXPOSE 5678

# Set environment variables (if needed)
ENV NODE_ENV=production

# Use the default n8n command to start the application
CMD ["n8n", "start"]
