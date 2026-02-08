#!/bin/bash
# Quick update script - run this after I push changes

cd /var/www/growth-dashboard

# Pull latest
git pull origin master

# Restart service
sudo systemctl restart growth-dashboard

echo "Updated and restarted"
