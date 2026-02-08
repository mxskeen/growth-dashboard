#!/bin/bash
# AWS EC2 setup script for Growth Dashboard

set -e

echo "=== Growth Dashboard AWS Setup ==="

# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install dependencies
sudo apt-get install -y python3-pip python3-venv nginx git

# Create app directory
sudo mkdir -p /var/www/growth-dashboard
sudo chown ubuntu:ubuntu /var/www/growth-dashboard

# Clone repo
cd /var/www/growth-dashboard
git clone https://github.com/mxskeen/growth-dashboard.git .

# Setup Python environment
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Create systemd service
sudo tee /etc/systemd/system/growth-dashboard.service > /dev/null << EOF
[Unit]
Description=Growth Dashboard FastAPI App
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/var/www/growth-dashboard
Environment="PATH=/var/www/growth-dashboard/.venv/bin"
ExecStart=/var/www/growth-dashboard/.venv/bin/uvicorn backend.main:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

# Setup nginx
sudo tee /etc/nginx/sites-available/growth-dashboard > /dev/null << EOF
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/growth-dashboard /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx config
sudo nginx -t

# Start services
sudo systemctl daemon-reload
sudo systemctl enable growth-dashboard
sudo systemctl start growth-dashboard
sudo systemctl restart nginx

echo "=== Setup Complete ==="
echo "App running on: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
echo ""
echo "To update app:"
echo "  cd /var/www/growth-dashboard && git pull && sudo systemctl restart growth-dashboard"
