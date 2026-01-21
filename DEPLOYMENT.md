# 🚀 Guide de Déploiement - AgriLand API

Ce guide couvre le déploiement de l'API sur différentes plateformes.

## 📋 Pré-requis

- ✅ MongoDB Atlas configuré
- ✅ Variables d'environnement configurées
- ✅ Code testé en local
- ✅ Git repository créé

---

## 🌐 Déploiement sur Heroku

### 1. Installation Heroku CLI

```bash
# macOS
brew tap heroku/brew && brew install heroku

# Windows
# Télécharger depuis https://devcenter.heroku.com/articles/heroku-cli

# Linux
curl https://cli-assets.heroku.com/install.sh | sh
```

### 2. Login et Création de l'App

```bash
# Login
heroku login

# Créer l'application
heroku create agriland-api

# Ou avec un nom spécifique
heroku create votre-nom-app
```

### 3. Configuration des Variables d'Environnement

```bash
heroku config:set MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/agriland"
heroku config:set JWT_SECRET="votre-cle-secrete-super-complexe"
heroku config:set JWT_EXPIRATION="7d"
heroku config:set NODE_ENV="production"

# Vérifier
heroku config
```

### 4. Ajouter le Procfile

Créer un fichier `Procfile` à la racine :

```
web: npm run start:prod
```

### 5. Déploiement

```bash
# Initialiser git (si pas déjà fait)
git init
git add .
git commit -m "Initial commit"

# Déployer
git push heroku main

# Ouvrir l'app
heroku open

# Voir les logs
heroku logs --tail
```

### 6. URL de l'API

Votre API sera accessible sur :
```
https://votre-nom-app.herokuapp.com
```

Documentation Swagger :
```
https://votre-nom-app.herokuapp.com/api
```

---

## ☁️ Déploiement sur Render

### 1. Créer un compte

Aller sur https://render.com et créer un compte.

### 2. Nouveau Web Service

- Click "New +" → "Web Service"
- Connecter votre repository Git
- Configuration :
  - **Name**: agriland-api
  - **Environment**: Node
  - **Build Command**: `npm install && npm run build`
  - **Start Command**: `npm run start:prod`
  - **Instance Type**: Free

### 3. Variables d'Environnement

Dans l'onglet "Environment", ajouter :

```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=votre-secret
JWT_EXPIRATION=7d
NODE_ENV=production
PORT=3000
```

### 4. Déploiement

Render déploiera automatiquement à chaque push sur main.

---

## 🐳 Déploiement avec Docker

### 1. Créer le Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copier package.json
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le code source
COPY . .

# Build
RUN npm run build

# Exposer le port
EXPOSE 3000

# Démarrer l'app
CMD ["npm", "run", "start:prod"]
```

### 2. Créer .dockerignore

```
node_modules
npm-debug.log
.env
.git
.gitignore
README.md
dist
coverage
```

### 3. Build et Run

```bash
# Build l'image
docker build -t agriland-api .

# Run le container
docker run -p 3000:3000 \
  -e MONGODB_URI="mongodb+srv://..." \
  -e JWT_SECRET="secret" \
  agriland-api
```

### 4. Docker Compose

Créer `docker-compose.yml` :

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
      - JWT_EXPIRATION=7d
      - NODE_ENV=production
    restart: unless-stopped
```

```bash
# Démarrer
docker-compose up -d

# Arrêter
docker-compose down
```

---

## ☁️ Déploiement sur AWS (EC2)

### 1. Créer une instance EC2

- AMI: Ubuntu Server 22.04 LTS
- Type: t2.micro (Free tier)
- Security Group: Autoriser ports 22 (SSH) et 3000

### 2. Se connecter via SSH

```bash
ssh -i votre-cle.pem ubuntu@ec2-ip-address
```

### 3. Installation Node.js

```bash
# Mettre à jour
sudo apt update && sudo apt upgrade -y

# Installer Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installer PM2
sudo npm install -g pm2
```

### 4. Cloner et Installer

```bash
# Cloner le repo
git clone https://github.com/votre-repo/agriland-api.git
cd agriland-api

# Installer les dépendances
npm install

# Build
npm run build
```

### 5. Configurer les variables

```bash
# Créer .env
nano .env

# Ajouter vos variables
MONGODB_URI=...
JWT_SECRET=...
```

### 6. Démarrer avec PM2

```bash
# Démarrer l'app
pm2 start dist/main.js --name agriland-api

# Auto-démarrage au boot
pm2 startup
pm2 save

# Voir les logs
pm2 logs agriland-api

# Status
pm2 status
```

### 7. Configuration Nginx (Optionnel)

```bash
# Installer Nginx
sudo apt install nginx -y

# Configuration
sudo nano /etc/nginx/sites-available/agriland
```

```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Activer le site
sudo ln -s /etc/nginx/sites-available/agriland /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔒 SSL avec Let's Encrypt (AWS/VPS)

```bash
# Installer Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtenir le certificat
sudo certbot --nginx -d votre-domaine.com

# Auto-renouvellement
sudo certbot renew --dry-run
```

---

## 📊 Monitoring et Logs

### Heroku

```bash
# Logs en temps réel
heroku logs --tail

# Derniers logs
heroku logs --num 100
```

### PM2 (AWS/VPS)

```bash
# Monitoring
pm2 monit

# Logs
pm2 logs

# Restart
pm2 restart agriland-api
```

---

## 🔄 Mise à Jour (CI/CD)

### GitHub Actions

Créer `.github/workflows/deploy.yml` :

```yaml
name: Deploy to Heroku

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{secrets.HEROKU_API_KEY}}
          heroku_app_name: "agriland-api"
          heroku_email: "votre@email.com"
```

---

## ⚡ Optimisations Production

### 1. Compression

```bash
npm install compression
```

```typescript
// main.ts
import compression from 'compression';

app.use(compression());
```

### 2. Rate Limiting

```bash
npm install @nestjs/throttler
```

```typescript
// app.module.ts
import { ThrottlerModule } from '@nestjs/throttler';

ThrottlerModule.forRoot({
  ttl: 60,
  limit: 100,
}),
```

### 3. Helmet (Sécurité)

```bash
npm install helmet
```

```typescript
// main.ts
import helmet from 'helmet';

app.use(helmet());
```

---

## 🧪 Vérifications Post-Déploiement

```bash
# Health check
curl https://votre-app.com/

# Swagger
curl https://votre-app.com/api

# Test endpoint
curl https://votre-app.com/lands
```

---

## 🚨 Dépannage

### MongoDB Connection Error

```
MongooseServerSelectionError
```

**Solutions** :
1. Vérifier MONGODB_URI
2. Whitelist 0.0.0.0/0 sur Atlas (ou IP du serveur)
3. Vérifier le password (encoder caractères spéciaux)

### Port Already in Use

```bash
# Trouver le processus
lsof -i :3000

# Tuer le processus
kill -9 PID
```

### Out of Memory (Heroku)

Upgrader vers un dyno payant ou optimiser l'app.

---

## 📈 Scalabilité

### Horizontal Scaling (Heroku)

```bash
# Augmenter les dynos
heroku ps:scale web=2
```

### Load Balancing (AWS)

Utiliser AWS Elastic Load Balancer avec plusieurs instances EC2.

---

## 💾 Backup MongoDB

```bash
# Backup automatique sur Atlas
# Database → Backup → Enable

# Export manuel
mongodump --uri="mongodb+srv://..." --out=backup/
```

---

## 📝 Checklist Pré-Déploiement

- [ ] Tests passent
- [ ] .env configuré
- [ ] MongoDB Atlas accessible
- [ ] CORS configuré pour production
- [ ] SSL activé
- [ ] Monitoring configuré
- [ ] Backup activé
- [ ] Documentation à jour

---

## 🎯 URLs Utiles

- **Heroku Dashboard**: https://dashboard.heroku.com
- **Render Dashboard**: https://dashboard.render.com
- **MongoDB Atlas**: https://cloud.mongodb.com
- **Docker Hub**: https://hub.docker.com

---

**Bon déploiement ! 🚀**
