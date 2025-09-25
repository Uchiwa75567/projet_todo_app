# Application de Gestion de Tâches (Todo List)

## Vue d'ensemble du Projet

Cette application est une gestionnaire de tâches moderne construite avec React et Vite, qui communique avec un backend Node.js/Express via une API REST. Elle permet aux utilisateurs de créer, modifier, supprimer et partager des tâches, avec support pour les fichiers et les images.

## Architecture du Projet

### Technologies Utilisées

- **Frontend** :
  - React (avec Hooks et Context)
  - Axios pour les requêtes HTTP
  - TailwindCSS pour le styling
  - React Router pour la navigation

- **Backend** (communique avec) :
  - API REST sur `http://localhost:3000`
  - Points d'accès authentifiés
  - Gestion des fichiers multipart/form-data

## Communication avec le Backend

### Points d'API

1. **Authentification** (`/todo/auth/`)
   ```javascript
   POST /register    // Inscription d'un nouvel utilisateur
   POST /login       // Connexion utilisateur
   ```

2. **Tâches** (`/todo/tasks/`)
   ```javascript
   GET    /         // Récupérer toutes les tâches
   GET    /:id      // Récupérer une tâche spécifique
   POST   /         // Créer une nouvelle tâche
   PUT    /:id      // Modifier une tâche
   DELETE /:id      // Supprimer une tâche
   ```

3. **Permissions** (`/todo/tasks/:id/permissions`)
   ```javascript
   POST /          // Accorder des permissions sur une tâche
   ```

### Flux de Données

1. **Création d'une Tâche** :
   ```javascript
   // Dans TaskForm.jsx
   const handleSubmit = async (e) => {
     const formData = new FormData();
     formData.append('title', title);
     formData.append('description', description);
     if (image) formData.append('image', image);
     
     const response = await taskService.createTask(formData);
     // Mise à jour de l'UI avec la nouvelle tâche
   } 
   ```

2. **Mise à jour d'une Tâche** :
   ```javascript
   // Dans TaskCard.jsx
   const handleUpdate = async () => {
     const updatedTask = await taskService.updateTask(id, data);
     onTaskUpdated(updatedTask);
   }
   ```

3. **Suppression d'une Tâche** :
   ```javascript
   // Processus de suppression
   1. Confirmation utilisateur
   2. Appel API DELETE
   3. Mise à jour optimiste de l'UI
   4. Gestion des erreurs si échec
   ```

### Gestion de l'État

1. **Contexte d'Authentification** (`AuthContext.jsx`)
   ```javascript
   const AuthContext = {
     user,          // Utilisateur connecté
     login(),       // Connexion
     register(),    // Inscription
     logout(),      // Déconnexion
     isAuthenticated() // Vérification auth
   }
   ```

2. **Hook de Gestion des Tâches** (`useTasks.js`)
   ```javascript
   const {
     tasks,         // Liste des tâches
     loading,       // État de chargement
     error,         // Erreurs éventuelles
     fetchTasks,    // Charger les tâches
     createTask,    // Créer une tâche
     updateTask,    // Modifier une tâche
     deleteTask     // Supprimer une tâche
   } = useTasks();
   ```

### Structure des Dossiers
```
todolist-frontend/
├── src/
│   ├── components/     # Composants React réutilisables
│   │   ├── auth/      # Composants liés à l'authentification
│   │   ├── layout/    # Composants de mise en page
│   │   ├── tasks/     # Composants liés aux tâches
│   │   └── ui/        # Composants UI génériques
│   ├── context/       # Contextes React
│   ├── hooks/         # Hooks personnalisés
│   ├── pages/         # Pages de l'application
│   ├── services/      # Services pour les appels API
│   └── utils/         # Utilitaires et constantes
```

## Composants et leurs Responsabilités

### Services (`services/`)

1. **api.js** - Configuration Axios
   ```javascript
   // Configuration de base
   const api = axios.create({
     baseURL: 'http://localhost:3000',
     headers: { Accept: 'application/json' }
   });

   // Interception des requêtes pour ajouter le token
   api.interceptors.request.use(config => {
     const token = localStorage.getItem('token');
     if (token) {
       config.headers.Authorization = `Bearer ${token}`;
     }
     return config;
   });
   ```

2. **taskService.js** - Gestion des Tâches
   ```javascript
   export const taskService = {
     // Récupère toutes les tâches
     getAllTasks: async () => {
       const response = await api.get('/todo/tasks');
       return response.data;
     },

     // Crée une nouvelle tâche
     createTask: async (taskData) => {
       const formData = new FormData();
       // Ajout des données et fichiers
       const response = await api.post('/todo/tasks', formData);
       return response.data;
     },

     // Met à jour une tâche
     updateTask: async (id, taskData) => {
       const response = await api.put(`/todo/tasks/${id}`, taskData);
       return response.data;
     }
   };
   ```

3. **authService.js** - Authentification
   ```javascript
   export const authService = {
     login: async (credentials) => {
       const response = await api.post('/todo/auth/login', credentials);
       // Stockage du token
       localStorage.setItem('token', response.data.token);
       return response.data;
     }
   };
   ```

### Composants React

1. **TaskForm** (`components/tasks/TaskForm.jsx`)
   - Gère la création/modification de tâches
   - Upload de fichiers
   - Validation des données

2. **TaskCard** (`components/tasks/TaskCard.jsx`)
   - Affiche une tâche individuelle
   - Gère les actions (marquer comme terminé, supprimer)
   - Vérifie les permissions

3. **TaskList** (`components/tasks/TaskList.jsx`)
   - Affiche la liste des tâches
   - Gère la pagination (si implémentée)
   - Filtrage et tri

### Pages

1. **Tasks.jsx**
   ```javascript
   const Tasks = () => {
     const [tasks, setTasks] = useState([]);

     useEffect(() => {
       // Chargement initial des tâches
       const loadTasks = async () => {
         const data = await taskService.getAllTasks();
         setTasks(data);
       };
       loadTasks();
     }, []);

     // Gestion des mises à jour
     const handleTaskUpdated = (updatedTask) => {
       setTasks(tasks.map(task => 
         task.id === updatedTask.id ? updatedTask : task
       ));
     };
   };
   ```

## Gestion des Erreurs et Validation

### Validation des Données

1. **Création/Modification de Tâche**
   ```javascript
   const validateTask = (taskData) => {
     if (!taskData.title) {
       throw new Error('Le titre est obligatoire');
     }
     if (taskData.image && !taskData.image.type.startsWith('image/')) {
       throw new Error('Format d'image invalide');
     }
   };
   ```

### Gestion des Erreurs API

1. **Intercepteur Axios**
   ```javascript
   api.interceptors.response.use(
     response => response,
     error => {
       if (error.response?.status === 401) {
         // Redirection vers login
       }
       return Promise.reject(error);
     }
   );
   ```

2. **Composants React**
   ```javascript
   try {
     await taskService.updateTask(id, data);
   } catch (error) {
     setError(error.message);
   }
   ```

## Optimisations et Bonnes Pratiques

1. **Mise à jour Optimiste**
   ```javascript
   const handleDelete = async (taskId) => {
     // Supprimer de l'UI immédiatement
     setTasks(tasks.filter(t => t.id !== taskId));
     try {
       await taskService.deleteTask(taskId);
     } catch (error) {
       // Restaurer en cas d'erreur
       setTasks(previousTasks);
     }
   };
   ```

2. **Gestion du Cache**
   ```javascript
   const cachedTasks = {};
   const getTask = async (id) => {
     if (cachedTasks[id]) return cachedTasks[id];
     const task = await taskService.getTaskById(id);
     cachedTasks[id] = task;
     return task;
   };
   ```

## Sécurité

1. **Protection des Routes**
   ```javascript
   const PrivateRoute = ({ children }) => {
     const { isAuthenticated } = useAuth();
     return isAuthenticated ? children : <Navigate to="/login" />;
   };
   ```

2. **Gestion des Tokens**
   ```javascript
   // Stockage sécurisé
   const setToken = (token) => {
     localStorage.setItem('token', token);
   };

   // Nettoyage à la déconnexion
   const logout = () => {
     localStorage.removeItem('token');
     localStorage.removeItem('user');
   };
   ```

## Tests et Débogage

### Points de Vérification

1. **Authentification**
   - Token présent et valide
   - Redirection appropriée

2. **Opérations sur les Tâches**
   - Données correctement envoyées
   - Gestion des fichiers
   - Mise à jour de l'UI

3. **Permissions**
   - Vérification côté client
   - Feedback utilisateur approprié

### Services (`services/`)

#### `api.js` - Service de Configuration API
```javascript
// Configuration de base
const api = axios.create({...})
// Configure l'URL de base et les headers par défaut

// Intercepteur de requête
api.interceptors.request.use((config) => {...})
// Ajoute automatiquement le token d'authentification à chaque requête

// Intercepteur de réponse
api.interceptors.response.use((response) => {...})
// Gère les erreurs globalement (401, 403, 500, etc.)
```

#### `taskService.js` - Gestion des Tâches
```javascript
// getAllTasks()
// Récupère toutes les tâches de l'utilisateur connecté

// getTaskById(id)
// Récupère une tâche spécifique avec ses détails

// createTask(taskData)
// Crée une nouvelle tâche avec gestion des fichiers joints

// updateTask(id, taskData)
// Met à jour une tâche existante, gère à la fois les mises à jour partielles et complètes

// toggleTaskCompletion(id, completed)
// Change spécifiquement le statut terminé/non-terminé d'une tâche

// deleteTask(id)
// Supprime une tâche si l'utilisateur a les permissions

// grantPermission(taskId, userId, permissions)
// Accorde des droits spécifiques à un autre utilisateur sur une tâche
```

### Composants de Tâches (`components/tasks/`)

#### `TaskList.jsx`
```javascript
// Liste toutes les tâches avec filtrage et tri
// Utilise useTasks pour la gestion d'état
// Gère le rendu conditionnel selon les permissions
```

#### `TaskCard.jsx`
```javascript
// Affiche une tâche individuelle
// Gère les actions rapides (marquer comme terminé, etc.)
// Vérifie les permissions avant d'afficher les actions
```

#### `TaskForm.jsx`
```javascript
// Formulaire de création/modification de tâche
// Gère l'upload de fichiers
// Validation des données avant envoi
```

#### `TaskDetail.jsx`
```javascript
// Vue détaillée d'une tâche
// Affiche l'historique des modifications
// Gère les permissions et actions avancées
```

### Composants d'Authentification (`components/auth/`)

#### `LoginForm.jsx` & `RegisterForm.jsx`
```javascript
// Gèrent l'authentification utilisateur
// Validation des entrées
// Feedback utilisateur en temps réel
```

### Contexte et Hooks

#### `AuthContext.jsx`
```javascript
// Maintient l'état global d'authentification
// Fournit les méthodes de login/logout
// Stocke les informations utilisateur
```

#### `useAuth.js`
```javascript
// Hook personnalisé pour l'accès aux données d'auth
// Vérifie les permissions utilisateur
// Gère le refresh du token
```

#### `useTasks.js`
```javascript
// Gestion de l'état des tâches
// Mise en cache et invalidation
// Optimistic updates pour une meilleure UX
```

## Gestion des Erreurs

### Types d'Erreurs Gérés
1. Erreurs d'authentification (401, 403)
2. Erreurs serveur (500)
3. Erreurs de validation
4. Erreurs de permissions

### Stratégie de Gestion
```javascript
try {
  // Action utilisateur
} catch (error) {
  if (error.response?.status === 500) {
    // Erreur serveur
  } else if (error.response?.status === 403) {
    // Erreur de permission
  }
  // Affichage message utilisateur approprié
}
```

## Bonnes Pratiques

### Sécurité
- Validation des données côté client
- Vérification des permissions à chaque action
- Nettoyage des données sensibles

### Performance
- Mise en cache des données
- Chargement à la demande
- Optimistic updates

### UX
- Feedback immédiat
- Messages d'erreur clairs
- États de chargement

## Améliorations Possibles

1. **Performance**
   - Implementation de React Query
   - Virtualisation des listes longues
   - Service Workers pour mode hors-ligne

2. **Sécurité**
   - Double authentification
   - Rate limiting côté client
   - Validation plus stricte des entrées

3. **Fonctionnalités**
   - Filtres avancés
   - Export de données
   - Mode collaboratif en temps réel

## Guide de Débogage

### Logs à Vérifier
1. Requêtes API dans la console
2. États des composants avec React DevTools
3. Messages d'erreur dans taskService
4. Réponses serveur dans api.js
````markdown
# Flux d'Exécution de l'Application

## 1. Point d'Entrée
1. `main.jsx`
   - Premier fichier exécuté
   - Rend l'application dans le DOM
   - Charge les styles globaux (index.css)
   - Monte le composant `App`

2. `App.jsx`
   - Configure les routes avec `react-router-dom`
   - Enveloppe l'application dans `AuthProvider`
   - Définit la structure de base des routes

## 2. Flux d'Authentification
Quand un utilisateur accède à l'application :

1. `AuthProvider` (`AuthContext.jsx`)
   - Vérifie s'il existe un token dans localStorage
   - Si oui, restaure la session utilisateur
   - Si non, redirige vers login

2. `authService.js`
   - Gère les appels API d'authentification
   - Stocke/récupère les tokens
   - Maintient l'état de connexion

## 3. Navigation et Routes
Quand une URL est visitée :

1. `App.jsx` détermine quelle route afficher
2. Routes publiques (`/`, `/login`, `/register`)
   - Accessibles sans authentification
   - Utilisent les composants `Home`, `Login`, `Register`

3. Routes protégées (`/tasks`, `/tasks/:id`, `/history`)
   - Vérifient l'authentification via `PrivateRoute`
   - Redirigent vers login si non authentifié

## 4. Flux des Composants
Pour la page des tâches (`/tasks`) :

1. `Tasks.jsx` (Page principale)
   - Monte le composant
   - Appelle `taskService.getAllTasks()`

2. `TaskList.jsx`
   - Reçoit les tâches de `Tasks.jsx`
   - Rend une liste de `TaskCard`

3. `TaskCard.jsx`
   - Affiche chaque tâche
   - Gère les interactions (modification, suppression)

## 5. Flux des Services API
Pour chaque requête API :

1. `api.js`
   - Intercepte la requête
   - Ajoute le token d'authentification
   - Gère les erreurs globales

2. `taskService.js` ou `authService.js`
   - Exécute les appels API
   - Transforme les données
   - Gère les erreurs spécifiques

## 6. Gestion des Formulaires
Pour la création/modification de tâches :

1. `TaskForm.jsx`
   - Capture les entrées utilisateur
   - Valide les données
   - Appelle `taskService`

2. `Modal.jsx`
   - Affiche les formulaires en modal
   - Gère l'overlay et les animations

## 7. Gestion des Fichiers
Pour l'upload de fichiers :

1. `TaskForm.jsx`
   - Capture les fichiers
   - Crée un FormData

2. `taskService.js`
   - Envoie les fichiers au serveur
   - Gère les réponses multipart

## 8. Gestion des Erreurs
Cascade de gestion des erreurs :

1. `api.js` : Erreurs réseau et HTTP
2. Services : Erreurs métier
3. Composants : Affichage des erreurs

## 9. Cycle de Vie Complet
Exemple de création de tâche :

1. Utilisateur clique "Nouvelle Tâche"
2. `Tasks.jsx` affiche `TaskForm`
3. `TaskForm.jsx` capture les données
4. `taskService.js` envoie au serveur
5. `api.js` gère la requête
6. Réponse remonte la chaîne
7. UI mise à jour via `setState`

Cette structure en cascade assure une séparation claire des responsabilités et un flux de données prévisible.
````
