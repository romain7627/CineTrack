# 🎬 CineTrack

Bienvenue sur **CineTrack**, votre nouvel outil indispensable pour suivre vos films, séries. 📽️🎮

## 📋 Table des Matières

- [Fonctionnalités](#-fonctionnalités)
- [Technologies Utilisées](#-technologies-utilisées)
- [Installation](#-installation)
- [Variables d'Environnement](#-variables-denvironnement)
- [Lancement du Projet](#-lancement-du-projet)
- [Points de Terminaison API](#-points-de-terminaison-api)
- [Sécurité du Formulaire de Contact](#-sécurité-du-formulaire-de-contact)
- [Contribution](#-contribution)
- [Licence](#-licence)

## 🌟 Fonctionnalités

- **Authentification des Utilisateurs** : Connexion et inscription sécurisées avec JWT.
- **Gestion du Profil** : Mise à jour des informations personnelles et de la photo de profil.
- **Gestion des Favoris** : Ajouter, consulter et supprimer des films et séries favoris.
- **Historique de Visionnage** : Suivre les films et séries visionnés avec détails.
- **Détails des Films et Séries** : Récupération d'informations détaillées depuis l'API TMDB.
- **Formulaire de Contact** : Soumission sécurisée des messages de contact vers MongoDB.
- **Design Responsive** : Interface utilisateur conviviale et adaptable à tous les appareils.

## 🛠️ Technologies Utilisées

- **Frontend** : React, React Router, Axios, FontAwesome, React Multi Carousel
- **Backend** : Node.js, Express.js, PostgreSQL, MongoDB, Mongoose, JWT, Bcrypt
- **Styling** : CSS

## 🧩 Installation

### Prérequis

- **Node.js** et **npm** : [Télécharger et installer Node.js](https://nodejs.org/)
- **PostgreSQL** : Assurez-vous qu'il est installé et en cours d'exécution.
- **MongoDB** : Utilisez MongoDB Atlas pour une solution cloud ou localement.

### Étapes

1. **Cloner le dépôt** :
   ```sh
   git clone https://github.com/romain7627/CineTrack.git
   cd cinetrack
   ```

2. **Configuration du Backend** :
   ```sh
   cd server
   npm install
   ```

3. **Configuration du Frontend** :
   ```sh
   cd client
   npm install
   ```

## 🔑 Variables d'Environnement

Créez un fichier `.env` dans le répertoire `server` :

```env
PORT=5002
JWT_SECRET=your_jwt_secret_key
DB_USER=your_postgresql_username
DB_HOST=localhost
DB_NAME=your_postgresql_database_name
DB_PASSWORD=your_postgresql_password
DB_PORT=5432
TMDB_API_KEY=your_tmdb_api_key
MONGODB_URI=your_mongodb_uri
```

## 🚀 Lancement du Projet

### Backend

```sh
cd server
npm start
```

### Frontend

```sh
cd client
npm start
```

### Accédez à l'Application

Ouvrez votre navigateur et allez à [http://localhost:3000](http://localhost:3000).

## 🛣️ Points de Terminaison API

### Authentification

- **POST /signup** : Inscription
- **POST /login** : Connexion

### Profil

- **GET /me** : Récupérer le profil utilisateur
- **PUT /profile** : Mettre à jour le profil utilisateur

### Favoris

- **POST /favorites** : Ajouter un favori
- **GET /favorites** : Récupérer les favoris
- **DELETE /favorites/:movie_id** : Supprimer un favori

### Historique de Visionnage

- **POST /watch-history** : Ajouter à l'historique
- **GET /watch-history** : Récupérer l'historique

### Films et Séries

- **GET /movie/:id** : Détails d'un film
- **GET /details/:id** : Détails d'un film ou d'une série

### Formulaire de Contact

- **POST /contact** : Soumettre un message de contact

## 🔒 Sécurité du Formulaire de Contact

Le formulaire est sécurisé avec les validations suivantes :
- **Nom** : Entre 4 et 150 caractères.
- **Email** : Adresse email valide.
- **Message** : Entre 10 et 500 caractères.

Les validations sont effectuées avec express-validator pour garantir la sécurité et l'intégrité des données.

## 🚀 Version Bêta et Développement Continu

**CineTrack** est actuellement en version bêta et en cours de développement. De nouvelles fonctionnalités sont ajoutées régulièrement pour améliorer l'expérience utilisateur. Restez à l'écoute pour les mises à jour futures !
