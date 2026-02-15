# 🔐 Auth System

Secure authentication with JWT, 2FA, and rate limiting.

## Features

- JWT Authentication
- 2FA with TOTP
- Rate Limiting
- Password Hashing (Argon2)
- Audit Logging

## Tech Stack

**Backend**: NestJS, PostgreSQL, Redis  
**Frontend**: Vue 3, Pinia  
**Infra**: Docker, Traefik

## Quick Start
```bash
cd projects/01-auth-system
cp .env.example .env
docker compose up -d
```

## Live Demo

[auth.rstcoder.cloud](https://auth.rstcoder.cloud)

## API Docs

See [API.md](./docs/API.md)
