# 🚀 Guide de Démarrage Rapide - AgriLand API

Ce guide vous permet de démarrer l'API en 5 minutes.

## ⚡ Installation Express

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer l'environnement
cp .env.example .env

# 3. Éditer .env et ajouter votre MongoDB URI
nano .env

# 4. Démarrer le serveur
npm run start:dev
```

## 🗄️ Configuration MongoDB Atlas (Gratuit)

1. **Créer un compte** : https://www.mongodb.com/cloud/atlas/register
2. **Créer un cluster gratuit** (M0 - Free tier)
3. **Créer un utilisateur DB** :
   - Database Access → Add New Database User
   - Username: `agriland`
   - Password: générer un mot de passe fort
4. **Whitelist IP** :
   - Network Access → Add IP Address
   - Allow Access from Anywhere : `0.0.0.0/0`
5. **Obtenir la connection string** :
   - Databases → Connect → Connect your application
   - Copier l'URI : `mongodb+srv://agriland:<password>@cluster0.xxxxx.mongodb.net/`
6. **Mettre à jour .env** :
   ```env
   MONGODB_URI=mongodb+srv://agriland:VOTRE_PASSWORD@cluster0.xxxxx.mongodb.net/agriland?retryWrites=true&w=majority
   ```

## 🧪 Tester l'API

### 1. Ouvrir Swagger

Accéder à : http://localhost:3000/api

### 2. Créer un utilisateur

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test Owner",
    "email": "owner@test.com",
    "password": "Password123!",
    "phone": "+221771234567",
    "role": "OWNER"
  }'
```

### 3. Se connecter

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@test.com",
    "password": "Password123!"
  }'
```

**Copier le `access_token` de la réponse** ⬇️

### 4. Créer une terre

```bash
curl -X POST http://localhost:3000/lands \
  -H "Authorization: Bearer VOTRE_TOKEN_ICI" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Terre test à Dakar",
    "description": "Terre pour tests",
    "surfaceHectares": 5,
    "type": "RENT",
    "price": 500000,
    "location": {
      "region": "Dakar",
      "commune": "Rufisque",
      "coordinates": {
        "type": "Point",
        "coordinates": [-17.4467, 14.6937]
      }
    },
    "soil": {
      "ph": 6.5,
      "nitrogen": 50,
      "phosphorus": 30,
      "potassium": 150,
      "soilTexture": "LOAM"
    }
  }'
```

### 5. Obtenir des recommandations

```bash
# Remplacer LAND_ID par l'ID de la terre créée
curl http://localhost:3000/lands/LAND_ID/recommendations
```

## 📊 Endpoints Principaux

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api` | GET | Documentation Swagger |
| `/auth/register` | POST | Inscription |
| `/auth/login` | POST | Connexion |
| `/lands` | GET | Liste des terres |
| `/lands` | POST | Créer une terre |
| `/lands/:id` | GET | Détails d'une terre |
| `/lands/:id/recommendations` | GET | Recommandations |
| `/contact/land/:id` | GET | Contact propriétaire |

## 🔍 Vérifications

✅ MongoDB connecté → Check les logs au démarrage  
✅ Swagger accessible → http://localhost:3000/api  
✅ JWT fonctionnel → Tester login  
✅ GeoJSON index créé → Check MongoDB Compass  

## 🐛 Dépannage

### Erreur de connexion MongoDB

```
MongooseServerSelectionError: connect ECONNREFUSED
```

**Solutions** :
1. Vérifier `MONGODB_URI` dans `.env`
2. Vérifier que l'IP est whitelistée sur Atlas
3. Vérifier le mot de passe (pas de caractères spéciaux non encodés)

### Port déjà utilisé

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution** :
```bash
# Changer le port dans .env
PORT=3001
```

### JWT Invalid

**Solution** :
- Vérifier que le token est bien dans le header : `Authorization: Bearer <token>`
- Le token expire après 7 jours (configurable dans `.env`)

## 📱 Test Frontend

Voici un exemple de code Angular pour consommer l'API :

```typescript
// auth.service.ts
import { HttpClient } from '@angular/common/http';

export class AuthService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  register(data: any) {
    return this.http.post(`${this.apiUrl}/auth/register`, data);
  }

  login(email: string, password: string) {
    return this.http.post(`${this.apiUrl}/auth/login`, { email, password });
  }
}

// lands.service.ts
export class LandsService {
  getLands(filters?: any) {
    return this.http.get(`${this.apiUrl}/lands`, { params: filters });
  }

  createLand(land: any, token: string) {
    return this.http.post(`${this.apiUrl}/lands`, land, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}
```

## 🎯 Prochaines Étapes

1. ✅ API fonctionnelle
2. 📱 Créer votre frontend Angular
3. 🗺️ Intégrer une carte (Leaflet, Mapbox)
4. 📧 Ajouter l'envoi d'emails (Nodemailer)
5. 📸 Upload d'images des terres
6. 🔍 Améliorer les recommandations IA

## 💬 Support

En cas de problème :
1. Vérifier les logs : `npm run start:dev`
2. Tester sur Swagger : http://localhost:3000/api
3. Consulter le README.md complet

---

**Bonne chance ! 🚀**
