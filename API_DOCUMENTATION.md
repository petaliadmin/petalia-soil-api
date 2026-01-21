# 📚 Documentation Complète de l'API

Documentation détaillée de tous les endpoints de l'API AgriLand.

## 🔗 Base URL

```
http://localhost:3000
```

En production : `https://votre-domaine.com`

---

## 🔐 Authentication

### POST /auth/register
Inscription d'un nouvel utilisateur.

**Request Body:**
```json
{
  "fullName": "Amadou Diallo",
  "email": "amadou@example.com",
  "password": "Password123!",
  "phone": "+221 77 123 45 67",
  "role": "OWNER"
}
```

**Response 201:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "fullName": "Amadou Diallo",
    "email": "amadou@example.com",
    "phone": "+221 77 123 45 67",
    "role": "OWNER"
  }
}
```

**Response 409 (Email existe déjà):**
```json
{
  "statusCode": 409,
  "message": "Cet email est déjà utilisé"
}
```

---

### POST /auth/login
Connexion d'un utilisateur existant.

**Request Body:**
```json
{
  "email": "amadou@example.com",
  "password": "Password123!"
}
```

**Response 200:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "fullName": "Amadou Diallo",
    "email": "amadou@example.com",
    "phone": "+221 77 123 45 67",
    "role": "OWNER"
  }
}
```

**Response 401 (Identifiants invalides):**
```json
{
  "statusCode": 401,
  "message": "Email ou mot de passe incorrect"
}
```

---

## 👥 Users

### GET /users
Récupérer tous les utilisateurs (authentification requise).

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
[
  {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "fullName": "Amadou Diallo",
    "email": "amadou@example.com",
    "phone": "+221 77 123 45 67",
    "role": "OWNER",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  },
  {
    "_id": "65f2b3c4d5e6f7g8h9i0j1k2",
    "fullName": "Fatou Sall",
    "email": "fatou@example.com",
    "phone": "+221 76 987 65 43",
    "role": "FARMER",
    "createdAt": "2025-01-16T14:20:00.000Z",
    "updatedAt": "2025-01-16T14:20:00.000Z"
  }
]
```

---

## 🌾 Lands

### POST /lands
Créer une nouvelle annonce de terre (OWNER uniquement).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "5 hectares de rizière à Rufisque",
  "description": "Excellente rizière avec système d'irrigation moderne",
  "surfaceHectares": 5.0,
  "type": "RENT",
  "price": 750000,
  "location": {
    "region": "Dakar",
    "commune": "Rufisque",
    "coordinates": {
      "type": "Point",
      "coordinates": [-17.2713, 14.7167]
    }
  },
  "soil": {
    "ph": 5.9,
    "nitrogen": 45,
    "phosphorus": 28,
    "potassium": 120,
    "soilTexture": "CLAY",
    "moisture": 65
  }
}
```

**Response 201:**
```json
{
  "_id": "65f3c4d5e6f7g8h9i0j1k2l3",
  "title": "5 hectares de rizière à Rufisque",
  "description": "Excellente rizière avec système d'irrigation moderne",
  "surfaceHectares": 5.0,
  "type": "RENT",
  "price": 750000,
  "isAvailable": true,
  "owner": "65f1a2b3c4d5e6f7g8h9i0j1",
  "location": {
    "region": "Dakar",
    "commune": "Rufisque",
    "coordinates": {
      "type": "Point",
      "coordinates": [-17.2713, 14.7167]
    }
  },
  "soil": {
    "ph": 5.9,
    "nitrogen": 45,
    "phosphorus": 28,
    "potassium": 120,
    "soilTexture": "CLAY",
    "moisture": 65
  },
  "createdAt": "2025-01-20T09:15:00.000Z",
  "updatedAt": "2025-01-20T09:15:00.000Z"
}
```

---

### GET /lands
Récupérer toutes les terres avec filtres et pagination.

**Query Parameters:**
- `type` (optional): `RENT` | `SALE`
- `minSurface` (optional): nombre minimum d'hectares
- `maxSurface` (optional): nombre maximum d'hectares
- `minPh` (optional): pH minimum du sol
- `maxPh` (optional): pH maximum du sol
- `page` (optional, default: 1): numéro de page
- `limit` (optional, default: 10): éléments par page

**Exemples:**
```
GET /lands
GET /lands?type=RENT
GET /lands?minSurface=5&maxSurface=10
GET /lands?type=SALE&minPh=6&maxPh=7
GET /lands?page=2&limit=20
```

**Response 200:**
```json
{
  "data": [
    {
      "_id": "65f3c4d5e6f7g8h9i0j1k2l3",
      "title": "5 hectares de rizière à Rufisque",
      "description": "Excellente rizière...",
      "surfaceHectares": 5.0,
      "type": "RENT",
      "price": 750000,
      "isAvailable": true,
      "owner": {
        "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
        "fullName": "Amadou Diallo",
        "email": "amadou@example.com",
        "phone": "+221 77 123 45 67"
      },
      "location": {
        "region": "Dakar",
        "commune": "Rufisque",
        "coordinates": {
          "type": "Point",
          "coordinates": [-17.2713, 14.7167]
        }
      },
      "soil": {
        "ph": 5.9,
        "nitrogen": 45,
        "phosphorus": 28,
        "potassium": 120,
        "soilTexture": "CLAY",
        "moisture": 65
      },
      "createdAt": "2025-01-20T09:15:00.000Z",
      "updatedAt": "2025-01-20T09:15:00.000Z"
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 10,
  "totalPages": 3
}
```

---

### GET /lands/:id
Récupérer une terre par son ID.

**Response 200:**
```json
{
  "_id": "65f3c4d5e6f7g8h9i0j1k2l3",
  "title": "5 hectares de rizière à Rufisque",
  "description": "Excellente rizière avec système d'irrigation moderne",
  "surfaceHectares": 5.0,
  "type": "RENT",
  "price": 750000,
  "isAvailable": true,
  "owner": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "fullName": "Amadou Diallo",
    "email": "amadou@example.com",
    "phone": "+221 77 123 45 67"
  },
  "location": {
    "region": "Dakar",
    "commune": "Rufisque",
    "coordinates": {
      "type": "Point",
      "coordinates": [-17.2713, 14.7167]
    }
  },
  "soil": {
    "ph": 5.9,
    "nitrogen": 45,
    "phosphorus": 28,
    "potassium": 120,
    "soilTexture": "CLAY",
    "moisture": 65
  },
  "createdAt": "2025-01-20T09:15:00.000Z",
  "updatedAt": "2025-01-20T09:15:00.000Z"
}
```

**Response 404:**
```json
{
  "statusCode": 404,
  "message": "Terre non trouvée"
}
```

---

### GET /lands/map
Récupérer les terres pour affichage sur une carte (données simplifiées).

**Response 200:**
```json
[
  {
    "_id": "65f3c4d5e6f7g8h9i0j1k2l3",
    "title": "5 hectares de rizière à Rufisque",
    "type": "RENT",
    "price": 750000,
    "surfaceHectares": 5.0,
    "location": {
      "region": "Dakar",
      "commune": "Rufisque",
      "coordinates": {
        "type": "Point",
        "coordinates": [-17.2713, 14.7167]
      }
    }
  },
  {
    "_id": "65f4d5e6f7g8h9i0j1k2l3m4",
    "title": "10 hectares à Thiès",
    "type": "SALE",
    "price": 15000000,
    "surfaceHectares": 10.5,
    "location": {
      "region": "Thiès",
      "commune": "Thiès Ville",
      "coordinates": {
        "type": "Point",
        "coordinates": [-16.9333, 14.7833]
      }
    }
  }
]
```

---

### GET /lands/nearby
Rechercher des terres dans un rayon donné (géolocalisation).

**Query Parameters:**
- `longitude` (required): longitude du point central
- `latitude` (required): latitude du point central
- `radius` (required): rayon de recherche en kilomètres

**Exemple:**
```
GET /lands/nearby?longitude=-17.4467&latitude=14.6937&radius=20
```

**Response 200:**
```json
[
  {
    "_id": "65f3c4d5e6f7g8h9i0j1k2l3",
    "title": "5 hectares de rizière à Rufisque",
    "distance": 12.5,
    "surfaceHectares": 5.0,
    "type": "RENT",
    "price": 750000,
    "location": {
      "region": "Dakar",
      "commune": "Rufisque",
      "coordinates": {
        "type": "Point",
        "coordinates": [-17.2713, 14.7167]
      }
    },
    "owner": {
      "fullName": "Amadou Diallo",
      "phone": "+221 77 123 45 67"
    }
  }
]
```

---

### PATCH /lands/:id
Mettre à jour une terre (OWNER uniquement, doit être le propriétaire).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body (tous les champs sont optionnels):**
```json
{
  "title": "Nouveau titre",
  "price": 800000,
  "isAvailable": false
}
```

**Response 200:**
```json
{
  "_id": "65f3c4d5e6f7g8h9i0j1k2l3",
  "title": "Nouveau titre",
  "description": "Excellente rizière...",
  "price": 800000,
  "isAvailable": false,
  ...
}
```

**Response 403 (Pas le propriétaire):**
```json
{
  "statusCode": 403,
  "message": "Vous n'êtes pas autorisé à modifier cette terre"
}
```

---

### DELETE /lands/:id
Supprimer une terre (OWNER uniquement, doit être le propriétaire).

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "message": "Terre supprimée avec succès"
}
```

**Response 403:**
```json
{
  "statusCode": 403,
  "message": "Vous n'êtes pas autorisé à supprimer cette terre"
}
```

---

## 🌱 Recommendations

### GET /lands/:id/recommendations
Obtenir des recommandations de cultures pour une terre.

**Response 200:**
```json
{
  "landId": "65f3c4d5e6f7g8h9i0j1k2l3",
  "landTitle": "5 hectares de rizière à Rufisque",
  "soilParameters": {
    "ph": 5.9,
    "nitrogen": 45,
    "phosphorus": 28,
    "potassium": 120,
    "soilTexture": "CLAY",
    "moisture": 65
  },
  "recommendations": [
    {
      "crop": "Riz",
      "suitability": "Excellente",
      "reason": "Sol argileux avec pH 5.9, idéal pour la rétention d'eau nécessaire au riz",
      "confidence": 90
    },
    {
      "crop": "Niébé",
      "suitability": "Bonne",
      "reason": "pH 5.9 adapté au niébé, légumineuse fixatrice d'azote",
      "confidence": 75
    }
  ],
  "generatedAt": "2025-01-21T10:30:00.000Z"
}
```

---

## 📞 Contact

### GET /contact/land/:id
Obtenir les informations de contact du propriétaire d'une terre.

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "landId": "65f3c4d5e6f7g8h9i0j1k2l3",
  "landTitle": "5 hectares de rizière à Rufisque",
  "owner": {
    "name": "Amadou Diallo",
    "email": "amadou@example.com",
    "phone": "+221 77 123 45 67"
  },
  "contactMethods": {
    "phone": "+221 77 123 45 67",
    "email": "amadou@example.com",
    "whatsapp": "https://wa.me/221771234567?text=Bonjour%2C%20je%20suis%20int%C3%A9ress%C3%A9(e)%20par%20votre%20terre%3A%205%20hectares%20de%20rizi%C3%A8re%20%C3%A0%20Rufisque"
  },
  "message": "Vous pouvez contacter Amadou Diallo pour cette terre"
}
```

---

## 🔒 Codes d'Erreur Communs

| Code | Message | Description |
|------|---------|-------------|
| 400 | Bad Request | Données de requête invalides |
| 401 | Unauthorized | Token manquant ou invalide |
| 403 | Forbidden | Accès interdit (rôle insuffisant) |
| 404 | Not Found | Ressource non trouvée |
| 409 | Conflict | Conflit (ex: email déjà utilisé) |
| 500 | Internal Server Error | Erreur serveur |

---

## 📝 Enums

### UserRole
- `ADMIN` - Administrateur système
- `OWNER` - Propriétaire de terres
- `FARMER` - Agriculteur

### LandType
- `RENT` - Location
- `SALE` - Vente

### SoilTexture
- `SANDY` - Sableux
- `CLAY` - Argileux
- `LOAM` - Limoneux

---

## 🔐 Authentification JWT

Toutes les routes protégées nécessitent un header :

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Le token expire après **7 jours** (configurable via `JWT_EXPIRATION`).

---

## 📊 Limites de Pagination

- `limit` max: 100 éléments par page
- `page` min: 1

---

## 🌍 Format GeoJSON

Les coordonnées suivent le format GeoJSON Point :

```json
{
  "type": "Point",
  "coordinates": [longitude, latitude]
}
```

⚠️ **Important** : L'ordre est `[longitude, latitude]`, pas latitude/longitude !

---

## 💡 Conseils d'Utilisation

1. **Toujours valider les coordonnées GPS** avant d'envoyer
2. **Utiliser la pagination** pour les grandes listes
3. **Stocker le token JWT** en localStorage (frontend)
4. **Gérer l'expiration du token** (refresh après 7j)
5. **Utiliser les filtres** pour optimiser les recherches
6. **Tester sur Swagger** : http://localhost:3000/api

