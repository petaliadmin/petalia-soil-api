# 🛒 Guide d'intégration — Module Marketplace

## Vue d'ensemble

Ce module ajoute à AgriLand/Petalia Soil :
- **Auto-inscription** des techniciens agronomes et fournisseurs de services
- **Annuaire public** consultable et filtrable par type, région, note
- **Système de devis/contact** entre agriculteurs et prestataires
- **Portail fournisseur** pour gérer son profil et ses demandes reçues
- **Interface admin** pour valider/rejeter les candidatures

---

## 1️⃣ Backend — Ajouter le module dans `app.module.ts`

```typescript
// src/app.module.ts
import { MarketplaceModule } from './marketplace/marketplace.module';

@Module({
  imports: [
    // ... modules existants ...
    MarketplaceModule,   // ← Ajouter cette ligne
  ],
})
export class AppModule {}
```

---

## 2️⃣ Backend — Ajouter les enums dans l'index commun

```typescript
// src/common/enums/index.ts  (ajouter ces 2 exports)
export * from './provider-type.enum';
export * from './marketplace.enum';
```

---

## 3️⃣ Frontend — Ajouter les routes Angular

```typescript
// src/app/app.routes.ts
{
  path: 'marketplace',
  loadComponent: () =>
    import('./features/marketplace/marketplace-page.component')
      .then(m => m.MarketplacePageComponent),
  title: 'Marketplace — Petalia Soil',
},
{
  path: 'marketplace/inscription',
  loadComponent: () =>
    import('./features/marketplace/provider-register.component')
      .then(m => m.ProviderRegisterComponent),
  title: 'Devenir Prestataire — Petalia Soil',
},
```

---

## 4️⃣ Frontend — Ajouter la route admin

```typescript
// src/app/features/admin/admin.routes.ts
{
  path: 'marketplace',
  loadComponent: () =>
    import('./marketplace/admin-marketplace.component')
      .then(m => m.AdminMarketplaceComponent),
  canActivate: [adminGuard],
  title: 'Marketplace — Admin',
},
```

---

## 5️⃣ Frontend — Ajouter le lien dans le menu admin

Dans `admin-layout.component.ts`, ajouter dans la navigation :

```html
<a routerLink="/admin/marketplace"
   class="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
  <span class="text-xl">🛒</span>
  <span>Marketplace</span>
</a>
```

---

## 6️⃣ Frontend — Ajouter le lien dans le header principal

Dans `header.component.ts`, ajouter dans la navigation principale :

```html
<a routerLink="/marketplace" class="...">
  🌾 Marketplace
</a>
```

---

## 📡 Endpoints API créés

### Publics (sans auth)
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/marketplace/register` | Inscription fournisseur |
| POST | `/marketplace/login` | Connexion fournisseur |
| GET | `/marketplace/providers` | Annuaire public |
| GET | `/marketplace/providers/:id` | Profil d'un fournisseur |
| GET | `/marketplace/providers/:id/offers` | Ses offres |
| GET | `/marketplace/offers` | Recherche d'offres |
| POST | `/marketplace/requests` | Envoyer une demande |

### Portail fournisseur (JWT PROVIDER)
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| PATCH | `/marketplace/portal/profile` | Modifier mon profil |
| GET | `/marketplace/portal/requests` | Mes demandes reçues |
| PATCH | `/marketplace/portal/requests/:id/respond` | Répondre (accepter/refuser) |
| POST | `/marketplace/portal/offers` | Publier une offre |
| PATCH | `/marketplace/portal/offers/:id` | Modifier une offre |
| DELETE | `/marketplace/portal/offers/:id` | Supprimer une offre |

### Admin (JWT ADMIN)
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/marketplace/admin/providers` | Tous les fournisseurs |
| POST | `/marketplace/admin/providers/:id/approve` | Approuver |
| POST | `/marketplace/admin/providers/:id/reject` | Rejeter |
| PATCH | `/marketplace/admin/providers/:id/toggle-suspension` | Suspendre/Réactiver |
| PATCH | `/marketplace/admin/providers/:id/toggle-featured` | Mise en avant |
| GET | `/marketplace/admin/stats` | Statistiques |

---

## 🗄️ Collections MongoDB créées

- **`providers`** — Profils des fournisseurs/techniciens
- **`serviceoffers`** — Offres de service publiées
- **`servicerequests`** — Demandes/devis entre clients et fournisseurs

---

## 🔄 Workflow complet

```
1. Fournisseur → POST /marketplace/register
                 ↓ status: PENDING
2. Admin → GET /marketplace/admin/providers?status=pending
        → POST /marketplace/admin/providers/:id/approve
                 ↓ status: ACTIVE + accessCode généré
3. Fournisseur → POST /marketplace/login → JWT
              → POST /marketplace/portal/offers (publier ses offres)
              
4. Agriculteur → GET /marketplace/providers (chercher)
              → POST /marketplace/requests (contacter)
              
5. Fournisseur → GET /marketplace/portal/requests (voir les demandes)
              → PATCH /marketplace/portal/requests/:id/respond (répondre)
              
6. Agriculteur → POST /marketplace/requests/:id/rate (noter après prestation)
```

---

## 🎨 Pages Angular créées

| Fichier | Route | Description |
|---------|-------|-------------|
| `marketplace-page.component.ts` | `/marketplace` | Annuaire public + contact |
| `provider-register.component.ts` | `/marketplace/inscription` | Inscription multi-étapes |
| `admin-marketplace.component.ts` | `/admin/marketplace` | Gestion admin |

---

## ✅ Types de fournisseurs disponibles

| Code | Label |
|------|-------|
| AGRONOMIST | Technicien Agronome |
| INPUT_SUPPLIER | Fournisseur d'Intrants |
| DRILLING | Foreur / Puits |
| IRRIGATION | Irrigation |
| EQUIPMENT | Matériel Agricole |
| TRANSPORT | Transport |
| STORAGE | Stockage |
| PROCESSING | Transformation |
| VETERINARY | Vétérinaire |
| FINANCING | Financement / Crédit |
| CERTIFICATION | Certification |
| OTHER | Autre Service |
