# Levage avec la ferry crane (lot 4)

Module « Levage » de `/3D/test/` : la grue de la plateforme de la fondation,
qui surplombe l'avant du CTV au boat landing, pivote, le treuil monte et
descend une charge de sacs de levage, et la charge se balance avec le
mouvement du CTV et la houle du moment.

## La grue retenue

Le modèle de la fondation ne contient qu'une grue : celle de la plateforme en
porte-à-faux, au-dessus de la zone de dépose. C'est la « ferry crane ».

- Le pied et la couronne restent fixes. Tout ce qui est au-dessus pivote :
  ce sont les maillages du modèle, découpés à l'ouverture du module.
- Le moufle replié d'origine est masqué ; celui du module pend au câble.
- Hauteur et longueur de flèche : géométrie du modèle (flèche à 5,5 m
  au-dessus de la bride), marquées « à confirmer ».
- Le réa du modèle est à 8,08 m de l'axe. Le câble pend à 8,00 m, la portée
  de la plaque : 8 cm vers l'intérieur, invisible.
- La grue n'atteint que l'avant du pont du CTV amarré : le centre du pont
  avant est à plus de 8 m de l'axe (le crochet en passe à 3,1 m au plus près).
  Le pont est sous le crochet pour une orientation de 136° à −147°, en passant
  par 180° : 77° d'arc, à l'opposé de la position repliée. Le panneau affiche
  cette plage.
- Rotation continue : la plaque ne donne aucune butée, et le CTV se trouve
  justement derrière la position repliée.

## Plaque de la grue et sacs

Plaque constructeur : charge maximale d'utilisation de 1 t à 8 m de portée,
valable jusqu'à Hs = 2 m. Rien d'autre n'est connu, et rien d'autre n'est
supposé.

- Le panneau affiche la charge suspendue (sacs vides + contenu) face à
  « 1 t à 8 m ».
- La portée affichée est la distance horizontale de l'axe au crochet. Si le
  balancement l'emmène au-delà de 8 m (au décimètre), le panneau affiche
  « hors données plaque ».
- Quand la houle du moment dépasse Hs 2 m, une alerte indique que la charge
  de la plaque n'est plus garantie. Si la houle est estimée faute de
  prévision, l'alerte le précise.

Sacs, d'après les fiches fabricant :

| | Sac 240 L (par paire) | Sac 580 L |
| --- | --- | --- |
| Dimensions L × l × H | 78 × 48 × 67 cm | 120 × 70 × 70 cm |
| Hauteur de levage | 61 cm ou 77 cm | 135 cm |
| À vide | 9 kg | 27 kg |
| Contenu maximal | 400 kg chacun | 400 kg |
| Forme | carré, fond et couvercle rigides, poignées tubulaires latérales, sangles polyester | 2 sangles, fond rigide, couvercle à velcro, 4 boucles inox |

- Couleur : orange pour les deux. Elle n'est pas confirmée pour le 240 L.
- Les deux sacs de 240 L pendent ensemble au crochet. Leur élingage est
  marqué « à confirmer ».
- Hauteur de levage, définition confirmée : distance entre le haut du sac et
  l'anneau des sangles. Elle vaut 61 ou 77 cm pour le 240 L et 135 cm pour le
  580 L (même fabricant, même terme).
- Un curseur par sac règle la masse du contenu, de 0 à 400 kg ; le total
  suspendu est affiché. Avec quatre sacs pleins au maximum, on reste sous
  1 t : 818 kg pour la paire de 240 L, 427 kg pour le 580 L.

Vitesses de rotation (6°/s) et de treuil (0,25 m/s) : elles ne figurent pas
sur la plaque. Ce sont des valeurs plausibles, marquées « à confirmer ».

## Physique

- La charge est un pendule sphérique au bout d'un câble inextensible, qui
  peut prendre du mou.
- Rotation et treuil sont limités en vitesse et en accélération.
- Freinage : un amortissement léger dans l'air, fort dans l'eau.
- Vent du moment : traînée sur la face des sacs ; plus la charge est lourde,
  moins elle dérive.
- Appuis : le pont du CTV (son conteneur compris) et la plateforme de la
  fondation. Les hauteurs viennent de la géométrie des modèles, calculées une
  fois à l'ouverture.
- Posée sur le CTV, la charge suit le navire, qui flotte sur la houle du
  moment. Quand le câble se tend, elle décolle avec la vitesse du pont : c'est
  ce qui lance le balancement.

## Chargement à la demande

- Le module est un fichier autonome. Il n'importe rien et reçoit le three.js
  de l'app ; le panneau est en DOM simple.
- Il est scellé comme une ressource chiffrée « paresseuse » du coffre, à part
  du runtime : il n'est ni téléchargé ni déchiffré tant qu'on n'a pas appuyé
  sur « Levage ». Pas de service worker.
- Le coffre (`vault.json`) ne change que par son entrée `runtime`.
- `source-3d/restore.mjs` ne reprend plus les modules à la demande : ils sont
  reconstruits depuis la source à chaque build. Le scellement ignore aussi
  toute ancienne entrée « paresseuse ».
- Fermer le module remet la grue repliée, retire tout ce qu'il a ajouté et
  rend la vue d'avant.

## Commandes

- Bouton « Levage » dans le HUD, et dans les actions d'angle à côté de
  « Prendre la barre » quand le HUD est masqué.
- Boutons à maintenir, au doigt comme à la souris : tourner à gauche ou à
  droite, monter ou descendre. Relâcher, quitter la page ou perdre le pointeur
  arrête toujours la grue.
- Le panneau donne :
  - le choix de la charge, la hauteur de levage, un curseur par sac ;
  - la charge suspendue face à la plaque, la portée, l'alerte de houle ;
  - l'orientation, le câble, la hauteur du crochet, l'état de la charge
    (suspendue, posée sur le CTV ou sur la plateforme, dans l'eau) ;
  - le vide sous la charge, le balancement ;
  - la plage d'orientation où le pont du CTV est sous le crochet.
- « ◎ » recadre la vue sur la charge ; « ▾ » réduit le panneau aux quatre
  commandes et à une ligne d'état. Le panneau est réduit par défaut sur
  téléphone : déplié, il cachait la charge.

## Preuves

Ces preuves ont été faites dans le banc local (Chromium, rendu logiciel sans
GPU), sur le build scellé tel qu'il est commité.

Physique : 8 tests.

- La période d'un petit balancement vaut 2π√(L/g) à 1 % près.
- Le câble ne s'allonge jamais ; s'il a du mou, la charge tombe jusqu'à ce
  qu'il se tende.
- Rotation et treuil restent dans leurs vitesses et leurs limites ; la
  rotation peut faire des tours complets.
- Un départ de rotation lance un balancement, qui s'amortit ensuite.
- Descendue sur un pont mobile, la charge se pose, suit le pont, puis décolle
  avec sa vitesse (0,5 m/s) et se met à balancer.
- Avec le vent, la charge dérive sous le vent, d'autant moins qu'elle est
  lourde ; dans l'eau, le balancement s'éteint.
- Les cotes des sacs viennent des fiches ; la masse suspendue vaut sacs vides
  plus contenu, contenu borné de 0 à 400 kg ; la hauteur de levage est bien
  prise en compte.

Un autre test vérifie le module scellé :

- ressource à la demande, chiffrée à part ;
- sans aucun import ;
- absente du runtime chargé d'office.

Suite privée complète : 163 sur 163.

Parcours dans le navigateur, avec les vraies commandes :

- **Téléphone (Pixel 7 émulé)**, en trois passes :
  - parcours complet : ouverture, choix des contenus, rotation à 175° ;
  - descente jusqu'au pont du CTV (« posée sur le CTV ») ;
  - levée : la charge quitte le pont et se balance (0,86 m) ;
  - 580 L à 400 kg : 0,43 t affichée, et « hors données plaque » quand le
    balancement porte la portée à 8,3 m ;
  - fermeture ;
  - seconde passe : rotation à −122°, au-dessus de la mer libre, descente
    jusqu'à « dans l'eau » ;
  - troisième passe, panneau réduit par défaut.
- **PC** : ouverture, contenus, rotation vers le CTV ; panneau déplié puis
  réduit.
- Avant le clic sur « Levage », l'app charge ses 12 fichiers habituels ; le
  clic en ajoute un seul, le module (26,5 Ko).
- Aucune erreur de page ni de console, en dehors des prévisions, coupées
  exprès dans le banc.

Budget du module, compteurs du moteur à caméra identique et mouvement réduit,
module fermé puis ouvert puis refermé :

| | Fermé | Ouvert | Refermé |
| --- | --- | --- | --- |
| PC 1024 × 640, draw calls | 87 | 97 (+10) | 87 |
| PC, triangles | 718 920 | 719 352 (+432) | 718 920 |
| Téléphone (mode allégé), draw calls | 89 | 99 (+10) | 89 |
| Téléphone, triangles | 730 520 | 730 952 (+432) | 730 520 |
| Textures | 17 | 17 | 17 |

- Téléchargé à l'ouverture : environ 28 Ko, une seule fois. Le budget de 20
  draw calls et 3 Mo est tenu.
- Pour cette mesure seulement, une copie de banc neutralise le cadrage
  automatique. Sans cela, la caméra bouge à l'ouverture et les compteurs
  mesurent le changement de vue, pas le module.

Socle inchangé, rendu à instant figé, mouvement réduit, prévisions coupées,
calques HTML masqués :

| Vue | Plancher `main` contre `main` | Module jamais ouvert | Module ouvert puis refermé |
| --- | --- | --- | --- |
| PC 1024 × 640 | 0 pixel | 0 pixel | 0 pixel |
| Téléphone 412 × 839 (mode allégé) | 0 pixel | 0 pixel | 0 pixel |

- Le runtime chargé d'office est identique octet pour octet d'un build à
  l'autre de ce lot : seul le module à la demande change.
- Le bouton « Levage » est le seul ajout visible hors 3D.

Mode allégé du téléphone : même rendu au pixel près, et le module s'y ouvre et
s'y utilise. Le module n'y ajoute pas d'ombre et y utilise moins de segments.

Vérifications d'usage :

- coffre inchangé hors entrée `runtime` ;
- fichiers ajoutés aléatoires : entropie de 7,99 bits/octet et plus ;
- `npm run lint` : 0 erreur ; `npm run build` OK, `dist/3D` identique à
  `public/3D` ;
- archive `source-3d/` rafraîchie (règle 9), même coffre d'archive. Une
  restauration depuis l'archive, suivie d'une installation figée et d'un
  build, redonne le même contenu déchiffré.

## Non vérifié

- Les vitesses réelles de la grue (rotation, treuil) et l'élingage des deux
  sacs de 240 L : valeurs plausibles, marquées « à confirmer ».
- La fluidité sur un vrai téléphone et un vrai PC : le banc n'a pas de GPU.
