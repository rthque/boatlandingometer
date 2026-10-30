# 3D TEST — dernier étage retiré, TP cover posé

Version TEST (`/3D/test/`) uniquement : la production `/3D/` n'est pas touchée.
Même coffre (identifiant, sel, contrôle), même mot de passe. Changent dans le
coffre :

- le modèle de la fondation, avec un IV neuf ;
- le volume d'exposition ;
- le runtime.

Les photos fournies sont privées : elles ne sont pas dans le dépôt.

## 1. Dernier étage intérieur retiré

Retiré : tout ce qui se trouve entièrement à l'intérieur de la tôle de la pièce
de transition, entre le dernier niveau et la bride. Ce sont **54 pièces** :

- le plancher du palier haut, ses poutres et les 8 consoles qui le portent sur
  la face intérieure de la tôle ;
- l'échelle, qui dépassait de 1,6 m au-dessus de la bride (jusqu'à 38,8 m) ;
- le chemin de câble, la plus grosse pièce du modèle ;
- un poteau isolé.

Le tri se fait sur la géométrie réelle. Une pièce est retirée si tous ses
sommets sont à moins de 2,95 m de l'axe, soit à l'intérieur de la tôle (face
intérieure à 2,94 m, face extérieure à 3,00 m), et à plus de 2,5 m sous la
bride. Restent en place :

- la bride, avec sa face de contact Zn/Al ;
- la tôle elle-même ;
- l'intérieur bas de la pièce de transition, au niveau du pont.

Le modèle perd **84 421 triangles et 196 000 sommets**. Le fichier chiffré
passe de 4,26 Mo à 3,25 Mo. Les sommets que plus rien n'utilisait sont
retirés des tampons, pour ne plus être chargés en mémoire graphique.

## 2. TP cover

Le capot posé sur la bride, d'après les photos. Il ferme la fondation : vu
d'en haut, plus rien de l'intérieur n'est visible.

- **Corps** : un cylindre de 3,016 m de rayon, juste au-dessus de l'anneau de la
  bride (3,00 m), de **1,50 m** de haut. Rapportée au diamètre de la tôle
  (6,0 m), la bande blanche mesure 0,20 à 0,26 selon la vue, et une personne
  se tient dans une trappe près de son sommet.
- **Rebord roulé** d'environ 9 cm en saillie, et un dessus plat.
- **Deux trappes d'accès** : un boîtier en saillie de la tôle, la porte sur sa
  face, un joint sombre, des charnières et des loquets.
- **Quatre oreilles de levage** sur le dessus, dont une jaune comme sur les
  photos, et **quatre tubes roses** qui sortent du rebord.

Les dimensions viennent des photos, rapportées au diamètre réel de la tôle mesuré
sur le modèle. La position des trappes, des oreilles et des tubes autour du
cercle est approximative : les photos ne permettent pas de la caler sur le
modèle.

Couleurs, hors plan de traitement de surface :

| Pièces                   | Couleur                                                                                | Finition               |
| ------------------------ | -------------------------------------------------------------------------------------- | ---------------------- |
| Corps, trappes, oreilles | Blanc, L\* 88                                                                          | Peinture, rugosité 0,4 |
| Dessus                   | Gris-beige sali, L\* 66, avec des marbrures de crasse et du guano sur toute la surface | Mat, rugosité 0,8      |
| Tubes de guidage         | Rose, L\* 66, a\* 48                                                                   | Rugosité 0,45          |
| Une oreille              | RAL 1003, comme sur les photos                                                         | PU brillant            |
| Joints                   | Caoutchouc noir                                                                        | Mat                    |

**Mesures sur les photos.** Elles servent de référence relative : oreilles
blanches à L\* 88, dessus 10 points plus sombre, rose à L\* 72, a\* +44.
L'appareil désature fortement : le RAL 1003 voisin ressort à une chroma de 40
au lieu de 82. Le rose a donc été pris un peu plus saturé que sur la photo.

**Teinte du dessus.** Rendu face au ciel, un dessus à L\* 77 ressortait à
environ L\* 92, nettement plus clair que le jaune voisin. Sur les photos, il
est à peu près aussi clair que ce jaune : sa teinte a été réglée sur ce qui
est rendu.

**Le dessus est un reposoir.** C'est la surface plane la plus haute de la
structure. L'usure y traite tout le dessus comme un perchoir pour le guano, et
y ajoute des marbrures de crasse de quelques mètres, tirées des bruits lents
que le shader lisait déjà : aucune lecture de texture en plus.

**Pas modélisés**, faute de pouvoir les placer juste :

- les traits noirs et les croix d'orientation (N, E…) peints sur la pièce de
  transition et le capot, car l'orientation du modèle par rapport au nord
  n'est pas connue ;
- l'inscription de charge au pochoir sur le rebord.

## Volume d'exposition

Il a été recalculé sur le nouveau modèle, mais n'est repris qu'**autour de la
tête**, à moins de 4,5 m de l'axe et au-dessus de 33 m. Ailleurs, l'ancien
calcul est conservé.

Les rayons qui mesurent la part de ciel montent jusqu'à 80 m dans un cône de
35° : depuis le bas du jacket, ils frôlent la tête à plus de 20 m de l'axe. Le
capot et l'ancienne échelle n'y masquent pas le même ciel, et l'écart
atteignait 3 rayons sur 16 à certains endroits des ponts, ce qui déplaçait un
peu de guano loin de la tête. La modification ne porte que sur la tête : le
reste de la structure garde exactement son usure.

## Graine de variation conservée

Chaque pièce porte une graine qui fait varier légèrement sa teinte et la limite
de sa salissure marine. Elle dépendait du numéro de la pièce, et retirer 54
pièces décalait toute la numérotation : chaque pièce de la structure changeait
légèrement de couleur. Le classement conserve désormais la graine de chaque
sommet existant. Seules les pièces neuves en reçoivent une.

## Preuves

- **Tests unitaires : 101/101.**
  - Trois tests nouveaux :
    - plus rien à l'intérieur de la tête entre le dernier niveau et la bride,
      ni au-dessus de la bride, alors que la bride Zn/Al et l'intérieur bas sont
      conservés ;
    - le capot pose sur la bride et monte de 1,50 m ; sa paroi est juste à
      l'extérieur de l'anneau et son rebord est en saillie ; tiré à la verticale
      sur toute la surface de la tête, chaque rayon touche d'abord le capot ;
    - les couleurs et les classes de chaque partie.
  - Trois tests mis à jour : hauteur du modèle, face supérieure de la bride
    sous le capot, exposition (le ciel est ouvert au-dessus du capot,
    l'intérieur de la tête est fermé).
- **Relecture GPU du shader rendu : 160 points, 20 lignes, tous conformes,
  ΔE ≤ 0,5**, dont les lignes du corps et du dessus du capot.
- **Planche avant / après / photos** sur trois vues, plus la tête de la pièce de
  transition : envoyée à part, car les photos sont privées.
- **Non-régression**, sur quatre vues générales au même instant :
  - fondation masquée (CTV, mer, ciel) : **0 pixel différent** ;
  - fondation visible : **0 pixel différent hors de la tête de la pièce de
    transition** (au-dessus de 32,5 m et à moins de 4,5 m de l'axe, là où
    l'exposition a été reprise) et de son reflet.
- **Performances**, sur un rendu logiciel (médiane et p95, un tour) :

  |                 | Vue d'ensemble | Gros plan du pont | Boat landing |
  | --------------- | -------------- | ----------------- | ------------ |
  | PC              | −15 % / −17 %  | −1 % / 0 %        | +1 % / −5 %  |
  | Téléphone bridé | −7 % / −11 %   | 0 % / +1 %        | +1 % / −2 %  |

  La vue d'ensemble gagne les 84 000 triangles retirés. Les deux autres vues
  restent dans le bruit de mesure.

- **Mémoire GPU** : géométrie 16,09 → 12,60 Mo ; textures inchangées.
- **Draw calls** : 99 → 107, pour les maillages du capot.
- **Téléchargement** : 1,0 Mo de moins (modèle −1 005 504 octets, runtime
  +495, exposition −161).
- **Build scellé** : coffre inchangé hors entrée `runtime`, aucun fichier en
  clair, connexion par mot de passe OK, aucune erreur dans la console.
  `npm run build` OK, `dist/3D` identique à `public/3D`.

## Promotion en production

Validée par Quentin sur `/3D/test/`, puis promue selon la procédure de
`CLAUDE.md` : `public/3D/` est une copie de `public/3D/test/`, sans
reconstruction ni rechiffrement.

- `public/3D/` est identique octet pour octet à `public/3D/test/`.
- Même coffre que l'ancienne production (identifiant, sel, contrôle,
  itérations) : seule l'entrée `runtime` change. Les fichiers en clair (page
  d'accès, chargeur) sont inchangés ; trois ressources chiffrées sont
  remplacées : le modèle, le volume d'exposition et le runtime.
- `npm run build` OK, `dist/3D` identique à `public/3D`, `npm run lint` sans
  erreur, et les redirections `/3d/` et `/3d/test/` sont inchangées.
- La page d'accès se charge sans erreur sur `/3D/`, `/3D/test/` et via `/3d/`.
- La connexion par mot de passe a été vérifiée sur ces mêmes fichiers dans
  `/3D/test/`, avant la fusion de la PR #22. Le code qui décide des chemins et
  de l'étiquette TEST n'a pas changé depuis la promotion précédente, où il a été
  vérifié dans les deux dossiers. Le mot de passe avait été détruit à la fin de
  la série : la connexion sur `/3D/` n'est pas revérifiée ici.
