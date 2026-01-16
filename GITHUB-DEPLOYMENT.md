# FPanel GitHub Deployment Guide

This guide will help you deploy FPanel to GitHub and install it on your VPS.

## 📦 Preparing Your GitHub Repository

### 1. Create GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click the "+" icon in the top right → "New repository"
3. Name it: `fpanel`
4. Choose visibility (Public or Private)
5. Click "Create repository"

### 2. Initialize Git and Push

```bash
# Navigate to your project directory
cd /home/z/my-project

# Initialize git (if not already initialized)
git init

# Add all files
git add .

# Create .gitignore if it doesn't exist
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp/
.pnp.js

# Testing
coverage/

# Next.js
.next/
out/
build/

# Production
dist/

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts

# Database
db/*.db
db/*.db-journal

# Logs
logs/
*.log
dev.log
server.log

# Uploads
upload/*

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
Thumbs.db
EOF

# Commit changes
git commit -m "Initial commit: FPanel MVP"

# Rename remote if it exists
git remote rename origin old-origin

# Add new remote
git remote add origin https://github.com/YOUR_USERNAME/fpanel.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Note:** Replace `YOUR_USERNAME` with your GitHub username.

### 3. Verify GitHub Repository

Visit `https://github.com/YOUR_USERNAME/fpanel` to verify all files are uploaded.

## 🚀 Installing FPanel on Your VPS

### Method 1: One-Click Installation (Recommended)

```bash
# SSH into your VPS
ssh root@your-vps-ip

# Download and run installer
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/fpanel/main/install.sh -o install.sh
chmod +x install.sh
sudo ./install.sh
```

### Method 2: Manual Installation

```bash
# SSH into your VPS
ssh root@your-vps-ip

# Update system
apt update && apt upgrade -y

# Install git and other dependencies
apt install -y git curl wget

# Clone repository
git clone https://github.com/YOUR_USERNAME/fpanel.git /opt/fpanel
cd /opt/fpanel

# Install Bun
curl -fsSL https://bun.sh/install | bash
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

# Install dependencies
bun install

# Setup database
bun run db:push

# Build application
bun run build

# Create environment file
cp .env.example .env
nano .env  # Edit your configuration

# Setup systemd service
cat > /etc/systemd/system/fpanel.service << 'EOF'
[Unit]
Description=FPanel - Mini Hosting Control Panel
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/fpanel
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/root/.bun/bin/bun run start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
systemctl daemon-reload
systemctl enable fpanel
systemctl start fpanel

# Setup Nginx
apt install -y nginx
cat > /etc/nginx/sites-available/fpanel << 'EOF'
server {
    listen 80;
    server_name _;

    client_max_body_size 100M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

ln -sf /etc/nginx/sites-available/fpanel /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx

# Configure firewall
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
```

## 🔄 Updating FPanel

When you push updates to GitHub, update your VPS with:

```bash
# SSH into your VPS
ssh root@your-vps-ip

# Navigate to FPanel directory
cd /opt/fpanel

# Pull latest changes
git pull

# Install new dependencies
bun install

# Update database schema (if changed)
bun run db:push

# Rebuild application
bun run build

# Restart service
systemctl restart fpanel
```

## 🔧 Managing FPanel

### Start/Stop/Restart Service

```bash
# Start
systemctl start fpanel

# Stop
systemctl stop fpanel

# Restart
systemctl restart fpanel

# Check status
systemctl status fpanel
```

### View Logs

```bash
# Live logs
journalctl -u fpanel -f

# Last 100 lines
journalctl -u fpanel -n 100

# Since today
journalctl -u fpanel --since today
```

### Database Management

```bash
# Backup database
cp /opt/fpanel/db/custom.db /opt/fpanel/db/backup/custom-$(date +%Y%m%d-%H%M%S).db

# Restore database
systemctl stop fpanel
cp /opt/fpanel/db/backup/custom-20240101-120000.db /opt/fpanel/db/custom.db
systemctl start fpanel

# Access SQLite database
sqlite3 /opt/fpanel/db/custom.db
```

## 🔒 Security Recommendations

1. **Change JWT Secret**: Edit `.env` and set a strong `JWT_SECRET`
2. **Enable SSL**: Configure HTTPS with Let's Encrypt
3. **Firewall**: Keep UFW enabled with only necessary ports
4. **Updates**: Regularly run `apt update && apt upgrade`
5. **Backups**: Schedule regular database backups
6. **Monitoring**: Monitor disk space and resource usage

## 📊 Performance Optimization

1. **Enable Caching**: Configure Redis for caching
2. **CDN**: Use CDN for static assets
3. **Database**: Optimize database queries and add indexes
4. **Nginx**: Enable gzip compression (already configured)
5. **Monitor**: Use monitoring tools to track performance

## 🆘 Troubleshooting

### Service won't start
```bash
# Check service status
systemctl status fpanel

# View error logs
journalctl -u fpanel -n 50

# Check port usage
netstat -tlnp | grep 3000
```

### Can't access website
```bash
# Check Nginx status
systemctl status nginx

# Test Nginx config
nginx -t

# View Nginx logs
tail -f /var/log/nginx/error.log
```

### Database errors
```bash
# Check database file permissions
ls -lh /opt/fpanel/db/

# Re-create database
cd /opt/fpanel
bun run db:push
```

## 📝 Useful Links

- **GitHub Repository**: https://github.com/YOUR_USERNAME/fpanel
- **Documentation**: https://docs.fpanel.io
- **Support Email**: support@fpanel.io
- **Status Page**: https://status.fpanel.io

## 💡 Tips

1. Always test changes on a development/staging server first
2. Keep backups before updating
3. Monitor logs regularly
4. Keep dependencies up to date
5. Use strong passwords and secrets
6. Enable 2FA when available

---

For more information, visit the main [README.md](README-FPANEL.md)
