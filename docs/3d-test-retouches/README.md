# 3D TEST — retouches des matériaux de la fondation

Suite de `docs/3d-test-materiaux/` (PR #17), d'après les cinq captures annotées.
Version TEST (`/3D/test/`) uniquement : la production `/3D/` n'est pas touchée.
Même coffre (identifiant, sel, contrôle), même mot de passe. Changent dans le
coffre : le modèle de la fondation (classes de pièces recalculées, IV neuf) et
le runtime (shader). Géométrie, éclairage, tone mapping, ressources : inchangés.

## 1. Chemins de câbles au sol

**Avant :** des plaques jaunes. Dans la CAO, ce sont des pièces en acier jaune
posées sur le caillebotis à 24,55–24,62 m : caissons de 50 mm, couvercles de
6 mm et leurs boulons. Elles tombaient dans la classe « acier de la
structure », donc en RAL 1003. Elles n'étaient pas classées en galvanisé.

**Après :** une classe à part, gris très foncé, presque noir (L\* 20, neutre),
mat (rugosité 0,8), non métallique, comme sur les photos. Elle compte 113
pièces : la bande qui fait le tour de la pièce de transition et celle qui
traverse la zone de dépose. Les garde-corps restent en galvanisé (ligne 2.2.2).

La capture annotée signalait aussi une plaque jaune à côté des panneaux rouges
de la zone de dépose. C'est un troisième panneau de cette zone : il passe en
rouge, tout comme le dessous des deux autres.

## 2. Partie immergée

**La peinture du plan reste RAL 7035** sous LAT −1 m (lignes 2.3.2, 2.4.1,
3.3.2 à 3.3.4) : le système et le test de conformité sont inchangés. **Ce qu'on
voit, c'est la salissure marine qui la recouvre** :

- **Couverture**, d'après le temps d'immersion calculé par la marée de l'app :
  nulle au-dessus d'environ +5 m, à moitié vers +3 m, complète à partir de
  +0,5 m. La transition traverse donc la partie basse de la zone de marnage,
  sans ligne nette.
- **Couleur** : un brun foncé un peu verdâtre, plus sombre avec la profondeur
  (pleine profondeur à 12 m sous le LAT), avec une variation lente de quelques
  mètres qui ne peut pas scintiller.
- **Finition** : mate (rugosité 0,9), non métallique.
- **Tous les paliers** : elle est dans tous les paliers, appareil léger compris,
  et couvre tout l'acier immergé, boat landing compris. Le détail fin s'efface
  dessous.

**Atténuation par l'eau :** l'eau de l'app atténue déjà fortement les couleurs
immergées ; il n'en a pas été ajouté. C'est d'ailleurs ce qui fixe la teinte de
base. Une salissure sombre « réelle » (L\* 34) ressortait presque noire à
travers l'eau (L\* 10, vert). La teinte de base a donc été réglée par mesure,
pour que le rendu à travers l'eau retrouve la capture « yes » :

|                                   | L\*     | a\*    | b\*     |
| --------------------------------- | ------- | ------ | ------- |
| Capture « yes »                   | 28      | −2     | 13      |
| Rendu, de la surface vers le fond | 27 → 20 | −5 à 0 | 16 → 13 |

## 3. Pad eyes

Les 8 oreilles de levage, deux par pointe en haut des jambes, étaient
galvanisées dans la CAO. Elles passent en RAL 1003, comme l'acier sur lequel
elles sont soudées. Selon la ligne 3.2.5, seuls les points d'ancrage sont en
RAL 3020.

## 4. Porte d'accès à la pièce de transition

Ses 3 pièces (vantail et cadre), galvanisées dans la CAO, passent en RAL 1003
éclairci, **même teinte, L\* +6 exactement**. Ce sont les seules différences
avec le RAL 1003 : rugosité et usure sont identiques. Le réglage tient dans une
constante du code source de l'app 3D, `DOOR_LIGHTER_L` (6), documentée à
côté du tableau des systèmes.

Un jaune plus clair sort du gamut sRGB. L'écrêter aurait réduit l'écart de
luminance à +4,5 ; la chroma est donc réduite juste assez pour tenir dans le
gamut, à L\* et teinte inchangées.

## Pièces qui ne sont pas en jaune, et pourquoi

Au-dessus de la bande de marnage :

| Pièces                                                                 | Couleur               | Raison                            |
| ---------------------------------------------------------------------- | --------------------- | --------------------------------- |
| Garde-corps des plateformes et leurs ferrures (307 pièces)             | Galvanisé             | Plan 2.2.2                        |
| Points d'ancrage marqués en rouge dans la CAO, embouts de poteaux (28) | RAL 3020              | Plan 3.2.5, photos                |
| Face supérieure de la bride de la pièce de transition (1)              | Zn/Al                 | Plan 4.2.1                        |
| Panneaux de caillebotis (27)                                           | Beige                 | Photos                            |
| Zone de dépose de la grue (5)                                          | GRP rouge             | Photos, capture annotée           |
| Chemins de câbles (113)                                                | Gris très foncé       | Photos, capture annotée           |
| Bandes de signalisation et bandes d'échelle (99 marques)               | Noir                  | Photos                            |
| Élastomères : défenses, flexibles (232)                                | Caoutchouc noir       | Matériau                          |
| Porte d'accès (3)                                                      | RAL 1003 éclairci     | Photos, capture annotée           |
| Signalétique (19)                                                      | Matériau CAO conservé | Hors plan                         |
| Équipements orange (27)                                                | Matériau CAO conservé | Hors plan                         |
| Intérieur de la pièce de transition (68)                               | Matériau CAO conservé | Hors plan, vu de dessus seulement |

Sous la bande de marnage, c'est la salissure marine qu'on voit sur toutes les
pièces (voir 2).

**À confirmer :** 6 ferrures galvanisées le long de l'échelle du boat landing,
par paires à 22,7, 27,4 et 30,9 m. Ce sont peut-être des points d'ancrage
antichute (RAL 3020 selon 3.2.5), mais rien dans la CAO ne le dit : elles
restent galvanisées, comme avant.

## Preuves

**a) Conformité, test automatique.**

- **Tests unitaires : 98/98.** Quatre nouveaux tests couvrent les quatre points ;
  deux tests existants sont mis à jour : classes de l'acier et zone de dépose.
  - **Chemins de câbles** : sur le pont seulement, autour de la pièce de
    transition et à travers la zone de dépose, presque noirs, non métalliques.
    Les garde-corps restent galvanisés.
  - **Partie immergée** : le RAL 7035 reste le système du plan. La salissure
    est nulle au-dessus de la mi-marée, complète du LAT vers le bas, monotone
    entre les deux. Elle est plus sombre en profondeur, mate, et présente dans
    tous les paliers.
  - **Pad eyes** : en RAL 1003 sur les quatre pointes, et le RAL 3020 seulement
    là où la CAO marque les points d'ancrage.
  - **Porte** : seule, L\* +6 exactement, même teinte, même finition.
- **Relecture GPU du shader rendu : 144 points, 18 lignes, tous conformes,
  ΔE ≤ 0,5.** Nouvelles lignes : chemins de câbles, porte, pad eyes, troisième
  panneau de la zone de dépose. Pour la partie immergée et la zone de marnage,
  la couleur réellement vue est comparée au modèle de salissure à la hauteur
  du point.

**b) Planche avant / après** sur les quatre zones, à côté des captures jointes.
Elle est envoyée à part : les captures sont privées.

**c) Non-régression ailleurs**, sur quatre vues générales rendues avec le même
moteur au même instant :

- fondation masquée (CTV, mer, ciel) : **0 pixel différent** sur 4 × 540 000 ;
- fondation visible : 82 011 pixels différents. Tous sont dans une zone retouchée
  ou dans le reflet de la fondation sur l'eau, sauf **2**. Ce sont deux pixels
  d'anticrénelage à 2 px d'une zone retouchée, à ±1 et ±2 niveaux sur 255.

**d) Performances.** Le seul code ajouté est le bloc de la salissure. Les
nouvelles classes ne changent que des valeurs d'uniformes, sur les mêmes
branches. Le surcoût a donc été mesuré dans une même page : le shader avec et
sans ce bloc, rendus en alternance par lots de six images, six fois,
aux trois caméras habituelles, sur un rendu logiciel. Écart des médianes :

|                                 | Vue d'ensemble | Gros plan du pont | Boat landing |
| ------------------------------- | -------------- | ----------------- | ------------ |
| PC, palier complet              | −0,6 %         | +5,4 %            | +2,8 %       |
| PC, palier léger                | −4,7 %         | −0,7 %            | +5,6 %       |
| Téléphone bridé, palier complet | +2,6 %         | +2,6 %            | +2,0 %       |
| Téléphone bridé, palier léger   | +3,9 %         | +3,8 %            | −0,2 %       |

**Moyenne : +1,9 %.** Les écarts vont de −4,7 % à +5,6 %, et le gros plan du
pont ne contient pas un seul fragment sous la bande de marnage. C'est le bruit
de ce banc (environ ±4 %), qui ne permet pas de trancher à ±3 % vue par vue.
Pour rester aussi léger que possible, la salissure ne lit aucune texture : sa
variation se fait par pièce. Rien au-dessus de +5,5 m ne l'évalue. Mémoire GPU
et draw calls sont inchangés : textures 25,35 Mo, géométrie 16,09 Mo, 99 draw
calls. Le téléchargement grossit de 540 octets pour le modèle et de 1 284 octets
pour le runtime.
