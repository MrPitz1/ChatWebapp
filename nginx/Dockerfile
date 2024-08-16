FROM nginx:latest

# Copy the configuration template
COPY nginx.conf.template /etc/nginx/nginx.conf.template

# Copy the custom entrypoint script
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Set the entrypoint
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
