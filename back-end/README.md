#
## Endpoints détaillés

### Authentification
- POST `/todo/auth/register` : inscription (body: name, email, password)
- POST `/todo/auth/login` : connexion (body: email, password)

### Tâches
- GET `/todo/tasks` : liste toutes les tâches
- GET `/todo/tasks/paginated?page=1&limit=5` : liste paginée
- GET `/todo/tasks/:id` : voir une tâche par id
- POST `/todo/tasks` : créer une tâche (body: title, description, fichiers image/file/voice en multipart)
- PUT `/todo/tasks/:id` : modifier une tâche (body: title, description, completed, fichiers)
- PATCH `/todo/tasks/:id` : modifier partiellement une tâche
- DELETE `/todo/tasks/:id` : supprimer une tâche

### Permissions
- POST `/todo/tasks/:id/permissions` : accorder des droits à un utilisateur (body: userId, canEdit, canDelete)

### Historique
- GET `/todo/tasks/history` : voir l’historique des actions

### Notifications
- GET `/todo/notifications` : récupérer les notifications de l'utilisateur
- GET `/todo/notifications/unread-count` : compter les notifications non lues
- PUT `/todo/notifications/:id/read` : marquer une notification comme lue
- PUT `/todo/notifications/mark-all-read` : marquer toutes les notifications comme lues
- DELETE `/todo/notifications/:id` : supprimer une notification

### Fichiers
- Les fichiers uploadés (image, file, voice) sont accessibles via `/uploads/<filename>`

# Todo List API – Résumé Développeur

API RESTful pour la gestion de tâches avec authentification, permissions, upload de fichiers, historique d’actions et système de notifications.

**Stack technique** : Node.js, Express, TypeScript, Prisma (MySQL), JWT, Zod, Multer

## Structure principale

- `index.ts` : Point d’entrée Express
- `prisma/schema.prisma` : Schéma BDD
- `src/controllers/` : Logique des routes
- `src/services/` : Logique métier
- `src/repositories/` : Accès BDD
- `src/middlewares/` : Auth, upload, validation
- `src/routes/` : Définition des routes
- `src/types/` : Types TypeScript
- `src/validators/` : Validation Zod
- `uploads/` : Fichiers uploadés

## Fonctionnement

- Authentification JWT (register/login)
- CRUD tâches (avec upload image, fichier, voice)
- Permissions par tâche (partage, édition, suppression)
- Historique des actions (ActionLog)
- Système de notifications (alertes pour modifications, tâches commençant, échéances)

## Endpoints principaux

- POST `/todo/auth/register` : inscription
- POST `/todo/auth/login` : connexion
- GET `/todo/tasks` : liste des tâches
- POST `/todo/tasks` : créer une tâche (upload possible)
- GET `/todo/tasks/:id` : voir une tâche
- PUT/PATCH `/todo/tasks/:id` : modifier une tâche
- DELETE `/todo/tasks/:id` : supprimer une tâche
- POST `/todo/tasks/:id/permissions` : accorder des droits
- GET `/todo/tasks/history` : historique des actions
- GET `/todo/notifications` : notifications utilisateur
- PUT `/todo/notifications/:id/read` : marquer notification lue
- PUT `/todo/notifications/mark-all-read` : marquer toutes les notifications lues

## Sécurité

- Mots de passe hashés (bcrypt)
- JWT pour l’accès aux routes protégées
- Vérification des droits avant modification/suppression

## Pour comprendre rapidement

1. Inscris-toi ou connecte-toi pour obtenir un token JWT
2. Utilise ce token dans le header `Authorization: Bearer <token>`
3. Utilise les endpoints pour gérer tes tâches et fichiers
4. Les actions sont historisées et les permissions gérées

## Auteur

Projet réalisé par Bachir-Uchiwa
