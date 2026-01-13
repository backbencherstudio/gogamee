# ⚡ VPS Quick Start - Bengali

## 🎯 দ্রুত শুরু করার জন্য

### Step 1: VPS এ Connect করুন
```bash
ssh root@your-vps-ip
```

### Step 2: Node.js Install করুন
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

### Step 3: Nginx Install করুন
```bash
sudo apt install -y nginx
```

### Step 4: Project Clone করুন
```bash
cd /var/www
sudo git clone https://github.com/your-repo/gogamee.git
cd gogamee
sudo chown -R $USER:$USER /var/www/gogamee
```

### Step 5: Dependencies Install করুন
```bash
npm install
```

### Step 6: Environment Variables Setup করুন
```bash
nano .env.production
```
সব environment variables add করুন (Stripe, Redis, Email, etc.)

### Step 7: Build করুন
```bash
npm run build
```

### Step 8: PM2 দিয়ে Start করুন
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Step 9: Nginx Configure করুন
```bash
sudo nano /etc/nginx/sites-available/gogamee
```
Nginx config add করুন (VPS_DEPLOYMENT_GUIDE.md দেখুন)

```bash
sudo ln -s /etc/nginx/sites-available/gogamee /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 10: SSL Certificate (Domain থাকলে)
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Step 11: Firewall Setup
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## ✅ Check করুন
```bash
pm2 status
curl http://localhost:3000
```

## 🔄 Update করার জন্য
```bash
./deploy.sh
```

## 📝 Important Files
- `VPS_DEPLOYMENT_GUIDE.md` - Full detailed guide
- `deploy.sh` - Quick deployment script
- `ecosystem.config.js` - PM2 configuration

## 🆘 Help
- PM2 logs: `pm2 logs gogamee`
- Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Check status: `pm2 status`

