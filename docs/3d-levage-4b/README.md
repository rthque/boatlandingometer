# 3D : levage, corrections après essais (lot 4b)

Corrections du module Levage après les essais de Quentin. Le module reste
chargé à la demande, chiffré à part, et rien ne change dans le socle tant
qu'il est fermé.

## Ce qui change

### Vitesses

- Treuil 1 m/s (quatre fois la version testée), confirmé par Quentin. Le plan
  du constructeur indique 20 m/min.
- Rotation 9°/s (une fois et demie la version testée).

### Grue redessinée d'après le plan du constructeur

La grue du modèle est masquée à l'ouverture et redessinée par le module :
pied, couronne d'orientation, carter, talon et flèche droite inclinée, tête
avec son réa, contre-fiche sous la flèche. Elle utilise les matériaux de la
structure (même rendu, mêmes marquages) et se rétablit à l'identique à la
fermeture.

- Portée 8,08 m jusqu'au crochet, hauteur 5,585 m de l'embase au haut de la
  tête, course du crochet 30 m.
- Le câble pend à 8,00 m (8 cm en retrait du réa dessiné, invisible) : la
  charge reste dans les données de la plaque, 1 t à 8 m, tant que son
  balancement ne la porte pas au-delà.
- Deux barres de pivot sous la flèche : la rouge, lue dans le modèle, et la
  jaune juste à côté, parallèle à elle (confirmé).
- Rotation limitée à 290° entre deux butées. La zone morte de 70° est centrée
  sur la tour (confirmé : la grue ne peut pas y entrer). L'orientation
  affichée va de 0° (butée de départ, la plus proche de la position de repos
  du modèle) à 290°.
- La plage où le crochet est au-dessus du pont du CTV, de 147° à 218°, reste
  entièrement accessible.

### Crochet

D'après les photos : lest cylindrique rouge, émerillon noir, crochet à
linguet.

### Sacs et élingage

Redessinés d'après les photos, aux cotes des fiches :

- **Sac de 580 L** : base blanche rigide, deux bandes noires horizontales,
  pochette transparente, repère vert, quatre sangles claires jusqu'à un
  anneau noir. Le point de levage (bout des sangles) est à 1,30 m au-dessus du
  bas du sac. La définition « 135 cm au-dessus du haut » était fausse.
- **Sacs de 240 L** : base blanche, sangles noires à repères verts, poignées
  tubulaires, anneau textile à 61 cm au-dessus du sac. Le bouton « Levage
  77 cm » est supprimé.
- **Élingage des deux sacs de 240 L** (confirmé) : une sangle de levage
  violette de 60 cm passe en double dans les anneaux textiles des deux sacs,
  puis elle est reprise en double sur le crochet. Il y a donc 30 cm entre
  l'œil du crochet et les anneaux.

### Collisions

Les sacs et le crochet ne traversent plus rien : garde-corps, sol et bords de
la plateforme, structure de la fondation, pont, bastingage et superstructure
du CTV. Les volumes sont simplifiés et calculés une fois à l'ouverture, à
partir de la géométrie du modèle :

- **Voxels de 15 cm** pour les faces raides (parois, garde-corps, côtés des
  tubes, coque). La fondation est prise dans la portée de la grue, le CTV dans
  son propre repère, il suit donc la houle.
- **Champ de hauteurs** pour les surfaces sur lesquelles une charge se pose :
  pont, plateforme, toits.

La charge est échantillonnée tous les 12 cm sur ses faces. Un point qui
n'était pas dans un obstacle ne peut pas y entrer : le mouvement est refusé
axe par axe. La charge s'arrête donc, ou glisse le long de l'obstacle avec un
frottement. Un sac qui arrive de côté est bloqué de la même façon. Quand le
CTV vient au contact d'une charge, il la pousse.

### Rupture des sangles

Si l'on force sur une charge coincée (treuil, rotation, ou CTV qui l'entraîne),
le câble, les sangles et le tissu s'allongent un peu, et l'effort monte
au-dessus du poids. Au-delà du seuil :

- les sangles sous le crochet se déchirent, et des bouts déchirés restent au
  crochet ;
- le sac tombe seul et s'arrête sur ce qu'il rencontre : plateforme, pont du
  CTV, garde-corps ou mer ;
- le panneau affiche « Sangles rompues », avec un bouton « Charge neuve ».

Le seuil est de 5 fois la charge de travail de 400 kg d'un sac, soit environ
2 t, avec une raideur de 15 kN/m : à confirmer. Le panneau affiche l'effort
dans les sangles. Un sac qui frotte contre un garde-corps sans être coincé
peut aussi passer par-dessus, si le câble est assez incliné pour le soulever.

### Sac à l'eau

Le sac flotte, enfoncé à 40 %, puis s'enfonce régulièrement : il affleure
vers 25 s et passe sous l'eau vers 30 s. Il dérive avec le courant du moment,
plus 3 % du vent. Il suit la houle dessinée. Détaché, il disparaît une fois
3 m sous la surface. Accroché, il reste au bout du câble.

## Restent à confirmer

- Le seuil de rupture des sangles (environ 2 t) et la raideur du câble et des
  sangles.
- La masse du crochet seul (60 kg), qui ne sert qu'au frottement de l'air.

## Preuves

- **Tests de la physique** (`lift-physics`, 13 tests) :
  - période du pendule ;
  - câble jamais étiré ;
  - vitesses de 1 m/s et 9°/s, course de 30 m ;
  - butées à 290° ;
  - pose sur un pont mobile puis levée ;
  - vent ;
  - cotes et élingage ;
  - plaque ;
  - blocage par un garde-corps ;
  - rupture en levant sous un obstacle, puis sac posé sur le pont ;
  - rupture en tournant contre un garde-corps, jamais au premier contact ;
  - dérive puis coulée en 30 s environ.
- **Suite privée** : 168 tests sur 168.
- **Banc, rendu logiciel** :
  - garde-corps : contact à 12°. Le sac, posé sur le garde-corps, est forcé
    en rotation, et les sangles rompent après 7,2 s de forçage. Le sac reste
    arrêté sur le garde-corps.
  - CTV : pose sur le pont au milieu de sa plage, puis levée sans rupture.
  - Mer : franc-bord de 0,17 m à 15 s, dérive de 0,64 m/s (0,40 de courant
    plus 3 % de 8 m/s de vent), sac sous l'eau à 30 s.
- **Captures PC et téléphone** : nouvelle grue, crochet, sacs, sac bloqué par
  un garde-corps, rupture, sac à l'eau à 0, 15 et 30 s. Elles restent hors du
  dépôt (règle 5).
- **Budget du module**, à caméra identique :
  - +5 draw calls par rendu (39 contre 34 ; une image affichée compte deux
    rendus, soit 78 contre 68) ;
  - +760 triangles, aucune texture ;
  - code de 45,6 Ko (28,4 Ko avant).
- **Socle module fermé** : 0 pixel différent de `main` à instant figé, sur PC
  et sur téléphone en mode allégé. Le plancher `main` contre `main` est aussi
  à 0.
- **Contenu déchiffré** : 11 ressources identiques à `main`, seul le module
  Levage change. Le coffre ne change que par son entrée `runtime`.
- **Archive `source-3d/`** : rafraîchie sur le même coffre. Restaurée, elle
  redonne les 281 fichiers de la source à l'identique, et un mauvais mot de
  passe est refusé.
- **Fluidité** : non vérifiée sur un vrai appareil, le banc n'a pas de GPU.
