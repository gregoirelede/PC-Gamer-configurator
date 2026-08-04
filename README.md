# ⚡ ForgePC — Configurateur PC Gamer

Configurateur de PC Gamer moderne qui génère **la configuration au meilleur rapport
qualité/prix pour un budget donné**, avec compatibilité vérifiée automatiquement,
suivi des prix et détection de bons plans.

## Fonctionnalités

- **⚡ Mode Auto** — donnez un budget (500 € à 4 000 €), un profil d'usage
  (gaming pur, gaming + streaming, gaming + création, gaming silencieux) et une
  définition cible (1080p / 1440p / 4K) : l'optimiseur explore toutes les
  combinaisons compatibles et retient celle qui maximise les performances
  réelles, puis propose des alternatives sur d'autres GPU.
- **🔧 Mode Manuel** — assemblage pièce par pièce avec vérification de
  compatibilité en direct (les options incompatibles sont désactivées) et
  estimation des FPS.
- **🔥 Bons plans** — composants dont le prix courant est nettement sous leur
  moyenne 90 jours, triés par remise, avec mini-graphique d'évolution.
- **⚖️ Comparateur** — sauvegarde des configurations (localStorage) et
  comparaison poste par poste, FPS et totaux inclus.

## Ce que vérifie le moteur de compatibilité

Socket CPU ↔ carte mère · génération RAM (DDR4/DDR5) et nombre de slots ·
format de carte mère ↔ boîtier · longueur du GPU ↔ boîtier · hauteur du
ventirad et taille de radiateur AIO ↔ boîtier · capacité de dissipation du
refroidisseur ↔ TDP du CPU · puissance de l'alimentation (consommation estimée
+ 30 % de marge, et minimum constructeur du GPU) · connecteur 12V-2x6 natif
pour les GPU qui l'exigent.

## Comment l'optimiseur choisit

1. Chaque CPU porte un score « FPS max atteignable en jeu » et chaque GPU des
   FPS moyens par définition (benchmarks agrégés publics). Les FPS estimés
   d'une configuration sont `min(CPU, GPU)` : **le goulot d'étranglement est
   modélisé**, pas de configuration déséquilibrée.
2. L'optimiseur énumère les plateformes compatibles (CPU × carte mère × RAM),
   les croise avec chaque GPU, complète au prix le plus bas (alimentation
   suffisante, boîtier adapté, refroidissement dimensionné) et garde la
   meilleure combinaison sous le budget.
3. Le budget restant est ensuite investi en confort : stockage plus grand,
   RAM plus rapide, refroidissement plus discret, alimentation Gold.

## Démarrer

```bash
npm install
npm run dev        # serveur de développement
npm run build      # build de production (vérifie aussi les types)
npm test           # tests du moteur (Vitest)
```

## Prix : fonctionnement et limites

Les prix embarqués (`src/data/components.ts`) sont des **références
indicatives en euros** relevées chez les grands marchands sécurisés, datées
(`PRICES_UPDATED_AT`). La moyenne 90 jours alimente la détection de bons plans.

Pour des prix réellement à jour, implémentez l'interface `PriceProvider`
(`src/prices/provider.ts`) avec une source légitime :

- flux d'affiliation officiels des marchands (Amazon PA-API, Awin, etc.) ;
- un backend d'agrégation maison ;
- un fichier JSON regénéré périodiquement par une GitHub Action.

Le scraping direct des sites marchands n'est volontairement pas implémenté :
il est peu fiable (protections anti-bot) et contraire aux CGU de la plupart
des enseignes.

## Architecture

```
src/
├── types.ts               # Modèle de données (composants, build, profils)
├── data/components.ts     # Base de ~95 composants avec specs et prix
├── engine/
│   ├── compatibility.ts   # Règles de compatibilité (erreurs + avertissements)
│   ├── optimizer.ts       # Budget → meilleure configuration + alternatives
│   ├── deals.ts           # Détection de bons plans, historiques de prix
│   └── engine.test.ts     # Tests Vitest du moteur
├── prices/provider.ts     # Interface PriceProvider (sources de prix branchables)
└── ui/                    # Interface React (Auto, Manuel, Bons plans, Comparer)
```

Application web statique (React + TypeScript + Vite) : aucune infrastructure
serveur requise, déployable telle quelle sur GitHub Pages, Vercel ou Netlify.
