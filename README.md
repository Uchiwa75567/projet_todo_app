# Application de Gestion de Tâches (Todo List)

Application complète de gestion de tâches avec front-end React et back-end Node.js, permettant aux utilisateurs de créer, gérer et partager des tâches avec support pour les fichiers multimédias.

## Technologies Utilisées

### Frontend
- React 19 avec Vite
- React Router pour la navigation
- Axios pour les requêtes HTTP
- TailwindCSS pour le styling
- TypeScript

### Backend
- Node.js avec Express
- TypeScript
- Prisma (MySQL)
- JWT pour l'authentification
- Multer pour la gestion des fichiers
- Zod pour la validation

## Configuration Requise

- Node.js 18+
- MySQL
- npm ou yarn

## Installation

1. **Cloner le projet**
```bash
git clone [url-du-projet]
cd projet_todo_app
```

2. **Backend Setup**
```bash
cd back-end
npm install
cp .env.example .env
# Configurer les variables d'environnement dans .env
npm run prisma migrate dev
npm run seed # optionnel
npm run dev
```

3. **Frontend Setup**
```bash
cd front-end
npm install
npm run dev
```

## Structure du Projet

```
projet_todo_app/
├── front-end/           # Application React
│   ├── src/
│   │   ├── components/  # Composants React
│   │   ├── services/    # Services API
│   │   └── pages/      # Pages de l'application
│   └── package.json
│
└── back-end/            # Serveur Node.js
    ├── src/
    │   ├── controllers/ # Contrôleurs
    │   ├── services/    # Logique métier
    │   └── routes/     # Routes API
    ├── prisma/         # Schéma et migrations
    └── package.json
```

## Fonctionnalités Principales

- 👤 Authentification (inscription/connexion)
- ✅ CRUD complet pour les tâches
- 🖼️ Upload de fichiers (images, documents, audio)
- 🔄 Historique des modifications
- 🔔 Système de notifications
- 👥 Partage de tâches et permissions

## API Endpoints

### Auth
- POST `/todo/auth/register` : Inscription
- POST `/todo/auth/login` : Connexion

### Tâches
- GET `/todo/tasks` : Liste des tâches
- POST `/todo/tasks` : Création
- PUT `/todo/tasks/:id` : Modification
- DELETE `/todo/tasks/:id` : Suppression

*Plus de détails dans la documentation API*

## Scripts Disponibles

### Backend
```bash
npm run dev     # Développement
npm run build   # Build production
npm run start   # Démarrage production
npm run seed    # Seed de la base de données
```

### Frontend
```bash
npm run dev     # Développement
npm run build   # Build production
npm run preview # Preview production
```

## Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## License

ISC

## Auteur

Bachir-Uchiwa

## Support

Pour toute question ou problème, ouvrir une issue dans le repository.