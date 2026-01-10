# 🚀 VPS Deployment Guide - Step by Step

## 📋 Prerequisites Checklist

- [ ] VPS server (Ubuntu 20.04/22.04 recommended)
- [ ] Root/Sudo access
- [ ] Domain name (optional but recommended)
- [ ] SSH access to VPS

---

## Step 1: VPS Server Setup

### 1.1 Connect to Your VPS
```bash
ssh root@your-vps-ip
# or
ssh username@your-vps-ip
```

### 1.2 Update System
```bash
sudo apt update
sudo apt upgrade -y
```

### 1.3 Install Essential Tools
```bash
sudo apt install -y curl wget git build-essential
```

---

## Step 2: Install Node.js (LTS Version)

### 2.1 Install Node.js 20.x (Recommended for Next.js 16)
```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

### 2.2 Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
pm2 --version
```

---

## Step 3: Install Nginx (Reverse Proxy)

### 3.1 Install Nginx
```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 3.2 Check Nginx Status
```bash
sudo systemctl status nginx
```

---

## Step 4: Clone Your Repository

### 4.1 Create Application Directory
```bash
sudo mkdir -p /var/www
cd /var/www
```

### 4.2 Clone Repository
```bash
# Option 1: Using Git (if repo is on GitHub/GitLab)
sudo git clone https://github.com/your-username/gogamee.git
cd gogamee

# Option 2: Upload files manually using SCP
# From your local machine:
# scp -r ./gogamee root@your-vps-ip:/var/www/
```

### 4.3 Set Permissions
```bash
sudo chown -R $USER:$USER /var/www/gogamee
cd /var/www/gogamee
```

---

## Step 5: Install Dependencies

### 5.1 Install npm packages
```bash
npm install
```

### 5.2 Verify Installation
```bash
npm list --depth=0
```

---

## Step 6: Environment Variables Setup

### 6.1 Create .env.production file
```bash
nano .env.production
```

### 6.2 Add All Environment Variables
```env
# Node Environment
NODE_ENV=production

# Next.js Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
# or if no domain: http://your-vps-ip

# Database - Upstash Redis
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token

# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email Configuration (Gmail SMTP)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=info@gogame2025.com
MAIL_PASS=your_gmail_app_password
MAIL_FROM=info@gogame2025.com
MAIL_TO=info@gogame2025.com

# Vercel URL (if using)
VERCEL_URL=your-domain.com
```

### 6.3 Save and Exit
```bash
# Press Ctrl+X, then Y, then Enter
```

### 6.4 Secure the file
```bash
chmod 600 .env.production
```

---

## Step 7: Build the Application

### 7.1 Build for Production
```bash
npm run build
```

### 7.2 Verify Build Success
```bash
# Should see: ✓ Compiled successfully
ls -la .next
```

---

## Step 8: Setup PM2 Process Manager

### 8.1 Create PM2 Ecosystem File
```bash
nano ecosystem.config.js
```

### 8.2 Add PM2 Configuration
```javascript
module.exports = {
  apps: [{
    name: 'gogamee',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/var/www/gogamee',
    instances: 2, // Use 2 instances for better performance
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/www/gogamee/logs/pm2-error.log',
    out_file: '/var/www/gogamee/logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G'
  }]
};
```

### 8.3 Create Logs Directory
```bash
mkdir -p logs
```

### 8.4 Start Application with PM2
```bash
pm2 start ecosystem.config.js
```

### 8.5 Save PM2 Configuration
```bash
pm2 save
pm2 startup
# Run the command that PM2 outputs
```

### 8.6 Check PM2 Status
```bash
pm2 status
pm2 logs gogamee
```

---

## Step 9: Configure Nginx Reverse Proxy

### 9.1 Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/gogamee
```

### 9.2 Add Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    # If no domain, use: server_name your-vps-ip;

    # Increase body size for file uploads
    client_max_body_size 10M;

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

    # Static files caching
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
    }
}
```

### 9.3 Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/gogamee /etc/nginx/sites-enabled/
```

### 9.4 Test Nginx Configuration
```bash
sudo nginx -t
```

### 9.5 Reload Nginx
```bash
sudo systemctl reload nginx
```

---

## Step 10: Setup SSL Certificate (Let's Encrypt)

### 10.1 Install Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 10.2 Get SSL Certificate
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 10.3 Auto-renewal Setup
```bash
sudo certbot renew --dry-run
```

---

## Step 11: Configure Firewall

### 11.1 Setup UFW Firewall
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

---

## Step 12: Verify Deployment

### 12.1 Check Application Status
```bash
# PM2 Status
pm2 status

# Nginx Status
sudo systemctl status nginx

# Check if app is running
curl http://localhost:3000
```

### 12.2 Test from Browser
- Visit: `http://your-vps-ip` or `https://your-domain.com`
- Check all pages load correctly
- Test API endpoints

---

## Step 13: Setup Monitoring (Optional but Recommended)

### 13.1 Install PM2 Monitoring
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### 13.2 Setup PM2 Web Dashboard (Optional)
```bash
pm2 web
# Access at: http://your-vps-ip:9615
```

---

## Step 14: Database Verification

### 14.1 Verify Upstash Redis Connection
```bash
# Check environment variables
cat .env.production | grep UPSTASH

# Test connection (if you have redis-cli)
# Or check application logs
pm2 logs gogamee | grep -i redis
```

---

## Step 15: Stripe Webhook Setup

### 15.1 Update Stripe Webhook URL
1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-domain.com/api/webhooks/stripe`
3. Copy the webhook secret
4. Update `.env.production` with new secret
5. Restart PM2: `pm2 restart gogamee`

---

## 🔧 Useful Commands

### Application Management
```bash
# Start application
pm2 start gogamee

# Stop application
pm2 stop gogamee

# Restart application
pm2 restart gogamee

# View logs
pm2 logs gogamee

# View real-time logs
pm2 logs gogamee --lines 100

# Monitor
pm2 monit
```

### Nginx Management
```bash
# Restart Nginx
sudo systemctl restart nginx

# Reload Nginx (no downtime)
sudo systemctl reload nginx

# Check Nginx status
sudo systemctl status nginx

# View Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Build & Deploy Updates
```bash
# Pull latest changes
git pull origin main

# Install new dependencies
npm install

# Rebuild application
npm run build

# Restart application
pm2 restart gogamee
```

---

## 🐛 Troubleshooting

### Application Not Starting
```bash
# Check PM2 logs
pm2 logs gogamee --err

# Check if port 3000 is in use
sudo lsof -i :3000

# Check environment variables
pm2 env 0
```

### Nginx 502 Bad Gateway
```bash
# Check if app is running
pm2 status

# Check app logs
pm2 logs gogamee

# Restart application
pm2 restart gogamee
```

### Database Connection Issues
```bash
# Verify environment variables
cat .env.production | grep UPSTASH

# Check application logs
pm2 logs gogamee | grep -i "redis\|database"
```

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

---

## 📊 Performance Optimization

### 1. Enable Gzip Compression in Nginx
Add to nginx config:
```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
```

### 2. Increase PM2 Instances
```javascript
// In ecosystem.config.js
instances: 'max' // Use all CPU cores
```

### 3. Setup CDN (Optional)
- Use Cloudflare or similar CDN
- Cache static assets
- Reduce server load

---

## 🔒 Security Checklist

- [ ] Firewall configured (UFW)
- [ ] SSL certificate installed
- [ ] Environment variables secured (chmod 600)
- [ ] Regular security updates
- [ ] Strong passwords
- [ ] SSH key authentication (disable password login)
- [ ] Regular backups

---

## 📝 Maintenance Schedule

### Daily
- Check PM2 status: `pm2 status`
- Monitor logs: `pm2 logs gogamee --lines 50`

### Weekly
- Update system: `sudo apt update && sudo apt upgrade`
- Check disk space: `df -h`
- Review error logs

### Monthly
- Update dependencies: `npm audit fix`
- Backup database
- Review performance metrics

---

## 🎯 Quick Start Script

Create a deployment script:
```bash
nano deploy.sh
```

Add:
```bash
#!/bin/bash
echo "🚀 Starting deployment..."
git pull origin main
npm install
npm run build
pm2 restart gogamee
echo "✅ Deployment complete!"
```

Make executable:
```bash
chmod +x deploy.sh
```

Run:
```bash
./deploy.sh
```

---

## ✅ Final Checklist

- [ ] Node.js installed
- [ ] PM2 installed and configured
- [ ] Nginx installed and configured
- [ ] Application built successfully
- [ ] Environment variables set
- [ ] PM2 process running
- [ ] Nginx reverse proxy working
- [ ] SSL certificate installed (if using domain)
- [ ] Firewall configured
- [ ] Application accessible
- [ ] Database connected
- [ ] Stripe webhooks configured
- [ ] Email sending working

---

**🎉 Congratulations! Your application is now live on VPS!**

For support, check logs:
- Application: `pm2 logs gogamee`
- Nginx: `sudo tail -f /var/log/nginx/error.log`

