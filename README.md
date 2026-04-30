# Auth System

Système d'authentification sécurisé avec JWT, 2FA TOTP et gestion de sessions.

## Features

- JWT Authentication (access token 15min + refresh token 7j)
- 2FA avec TOTP (otplib + QR code)
- Gestion des sessions actives (révocation, détail user-agent)
- Rate limiting par endpoint (`@nestjs/throttler`)
- Hachage des mots de passe (Argon2)
- Logs d'activité (connexions, actions sensibles)
- Headers de sécurité (Helmet)
- Logs structurés (Pino)

## Tech Stack

| Couche | Stack |
|---|---|
| Backend | NestJS 10, Prisma 7, TypeScript |
| Frontend | Vue 3, Pinia, TypeScript, Vite |
| Base de données | PostgreSQL 16 |
| Cache / Sessions | Redis 7 |
| Infra | Docker, Coolify, Traefik |

## Structure du projet

```
.
├── backend/          # API NestJS
│   └── src/modules/
│       ├── auth/       # Login, logout, refresh token
│       ├── users/      # Profil utilisateur
│       ├── sessions/   # Gestion des sessions actives
│       ├── 2fa/        # TOTP setup & vérification
│       ├── activity/   # Logs d'activité
│       ├── security/   # Règles de sécurité
│       └── prisma/     # Client Prisma partagé
├── frontend/         # App Vue 3
├── bruno-auth-system-docs/  # Collection Bruno (tests API)
├── compose.yaml
└── env.example
```

## Quick Start

```bash
# Backend
cp backend/env.example backend/.env
# Remplir les valeurs dans backend/.env

# Frontend
cp frontend/env.example frontend/.env
# Remplir les valeurs dans frontend/.env

docker compose up -d
```

Le backend écoute sur le port `4001`, le frontend sur `8080`.  
En local, décommenter les ports dans `compose.yaml` si besoin.

## Variables d'environnement

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `DATABASE_URL` | URL de connexion PostgreSQL (format Prisma) |
| `JWT_SECRET` | Secret JWT access token (≥ 32 caractères) |
| `JWT_REFRESH_SECRET` | Secret JWT refresh token |
| `JWT_EXPIRES_IN` | Durée de vie de l'access token (ex: `60s`) |
| `ENCRYPTION_KEY` | Clé AES-256-GCM (64 caractères hex) |
| `COOKIE_SECRET` | Secret pour la signature des cookies |
| `CORS_ORIGIN` | Origine autorisée par CORS (ex: `http://localhost:5174`) |
| `NODE_ENV` | Environnement (`development` ou `production`) |
| `PORT` | Port d'écoute du backend (défaut : `3000`) |

### Frontend (`frontend/.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | URL de l'API backend (ex: `http://localhost:3000`) |
| `NODE_ENV` | Environnement (`development` ou `production`) |

## Tests API

La collection [Bruno](https://www.usebruno.com/) se trouve dans `bruno-auth-system-docs/`.  
Importer le dossier dans Bruno et sélectionner l'environnement `local` ou `prod`.

## Live Demo

[totp-auth](https://totp-auth.overstand.cloud/)