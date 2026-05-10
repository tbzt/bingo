# 🎱 Bingo GitHub — temps réel sans backend

Un système de bingo simple, statique et hébergé sur GitHub Pages.

---

## ✨ Fonctionnalités

- 🎯 admin tactile (clic sur une grille)
- 📺 affichage public en temps réel
- ⚡ aucun backend
- 🧠 état stocké dans un fichier `state.json`
- 🌐 hébergement via GitHub Pages

---

## 🧩 Principe

Le fonctionnement repose sur un seul fichier partagé dans un dépôt GitHub :

- il contient le numéro actuel tiré
- il contient l’historique des numéros
- il est mis à jour par l’interface admin
- il est lu régulièrement par la page publique

---

## 🖥️ Pages du projet

### 📺 page publique

- affiche une grille de 1 à 99
- met en évidence les numéros tirés
- anime le dernier numéro
- se met à jour automatiquement

---

### 🎮 page admin

- grille tactile de 1 à 99
- clic sur une case = tirage d’un numéro
- mise à jour immédiate du fichier d’état
- aucune saisie nécessaire

---

## ⚙️ Configuration

Dans le fichier `admin.js`, il faut définir :

- un token GitHub
- le nom d’utilisateur GitHub
- le nom du repository

Ces informations sont utilisées pour écrire dans le fichier d’état.

---

## 🔐 Token GitHub

Créer un token ici :

https://github.com/settings/tokens

Permissions nécessaires :

- accès au repository en lecture et écriture

---

## 🚀 Installation

### 1. créer le repository

Initialiser un repo GitHub et le connecter localement.

---

### 2. ajouter les fichiers

Ajouter dans le repository :

- page publique
- page admin
- scripts JavaScript
- styles CSS
- fichier d’état

---

### 3. activer GitHub Pages

Dans les paramètres du repository :

- section Pages
- branch principale
- dossier racine

---

## 📡 Fonctionnement temps réel

- l’admin clique sur un numéro
- le fichier d’état est mis à jour sur GitHub
- la page publique recharge périodiquement les données
- l’affichage se met à jour automatiquement

---

## 🎨 UX

- grille claire et lisible
- numéros déjà tirés surlignés
- dernier numéro mis en avant
- interface optimisée mobile

---

## 🧠 Avantages

- aucun serveur nécessaire
- gratuit
- simple à déployer
- hébergement natif GitHub
- facile à modifier
- versionné automatiquement

---

## ⚠️ Limites

- légère latence (mise à jour périodique)
- dépendance à GitHub pour la synchronisation
- usage recommandé en contexte privé ou événementiel

---

## 🔥 idées d’évolution

- animation de tirage type machine à boules
- sons et vibrations sur mobile
- mode plein écran pour projection
- tirage automatique
- multi-salles indépendantes
- couleurs par colonnes type bingo

---

## 🧪 stack

- HTML
- CSS
- JavaScript vanilla
- GitHub Pages

---

## 💡 philosophie

Pas de backend.  
Pas de base de données.  
Juste un fichier partagé et du JavaScript.
