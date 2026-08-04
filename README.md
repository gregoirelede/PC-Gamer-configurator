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
npm run dev            # serveur de développement
npm run build          # build de production (vérifie aussi les types)
npm test               # tests du moteur (Vitest)
npm run update-prices  # regénère public/prices.json (prix + historique)
```

## Déploiement (GitHub Pages)

Le workflow `.github/workflows/deploy.yml` construit et déploie le site sur
GitHub Pages à chaque push sur `main` (plus un redéploiement quotidien à
07:00 UTC pour embarquer les prix frais). Au premier lancement, il active
Pages automatiquement ; si cela échoue, activez **Settings → Pages →
Source : GitHub Actions** puis relancez le workflow. Le site est alors servi
sur `https://<utilisateur>.github.io/PC-Gamer-configurator/`.

## Pipeline de prix

1. **`scripts/update-prices.ts`** (lancé chaque jour à 06:23 UTC par
   `.github/workflows/update-prices.yml`, ou à la main via
   `npm run update-prices`) regénère `public/prices.json` : prix courants,
   historique de relevés quotidiens (fenêtre 120 jours) et moyennes 90 jours
   recalculées dès que l'historique compte assez de relevés.
2. **L'application charge `prices.json` au démarrage** et applique les prix
   sur la base embarquée : l'optimiseur, les bons plans et les graphiques
   utilisent alors les valeurs fraîches (avec repli silencieux sur les prix
   embarqués si le fichier est absent).
3. **Sources réelles** : ajoutez vos intégrations dans
   `scripts/providers.ts` (interface `PriceProvider`) — API d'affiliation
   officielles (Amazon PA-API, Awin…), agrégateur ou backend maison — avec
   vos clés déclarées en secrets GitHub Actions. Chaque cotation retournée
   écrase le prix de référence ; les fournisseurs en échec sont ignorés.

Le scraping direct des sites marchands n'est volontairement pas implémenté :
il est peu fiable (protections anti-bot) et contraire aux CGU de la plupart
des enseignes.

## Architecture

```
src/
├── types.ts               # Modèle de données (composants, build, profils)
├── data/components.ts     # Base de 85 composants avec specs et prix
├── engine/
│   ├── compatibility.ts   # Règles de compatibilité (erreurs + avertissements)
│   ├── optimizer.ts       # Budget → meilleure configuration + alternatives
│   ├── deals.ts           # Détection de bons plans, séries de démonstration
│   └── engine.test.ts     # Tests Vitest du moteur
├── prices/
│   ├── provider.ts        # Interface PriceProvider (sources branchables)
│   ├── history.ts         # Fusion d'historique + moyenne 90 jours (testé)
│   └── remote.ts          # Chargement/application de public/prices.json
├── ui/                    # Interface React (Auto, Manuel, Bons plans, Comparer)
scripts/
├── update-prices.ts       # Regénère public/prices.json (Action quotidienne)
└── providers.ts           # Vos fournisseurs de prix personnalisés
public/prices.json         # Prix courants + historique (commité par le bot)
.github/workflows/
├── ci.yml                 # Build + tests sur chaque push
├── deploy.yml             # Déploiement GitHub Pages (push main + quotidien)
└── update-prices.yml      # Mise à jour quotidienne des prix (06:23 UTC)
```

Application web statique (React + TypeScript + Vite) : aucune infrastructure
serveur requise, déployable telle quelle sur GitHub Pages, Vercel ou Netlify.
