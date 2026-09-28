# CineScope

## Description

**CineScope** est une application web dédiée à la découverte et à l'organisation de films.  
Elle permet de consulter des films provenant de **The Movie Database (TMDB)**, d'effectuer des recherches, d'accéder aux informations détaillées des films et de gérer une bibliothèque personnelle.

L'application propose également des fonctionnalités de personnalisation comme les favoris, les notes personnelles, l'historique de consultation, les recommandations et les préférences d'affichage.

## Principales fonctionnalités

- Consultation d'un catalogue de films provenant de TMDB.
- Recherche de films.
- Affichage des informations détaillées d'un film :
  - titre ;
  - affiche ;
  - synopsis ;
  - année de sortie ;
  - genres ;
  - durée ;
  - note TMDB ;
  - nombre de votes ;
  - langue originale ;
  - pays de production ;
  - casting ;
  - bande-annonce lorsqu'elle est disponible.
- Consultation des informations sur les acteurs.
- Gestion des films favoris.
- Bibliothèque personnelle avec plusieurs statuts :
  - **À regarder** ;
  - **En cours** ;
  - **Vu**.
- Attribution de notes personnelles aux films.
- Historique des films consultés.
- Recommandations personnalisées avec la page **Pour vous**.
- Fonction **Film aléatoire** pour découvrir un film.
- Création de compte et connexion.
- Gestion d'un profil utilisateur.
- Paramètres de personnalisation de l'application.
- Choix du thème et de la couleur d'accent.
- Filtres et pagination dans le catalogue.
- Gestion des erreurs lors des requêtes vers TMDB.

> Les informations utilisateur sont actuellement enregistrées localement dans le navigateur avec `localStorage`. Le projet n'utilise pas de base de données distante pour ces données.

## Technologies utilisées

Le projet utilise principalement :

- **React 18** pour construire l'interface utilisateur ;
- **TypeScript** pour le typage du code ;
- **Vite** comme environnement de développement et outil de build ;
- **React Router DOM** pour la navigation entre les pages ;
- **Tailwind CSS** pour la mise en forme de l'interface ;
- **PostCSS** et **Autoprefixer** pour le traitement des styles ;
- **API TMDB** pour récupérer les informations cinématographiques ;
- **LocalStorage** pour conserver localement certaines données et préférences utilisateur.

## Lancer le projet

### Prérequis

Pour lancer CineScope, il faut disposer de :

- **Node.js** ;
- **npm** ;
- un compte TMDB et un **API Read Access Token**.

### 1. Ouvrir le projet

Ouvrir un terminal dans le dossier du projet CineScope.

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer TMDB

Avant de démarrer l'application, il faut configurer l'accès à l'API TMDB en suivant les instructions de la section **Configuration de TMDB** ci-dessous.

### 4. Lancer le serveur de développement

```bash
npm run dev
```

Vite affiche ensuite dans le terminal l'adresse locale de l'application.  
Il suffit d'ouvrir cette adresse dans un navigateur.

### Build de production

Pour générer la version de production :

```bash
npm run build
```

Les fichiers générés sont placés dans le dossier `dist`.

Pour prévisualiser le build de production :

```bash
npm run preview
```

## Configuration de TMDB

CineScope utilise l'API de **The Movie Database (TMDB)** pour récupérer les films et leurs différentes informations.

### 1. Créer un compte TMDB

Créer un compte sur le site de TMDB si vous n'en possédez pas déjà un.

### 2. Obtenir un token API

Dans les paramètres du compte TMDB, accéder à la section consacrée à l'API et récupérer l'**API Read Access Token**.

### 3. Créer le fichier `.env`

À la racine du projet, au même niveau que `package.json`, créer un fichier nommé :

```text
.env
```

### 4. Ajouter le token TMDB

Ajouter dans le fichier `.env` :

```env
VITE_TMDB_TOKEN=VOTRE_API_READ_ACCESS_TOKEN
```

Remplacer `VOTRE_API_READ_ACCESS_TOKEN` par le token fourni par TMDB.

Exemple de structure :

```text
CineScope/
├── src/
├── public/
├── .env
├── package.json
└── README.md
```

### Sécurité

Le véritable token TMDB ne doit pas être écrit directement dans le code source ni publié dans le README.

Il est également recommandé de ne pas envoyer le fichier `.env` sur un dépôt Git public.

Une fois le fichier `.env` configuré, relancer le serveur de développement si celui-ci était déjà démarré :

```bash
npm run dev
```

L'application pourra alors effectuer ses requêtes vers l'API TMDB.

 Auteur
    Maxime HEINZ
