# Tennis TCG

Jeu de cartes à collectionner multijoueur 1v1 sur réseau local, thème tennis.

## Stack

- **Serveur** : Node.js + TypeScript + Socket.io (architecture Server-Authoritative)
- **Client** : React 18 + TypeScript + Vite + Tailwind CSS + Framer Motion
- **Déploiement** : Docker Compose (NAS Synology 920+ ou PC)

## Démarrage rapide (NAS Synology)

### 1. Prérequis
- Docker + Docker Compose installés sur le NAS
- Git installé (ou copier les fichiers manuellement)

### 2. Cloner le projet
```bash
git clone <url-du-repo>
cd tennnistcg
git checkout claude/server-authoritative-architecture-55pHx
```

### 3. Configurer
```bash
cp .env.example .env
# Éditer .env avec l'IP de votre NAS
nano .env
```

### 4. Ajouter vos illustrations
Copier vos images WebP dans le dossier `artworks/`.  
Consulter `artworks/.gitkeep` pour la liste des noms attendus.

### 5. Lancer
```bash
docker compose up -d --build
```

Ouvrir **http://192.168.1.109:3000** depuis n'importe quel appareil du réseau.

---

## Développement local

```bash
# Terminal 1 - Serveur
cd server && npm install && npm run dev

# Terminal 2 - Client  
cd client && npm install && npm run dev
```

Ouvrir **http://localhost:5173**

---

## Règles du jeu

### Objectif
Marquer **6 points** avant votre adversaire.

### Points
- Mettre K.O. un joueur Base ou Stage 1 : **1 point**
- Mettre K.O. un joueur Stage 2 : **2 points**

### Tour de jeu
1. **Pioche** : Piochez automatiquement 1 carte
2. **Phase Principale** :
   - Jouer 1+ joueurs Base sur le banc (max 5)
   - Évoluer un joueur (Base→Stage1, Stage1→Stage2)
   - Attacher 1 carte Endurance à n'importe quel joueur
   - Jouer 1 carte Staff
   - Jouer autant de cartes Objet que souhaité
   - Se retirer (payer le coût de retrait en Endurance)
3. **Attaque** : Déclarer une attaque (coût Endurance requis)

### Conditions de défaite
- Plus de cartes dans son deck au moment de piocher
- Plus aucun joueur sur le court ni sur le banc
- L'adversaire atteint 6 points

### Decks disponibles
| Deck | Joueurs vedettes | Style |
|------|-----------------|-------|
| Roi de la Terre | Nadal, Alcaraz, Wawrinka | AGGRO/TANK |
| Champion Mental | Djokovic, Murray, Swiatek | MOTEUR/DISRUPTEUR |
| Aristocrate du Court | Federer, Sampras, Edberg | MOTEUR élégant |

---

## Ajouter vos images

Placez vos illustrations générées par IA au format **WebP** dans `artworks/`.  
La carte affiche une icône d'élément si l'image est absente.

Pour modifier les statistiques ou ajouter de nouvelles cartes, éditer :
`server/src/data/cards.json` et `server/src/data/cardRegistry.ts`

---

## Ports

| Service | Port |
|---------|------|
| Interface web | 3000 |
| Serveur de jeu (API + WebSocket) | 3001 |
