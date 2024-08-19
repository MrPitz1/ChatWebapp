#!/bin/sh

# Create nginx.conf dynamically based on environment variables
cat <<EOF > /etc/nginx/nginx.conf
events {}

http {
    log_format main '\$remote_addr - \$remote_user [\$time_local] "\$request" '
                      '\$status \$body_bytes_sent "\$http_referer" '
                      '"\$http_user_agent" "\$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    keepalive_timeout 65;

    upstream socket_server {
        server ${SOCKET_SERVER_HOST:-socket-server}:${SOCKET_SERVER_PORT:-5000};
    }

    upstream backend_server {
        server ${BACKEND_SERVER_HOST:-backend-server}:${BACKEND_SERVER_PORT:-7000};
    }

    upstream frontend {
        server ${FRONTEND_SERVER_HOST:-frontend}:${FRONTEND_SERVER_PORT:-3000};
    }

    server {
        listen ${NGINX_PORT:-4000};

        location / {
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;

            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection "Upgrade";

            if (\$http_upgrade = "websocket") {
                proxy_pass http://socket_server;
                break;
            }
            if (\$request_uri ~* "^/server/") {
                proxy_pass http://backend_server;
                break;
            }
            proxy_pass http://frontend;
        }
    }
}
EOF

# Start NGINX
nginx -g 'daemon off;'
