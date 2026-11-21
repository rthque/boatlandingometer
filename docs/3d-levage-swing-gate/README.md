# Lot 10b — ActSafe : passage par la swing gate et hauteur réelle de la pivot bar

Sur `/3D/test/` seulement, module Levage. Réponses de Quentin du 21/11, données de terrain :

1. avec l'ActSafe, la charge ne passe pas par-dessus le garde-corps : les deux battants de la swing
   gate sont ouverts et la charge circule près du sol, par le portillon ;
2. une personne de 1,70 m atteint l'œil de la pivot bar bras tendu vers le haut ; pour 1,60 m, c'est
   trop juste ;
3. pour décoller les sacs de quelques centimètres avec l'ActSafe sur la pivot bar, le point haut du
   sac ne doit pas dépasser 1,40 m ; à 1,50 m, ça ne passe pas.

## 1. Hauteur de l'œil de la pivot bar

Portée de préhension debout, bras tendu vers le haut : environ 1,22 fois la taille. 1,70 m donne
2,07 m, 1,60 m donne 1,95 m. L'œil est donc à environ **2,08 m au-dessus du pont** de la plateforme
de la grue, marqué « estimée d'après Quentin, ± 5 cm » dans le panneau. C'était environ 2,5 m.

L'articulation de la pivot bar (bout extérieur de la barre de rotation rouge du modèle) est à
29,287 m, soit 4,68 m au-dessus du pont (24,61 m). La pivot bar mesure donc **2,60 m** au lieu de
2,1 m. Le module lit cette longueur dans le modèle à l'ouverture, d'après la hauteur de l'œil ; un
test vérifie sur le vrai modèle qu'elle vaut 2,60 m à 1 cm près.

La pivot bar jaune des modules ART et Cordes garde sa longueur du lot 5 (voir « Questions »).

## 2. Empilement sous l'œil, recalculé à la main

De l'œil vers le bas, ActSafe sur la pivot bar :

| Élément | Avant | Lot 10b |
|---|---|---|
| Mousqueton sur l'œil de la pivot bar | 0,12 m | 0,11 m |
| ActSafe, hauteur suspendu | 0,33 m | 0,27 m |
| Mousqueton sous l'ActSafe (sur la sangle) | dans la terminaison | 0,11 m |
| Cosse et disque d'arrêt noir | 0,32 m avec le mousqueton | 0,11 m |
| Mou de corde, au moins | 0,05 m | 0,05 m |
| **Total** | 0,82 m | **0,65 m** |

Place sous l'ActSafe pour la charge, de son fond à son point haut :
2,08 − 0,11 − 0,27 − 0,11 − (0,11 + 0,05) = **1,43 m**, cohérent avec les 1,40 m du terrain.

Mes cotes d'avant donnaient 2,08 − 0,82 = 1,26 m. J'ai ajusté les deux plus incertaines :

- **la hauteur de l'ActSafe** : 330 × 280 × 270 mm sur la fiche ; je prenais 330 mm à la verticale,
  je prends maintenant les 270 mm comme hauteur une fois suspendu ;
- **la terminaison** (cosse, manchon, disque d'arrêt, mousqueton) : 0,32 m estimés sur photo,
  ramenés à 0,22 m (0,11 m de cosse et disque, 0,11 m de mousqueton).

Le mousqueton passe de 0,12 à 0,11 m (même famille de mousquetons, à 1 cm près). L'ActSafe et la
terminaison sont redessinés à ces cotes.

Le montage sur la charge (« running ascender ») empile les mêmes pièces dans l'autre ordre :
terminaison à l'œil (0,22 m), mou (0,05 m), puis l'ActSafe et son mousqueton (0,38 m), soit aussi
0,65 m et 1,43 m de place. La même limite vaut donc dans les deux montages.

## 3. Point haut des sacs, décollage et alerte

Point haut de la charge au-dessus de son fond (affiché dans le panneau, ActSafe choisi) :

- **2 sacs de 240 L avec la sangle violette : 1,58 m** (sac 0,67 m, hauteur de levage 0,61 m
  jusqu'à l'anneau d'après la fiche du fabricant, sangle de 60 cm doublée, 0,30 m) ;
- **1 sac de 580 L : 1,30 m** (bout des sangles, d'après la fiche).

Hauteur du bas de la charge une fois la corde ravalée jusqu'à l'appareil (simulation, les deux
montages identiques) :

| Point haut | 1,30 m (580 L) | 1,40 m | 1,42 m | 1,43 m | 1,50 m | 1,58 m (2 × 240 L) |
|---|---|---|---|---|---|---|
| Bas de la charge au-dessus du pont | 13 cm | 3 cm | 1 cm | 0 | 0 | 0 |
| Décolle | oui | oui | oui | non | non | non |

Quand la charge ne décolle pas, la corde est ravalée jusqu'à l'appareil et s'arrête là ; la charge
reste posée. Le panneau affiche alors en rouge : « Sac trop haut : 1,40 m au plus sous l'ActSafe
(point haut 1,58 m pour 1,43 m de place). La charge ne décolle pas du pont. » La ligne de montée
indique de combien le bas de la charge dépasse le pont au plus haut (13 cm pour le 580 L), ou de
combien il reste en dessous.

Conséquence avec ces cotes : **la paire de 240 L avec la sangle violette ne décolle pas**, ni sur la
pivot bar ni sur la charge ; le 580 L passe avec 13 cm de marge. C'est en contradiction avec la
procédure décrite (sangle violette accrochée à la terminaison) : une des cotes de la paire est
fausse, voir « Questions ».

La montée affichée va maintenant jusqu'au niveau du pont lui-même (elle visait 5 cm au-dessus), et le
niveau de référence est celui du pont de la plateforme (24,61 m), et non plus la bride de la grue.

## 4. La swing gate

### Où

Le modèle n'a pas de portillon : le garde-corps de la plateforme de la grue est une suite de panneaux
galvanisés de 1,2 m. Le grand cadre à la pointe de la plateforme, près de la grue, est le panneau du
nom de la fondation, pas un portillon.

La pivot bar est à 6,2 m de l'axe de la grue. Sur sa course (290° entre les butées), elle ne passe
au-dessus de la plateforme qu'en fin de rotation, de 0 à 17° de la butée, et ne franchit le
garde-corps qu'à un endroit : son côté ouest, en biais, à 17,5° de la butée. C'est là que la grue pose
les charges. La swing gate y est **proposée**, marquée « position à confirmer » :

- elle remplace les deux panneaux que franchit la pivot bar, soit une ouverture de 2,45 m ;
- deux battants de 1,20 m, articulés aux deux bouts, qui s'ouvrent de 90° vers la plateforme
  (en 1,5 s) ;
- la pivot bar franchit l'ouverture à 0,34 m de son milieu.

Pendant que le module est ouvert, les deux panneaux sont retirés du modèle : leurs 234 triangles
deviennent dégénérés, sans toucher à la longueur, à l'ordre ni à l'arbre de recherche de l'index. Ils
sont redessinés en battants dans le matériau galvanisé du modèle (montants, lisse haute, lisse de
genou, plinthe, charnières, loquet), en un seul objet. À la fermeture du module, l'index est remis
exactement (test : identique valeur par valeur).

### Dans les procédures

Une étape **« gate »** s'ajoute aux deux montages, entre la montée et la pose :

- ActSafe sur la charge : ancrage, descente du lest, passage dans l'ActSafe, montée, **ouverture des
  deux battants**, pose ;
- ActSafe sur la pivot bar : mousquetonnage, descente du lest, accrochage, montée, **ouverture des
  deux battants**, pose.

Revenir avant cette étape referme les battants. Un bouton « Ouvrir / Fermer la swing gate » les
manœuvre à tout moment (pour reproduire la butée, ou refermer après la pose). Changer de moyen de
levage, de charge ou repartir avec une charge neuve les referme.

### Collisions

- **Battants fermés** : la charge bute contre eux comme contre le reste du garde-corps. Si l'on
  continue de tourner après le contact (au-delà d'environ 35° de la butée, corde inclinée à 50°), la
  corde tire la charge vers le haut le long des battants jusqu'à passer par-dessus : c'est la physique
  de pendule du lot 4b, la même partout sur le garde-corps.
- **Battants ouverts** : la charge passe par l'ouverture, au ras du pont (13 cm pour le 580 L).
- Un battant qui se fermerait ou s'ouvrirait sur la charge s'arrête là où il est.
- Les faces raides juste sous un sol (bords du pont, attaches du caillebotis) ne comptent plus comme
  obstacles : avec des voxels de 15 cm, elles bloquaient une charge passant à quelques centimètres
  au-dessus du pont.
- Au bout de la corde, la collision utilise maintenant l'équipement réel : sac de lest, terminaison ou
  ActSafe. Elle utilisait la forme du crochet de la grue (0,55 m), qui arrêtait le sac de lest 12 cm
  au-dessus du pont de la plateforme.

### Plus de pose sur la main courante

Le champ des hauteurs où une charge se pose prenait le dessus de la main courante pour un sol. Une
charge posée près du garde-corps (à moins de 0,6 m) restait à 1,15 m au-dessus du pont. Les dessus
étroits et surélevés sont retirés de ce champ : 0,25 m à 1,6 m plus hauts que ce qui les borde des
deux côtés, à moins de 0,75 m, dans l'une des quatre directions. Une cellule ainsi retirée retombe à
la hauteur du pont voisin. Un test vérifie, sur le vrai modèle, que la main courante n'est plus un
appui et que le pont juste à côté l'est.

## Vérifications

### Tests et contrôles du projet

- Suite privée : 261 tests sur 261, dont 9 nouveaux (`tests/lot10b.test.mjs`) :
  - empilement à la main, 1,43 m, identique dans les deux montages ; ± 5 cm sur l'œil donne ± 5 cm
    de place ;
  - points hauts : 1,58 m (paire de 240 L) et 1,30 m (580 L) ;
  - un sac à 1,40 m décolle de 3 cm, un sac à 1,50 m ne décolle pas, dans les deux montages ;
  - étape « gate » dans les deux montages, textes en français et en anglais ;
  - géométrie des battants : fermés, ils couvrent l'ouverture sur la ligne du garde-corps ; ouverts,
    ils sont perpendiculaires, côté plateforme ;
  - vrai modèle : pivot bar de 2,60 m, 234 triangles retirés puis remis à l'identique ;
  - vrai modèle : plus d'appui sur la main courante ;
  - vrai modèle, deux montages : le 580 L décolle de 13 cm, ne sort que par la swing gate ouverte et
    bute contre les battants fermés ;
  - vrai modèle : la paire de 240 L ne décolle pas, et la télémétrie le signale au panneau.
- Les tests du lot 10 (étapes, durée de montée jusqu'au pont) sont mis à jour.
- Lint privé : 23 erreurs, toutes déjà présentes, aucune nouvelle (le décodeur Draco copié par le
  build, ignoré par git, est exclu). Lint public : 0 erreur.
- `npm run build` OK, `dist/3D` identique à `public/3D`.
- Build scellé : coffre inchangé hors entrée `runtime`, aucun fichier en clair, connexion par mot de
  passe OK. Module Levage scellé : 88 Ko (77 Ko avant).
- Archive `source-3d/` rafraîchie.

### Socle et budget

Résultats dans « Mesures » plus bas.

### Parcours dans l'app scellée

Résultats dans « Mesures » plus bas. Les captures ont été envoyées à Quentin à part : elles ne sont
pas dans le dépôt.

## Questions pour Quentin

- **Swing gate** : est-elle bien sur le côté ouest du garde-corps de la plateforme de la grue, là où
  la pivot bar le franchit en fin de rotation ? Sa largeur (2 battants de 1,20 m) et son sens
  d'ouverture (vers la plateforme) ?
- **Paire de 240 L** : avec la sangle violette, son point haut fait 1,58 m d'après la fiche (hauteur
  de levage 61 cm) et la sangle doublée (30 cm). Elle ne décollerait pas sous l'ActSafe. Quelle cote
  est fausse : la hauteur de levage, la façon dont la sangle est passée, ou la paire n'est-elle pas
  levée à l'ActSafe ?
- **Pivot bar jaune (ART, Cordes)** : elle garde sa longueur du lot 5 (œil à environ 2,5 m). Avec un
  œil à 2,08 m, un brancard horizontal (0,92 m de son anneau à son dessous) ne passe plus au-dessus du
  garde-corps de 1,1 m : il faudrait le faire passer lui aussi par la swing gate. On l'applique dans
  ART et Cordes ?
- **Butée** : faut-il empêcher la charge de remonter le long d'un garde-corps quand on continue de
  tourner (ici comme partout depuis le lot 4b) ?
