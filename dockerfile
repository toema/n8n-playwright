# Use the official n8n image as base
FROM docker.n8n.io/n8nio/n8n:1.79.3

# Install WebKit dependencies
USER root
RUN apt-get update && apt-get install -y --no-install-recommends \
    libwoff1 \
    libopus0 \
    libwebp6 \
    libwebpdemux2 \
    libenchant1c2a \
    libgudev-1.0-0 \
    libsecret-1-0 \
    libhyphen0 \
    libgdk-pixbuf2.0-0 \
    libegl1 \
    libnotify4 \
    libxslt1.1 \
    libevent-2.1-7 \
    libgles2 \
    libvpx6 \
    libxcomposite1 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libatspi2.0-0 \
    libcairo2 \
    libepoxy0 \
    libfontconfig1 \
    libfreetype6 \
    libgbm1 \
    libglib2.0-0 \
    libharfbuzz0b \
    libicu66 \
    libjpeg8 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libpangoft2-1.0-0 \
    libpixman-1-0 \
    libpng16-16 \
    libwayland-client0 \
    libwayland-egl1 \
    libwayland-server0 \
    libx11-6 \
    libdbus-glib-1-2 \
		libxt6 \
    libxcb1 \
    libxext6 \
    libxfixes3 \
    libpci3 \
		libasound2 \
    libxi6 \
    libxkbcommon0 \
    libxrandr2 \
    libxrender1 \
    libxshmfence1 \
    libgtk-3-0 \
    fonts-liberation \
    fonts-noto-color-emoji \
    ttf-ubuntu-font-family \
    && rm -rf /var/lib/apt/lists/*

# Switch back to node user
USER node

# Set working directory
WORKDIR /home/node/.n8n

# Create a volume for persistent data
VOLUME /home/node/.n8n

# Expose port 5678
EXPOSE 5678

# Set environment variables
ENV NODE_ENV=production

# Use the default n8n command to start the application
CMD ["n8n", "start"]
