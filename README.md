# Bingo Live

Application de bingo en direct avec synchronisation temps réel via Firebase.

Fonctionnalités principales :

- affichage live des numéros tirés
- grille bingo fixe de 1 à 99
- synchronisation instantanée entre admin et écran public
- gestion des règles de partie
- animation de tirage
- mode fullscreen TV
- reset global de la partie

---

# Fonctionnement

admin.html permet :

- tirer les numéros
- voir les numéros déjà utilisés
- gérer les règles de partie
- reset la partie

index.html affiche :

- les trois derniers tirages
- la grille bingo complète
- les règles de la partie
- les animations live

Toutes les mises à jour passent par Firebase Realtime Database.

---