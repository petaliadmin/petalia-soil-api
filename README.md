# 🌾 AgriLand API

API REST professionnelle pour plateforme agricole avec géolocalisation, développée avec NestJS, MongoDB Atlas et JWT Auth.

## 📋 Table des matières

- [Caractéristiques](#caractéristiques)
- [Stack Technique](#stack-technique)
- [Installation](#installation)
- [Configuration](#configuration)
- [Démarrage](#démarrage)
- [Architecture](#architecture)
- [Endpoints API](#endpoints-api)
- [Authentification](#authentification)
- [Modules](#modules)
- [Exemples d'utilisation](#exemples-dutilisation)

## ✨ Caractéristiques

- ✅ **Authentification JWT** avec bcrypt
- ✅ **Rôles utilisateurs** (ADMIN, OWNER, FARMER)
- ✅ **Gestion des terres agricoles** (CRUD complet)
- ✅ **Géolocalisation GeoJSON** avec index 2dsphere
- ✅ **Recherche géographique** par rayon (km)
- ✅ **Analyse du sol** (pH, NPK, texture)
- ✅ **Recommandations de cultures** basées sur IA
- ✅ **Contact WhatsApp** entre propriétaires et agriculteurs
- ✅ **Filtres avancés** (pH, surface, type)
- ✅ **Pagination** des résultats
- ✅ **Documentation Swagger** interactive
- ✅ **Validation robuste** avec class-validator

## 🛠 Stack Technique

- **Framework**: NestJS 10.x
- **Base de données**: MongoDB Atlas (Cloud)
- **ODM**: Mongoose
- **Auth**: JWT + Passport
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI
- **Sécurité**: Guards, Roles, bcrypt

## 📦 Installation

```bash
# Cloner le projet
git clone <repository-url>
cd agriland-api

# Installer les dépendances
npm install
```

## ⚙️ Configuration

Créer un fichier `.env` à la racine du projet :

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/agriland?retryWrites=true&w=majority

# JWT
JWT_SECRET=votre-cle-secrete-super-complexe
JWT_EXPIRATION=7d

# Application
PORT=3000
NODE_ENV=development

# API Documentation
API_TITLE=AgriLand API
API_DESCRIPTION=API REST pour plateforme agricole
API_VERSION=1.0
```

### Configuration MongoDB Atlas

1. Créer un compte sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créer un cluster gratuit
3. Créer un utilisateur de base de données
4. Whitelist votre IP (ou 0.0.0.0/0 pour tous)
5. Copier la connection string dans `.env`

## 🚀 Démarrage

```bash
# Mode développement avec hot-reload
npm run start:dev

# Mode production
npm run build
npm run start:prod
```

L'API sera accessible sur :
- **API**: http://localhost:3000
- **Documentation Swagger**: http://localhost:3000/api

## 📁 Architecture

```
src/
├── auth/                      # Module d'authentification
│   ├── dto/                   # DTOs pour login/register
│   ├── strategies/            # JWT Strategy
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── users/                     # Module utilisateurs
│   ├── dto/
│   ├── schemas/
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.module.ts
├── lands/                     # Module terres agricoles
│   ├── dto/
│   ├── schemas/
│   ├── lands.controller.ts
│   ├── lands.service.ts
│   └── lands.module.ts
├── soil/                      # Module paramètres du sol
│   ├── dto/
│   └── schemas/
├── recommendations/           # Module recommandations
│   ├── interfaces/
│   ├── recommendations.controller.ts
│   ├── recommendations.service.ts
│   └── recommendations.module.ts
├── contact/                   # Module contact
│   ├── contact.controller.ts
│   ├── contact.service.ts
│   └── contact.module.ts
├── common/                    # Utilitaires partagés
│   ├── decorators/            # @Roles, @CurrentUser
│   ├── enums/                 # UserRole, LandType, SoilTexture
│   ├── guards/                # JwtAuthGuard, RolesGuard
│   └── interfaces/            # JwtPayload, Location
├── app.module.ts              # Module racine
└── main.ts                    # Point d'entrée avec Swagger
```

## 📡 Endpoints API

### 🔐 Authentication

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/auth/register` | Inscription | ❌ |
| POST | `/auth/login` | Connexion | ❌ |

### 👥 Users

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/users` | Liste des utilisateurs | ✅ JWT |

### 🌾 Lands

| Méthode | Endpoint | Description | Auth | Rôle |
|---------|----------|-------------|------|------|
| POST | `/lands` | Créer une terre | ✅ JWT | OWNER |
| GET | `/lands` | Liste avec filtres | ❌ | - |
| GET | `/lands/:id` | Détails d'une terre | ❌ | - |
| GET | `/lands/map` | Terres pour carte | ❌ | - |
| GET | `/lands/nearby` | Recherche par rayon | ❌ | - |
| PATCH | `/lands/:id` | Modifier une terre | ✅ JWT | OWNER |
| DELETE | `/lands/:id` | Supprimer une terre | ✅ JWT | OWNER |

### 🌱 Recommendations

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/lands/:id/recommendations` | Recommandations de cultures | ❌ |

### 📞 Contact

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/contact/land/:id` | Contact propriétaire | ✅ JWT |

## 🔑 Authentification

L'API utilise JWT Bearer Token :

```http
Authorization: Bearer <token>
```

### Exemple de connexion

```bash
# 1. S'inscrire
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Mamadou Diallo",
    "email": "mamadou@example.com",
    "password": "Password123!",
    "phone": "+221 77 123 45 67",
    "role": "OWNER"
  }'

# 2. Se connecter
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "mamadou@example.com",
    "password": "Password123!"
  }'

# Réponse
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65f...",
    "fullName": "Mamadou Diallo",
    "email": "mamadou@example.com",
    "role": "OWNER"
  }
}
```

## 📚 Modules

### 🔐 AuthModule

Gestion de l'authentification et de l'autorisation.

**Fonctionnalités** :
- Inscription avec hashage bcrypt
- Connexion avec JWT
- Validation des credentials
- Protection des routes

### 👥 UsersModule

Gestion des utilisateurs du système.

**Rôles disponibles** :
- `ADMIN` : Administrateur système
- `OWNER` : Propriétaire de terres
- `FARMER` : Agriculteur

### 🌾 LandsModule

Gestion complète des terres agricoles.

**Fonctionnalités** :
- CRUD complet
- GeoJSON Point (2dsphere)
- Filtres (type, surface, pH)
- Pagination
- Recherche géographique

**Schema Land** :
```typescript
{
  title: string;
  description: string;
  surfaceHectares: number;
  type: 'RENT' | 'SALE';
  price: number;
  isAvailable: boolean;
  owner: ObjectId;
  location: {
    region: string;
    commune: string;
    coordinates: {
      type: 'Point',
      coordinates: [longitude, latitude]
    }
  };
  soil: {
    ph: number;
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    soilTexture: 'SANDY' | 'CLAY' | 'LOAM';
    moisture?: number;
  }
}
```

### 🌱 RecommendationsModule

Système intelligent de recommandation de cultures.

**Règles de recommandation** :
- **Riz** : pH 5.5-6.5 + sol argileux
- **Maïs** : pH 6-7 + sol limoneux
- **Arachide** : pH 5-6 + sol sableux
- **Maraîchage** : NPK élevé + pH 6-7
- **Mil/Sorgho** : Sol sableux + résistant sécheresse
- **Niébé** : pH 5.5-7 + fixateur d'azote

### 📞 ContactModule

Mise en relation entre agriculteurs et propriétaires.

**Canaux de contact** :
- Téléphone
- Email
- WhatsApp (lien direct)

## 💡 Exemples d'utilisation

### Créer une terre

```bash
curl -X POST http://localhost:3000/lands \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Terre agricole à Rufisque",
    "description": "5 hectares de terre cultivable avec accès à l'\''eau",
    "surfaceHectares": 5.5,
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
      "ph": 6.2,
      "nitrogen": 55,
      "phosphorus": 30,
      "potassium": 160,
      "soilTexture": "LOAM",
      "moisture": 35
    }
  }'
```

### Rechercher des terres

```bash
# Toutes les terres disponibles
curl http://localhost:3000/lands

# Filtrer par type et surface
curl "http://localhost:3000/lands?type=RENT&minSurface=3&maxSurface=10&page=1&limit=10"

# Recherche par rayon (10 km autour de Dakar)
curl "http://localhost:3000/lands/nearby?longitude=-17.4467&latitude=14.6937&radius=10"
```

### Obtenir des recommandations

```bash
curl http://localhost:3000/lands/<landId>/recommendations
```

**Réponse** :
```json
{
  "landId": "65f...",
  "landTitle": "Terre agricole à Rufisque",
  "soilParameters": {
    "ph": 6.2,
    "nitrogen": 55,
    "phosphorus": 30,
    "potassium": 160,
    "soilTexture": "LOAM"
  },
  "recommendations": [
    {
      "crop": "Maïs",
      "suitability": "Excellente",
      "reason": "Sol limoneux avec pH 6.2, bon équilibre pour le maïs",
      "confidence": 90
    },
    {
      "crop": "Maraîchage (Tomates, Oignons, Choux)",
      "suitability": "Bonne",
      "reason": "NPK élevé (N:55, P:30, K:160) et pH 6.2, parfait pour cultures intensives",
      "confidence": 85
    }
  ],
  "generatedAt": "2025-01-21T10:30:00.000Z"
}
```

### Contacter un propriétaire

```bash
curl http://localhost:3000/contact/land/<landId> \
  -H "Authorization: Bearer <token>"
```

**Réponse** :
```json
{
  "landId": "65f...",
  "landTitle": "Terre agricole à Rufisque",
  "owner": {
    "name": "Mamadou Diallo",
    "email": "mamadou@example.com",
    "phone": "+221 77 123 45 67"
  },
  "contactMethods": {
    "phone": "+221 77 123 45 67",
    "email": "mamadou@example.com",
    "whatsapp": "https://wa.me/221771234567?text=Bonjour%2C%20je%20suis%20int%C3%A9ress%C3%A9(e)%20par%20votre%20terre%3A%20Terre%20agricole%20%C3%A0%20Rufisque"
  }
}
```

## 🔒 Sécurité

- ✅ Mots de passe hashés avec bcrypt (10 rounds)
- ✅ JWT avec expiration configurable
- ✅ Guards pour la protection des routes
- ✅ Validation stricte des inputs
- ✅ CORS configuré
- ✅ Protection OWNER sur modification/suppression

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests e2e
npm run test:e2e

# Couverture
npm run test:cov
```

## 📝 Documentation Swagger

Swagger UI disponible sur `/api` avec :
- Schémas détaillés
- Exemples de requêtes
- Test interactif des endpoints
- Authentification JWT intégrée

## 🚀 Déploiement

### Heroku

```bash
heroku create agriland-api
heroku config:set MONGODB_URI=<your-atlas-uri>
heroku config:set JWT_SECRET=<your-secret>
git push heroku main
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["npm", "run", "start:prod"]
```

## 🤝 Contribution

Les contributions sont les bienvenues ! Merci de :
1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

MIT

## 👨‍💻 Auteur

AgriLand Team - Backend NestJS Expert

---

**🌾 AgriLand - Connecter les terres aux cultivateurs**
