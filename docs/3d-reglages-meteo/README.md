# 3D : cap de la fondation, mer jusqu'à l'horizon, plein écran, météo au choix (lot 1a)

Quatre réglages demandés par Quentin, sur `/3D/test/`.

## 1. Fondation orientée au nord vrai

- Le boat landing fait face au **68° vrai** par défaut. Un CTV accosté fait donc cap au 248°.
- Le cap se règle dans la boussole, de 0 à 359°. Il est gardé sur l'appareil, et un bouton ramène à 68°.
- La scène garde son repère : la fondation, le CTV, les échelles, le levage et les cordes ne bougent pas.
  - Tout ce qui vient du monde réel tourne d'un seul angle, au point d'entrée de la scène : soleil, lune, vent, houle et ses composantes, courant, nuages.
  - Les panneaux affichent toujours les directions vraies.
  - Au pilotage, le cap affiché est un cap vrai.
- La nacelle de l'éolienne suit le vent tourné : elle fait face au vent vrai, et son cap affiché est vrai.
- **Boussole** en haut à gauche : la flèche rouge montre le nord vrai et le trait ambre le cap du boat landing, tous deux suivant la caméra.

Vérification dans le moteur, le 21 juin 2026 à 05:21 UTC (soleil au 68,0° vrai, 12,3° au-dessus de l'horizon) :

- Le soleil est dessiné exactement sur le relèvement du boat landing. Écart : 0,05°.
- Une mer venant du 248° vrai court vers le boat landing : 180,0° dans la scène.
- Le rotor fait face au vent du 248°.
- Avec l'ancien repère (nord vers −z), le soleil serait au 68° de la scène, à 112° du boat landing. C'est l'écart que ce lot corrige.

Tests de la suite privée :

- 68° vrai donne le côté du boat landing dans la scène ; aller-retour vrai ↔ scène exact.
- Chaque direction de la prévision est tournée, et rien d'autre (hauteurs, périodes, vitesses).
- Soleil et lune : même hauteur, azimut tourné, à 10⁻⁶° près. Au midi solaire du 21 juin, le soleil est plein sud.
- Une mer d'OSO court bien vers le côté du boat landing.

Limite : la pente du fond (0,26 % vers l'est) reste dans l'ancien repère. Elle est invisible depuis la surface.

## 2. La mer jusqu'à l'horizon

- **Avant** : la mer dessinée s'arrêtait à 650 m. Au-delà, le ciel peignait une mer plate et uniforme.
- **Après** : la surface continue jusqu'à 9 km, en anneaux de plus en plus larges, raccordés sommet à sommet à la grille existante.
  - À 9 km, depuis un pont, on est à 0,06° sous l'horizon : moins d'un pixel. La brume a pris le relais.
- Le détail suit la distance, et tout se calcule sur la carte graphique :
  - **près de la fondation** : la grille fine et les vagues en relief, inchangées ;
  - **au-delà d'environ 300 m**, là où la grille ne peut plus porter le relief : les vagues sont dessinées dans la normale de chaque pixel, tant que le pixel les résout (moins d'un radian de phase sur son empreinte) ;
  - **plus loin** : leur pente passe à la rugosité du scintillement (Cox et Munk), comme avant.
  - La part dessinée par les pixels est retirée de cette rugosité : rien n'est compté deux fois.
- Le fondu vers la mer du ciel se fait entre 5,4 et 8,7 km, avec la même formule que le ciel (Fresnel et brume). On ne voit pas de bord.
- Le processeur ne fait rien de plus : les anneaux sont une géométrie fixe, construite une fois, et les vagues sont dans les shaders.
- La physique ne change pas : flottaison du CTV, pilotage, caméra, levage et cordes lisent la même hauteur de mer qu'avant. Un test le vérifie point par point.
- Mode allégé : inchangé, sans anneaux ni vagues dans les pixels.

## 3. Plein écran

- Un bouton en haut à gauche passe en plein écran et en sort (API Fullscreen).
- Sur iPhone, Safari ne met pas une page en plein écran. Le bouton ouvre une fiche :
  1. toucher Partager ;
  2. « Sur l'écran d'accueil » ;
  3. ouvrir l'app depuis son icône, sans les barres de Safari.
- La page d'accès déclare l'app pour l'écran d'accueil (balises `apple-mobile-web-app-capable` et `mobile-web-app-capable`).
- Ouverte depuis l'écran d'accueil, l'app redemande le mot de passe une fois : iOS sépare son stockage de celui de Safari. La fiche le dit.

## 4. Météo au choix

Un sélecteur en haut à gauche, à côté de la boussole. Il reste visible en mode immersif, au pilotage, au levage et aux cordes, et s'applique à toutes ces simulations. La marée, le soleil et la lune restent ceux de l'heure affichée.

- **Actuelle** (par défaut) : la prévision Open-Meteo à l'heure affichée, comme avant.
- **Pire des prochaines 24 h** : l'heure où la houle (Hs) est la plus forte dans la prévision, de l'heure en cours à 24 h plus tard. L'heure et les valeurs sont affichées : Hs, période, direction, vent.
- **Préréglages**, du beau temps à la tempête extrême rare. Chacun fixe Hs, période, direction de la houle, vent, ciel (nuages, visibilité) et pluie.
- Hors « actuelle », la puce passe en ambre avec ses valeurs, et une croix ramène à « actuelle » en un geste.
- Le choix n'est pas mémorisé : chaque visite repart sur la météo actuelle.

### Sources des préréglages : à confirmer

Aucune source de valeurs extrêmes n'était joignable depuis le réseau de travail. Ifremer (HOMERE, Sextant), SHOM, Copernicus Marine et CANDHIS étaient refusés par le proxy, et Open-Meteo avait atteint son quota du jour. **Aucune valeur n'est donc confirmée** : chaque préréglage porte la mention « à confirmer » dans l'app.

Les valeurs ne sont pas inventées. Elles reposent sur :

- l'échelle d'état de la mer de l'OMM (Douglas) et l'échelle de Beaufort ;
- les deux seuils 🛑 de l'app (Hs 1,5 m, vent 12 m/s) pour la limite de transfert ;
- Tp = 4,5 √Hs, milieu de la plage que donne DNV-RP-C205 pour une mer du vent ;
- les classes de pluie de l'AMS ;
- des tempêtes venant de l'OSO, secteur dominant des coups de vent en Manche.

| Préréglage | Hs | Tp | Houle de | Vent | Ciel | Pluie |
| --- | --- | --- | --- | --- | --- | --- |
| Beau temps, mer d'huile | 0 m | — | — | 1,2 m/s de NE | dégagé, 40 km | aucune |
| Belle mer, petite brise | 0,5 m | 3,0 s | OSO | 4,5 m/s | peu nuageux | aucune |
| Mer peu agitée | 1,0 m | 4,5 s | OSO | 9 m/s | nuageux | aucune |
| Mer agitée, limite de transfert | 1,5 m | 5,5 s | OSO | 12 m/s | très nuageux, 15 km | 1 mm/h |
| Mer forte, coup de vent | 3,0 m | 8,0 s | OSO | 19 m/s | couvert, 8 km | 4 mm/h |
| Tempête | 4,5 m | 9,5 s | OSO | 26 m/s | couvert bas, 3 km | 8 mm/h |
| Tempête extrême rare | 6,0 m | 11,0 s | OSO | 31 m/s | couvert très bas, 1,5 km | 12 mm/h |

Pour la tempête extrême rare, le 6,0 m est **provisoire**. Il attend une analyse par période de retour au site (HOMERE ou CANDHIS, 50 ou 100 ans). Le seul chiffre rencontré, non vérifié, est une H1/3 annuelle de 4,3 m à Dieppe (Allen et Delannoy, 1990, cité par une étude des submersions en Manche orientale).

Pour confirmer les valeurs, il faut autoriser l'accès aux hôtes d'Ifremer, du SHOM, de Copernicus Marine ou de CANDHIS, ou fournir les valeurs de retour.

Le courant des préréglages est l'estimation tirée de la courbe de marée, déjà utilisée sans prévision et signalée comme telle.

## Preuves

### Dans l'app scellée

Prévision Open-Meteo simulée, sur PC (1280 × 800), téléphone (Pixel 7) et iPhone (iPhone 13, sans plein écran comme Safari). Captures gardées hors du dépôt :

- le sélecteur et la pire heure des 24 h, avec son heure et ses valeurs ;
- chaque préréglage, sur PC et sur téléphone ;
- le retour à « actuelle » d'un geste ;
- la boussole et le réglage du cap ;
- le plein écran, et sur iPhone la fiche d'ajout à l'écran d'accueil ;
- le mode allégé (`?safe=1`), avec et sans préréglage.

- Sélecteur : « Actuelle », « Pire des prochaines 24 h » et les 7 préréglages, chacun avec ses valeurs. Sur la prévision simulée (houle montant à 2,4 m dans 28 h), la pire heure retenue est la dernière des 24 h (vendredi 12:00, Hs 2,0 m) : le pic au-delà est bien exclu.
- Chaque préréglage s'applique, et la puce affiche son nom et ses valeurs. La croix ramène à « actuelle » : la puce et la croix disparaissent.
- Boussole : « 68° vrai · ENE ».
- Plein écran : sur PC et Android, la page passe en plein écran. Sur iPhone, sans plein écran comme Safari, la fiche en trois étapes s'ouvre.
- Mode allégé : rendu `safe-dom-dpr1`, préréglage Tempête appliqué, aucune erreur.
- Aucune erreur console sur les trois profils.

Le banc tourne sans « réduction des animations » : dans l'app, elle tient la mer à plat, et les préréglages portent justement sur la mer.

### Budget et fluidité

Même mer de tempête (Hs 4,5 m, Tp 9,5 s) sur `main` et sur ce lot, trois caméras : la vue de lancement, une vue au ras de l'eau vers l'horizon (6 m) et une vue haute. Mesures par image : appels de dessin et triangles de three.js, temps de script du fil principal (compteurs Chrome). Rendu logiciel sans GPU : les images par seconde sont des planchers, comparables entre elles seulement.

| Vue | Appels | Triangles | Script (ms/image) | Images/s |
| --- | --- | --- | --- | --- |
| PC, lancement | 106 → 107 | 870 942 → 884 730 | 7,2 → 4,4 | 0,4 → 0,4 |
| PC, ras de l'eau | 20 → 20 | 92 264 → 113 384 | 2,1 → 1,9 | 4,2 → 3,0 |
| PC, haute | 123 → 122 | 738 978 → 759 874 | 5,0 → 5,1 | 0,8 → 0,8 |
| Téléphone, lancement | 103 → 103 | 738 258 → 750 610 | 6,0 → 4,9 | 0,7 → 0,7 |
| Téléphone, ras de l'eau | 20 → 20 | 101 992 → 114 344 | 1,7 → 2,1 | 8,2 → 6,6 |
| Téléphone, haute | 123 → 122 | 748 706 → 760 834 | 4,2 → 4,7 | 1,1 → 1,1 |

- **Processeur** : aucune charge de plus. Les appels de dessin sont les mêmes, et le temps de script reste dans le bruit de la mesure. Les anneaux sont construits une fois.
- **Géométrie** : la mer gagne de 7 500 à 11 000 sommets et de 14 000 à 21 000 triangles selon la grille. La première version, avec 1 200 points par anneau, en ajoutait 81 000 ; les anneaux sont ramenés à 48 points par côté.
- **Coût** : la vue au ras de l'eau vers l'horizon est la seule qui ralentit en rendu logiciel, de 4,2 à 3,0 images/s sur PC et de 8,2 à 6,6 sur téléphone. Ce sont les pixels lointains, autrefois peints d'une couleur par le ciel, qui calculent maintenant leur mer. La boucle des vagues par pixel va des plus longues aux plus courtes et s'arrête à la première que le pixel ne résout plus, ce qui a regagné 0,2 à 0,3 image/s.
- **Vues de lancement et haute** : aucun écart.
- Sur un vrai GPU, ce coût est celui d'un shader sur une bande d'écran. Le téléphone garde sa baisse automatique de qualité sous 45 images/s.

### Contrôles habituels

- **Suite privée** : 201 tests, tous verts, dont 9 nouveaux (cap, rotation des directions, soleil et lune, houle, anneaux lointains, shader, préréglages, pire des 24 h).
- **Lint public** : 0 erreur.
- **Lint de la source privée** : aucune nouvelle erreur.
- **Build** : OK, et `dist/3D` est identique à `public/3D`.
- **Coffre** : identifiant, sel, itérations et contrôle inchangés ; seule l'entrée `runtime` change.
- **Ressources chiffrées** : les 13 ressources déchiffrées sont identiques à celles de `main` ; seul le code change.
- **Page d'accès** : les balises d'écran d'accueil sont ajoutées, rien d'autre.
- **Archive `source-3d/`** : rafraîchie (même coffre d'archive, IV neuf, 318 fichiers). Elle se restaure à l'identique.
- **Mot de passe** : absent du dépôt et des commits.

## Limites

- Les préréglages sont des ordres de grandeur, tous à confirmer (voir plus haut).
- La fluidité n'a pas été vérifiée sur un vrai appareil : le banc rend sans GPU. Seule la vue au ras de l'eau coûte plus cher (voir le budget).
- Par vent de tempête, l'écume des crêtes (Monahan, plafonnée à 20 % de la surface) forme de larges plaques. C'est le comportement existant, que les préréglages font simplement apparaître.
- La pente du fond n'est pas tournée (0,26 %, invisible depuis la surface).
