#!/bin/bash

# FPanel Auto-Installer for Ubuntu 24.04
# This script installs FPanel on your VPS automatically

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_banner() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║                                                          ║"
    echo "║           FPanel - Mini Hosting Control Panel             ║"
    echo "║                  Auto-Installer v1.0                     ║"
    echo "║                                                          ║"
    echo "║              for Ubuntu 24.04 LTS                        ║"
    echo "║                                                          ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_step() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_error "Please run as root"
        exit 1
    fi
}

check_ubuntu() {
    if [ ! -f /etc/lsb-release ]; then
        print_error "This script only works on Ubuntu"
        exit 1
    fi

    . /etc/lsb-release
    if [ "$DISTRIB_ID" != "Ubuntu" ]; then
        print_error "This script only works on Ubuntu"
        exit 1
    fi

    if [ "$DISTRIB_RELEASE" != "24.04" ]; then
        print_warning "This script is designed for Ubuntu 24.04, but you're running $DISTRIB_RELEASE"
        read -p "Continue anyway? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

check_resources() {
    print_step "Checking system resources..."

    # Check disk space (need at least 10GB free)
    local free_space=$(df -BG / | awk 'NR==2 {print $4}' | sed 's/G//')
    if [ "$free_space" -lt 10 ]; then
        print_error "Insufficient disk space. Need at least 10GB free."
        exit 1
    fi
    print_success "Disk space OK: ${free_space}GB free"

    # Check RAM (need at least 1GB)
    local total_ram=$(free -m | awk 'NR==2 {print $2}')
    if [ "$total_ram" -lt 1024 ]; then
        print_warning "Low RAM detected (${total_ram}MB). Recommended: 1GB+"
    fi
    print_success "RAM: ${total_ram}MB"
}

update_system() {
    print_step "Updating system packages..."
    apt-get update -qq
    apt-get upgrade -y -qq
    print_success "System updated"
}

install_dependencies() {
    print_step "Installing dependencies..."

    # Core dependencies
    apt-get install -y -qq \
        curl \
        wget \
        git \
        unzip \
        build-essential \
        python3 \
        python3-pip \
        nodejs \
        npm \
        nginx \
        sqlite3 \
        certbot \
        ufw \
        fail2ban

    # Install Bun (if not already installed)
    if ! command -v bun &> /dev/null; then
        print_step "Installing Bun runtime..."
        curl -fsSL https://bun.sh/install | bash
        export BUN_INSTALL="$HOME/.bun"
        export PATH="$BUN_INSTALL/bin:$PATH"
        print_success "Bun installed"
    else
        print_success "Bun already installed"
    fi

    print_success "Dependencies installed"
}

setup_fpanel() {
    print_step "Setting up FPanel..."

    # Create FPanel directory
    FPanel_DIR="/opt/fpanel"
    mkdir -p "$FPanel_DIR"
    cd "$FPanel_DIR"

    # Clone FPanel from GitHub (you'll need to push your code there)
    print_step "Cloning FPanel from repository..."
    # git clone https://github.com/YOUR_USERNAME/fpanel.git .
    # For now, we'll assume the files are already here or you'll upload them

    # Create necessary directories
    mkdir -p "$FPanel_DIR/db"
    mkdir -p "$FPanel_DIR/upload"
    mkdir -p "$FPanel_DIR/logs"

    # Set permissions
    chown -R www-data:www-data "$FPanel_DIR"

    print_success "FPanel directory created"
}

install_fpanel() {
    print_step "Installing FPanel dependencies..."

    FPanel_DIR="/opt/fpanel"
    cd "$FPanel_DIR"

    # Install npm dependencies
    if [ -f "package.json" ]; then
        bun install
    fi

    # Push database schema
    if [ -f "prisma/schema.prisma" ]; then
        bun run db:push
    fi

    # Build the application
    bun run build

    print_success "FPanel installed"
}

setup_nginx() {
    print_step "Setting up Nginx..."

    cat > /etc/nginx/sites-available/fpanel << 'EOF'
server {
    listen 80;
    server_name _;

    # Maximum upload size
    client_max_body_size 100M;

    # Proxy to FPanel
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

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static files
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
    }
}
EOF

    # Enable site
    ln -sf /etc/nginx/sites-available/fpanel /etc/nginx/sites-enabled/fpanel
    rm -f /etc/nginx/sites-enabled/default

    # Test and restart nginx
    nginx -t
    systemctl restart nginx
    systemctl enable nginx

    print_success "Nginx configured"
}

setup_systemd() {
    print_step "Setting up FPanel systemd service..."

    cat > /etc/systemd/system/fpanel.service << 'EOF'
[Unit]
Description=FPanel - Mini Hosting Control Panel
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/fpanel
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/root/.bun/bin/bun run start
Restart=always
RestartSec=10
StandardOutput=append:/opt/fpanel/logs/fpanel.log
StandardError=append:/opt/fpanel/logs/fpanel.error.log

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable fpanel

    print_success "Systemd service configured"
}

setup_firewall() {
    print_step "Configuring firewall..."

    # Reset UFW
    ufw --force reset

    # Allow essential ports
    ufw allow 22/tcp    # SSH
    ufw allow 80/tcp    # HTTP
    ufw allow 443/tcp   # HTTPS

    # Enable firewall
    ufw --force enable

    print_success "Firewall configured"
}

setup_fail2ban() {
    print_step "Setting up Fail2Ban..."

    cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log
EOF

    systemctl restart fail2ban
    systemctl enable fail2ban

    print_success "Fail2Ban configured"
}

start_services() {
    print_step "Starting services..."

    # Start FPanel
    systemctl start fpanel

    # Wait a moment for the service to start
    sleep 5

    # Check if service is running
    if systemctl is-active --quiet fpanel; then
        print_success "FPanel service started"
    else
        print_error "Failed to start FPanel service"
        journalctl -u fpanel -n 50
        exit 1
    fi
}

print_completion() {
    echo -e "${GREEN}"
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║                    INSTALLATION COMPLETE!                 ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
    echo -e "${GREEN}FPanel has been successfully installed!${NC}"
    echo ""
    echo "Access your FPanel at: ${BLUE}http://YOUR_SERVER_IP${NC}"
    echo ""
    echo "Important Information:"
    echo "  - FPanel directory: ${BLUE}/opt/fpanel${NC}"
    echo "  - Logs directory: ${BLUE}/opt/fpanel/logs${NC}"
    echo "  - Database: ${BLUE}/opt/fpanel/db/custom.db${NC}"
    echo "  - Service: ${BLUE}systemctl status fpanel${NC}"
    echo ""
    echo "Useful Commands:"
    echo "  - Start service: ${BLUE}systemctl start fpanel${NC}"
    echo "  - Stop service: ${BLUE}systemctl stop fpanel${NC}"
    echo "  - Restart service: ${BLUE}systemctl restart fpanel${NC}"
    echo "  - View logs: ${BLUE}journalctl -u fpanel -f${NC}"
    echo "  - Update FPanel: ${BLUE}cd /opt/fpanel && git pull && bun install && bun run build && systemctl restart fpanel${NC}"
    echo ""
    echo "Next Steps:"
    echo "  1. Access the panel at http://YOUR_SERVER_IP"
    echo "  2. Create your admin account"
    echo "  3. Configure your license"
    echo "  4. Add your first domain"
    echo ""
}

# Main installation flow
main() {
    print_banner

    check_root
    check_ubuntu
    check_resources

    read -p "Do you want to continue with the installation? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Installation cancelled"
        exit 0
    fi

    echo ""

    update_system
    install_dependencies
    setup_fpanel
    install_fpanel
    setup_nginx
    setup_systemd
    setup_firewall
    setup_fail2ban
    start_services

    print_completion
}

# Run main function
main
