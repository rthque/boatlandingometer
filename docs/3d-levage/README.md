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
- La grue n'atteint que l'étrave du CTV amarré : le pont avant est à plus de
  8 m de l'axe, et le point le plus proche du centre du pont avant est à 3,1 m.
  Il faut tourner la flèche d'environ 180° depuis sa position repliée.

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
- Hauteur de levage : je l'ai lue comme la hauteur de l'œil des sangles
  au-dessus du couvercle. C'est la seule lecture compatible avec 61 cm sur un
  sac de 67 cm de haut ; à confirmer.
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
- Fermer le module remet la grue repliée, retire tout ce qu'il a ajouté et
  rend la vue d'avant.

## Preuves

Ces preuves ont été faites dans le banc local (Chromium, rendu logiciel sans
GPU).
