# 📊 Données d'Exemple pour Tests

Ce fichier contient des exemples de données JSON pour tester l'API.

## 👤 Utilisateurs d'exemple

### Propriétaire (OWNER)
```json
{
  "fullName": "Amadou Diallo",
  "email": "amadou.diallo@agriland.sn",
  "password": "Owner123!",
  "phone": "+221 77 123 45 67",
  "role": "OWNER"
}
```

### Agriculteur (FARMER)
```json
{
  "fullName": "Fatou Sall",
  "email": "fatou.sall@agriland.sn",
  "password": "Farmer123!",
  "phone": "+221 76 987 65 43",
  "role": "FARMER"
}
```

### Administrateur (ADMIN)
```json
{
  "fullName": "Ousmane Ndiaye",
  "email": "admin@agriland.sn",
  "password": "Admin123!",
  "phone": "+221 78 555 12 34",
  "role": "ADMIN"
}
```

## 🌾 Terres d'exemple

### Terre 1 - Location Dakar (Riz)
```json
{
  "title": "5 hectares de rizière à Rufisque",
  "description": "Excellente rizière avec système d'irrigation moderne. Sol argileux riche, parfait pour la culture du riz. Accès direct à l'eau toute l'année.",
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

### Terre 2 - Vente Thiès (Maïs)
```json
{
  "title": "10 hectares terre cultivable à Thiès",
  "description": "Grande parcelle avec sol limoneux fertile, idéale pour céréales et maraîchage. Proche de la ville, facile d'accès.",
  "surfaceHectares": 10.5,
  "type": "SALE",
  "price": 15000000,
  "location": {
    "region": "Thiès",
    "commune": "Thiès Ville",
    "coordinates": {
      "type": "Point",
      "coordinates": [-16.9333, 14.7833]
    }
  },
  "soil": {
    "ph": 6.5,
    "nitrogen": 60,
    "phosphorus": 35,
    "potassium": 180,
    "soilTexture": "LOAM",
    "moisture": 40
  }
}
```

### Terre 3 - Location Kaolack (Arachide)
```json
{
  "title": "Terrain sableux 8 ha pour arachide",
  "description": "Sol sableux bien drainé, traditionnel pour la culture d'arachide. Zone connue pour sa production.",
  "surfaceHectares": 8.0,
  "type": "RENT",
  "price": 600000,
  "location": {
    "region": "Kaolack",
    "commune": "Kaolack",
    "coordinates": {
      "type": "Point",
      "coordinates": [-16.0833, 14.15]
    }
  },
  "soil": {
    "ph": 5.8,
    "nitrogen": 35,
    "phosphorus": 22,
    "potassium": 110,
    "soilTexture": "SANDY",
    "moisture": 25
  }
}
```

### Terre 4 - Vente Ziguinchor (Maraîchage)
```json
{
  "title": "Terre maraîchère 3 ha avec puits",
  "description": "Parfaite pour maraîchage intensif. Sol très riche en NPK, puits fonctionnel, clôturée.",
  "surfaceHectares": 3.0,
  "type": "SALE",
  "price": 8500000,
  "location": {
    "region": "Ziguinchor",
    "commune": "Ziguinchor",
    "coordinates": {
      "type": "Point",
      "coordinates": [-16.2633, 12.5833]
    }
  },
  "soil": {
    "ph": 6.8,
    "nitrogen": 75,
    "phosphorus": 45,
    "potassium": 200,
    "soilTexture": "LOAM",
    "moisture": 55
  }
}
```

### Terre 5 - Location Saint-Louis (Mil/Sorgho)
```json
{
  "title": "12 hectares zone semi-aride",
  "description": "Grande parcelle adaptée aux cultures résistantes à la sécheresse. Sol sableux léger.",
  "surfaceHectares": 12.0,
  "type": "RENT",
  "price": 480000,
  "location": {
    "region": "Saint-Louis",
    "commune": "Saint-Louis",
    "coordinates": {
      "type": "Point",
      "coordinates": [-16.4897, 16.0178]
    }
  },
  "soil": {
    "ph": 6.2,
    "nitrogen": 30,
    "phosphorus": 18,
    "potassium": 95,
    "soilTexture": "SANDY",
    "moisture": 20
  }
}
```

### Terre 6 - Location Diourbel (Niébé)
```json
{
  "title": "6 hectares pour légumineuses",
  "description": "Terre bien adaptée pour niébé et autres légumineuses. Sol équilibré.",
  "surfaceHectares": 6.0,
  "type": "RENT",
  "price": 550000,
  "location": {
    "region": "Diourbel",
    "commune": "Diourbel",
    "coordinates": {
      "type": "Point",
      "coordinates": [-16.2333, 14.65]
    }
  },
  "soil": {
    "ph": 6.3,
    "nitrogen": 40,
    "phosphorus": 25,
    "potassium": 130,
    "soilTexture": "LOAM",
    "moisture": 35
  }
}
```

## 🔍 Exemples de Recherche

### Recherche par filtres
```bash
# Terres en location
GET /lands?type=RENT

# Surface entre 5 et 10 hectares
GET /lands?minSurface=5&maxSurface=10

# pH entre 6 et 7
GET /lands?minPh=6&maxPh=7

# Combinaison avec pagination
GET /lands?type=RENT&minSurface=5&page=1&limit=10
```

### Recherche géographique
```bash
# Terres dans un rayon de 20km autour de Dakar
GET /lands/nearby?longitude=-17.4467&latitude=14.6937&radius=20

# Terres dans un rayon de 50km autour de Thiès
GET /lands/nearby?longitude=-16.9333&latitude=14.7833&radius=50
```

## 📍 Coordonnées GPS des Régions du Sénégal

| Région | Longitude | Latitude |
|--------|-----------|----------|
| Dakar | -17.4467 | 14.6937 |
| Thiès | -16.9333 | 14.7833 |
| Kaolack | -16.0833 | 14.1500 |
| Saint-Louis | -16.4897 | 16.0178 |
| Ziguinchor | -16.2633 | 12.5833 |
| Diourbel | -16.2333 | 14.6500 |
| Louga | -16.2167 | 15.6167 |
| Fatick | -16.4111 | 14.3347 |
| Kolda | -14.9500 | 12.8833 |
| Tambacounda | -13.6833 | 13.7833 |
| Matam | -13.2667 | 15.6500 |
| Kédougou | -12.1833 | 12.5500 |
| Sédhiou | -15.5569 | 12.7081 |
| Kaffrine | -15.5500 | 14.1000 |

## 🧪 Script de Test Complet (Postman/cURL)

```bash
#!/bin/bash

API_URL="http://localhost:3000"

echo "1. Inscription d'un propriétaire..."
REGISTER_RESPONSE=$(curl -s -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Amadou Diallo",
    "email": "amadou@test.com",
    "password": "Owner123!",
    "phone": "+221771234567",
    "role": "OWNER"
  }')

echo $REGISTER_RESPONSE

echo -e "\n2. Connexion..."
LOGIN_RESPONSE=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "amadou@test.com",
    "password": "Owner123!"
  }')

echo $LOGIN_RESPONSE

# Extraire le token (nécessite jq)
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token')

echo -e "\n3. Création d'une terre..."
LAND_RESPONSE=$(curl -s -X POST $API_URL/lands \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Terre test",
    "description": "Description test",
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
  }')

echo $LAND_RESPONSE

# Extraire l'ID de la terre
LAND_ID=$(echo $LAND_RESPONSE | jq -r '._id')

echo -e "\n4. Obtenir des recommandations..."
curl -s $API_URL/lands/$LAND_ID/recommendations | jq

echo -e "\n✅ Tests terminés!"
```

## 💾 Import dans MongoDB Compass

Pour importer les données directement :

1. Ouvrir MongoDB Compass
2. Se connecter à votre cluster Atlas
3. Créer la base `agriland`
4. Importer les JSONs ci-dessus dans les collections appropriées

## 📝 Notes

- Toutes les coordonnées sont réelles et correspondent aux villes du Sénégal
- Les paramètres du sol sont réalistes pour chaque type de culture
- Les prix sont en FCFA (Franc CFA)
- Les téléphones suivent le format sénégalais (+221)

