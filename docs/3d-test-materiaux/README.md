# 3D TEST — matériaux de la fondation d'après le plan de traitement de surface

Version TEST (`/3D/test/`) uniquement. La production `/3D/` n'est pas touchée.
Même coffre (identifiant, sel, contrôle), même mot de passe. Ce qui change
dans le coffre :

- le modèle de la fondation, rechiffré avec un IV neuf : géométrie identique,
  plus un attribut de zone par sommet ;
- quatre ressources chiffrées nouvelles : le volume d'exposition qui place
  l'usure, et les trois tuiles de détail générées par le code.

Le runtime est rescellé, parce qu'il porte le code et la liste des
ressources.

Les références privées (plan, photos) ne sont pas dans le dépôt. Aucune image,
texture photo, ni valeur tirée d'un logo ou d'une inscription n'y entre.

## Source de vérité

Le tableau « protection anticorrosion » du plan, ligne par ligne. Les couleurs
du dessin (jaune-vert, brun) sont des couleurs d'illustration et ne sont pas
utilisées. Les photos servent seulement pour ce que le plan ne dit pas : les
caillebotis, les embouts rouges des poteaux et les bandes jaune et noir.

Chaque pièce du modèle CAO (composante soudée d'un maillage) reçoit une
**classe** : le système de revêtement qu'elle porte. Cette classe est inscrite
par sommet dans le modèle. La couleur et la finition sont calculées par
fragment, à partir de la classe **et de la hauteur réelle au-dessus du LAT** du
modèle. La frontière LAT −1 m est donc une ligne calculée, exacte au
centimètre, et non une peinture faite à la main.

## Table zone → système → couleur → finition

| Ligne du plan | Zone | Système | Couleur | Finition |
| --- | --- | --- | --- | --- |
| 2.2.1 | Extérieur de la pièce de transition, dessous du pont compris | Époxy 600 µm + PU 80 µm | RAL 1003 | PU brillant patiné : diélectrique, rugosité 0,32 |
| 2.2.2 | Garde-corps des plateformes externes | Galvanisation à chaud ≥ 150 µm | Gris zinc patiné | Métal mat : métallicité 0,70, rugosité 0,55 |
| 2.3.1 | Jacket, du sommet de l'acier à LAT −1 m | Époxy 600 µm + PU 80 µm | RAL 1003 | PU brillant patiné |
| 2.3.2 | Jacket, de LAT −1 m aux clés de cisaillement | Époxy 125 µm | RAL 7035 | Époxy satiné : rugosité 0,55 |
| 2.4.1 | Pieux, extérieur | Époxy 350 µm | RAL 7035 | Époxy satiné |
| 3.2.1 | Plateforme externe | Époxy 600 µm + PU 80 µm | RAL 1003 | PU brillant patiné |
| 3.2.2 | Échelles externes | Époxy 600 µm + PU 80 µm | RAL 1003 | PU brillant patiné |
| 3.2.3 | Plateforme intermédiaire | Époxy 600 µm + PU 80 µm | RAL 1003 | PU brillant patiné |
| 3.2.4 | Boat landing et son échelle d'accès, **toutes zones** | Époxy 600 µm + PU 80 µm | RAL 1003, y compris sous LAT −1 m | PU brillant patiné |
| 3.2.5 | Points d'ancrage | Époxy 600 µm + PU 80 µm | RAL 3020 | PU brillant patiné |
| 3.3.1 | J-tubes, atmosphère et éclaboussures | Époxy 600 µm + PU 80 µm | RAL 1003 | PU brillant patiné |
| 3.3.2 | J-tubes, de LAT −1 m au bellmouth | Époxy 125 µm | RAL 7035 | Époxy satiné |
| 3.3.3 | Supports d'anodes | Époxy 350 µm | RAL 7035 | Époxy satiné |
| 3.3.4 | Acier secondaire du jacket sous LAT −1 m | Époxy 125 µm | RAL 7035 | Époxy satiné |
| 4.1.1 | Brides des plateformes externes | Zn/Al projeté, scellé | Gris métal | Métal mat : métallicité 0,55, rugosité 0,68 |
| 4.2.1 | Bride de la pièce de transition, face supérieure | Zn/Al projeté | Gris métal | Métal mat |
| 4.2.5 + note 2 | Bride de la pièce de transition, face externe et chanfrein | Système 2.2.1 prolongé | RAL 1003 | PU brillant patiné |
| Photos | Caillebotis composite (GRP) | — | Beige | Diélectrique gritté, rugosité 0,72 |
| Photos | Zone de dépose de la plateforme de la grue | — | GRP rouge | Diélectrique gritté |
| Photos | Embouts de poteaux de garde-corps | — | RAL 3020 | PU brillant patiné |
| Photos | Bandes de signalisation (goussets au pied de la pièce de transition, bandes d'échelle) | — | Jaune RAL 1003 et noir | PU brillant patiné |

Lignes sans pièce visible dans le modèle : 2.3.3 (clés de cisaillement, dans
les fourreaux), 2.4.2 et 2.4.3 (intérieur des pieux), 4.2.2 à 4.2.4 (dessous,
intérieur et trous de la bride).

### Hauteurs

Toutes les hauteurs sont en mètres au-dessus du LAT du modèle :

- **−1 m** : passage du RAL 1003 au RAL 7035 (lignes 2.3.1/2.3.2 et 3.3.1/3.3.2) ;
- **+14,6 m** : haut de la zone d'éclaboussures supérieure (vue de côté du plan, 14 600 mm au-dessus du 0 LAT) ;
- **−3 m** : bas de la zone d'éclaboussures inférieure (3 000 mm sous le 0 LAT).

### Couleurs : CIELAB vers sRGB linéaire

Les valeurs CIELAB **officielles** de RAL ne sont pas publiques : RAL les
protège par droit d'auteur et ne les cède que sous licence. Les valeurs
utilisées sont des moyennes de mesures au spectrophotomètre des références RAL
Classic, sous illuminant D65 et observateur 10°. Elles sont recoupées avec le
facteur de luminance (LRV) officiel publié par RAL.

| RAL | L\* a\* b\* (D65/10°) | sRGB linéaire | sRGB 8 bits | Y calculé / LRV officielle |
| --- | --- | --- | --- | --- |
| 1003 | 75,04 · 19,80 · 80,26 | 0,952 · 0,393 · 0,000 | 250 · 168 · 0 | 48,3 / ≈ 48 |
| 7035 | 80,05 · −1,21 · 1,39 | 0,560 · 0,572 · 0,551 | 197 · 199 · 196 | 56,8 / 58,3 à 59,0 |
| 3020 | 40,51 · 59,32 · 47,97 | 0,499 · 0,013 · 0,006 | 187 · 30 · 17 | 11,6 / 14,2 à 14,4 |

La conversion est faite dans le code (Lab → XYZ → sRGB linéaire) et non à
l'œil. Le blanc du Lab est pris comme le blanc D65 de sRGB, pour qu'un neutre
reste neutre. Le bleu du RAL 1003 sort à −0,004, juste hors gamut sRGB ;
l'écrêter coûte ΔE 0,4. Si tu disposes des valeurs sous licence, ou de la fiche
couleur du fournisseur de peinture, elles se remplacent en une ligne.

Le RAL 3020 de cette source est plus sombre que sa LRV officielle (Y 11,6
contre 14,2). C'est l'écart le plus net entre sources ; il est signalé, pas
corrigé.

## Pièces dont la zone est ambiguë (signalées, pas devinées)

1. **Brides des poteaux de garde-corps (4.1.1).** Dans le maillage, elles sont
   soudées aux poteaux galvanisés et ne s'en séparent pas. Elles restent en
   galvanisé, d'aspect très proche du Zn/Al (gris métal mat).
2. **Garde-corps du boat landing et de son accès.** La CAO les peint en jaune,
   avec des embouts rouges, comme la photo prise depuis l'accès. Ils restent
   jaunes. Les garde-corps galvanisés dans la CAO sont traités selon 2.2.2.
3. **Équipements orange de la CAO** (petits fûts et poteaux sur les ponts).
   Hors plan : ils gardent leur matériau CAO.
4. **Panneaux d'identification.** Hors plan : ils gardent leur matériau CAO.
5. **Intérieur de la pièce de transition** (plateforme interne, trappe).
   Hors plan, visible seulement de dessus : il garde son matériau CAO.
6. **Zone rouge du caillebotis.** Le plan ne la mentionne pas. Son emplacement
   vient de la vue de dessus de la plateforme de la grue : ce sont les deux
   panneaux de la zone de dépose dessinés dans la CAO.
7. **Couleurs des caillebotis.** Estimées sur deux photos sans référence
   colorimétrique : incertitude de l'ordre de 5 ΔE.
8. **Noir des bandes de signalisation.** Le plan ne le spécifie pas : c'est un
   noir physique (réflectance 2,5 %), pas un RAL.
9. **Galvanisé et Zn/Al.** Ces revêtements n'ont pas de RAL. Ce sont des valeurs
   physiques typiques de zinc patiné et de Zn/Al projeté, pas des mesures.
10. **Boat landing sous LAT −1 m.** La ligne 3.2.4 du plan le garde en RAL 1003
    dans toutes les zones (atmosphère, éclaboussures, immergée). Le plan est
    suivi : il est jaune jusqu'à son pied, environ −2 m.
11. **Petites pièces galvanisées sous LAT −1 m** (quelques plaquettes près des
    fourreaux de pieux). Tout ce qui est immergé porte le système immergé
    RAL 7035.

## Usure : sobre, procédurale, placée par la physique

Aucune texture photo : uniquement des masques calculés dans le shader. Ils
s'appuient sur trois sources :

- un bruit généré par le code (volume 32³) ;
- le **temps d'immersion** à chaque hauteur, calculé sur une année avec le
  prédicteur harmonique de marée de l'app (pas de 10 min) : 100 % sous
  +0,5 m, 50 % à +5,1 m, 0 % au-dessus de +9,75 m ;
- un **volume d'exposition** précalculé par lancer de rayons sur le vrai
  maillage (mailles de 0,5 m). Il donne la part de ciel visible dans un cône
  de 35° autour du zénith, et la présence d'un rebord solide dans les 3 m
  au-dessus. Il porte aussi deux bruits lents (3 m et 1,5 m), pour que le
  shader lise l'exposition et les variations lentes en une seule lecture.

Les masques :

- **Bande de marnage et d'éclaboussures**, de LAT −1 m à +14,6 m. La peinture
  se ternit et devient plus mate, au maximum là où l'alternance mouillé/sec est
  la plus forte (mi-marée) ; les embruns l'atteignent jusqu'au haut de la zone
  d'éclaboussures. **Trace verte** en bande à bord irrégulier, là où l'acier
  est immergé plus de 70 % du temps, juste au-dessus du LAT.
- **Guano**, sur les faces tournées vers le ciel, au-dessus de la marée haute.
  Il se dépose en amas, plus dense sous un perchoir (lisse, rebord, nœud) et
  sur les faces exposées. Il reste retenu : la structure est récente, et les
  photos montrent un état « avant nettoyage ».
- **Sel**, dans la zone d'éclaboussures, sur les faces abritées de la pluie.
- **Coulures**, sur les faces raides situées sous un rebord, un nœud ou une
  console, plus marquées là où la pluie arrive.
- **Brillance**, variant par lot et par épaisseur de film, et un peu de
  farinage sur les faces exposées au soleil.

Sous LAT −1 m, aucune usure : c'est l'eau de l'app qui s'en charge.

## Détail fin

**Tuiles générées par le code, sans aucune image tierce** (choix validé : les
hôtes CC0, ambientCG et Poly Haven, sont refusés par le réseau de
l'environnement de travail). Trois tuiles de 256 × 256 texels, environ 1 mm
par texel :

- **peinture** : peau d'orange, ondulations de 2 à 4 mm sur une tuile de
  0,25 m ;
- **galvanisé** : cristaux de zinc d'environ 6 mm sur une tuile de 0,25 m ;
- **GRP** : la maille carrée de 38 mm, avec des barreaux de 6 mm de large au
  sommet et un grain antidérapant, 4 mailles sur une tuile de 0,152 m. La
  maille est posée à plat et alignée sur les axes des plateformes.

Fonctionnement :

- **Format** : KTX2 en RGBA8, avec toute la chaîne de mipmaps et une
  supercompression Zstandard. R porte l'albédo, G la rugosité, B et A la
  normale. Les mipmaps moyennent les normales comme des vecteurs, puis les
  renormalisent : au loin, le relief s'aplatit au lieu de scintiller. Les
  tuiles sont chiffrées dans le coffre comme le reste.
- **Chargement** : lecture directe du KTX2, sans transcodeur Basis. Il n'y a
  donc ni worker imbriqué dans le worker de rendu, ni fichier en clair publié.
  Filtrage trilinéaire et anisotropie 4× : c'est suffisant contre le moiré de
  la maille à incidence rasante, et deux fois moins coûteux que 8×.
- **Portée courte** : le détail est plein jusqu'à 4 m de l'œil et disparaît à
  9 m. Sur téléphone, c'est 2,5 m et 6 m. Au-delà, le caillebotis prend sa
  couleur moyenne, barreaux et vides confondus.
- **Palier « appareil léger »** : couleur et usure, sans détail.
  - Il est choisi au démarrage si l'appareil annonce 4 cœurs ou moins, 3 Go
    de mémoire ou moins, ou des textures limitées à moins de 4096 px.
  - Sur téléphone, il est pris pour la session dès la première mesure sous
    48 i/s, avant toute baisse de résolution.
  - Ailleurs, il est pris si l'image reste sous 45 i/s alors que la
    résolution est déjà à son plancher.
  - Le mode sans échec n'a jamais de détail ni d'usure.
- **Variantes compilées** : le code de l'usure et celui du détail ne sont dans
  le shader que lorsqu'ils servent. Mesuré : présents mais sautés, ils
  coûtaient encore à eux seuls environ un cinquième d'un gros plan. Passer au
  palier léger recompile une fois les matériaux de la fondation.

## Lumière, gestion des couleurs, tone mapping

- **Éclairage et gestion des couleurs : inchangés.**
- **Tone mapping : changé pour la fondation seule, parce que c'est nécessaire
  pour des couleurs justes.** L'ACES de l'app décale le RAL 1003 de ΔE ≥ 7
  quelle que soit l'exposition : teinte décalée de +8 à +10° vers le jaune
  citron, chroma réduit de 13. Les matériaux de la fondation utilisent donc le
  tone mapping Khronos PBR Neutral, conçu pour rendre fidèlement les couleurs
  de base. Le CTV, la mer et le HUD gardent l'ACES et restent identiques au
  pixel.

## Preuves

### a) Conformité au plan, automatique

**Tests sur le modèle chiffré : 11 nouveaux, suite complète 94/94.** Pour
chaque ligne du tableau, ils vérifient que les pièces concernées portent le
bon système, donc la bonne couleur et la bonne finition, à la bonne hauteur :

- aucun sommet sans classe ;
- sous LAT −1 m, seulement trois systèmes : le gris RAL 7035 sur l'époxy, le
  jaune RAL 1003 exclusivement dans l'emprise du boat landing (3.2.4), et le
  caoutchouc ;
- la jambe qui traverse la frontière est grise juste dessous, jaune juste
  dessus ;
- les garde-corps des ponts sont galvanisés (2.2.2) ;
- la face supérieure de la bride de la pièce de transition est en Zn/Al
  (4.2.1), sa face externe dans le système 2.2.1 (note 2) ;
- les points d'ancrage sont en RAL 3020 (3.2.5) ;
- le caillebotis est aux niveaux des ponts, la zone rouge sur la plateforme de
  la grue, les bandes noires sur les goussets ;
- le shader : frontière, tone mapping propre à la fondation, ligne d'eau
  dessinée par-dessus ;
- le volume d'exposition ;
- la lecture des tuiles KTX2.

**Lecture au rendu GPU.** Sur 96 points réels du modèle, répartis sur 12
lignes du plan, le shader rendu a été relu : système, rugosité, métallicité et
couleur de base. Tous sont conformes, avec un ΔE ≤ 0,5 dû à la quantification
8 bits. Les points vont de −25,7 m (pieux) à +36,7 m (bride).

### b) ΔE2000 sous lumière neutre

Patch plan du vrai matériau, une seule lumière blanche à 45°, vu de face
(géométrie CIE 45°:0°), rien d'autre dans la scène. Le reflet spéculaire de la
peinture brillante est compris.

| RAL | Matériau seul | Avec le tone mapping de la fondation | Avant (teinte CAO, ACES) |
| --- | --- | --- | --- |
| 1003 | **1,35** | **2,81** | 13,3 |
| 7035 | **0,44** | **1,55** | 35,1 |
| 3020 | **1,83** | **2,03** | 17,4 |

Cible : moins de 3, tenue partout. Contre d'autres sources publiées des mêmes
références, l'écart va de 1,8 à 3,7 : c'est l'ordre de grandeur de
l'incertitude sur la valeur « officielle » elle-même.

### c) Planches rendu / photos

Envoyées à part, elles ne sont pas dans le dépôt.

### d) Performances

À compléter.

### e) Non-régression

**CTV, eau et ciel : identiques au pixel.** Les deux versions sont rendues avec
le même moteur, le même instant figé et les mêmes caméras, sur quatre vues :
ensemble avec CTV et mer, CTV de près, mer seule, boat landing.

- Fondation masquée : **0 pixel différent** sur les quatre vues.
- Fondation visible : **0 pixel différent hors de l'emprise de la fondation**.
  L'emprise couvre la fondation elle-même, ses reflets dans l'eau et ce
  qu'elle cache.

**HUD :** à compléter.

**Scintillement :** à compléter.
