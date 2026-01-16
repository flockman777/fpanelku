# FPanel - Mini Hosting Control Panel

FPanel is a modern, easy-to-use hosting control panel built with Next.js 15, designed for small web hosting providers, resellers, and web agencies.

![FPanel Logo](public/logo.svg)

## 🌟 Features

### Core Features
- **User Authentication** - Secure login/register with JWT tokens and role-based access control
- **License System** - Flexible licensing with tier-based limits (Basic, Professional, Enterprise)
- **Dashboard** - Real-time server monitoring with CPU, RAM, and disk usage

### Management Features
- **Domain Management** - Add, manage, and monitor your domains with SSL status
- **Database Management** - Create and manage MySQL databases with credentials viewer
- **File Manager** - Web-based file browser with upload, create folder, rename, delete
- **SSL Management** - Install Let's Encrypt SSL certificates with auto-renewal
- **Email Management** - Create email accounts with forwarding and auto-reply
- **FTP Management** - Manage FTP users with quota and home path configuration
- **Cron Jobs** - Schedule automated tasks with cron expressions
- **Backup System** - Automated backups (full, database, files) with status tracking

### UI/UX Features
- **Beautiful UI** - Modern interface built with shadcn/ui and Tailwind CSS
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile devices
- **Search Functionality** - Search across all management sections
- **Real-time Updates** - Auto-refresh and live monitoring
- **Status Indicators** - Visual status badges and notifications
- **Quick Actions** - Fast access to all features from dashboard

## 💰 Pricing Tiers

| Tier | Price | Servers | Domains | Storage | Support |
|------|-------|---------|---------|---------|---------|
| **Basic** | Rp 50.000/month | 1 | 10 | 5 GB | Community |
| **Professional** | Rp 150.000/month | 3 | 50 | 20 GB | Priority |
| **Enterprise** | Rp 500.000/month | Unlimited | Unlimited | Unlimited | 24/7 Premium |

## 🚀 Quick Start

### Option 1: Auto-Install Script (Ubuntu 24.04)

The easiest way to install FPanel on your VPS:

```bash
# Download and run the installer
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/fpanel/main/install.sh -o install.sh
chmod +x install.sh
sudo ./install.sh
```

The installer will automatically:
- Update your system
- Install all dependencies (Node.js, Bun, Nginx, etc.)
- Configure the web server
- Set up the firewall and security
- Start FPanel as a system service

### Option 2: Docker Deployment

Using Docker Compose:

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/fpanel.git
cd fpanel

# Create environment file
cp .env.example .env
nano .env  # Edit your configuration

# Start with Docker Compose
docker-compose up -d
```

### Option 3: Manual Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/fpanel.git
cd fpanel

# Install dependencies
bun install

# Setup database
bun run db:push

# Build the application
bun run build

# Start the production server
bun run start
```

## 📋 Requirements

### Minimum Requirements
- **OS**: Ubuntu 24.04 LTS (recommended)
- **CPU**: 1 Core
- **RAM**: 1 GB
- **Disk**: 20 GB
- **Network**: Internet connection

### Recommended Requirements
- **OS**: Ubuntu 24.04 LTS
- **CPU**: 2+ Cores
- **RAM**: 2+ GB
- **Disk**: 40+ GB SSD

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="file:./db/custom.db"

# JWT Secret (CHANGE THIS IN PRODUCTION!)
JWT_SECRET="your-very-secret-jwt-key-change-this"

# Server
PORT=3000
NODE_ENV=production
```

### Nginx Configuration

The installer will automatically configure Nginx. Manual configuration is available in `nginx/nginx.conf`.

### Firewall Rules

The installer configures UFW with these rules:
- Port 22 (SSH)
- Port 80 (HTTP)
- Port 443 (HTTPS)

## 📁 Project Structure

```
fpanel/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── dashboard/     # Dashboard endpoints
│   │   │   └── licenses/      # License management
│   │   ├── dashboard/         # Dashboard pages
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Main page (login)
│   ├── components/            # React components
│   │   └── ui/                # shadcn/ui components
│   ├── lib/                   # Utility functions
│   │   ├── db.ts              # Prisma client
│   │   └── utils.ts           # Utilities
│   └── hooks/                 # Custom React hooks
├── prisma/
│   └── schema.prisma          # Database schema
├── public/                    # Static files
├── docker-compose.yml         # Docker configuration
├── Dockerfile                 # Docker image
├── install.sh                 # Auto-install script
└── README.md                  # This file
```

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - Bcrypt encryption for passwords
- **Role-Based Access** - Admin, Reseller, and User roles
- **License Validation** - Domain and hardware ID binding
- **Firewall** - UFW with essential ports only
- **Fail2Ban** - Brute-force protection
- **HTTPS Ready** - SSL/TLS support with Let's Encrypt

## 🎨 Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Components**: shadcn/ui (New York style)
- **Icons**: Lucide React
- **Charts**: Recharts

### Backend
- **Runtime**: Bun
- **Database**: SQLite with Prisma ORM
- **Authentication**: JWT
- **API**: Next.js API Routes

### DevOps
- **Container**: Docker & Docker Compose
- **Web Server**: Nginx
- **Process Manager**: systemd (native) / PM2
- **Security**: UFW + Fail2Ban

## 📊 API Documentation

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

### Dashboard

#### Get Server Stats
```http
GET /api/dashboard/stats
Authorization: Bearer <token>
```

#### Get Domains
```http
GET /api/dashboard/domains
Authorization: Bearer <token>
```

### Licenses

#### Generate License
```http
POST /api/licenses/generate
Content-Type: application/json
Authorization: Bearer <token>

{
  "tier": "basic",
  "domain": "example.com"
}
```

#### Validate License
```http
POST /api/licenses/validate
Content-Type: application/json

{
  "licenseKey": "XXXX-XXXX-XXXX-XXXX",
  "domain": "example.com",
  "hardwareId": "unique-hardware-id"
}
```

## 🛠️ Maintenance

### Update FPanel
```bash
cd /opt/fpanel
git pull
bun install
bun run build
systemctl restart fpanel
```

### View Logs
```bash
# Application logs
journalctl -u fpanel -f

# Error logs
tail -f /opt/fpanel/logs/fpanel.error.log

# Nginx logs
tail -f /var/log/nginx/error.log
```

### Backup Database
```bash
# Backup SQLite database
cp /opt/fpanel/db/custom.db /opt/fpanel/db/backup/custom-$(date +%Y%m%d).db
```

### Restore Database
```bash
# Stop service
systemctl stop fpanel

# Restore database
cp /opt/fpanel/db/backup/custom-20240101.db /opt/fpanel/db/custom.db

# Start service
systemctl start fpanel
```

## 🐛 Troubleshooting

### FPanel won't start
```bash
# Check service status
systemctl status fpanel

# View logs
journalctl -u fpanel -n 50
```

### Database errors
```bash
# Check database file
ls -lh /opt/fpanel/db/custom.db

# Re-create database
cd /opt/fpanel
bun run db:push
```

### Nginx not serving
```bash
# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx

# Check Nginx logs
tail -f /var/log/nginx/error.log
```

## 📚 Documentation

- [Installation Guide](docs/installation.md)
- [User Manual](docs/user-guide.md)
- [API Documentation](docs/api-docs.md)
- [Troubleshooting](docs/troubleshooting.md)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

FPanel is licensed under the MIT License. See [LICENSE](LICENSE) for more information.

## 💬 Support

- **Email**: support@fpanel.io
- **Discord**: [FPanel Community](https://discord.gg/fpanel)
- **Documentation**: [docs.fpanel.io](https://docs.fpanel.io)
- **Status**: [status.fpanel.io](https://status.fpanel.io)

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- shadcn for the beautiful UI components
- Tailwind CSS for the styling system
- All contributors and users of FPanel

---

**Built with ❤️ by FPanel Team**
