# Lot 10 — levage réaliste et ActSafe

Sur `/3D/test/` seulement. Demandes de Quentin du 20/11 :

1. la chaîne sous le câble (contrepoids, crochet, sangle, sacs) doit prolonger l'oblique du câble ;
2. une option de levage à l'ActSafe ACX (Skylotec) sur la pivot bar rouge, dans les deux montages
   pratiqués ;
3. le retrait du réglage d'orientation de la fondation.

Cette PR s'empile sur celle du lot 9 (mer et courant) : elle part de son commit.

## 1. La chaîne sous le câble, en pendule

### Le défaut

Par vent fort et sac léger, le câble prenait le bon angle, mais tout ce qui pendait dessous restait
à la verticale. Le moteur traitait la charge comme un point au bout du câble : le crochet et les sacs
étaient dessinés droits sous ce point, quel que soit le vent.

### Le modèle

Ce qui pend sous le bout du câble est maintenant un pendule articulé à deux endroits :

- **au bout du câble**, où pend le crochet (son premier maillon, du haut du lest rouge à l'œil du
  crochet) ;
- **à l'œil du crochet**, où pend la sangle avec les sacs (le second maillon, jusqu'au centre des sacs).

Le centre des sacs est un point matériel. Il subit le poids, la traînée du vent sur les sacs (même
coefficient et même surface que le câble utilisait déjà) et un amortissement de son balancement par
rapport au bout du câble. L'œil du crochet est placé selon la force qu'il transmet : la traction des
sacs plus le poids du crochet émerillon (2 kg). Au repos, les trois directions sont donc celles de la
statique :

- le câble, en bas, et le premier maillon : la résultante du poids de tout ce qui pend et de la
  traînée ;
- les sacs : la résultante de leur propre poids et de leur traînée.

Le lest rouge du crochet n'est pas compté, comme jusqu'ici (masse à confirmer).

### Vérification à la main (tests, vent établi)

Sacs vides (2 × 9 kg), vent de 14 m/s, traînée ½ ρ Cd A U² = ½ × 1,225 × 1,1 × 1,045 × 14² = 138 N :

- câble en bas : atan(138 / (20 × 9,81)) = 35,13°, simulé 35,13° ;
- maillon du crochet : 0,00° d'écart avec le câble ;
- sacs : atan(138 / (18 × 9,81)) = 38,01°, simulés 38,01° ;
- axe de toute la chaîne (bout du câble au centre des sacs) : 2,0° du câble.

Les quatre cas testés (0 et 100 kg par sac, de 14 à 25 m/s) donnent un écart inférieur à 0,05° avec le
calcul à la main, et la chaîne entière reste à moins de 3° du câble.

### Rafales et rotation

- **Rafales** : le vent du module varie de 12 % autour de sa moyenne (intensité de turbulence usuelle
  en mer, à confirmer), en vitesse et un peu en direction. Le signal est lisse et reproductible : six
  périodes de 10 s à 2 min. Il agit sur le câble et sur la chaîne.
- **Oscillations** : sacs chargés (2 × 100 kg) à 14 m/s, la chaîne oscille d'environ 3 à 4° crête à
  crête. Sacs vides, de ±12° autour de 37°, ce que fait vraiment un sac vide dans un vent qui varie de
  ±25 % en force. Quand le vent se stabilise, l'oscillation s'amortit.
- **Rotation du sac sur lui-même** : de temps en temps, lentement, jamais plus de 3°/s, à partir de
  15 m/s de vent (moins en dessous). Elle est nulle sans vent.

### Collisions, rupture, sac à l'eau

Un balancement de la chaîne qui ferait entrer la charge dans un obstacle est refusé : la charge reste
contre l'obstacle et ne le traverse pas. Les points de contrôle de la charge suivent maintenant son
inclinaison. Sur un support ou dans l'eau, la chaîne se redresse (constante de temps 0,3 s). À la
rupture des sangles, le sac part de l'œil du crochet avec sa vitesse. Les 13 tests du levage existants
passent. Un seul a été adapté : il mesure la face de la charge depuis l'œil du crochet, puisque c'est
de là qu'elle pend.

## 2. L'ActSafe ACX sur la pivot bar rouge

### Matériel et valeurs

Valeurs du manuel Skylotec (révision 2023) et de la fiche produit :

- charge de travail 200 kg ou 2 personnes ; la fiche produit dit 220 kg, la valeur retenue est 200 kg ;
- l'électronique refuse de lever au-delà de 250 kg ;
- vitesse de 0 à 24 m/min, télécommande à 20, 50 et 100 % ;
- corde de levage ActSafe ELR de 11 mm, avec un nœud d'arrêt en bout ;
- appareil de 13 kg, 330 × 280 × 270 mm.

Valeurs données par Quentin : pivot bar prévue pour 1 t, sac de lest de 5 kg. La limite de la chaîne
reste l'ActSafe, 200 kg.

Valeurs supposées, à confirmer : longueur de corde de 40 m ; descente à la main à 0,5 m/s au premier
montage ; pivot bar de 2,1 m (œil à 2,5 m du pont).

### La pivot bar

La pivot bar rouge pend de l'extrémité côté tête de flèche de la barre rouge du modèle, rangée sous la
flèche. Elle mesure 2,1 m : son œil est alors à environ 2,5 m au-dessus du pont de la plateforme,
comme sur la photo où l'ActSafe est mousquetonné à la barre au-dessus du sac posé sur le pont. Cette
longueur est à confirmer. La barre du modèle court sur 5,6 m le long de la flèche : pendue à cette
longueur, son œil passerait sous le pont de la plateforme. La barre rangée est masquée tant que la
pivot bar pend. Celle-ci porte un œil en bas, et un petit trou pour la tag line. La rotation de la grue la déplace. Rigide et articulée en haut, elle s'aligne sur la corde
qu'elle porte. C'est l'ActSafe qui monte et descend la charge, pas le treuil : le crochet de la grue
reste en haut, sous la tête de flèche. La tag line orange part du pied de la pivot bar vers la flèche,
au droit de la contre-fiche, et pend en chaînette.

Aspect d'après les photos :

- boîtier orange, flanc d'entraînement et couvercle noirs, poignée noire, bouton rouge, lanière
  verte, mousquetons orange ;
- corde noire et rouge ;
- terminaison à cosse avec sa gaine rouge, son ruban jaune et son disque d'arrêt noir.

### Les deux montages, étape par étape

Le panneau Levage propose trois moyens : treuil de la grue, ActSafe sur la charge, ActSafe sur la
pivot bar. Les étapes s'enchaînent avec les boutons ◀ ▶ du panneau. Gauche et Droite tournent la grue ;
Monter et Descendre commandent l'ActSafe à la vitesse choisie (20, 50 ou 100 %).

**Premier levage, ActSafe sur la charge :**

1. Un technicien monte la corde par l'échelle et l'ancre à l'œil de la pivot bar (terminaison à
   cosse).
2. Il descend la corde avec le sac de lest jusqu'au deckhand sur le CTV. La corde se déroule seule
   jusqu'à ce que le sac de lest touche un pont, puis file encore 1,5 m de mou : sans ce mou, le pont du
   CTV qui monte et descend avec la houle relevait le sac. Si la flèche n'est pas au-dessus du pont du
   CTV, le sac finit à l'eau, et le panneau demande de tourner la grue.
3. Le deckhand passe la corde dans l'ActSafe accroché à la charge. La charge est posée sur le pont, à
   côté du sac de lest.
4. L'ActSafe grimpe la corde avec la charge jusqu'à la plateforme. La corde sous l'ActSafe pend, libre,
   jusqu'au sac de lest resté sur le pont.
5. Rotation de la grue et pose sur la plateforme.

Le panneau affiche en information, sans bloquer, que le manuel classe ce montage « running
ascender », réservé aux utilisateurs expérimentés en levage de matériel. Dans ce montage, l'appareil
monte avec la charge : ses 13 kg comptent dans la charge totale.

**Levages suivants, ActSafe sur la pivot bar :**

1. L'ActSafe est mousquetonné à l'œil de la pivot bar ; la corde et le sac de lest pendent dessous.
2. L'ActSafe déroule la corde : seuls la corde et le sac de lest descendent jusqu'au CTV.
3. Le deckhand accroche la charge : terminaison à cosse, disque d'arrêt noir, mousqueton, sangle
   violette (2 sacs 240 L) ou élingue 4 brins (580 L).
4. L'ActSafe ravale la corde et monte la charge ; le brin libre sort de l'appareil et pend jusqu'au
   pont ou à la mer.
5. Rotation de la grue et pose sur la plateforme.

La physique est celle du levage à la grue, chaîne en pendule comprise : collisions, poussée du CTV,
rupture des sangles et sac à l'eau restent valables. Le sommet du pendule est l'articulation de la
pivot bar, et la longueur pendante comprend la barre, l'appareil quand il est sur la barre, et la
corde.

### Alertes

- **Au-delà de 200 kg de charge totale** : alerte rouge « au-delà de la charge de travail de
  l'ActSafe ». Par défaut, deux sacs de 240 L à 100 kg pèsent 218 kg : l'alerte s'affiche dès qu'on
  choisit l'ActSafe.
- **Au-delà de 250 kg** : en appuyant sur Monter, la corde ne bouge pas, et le panneau écrit que
  l'électronique de l'ActSafe refuse de lever. La descente reste possible.
- **Durée de montée** : le panneau donne la hauteur qui reste jusqu'au niveau du pont de la plateforme,
  la vitesse et la durée, hauteur ÷ vitesse.

### Question ouverte : le passage du garde-corps

Au plus haut, avec la corde ravalée jusqu'à l'appareil, la charge pend à 2,4 m sous l'œil de la pivot
bar dans les deux montages :

- **ActSafe sur la pivot bar** : appareil et mousqueton 0,45 m, terminaison 0,32 m, sangle 0,30 m,
  sac de 240 L 1,28 m sous son anneau ;
- **ActSafe sur la charge** : terminaison 0,32 m, appareil et mousqueton 0,45 m, sangle et sac, soit
  la même longueur.

Avec l'œil à 2,5 m du pont, le bas des sacs arrive juste au niveau du pont : il ne peut pas passer
par-dessus un garde-corps de 1,1 m. Dans la scène, en tournant vers la plateforme, la charge vient
s'appuyer contre le garde-corps sans le traverser. Il faut savoir comment la charge passe en vrai :
- une ouverture du garde-corps à cet endroit ;
- une pivot bar plus courte ;
- un point de pivot plus haut sur la flèche.

### Vérifications de la durée et des alertes (tests)

- 6 m de montée, mesurés une fois la charge décollée du pont : 15,0 s à 100 % (6 ÷ 0,4 m/s = 15 s),
  30 s à 50 % et 75 s à 20 %, à moins de 0,3 s près.
- 218 kg : alerte. 2 × (9 + 50) = 118 kg : pas d'alerte.
- 2 × 95 kg + 13 kg sur la charge = 203 kg : alerte. Les mêmes sacs avec l'ActSafe sur la pivot bar
  font 190 kg : pas d'alerte.
- 258 kg : la corde ne bouge pas en montée, elle descend en descente.
- Sac de lest à l'eau : l'étape suivante attend, avec la raison écrite.
- Pont qui monte et descend de ±1 m : une fois posé et le mou filé, le sac de lest ne décolle plus.

## 3. Cap de la fondation fixe

Toutes les fondations du parc sont posées pareil : le boat landing fait face au 68° vrai. Le réglage a
été retiré :

- la fenêtre de la boussole n'a plus de curseur ni de bouton de retour ; elle indique « Boat landing
  68° vrai », le même sur toutes les fondations du parc ;
- le cap est une constante unique (`LANDING_BEARING`), avec son décalage de nord (`NORTH_OFFSET`, 112°) ;
- un ancien réglage enregistré sur un appareil n'est plus lu ; il est effacé au démarrage, sans
  erreur ;
- l'adresse de la page ne porte aucun cap ;
- les préréglages ne dépendent pas du cap ;
- un scénario de cordes enregistré avec un champ de cap s'ouvre normalement, et le champ est ignoré.

## Vérifications

### Tests et contrôles du projet

- Suite privée : 230 tests sur 230, dont 8 nouveaux (`tests/lot10.test.mjs`). Ils couvrent :
  - l'angle à la main ;
  - les rafales et leur amortissement ;
  - la rotation lente ;
  - la collision ;
  - les vitesses et les durées ;
  - les alertes ;
  - les deux montages ;
  - le cap fixe.
- Lint à 0 erreur, build OK, `dist/3D` identique à `public/3D`.
- Build scellé : coffre inchangé hors entrée `runtime`, aucun fichier en clair, mot de passe absent du
  dépôt. L'archive `source-3d/` est rafraîchie.

### Socle et budget

- **Socle à instant figé**, module fermé : 0 pixel d'écart avec le lot 9, sur PC et sur téléphone, que
  le module n'ait jamais été ouvert ou qu'il ait été ouvert puis refermé. Le plancher de bruit `main`
  contre `main` est aussi de 0.
- **Budget du module**, mesuré dans le harnais, en rendu logiciel à 1280 × 800 :
  - au treuil de la grue : 104 appels de dessin, comme avant ; 1 916 ms par image contre 1 902 ms ;
  - avec l'ActSafe : 110 appels (pivot bar, appareil, terminaison, sac de lest, une seule géométrie
    pour les trois cordes) ; temps par image dans le bruit de mesure (±2 %).
- **Taille** : module Levage de 75 Ko chiffré (46 Ko avant). Le module Cordes est inchangé.

### Parcours dans l'app scellée

Captures PC et téléphone :

- ancien réglage de cap présent sur l'appareil : boussole à 68° vrai, réglage effacé, aucune erreur
  console ;
- levage par vent fort avec la chaîne alignée sur le câble, et une courte séquence d'oscillation ;
- les deux montages ActSafe, étape par étape ;
- alerte à 218 kg et refus à 258 kg.

Mesures relevées dans l'app :

- **Vent fort** (préréglage « Mer agitée », 14 m/s, sacs vides) : sur 13,5 s, le câble va de 21,0 à
  38,3° au gré des rafales. La chaîne reste entre 1,1 et 1,9° du câble.
- **ActSafe sur la charge** :
  - 4,85 m montés en 12,0 s, contre 12,1 s par hauteur ÷ vitesse ;
  - 11,3 m annoncés pour 28 s jusqu'au niveau du pont, mesurés en 28,4 s.
- **ActSafe sur la pivot bar** :
  - 4,74 m en 12,0 s, contre 11,8 s par le calcul ;
  - 10,7 m annoncés pour 27 s, mesurés en 27,1 s.
- **Pose** : en tournant vers la plateforme, la charge finit sur le haut du garde-corps (ActSafe sur la
  charge) ou appuyée contre lui, la corde mollissant (ActSafe sur la pivot bar). C'est la question
  ouverte ci-dessus.
- **Alertes** : à 218 kg, alerte rouge ; à 258 kg, refus de lever, la corde ne bouge pas.

Le banc rend environ une image par seconde. La simulation du module avance au plus de 0,1 s par image :
elle tourne donc au ralenti. Les mesures du parcours se font sur le temps simulé.

## Limites

- Le lest rouge du crochet n'est pas compté dans le balancement, comme avant ; s'il pèse lourd, le câble
  serait un peu plus raide par vent fort avec des sacs vides.
- L'intensité des rafales (12 %), la longueur de corde (40 m), la vitesse de descente à la main
  (0,5 m/s) et la longueur de la pivot bar (2,1 m) sont des valeurs supposées.
- Pose sur la plateforme à l'ActSafe : voir la question ouverte sur le garde-corps.
- La corde de l'ActSafe est dessinée droite entre ses deux points, et son brin libre tombe à la
  verticale. Ce n'est pas un calcul de corde souple.
- Les personnages (technicien, deckhand) ne sont pas dessinés : les étapes les décrivent.
