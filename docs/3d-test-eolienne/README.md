# 3D TEST — éolienne, jumeau numérique

Version TEST (`/3D/test/`) uniquement : la production `/3D/` n'est pas touchée,
pas plus que le site principal, le workflow ou les redirections `/3d/`. Même
coffre (identifiant, sel, contrôle, itérations), même mot de passe.

Dans le coffre, **seul le runtime change** : l'éolienne est construite par le
code au chargement, à partir de ses dimensions. Il n'y a ni modèle, ni image,
ni texture nouvelle. Les photos fournies servent de référence visuelle et
restent privées : aucune n'est dans le dépôt, ni aucun nom, numéro ou repère
qu'elles portent. Ce dépôt ne nomme ni le parc ni le modèle d'éolienne ; les
sources sont décrites par leur nature.

## 1. Éolienne ou capot de TP

La tour se pose sur la bride de la pièce de transition, là où se trouve le
capot de TP ajouté à la tâche précédente. Les deux ne peuvent pas coexister, et
un bouton permet d'afficher l'un ou l'autre :

- dans la barre d'outils, à côté de WC59, une icône d'éolienne ;
- dans les réglages, l'interrupteur « Éolienne (sinon capot de TP) ».

Le choix est mémorisé sur l'appareil ; par défaut, l'éolienne est affichée.

Le capot masqué sort aussi du picking, des mesures et des collisions de
caméra. Il reste compté dans le cadrage : **le cadrage de lancement et celui
du simulateur ne changent pas**, avec ou sans éolienne.

Avec le capot, l'image est **identique au pixel près** à la version actuelle :
0 pixel différent sur 4 vues (lancement, pont, boat landing, vue lointaine).

## 2. Dimensions et sources

Valeurs publiées (fiche du constructeur, brochure du modèle, deux bases de
données d'éoliennes). Les autres sont **estimées**, et marquées comme telles.

| Grandeur | Valeur | Source |
| --- | --- | --- |
| Diamètre du rotor | 167 m | fiche constructeur |
| Longueur de pale | 81,5 m | brochure (81,4 m sur la page du constructeur) |
| Régime maximal | 10,3 tr/min (bout de pale à 90 m/s) | bases de données |
| Démarrage / nominal / coupure | 3 / 12 / 25 m/s | bases de données ; l'une donne 13 et 28 m/s, la valeur la plus citée est retenue |
| Hauteur du moyeu | 128,7 m LAT (123,5 m au-dessus du niveau moyen) | **estimée** : même éolienne sur jackets dans un autre parc français, 207 m au-dessus de la mer en bout de pale (autorité régionale), moins 83,5 m |
| Contrôle d'enveloppe | moyeu entre 117,5 et 127,5 m au-dessus de la mer | enveloppe autorisée du parc : bout de pale au plus à 211 m, tirant d'air au moins 34 m ; 123,5 m y est |
| Niveau moyen | 5,19 m au-dessus du LAT | moyenne 2026 de la marée prédite par l'app |
| Inclinaison du rotor | 6° | **estimée** : éolienne de référence publique de 15 MW à entraînement direct |
| Pré-conicité | 3° | **estimée** : entre les références publiques (2,5° et 4°) |
| Profil de pale | corde, vrillage, épaisseur relative, pré-cintrage | **estimé** : pale de référence publique de 15 MW (117 m) ramenée à 81,5 m ; cordes ×1,15 pour un pied de pale de 4,4 m comme sur les photos |
| Pied de pale / rayon de moyeu | 2,0 m | 83,5 − 81,5 m |
| Tour, pied | Ø 6,0 m | la bride du modèle (anneau de 3,00 m de rayon) |
| Tour, tête | Ø 4,8 m | **estimé** sur les photos |
| Longueur de tour | 88,15 m (bride 36,73 → 124,89 m LAT) | déduite : moyeu − 3,8 m − bride |
| Moyeu au-dessus du palier d'orientation | 3,8 m | **estimé** sur les gros plans de la nacelle |
| Porte-à-faux (moyeu devant l'axe de la tour) | 7,6 m | **estimé**, idem |
| Nacelle | carter de 13 m × 6,2 m × 7,2 m, anneau du générateur Ø 7,6 m, moyeu Ø 7,4 m | **estimée** sur les gros plans, en diamètres de tête de tour, environ ±10 % |
| Plateforme d'hélitreuillage | garde-corps rouge de 1,6 m, coin rouge avant de 3,5 m | **estimée**, idem |
| Bande rouge de la tour | 14,0 à 18,7 m au-dessus de la bride | mesurée sur les photos |
| Marquage des pales | bout blanc de 4 m, puis 10 m de rouge | mesuré sur les photos |
| Peinture | gris clair RAL 7035, rouge RAL 3020 | gris standard des éoliennes en mer ; mêmes valeurs Lab que la fondation |

**Contrôle tour / bride** (test automatique, sur le modèle chiffré) : la
bride mesurée est à 36,734 m LAT, anneau de 3,000 m de rayon. Le pied de la
tour est à 36,734 m, rayon 3,000 m : même niveau, même diamètre, sans
surplomb. Le pied est ouvert, la tête est dans la nacelle : aucune face n'est
coplanaire avec la bride.

Contrôles sur la géométrie construite : diamètre balayé 167 m à 0,6 m près,
moyeu à sa hauteur, bout de pale à plus de 6 m devant la tour à toutes les
positions, bandes rouges aux bonnes cotes.

## 3. Modèle

- Construit par le code, en 3 niveaux de détail par pièce : environ 16 400,
  5 600 et 1 700 triangles pour l'ensemble. Le changement de niveau suit la
  distance (moins d'un demi-pixel d'erreur de silhouette en 1080 lignes), avec
  8 % d'hystérésis. Il est calculé avec la caméra principale seulement, pour
  que la passe de reflet de la mer ne fasse pas basculer un niveau.
- Pales : sections aérodynamiques (cercle au pied, profil cambré ensuite),
  vrillées, pré-cintrées vers le vent.
- Nacelle d'après les gros plans : carter en gélule, arrière en calotte,
  anneau du générateur, moyeu bombé avec collerettes aux pieds de pales,
  plateforme à garde-corps rouge, coin rouge avec la trappe, mât d'instruments,
  nacelle technique dessous.
- Couleurs en couleurs de sommets, sans surface superposée : pas de
  z-fighting possible sur les bandes.

## 4. Comportement

Le vent est la série horaire à 10 m de la même requête Open-Meteo que l'app
(jusqu'ici, seuls les pics du jour étaient gardés). Il est interpolé à
l'heure affichée, sans jamais combler un trou. Il est ramené au moyeu par une
loi puissance d'exposant 0,11, mesuré en mer en conditions quasi neutres
(Hsu, Meindl et Gilhousen, 1994), sur la hauteur au-dessus de l'eau du
moment : ×1,32 au niveau moyen.

Le contrôleur tourne dans le temps de l'app :

- arrêt, pales en drapeau (88°), sous 3 m/s et au-delà de 25 m/s, décidé sur
  la moyenne de 10 minutes, avec hystérésis : arrêt sous 2,5 m/s, redémarrage
  après tempête sous 22 m/s (valeurs **estimées**) ;
- en charge partielle : pas à 0°, régime suivant le vent à vitesse
  spécifique 9, borné entre 5 tr/min (**estimé**) et 10,3 tr/min ;
- au-dessus du nominal : régime plafonné, pas croissant d'après les états
  stationnaires de la référence de 15 MW ramenés à notre plage 12–25 m/s
  (**estimé**). Les deux machines demandent un coefficient de puissance
  d'environ 0,04 à 25 m/s, ce qui fixe le point final (22,8°) ;
- orientation face au vent à 0,3°/s, déclenchée au-delà de 8° d'écart filtré,
  arrêtée sous 1° ; pas à 2°/s au plus ; montée en régime en 2 minutes environ
  (valeurs typiques, **estimées**).

Ce qui est dessiné suit le contrôleur sans jamais sauter : au plus 15°/s en
orientation, 20°/s en pas et 3 tr/min/s, en temps réel. En temps réel le
contrôleur est plus lent que ces limites ; en time-lapse ou après un saut
d'heure, elles évitent tout mouvement instantané. Le rotor tourne à sa vitesse
réelle, même pendant le time-lapse : accéléré, ce serait un stroboscope. Sans
prévision de vent, l'éolienne est représentée à l'arrêt, et le panneau le dit.

Le panneau d'informations affiche l'état à l'heure affichée : production ou
arrêt et sa raison, régime, pas, orientation, vent au moyeu et à 10 m.

Exemples (vent du 250°, eau au niveau moyen) :

| Cas | Vent à 10 m | Vent au moyeu | État | Régime | Pas | Orientation |
| --- | --- | --- | --- | --- | --- | --- |
| Calme | 1,5 m/s | 2,0 m/s | arrêt | 0 | 88° | 250° |
| Charge partielle | 6 m/s | 7,9 m/s | production | 8,14 tr/min | 0° | 250° |
| Régime maximal atteint | 7,6 m/s | 10,0 m/s | production | 10,30 tr/min | 0° | 250° |
| Au-dessus du nominal | 10 m/s | 13,2 m/s | production | 10,30 tr/min | 6,1° | 250° |
| Fort | 14 m/s | 18,5 m/s | production | 10,30 tr/min | 15,2° | 250° |
| Tempête | 22 m/s | 29,0 m/s | arrêt | 0 | 88° | 250° |

Tests automatiques : ces cas, la loi de cisaillement, la courbe (bornes,
monotonie), l'hystérésis, l'orientation (zone morte, 0,3°/s, passage par le
nord), le démarrage et l'arrêt à vitesses limitées, les sauts d'heure,
l'absence de prévision, la pose dessinée et les feux.

**Nuit** : deux feux rouges à éclats au sommet de la nacelle, 30 éclats par
minute, synchronisés sur l'horloge (arrêté du 23 avril 2018, annexe II,
éoliennes en mer). Mesuré : 30 éclats en 60 s, une demi-seconde chacun.

## 5. Ombres

L'existant est **inchangé** : une carte de 512 px sur ±23 m centrée sur le
CTV, dont le CTV est la seule source, reçue par la mer. La fondation n'y
projette ni n'y reçoit d'ombre ; c'était déjà le cas.

L'éolienne a **sa propre carte**, plus grossière : 1024 px sur un cadre de
176 m, soit 17 cm par texel, profondeur 16 bits (3 mm). Le cadre est calé une
fois pour toutes sur tout ce que l'éolienne peut balayer, quelle que soit son
orientation. Le soleil de la scène est fixe : le cadre ne bouge jamais, donc
aucun tremblement quand la caméra bouge. La carte n'est redessinée que si la
pose a changé.

- Seule l'éolienne y est dessinée : la fondation, le CTV et la mer ne peuvent
  pas s'y ombrer eux-mêmes, donc pas d'acné. Sur la tour et la nacelle, un
  décalage selon la normale de 0,3 m l'évite. Les pales ne la reçoivent pas.
- Reçue par la fondation, le CTV, la tour et la nacelle, sur la lumière du
  soleil seulement, au même endroit que l'ombre intégrée.
- Sur la mer, elle retire ce que le soleil apporte (diffus et reflet du
  soleil), pas la lumière remontant de l'eau ni le reflet du ciel. Une ombre
  sur la mer n'est donc jamais noire. Pénombre de 0,9 m, celle que donne le
  disque solaire (0,53°) à 100 m.

## 6. Profondeur et scintillement

- **Profondeur** : le plan proche reste réglé par l'existant (puissance de 2
  sous la moitié de la distance au plus proche). L'éolienne entre dans ce
  calcul quand elle est affichée, avec une enveloppe tour + carter + disque du
  rotor. Mesuré sur les vues de contrôle : proche 4 à 32 m, lointain 1 800 m.
  Avec un tampon de 24 bits, le pas de profondeur au moyeu est sous le
  millimètre (0,08 mm à 150 m pour un proche de 16 m). Il serait de 6 mm à
  100 m dans le pire cas (proche à 0,1 m). Les surfaces voisines les plus
  proches du modèle sont à 3 cm : pas de z-fighting.
- **Pales** : MSAA existant, plus un anti-crénelage spéculaire géométrique (la
  rugosité monte là où la normale tourne plus vite qu'un pixel), sur la tour,
  la nacelle et les pales.

## 7. Preuves

Toutes les mesures viennent d'un rendu logiciel (SwiftShader, sans GPU) :
seul le relatif compte.

**Tests** : suite complète au vert (116/116), dont 15 nouveaux (comportement : 9 ; géométrie, dont le contrôle tour / bride sur le modèle chiffré : 6).

**Non-régression avec l'éolienne affichée**, au pixel près, sur 6 vues, avec
un plancher de bruit base contre base de 0. Chaque écart est classé : dans la
silhouette de l'éolienne, dans son ombre, dans son reflet sur la mer, ou à la
place du capot retiré.

| Vue | Pixels différents | Hors de ces zones |
| --- | --- | --- |
| Lancement | 25 752 | 3 (écart de 1/255, reflet du capot dans la mer) |
| Pont | 22 809 | 0 |
| Boat landing | 7 950 | 0 (ombre seule) |
| Lointaine | 15 564 | 0 |
| Côté ombre | 19 092 | 0 |
| Tour | 47 904 | 0 |

**Scintillement** : 24 images consécutives, rotor à 10,3 tr/min (1,03° par
image à 60 i/s). Chaque image est aussi rendue au double de résolution, comme
référence suréchantillonnée.

| Vue | Hors rotor, ombre et reflet : variation max d'une image à l'autre | Rotor : écart temporel à la référence, moyen / p99,9 | Part de pixels qui sautent (> 48/255) |
| --- | --- | --- | --- |
| Rotor de près | 0 | 1,8 / 63 | 0,27 % |
| Avec la fondation et le CTV | 0 | 1,2 / 42 | 0,06 % |
| Lointaine (moiré) | 1,4/255, au bord du reflet | 2,6 / 46 | 0,08 % |

La fondation, le CTV et la mer ne bougent pas d'une image à l'autre. Sur le
rotor, l'écart à la référence reste petit devant la variation propre du
mouvement (6,8 à 23/255 en moyenne).

**Performances** : même page, éolienne masquée puis affichée, en alternance,
caméras fixes. Chaque image comprend la passe d'ombre de l'éolienne, rotor en
rotation, et le rendu complet, relu pour synchroniser. Médiane / p95 en ms.

PC, 1280 × 800 :

| Vue | Sans | Avec | Écart | Ramené à 8 ms |
| --- | --- | --- | --- | --- |
| Vue d'ensemble | 980 / 1 009 | 1 001 / 1 068 | +2,2 % / +5,9 % | +0,18 ms |
| Éolienne entière | 704 / 726 | 729 / 765 | +3,5 % / +5,4 % | +0,20 ms |
| Rotor de près | 82 / 86 | 135 / 149 | +53 ms | +0,43 ms |
| Gros plan du pont | 792 / 840 | 814 / 848 | +2,7 % / +1,0 % | +0,17 ms |

Téléphone bridé, 412 × 915 à ×2, processeur ralenti ×4 :

| Vue | Sans | Avec | Écart | Ramené à 8 ms |
| --- | --- | --- | --- | --- |
| Vue d'ensemble | 1 562 / 1 608 | 1 613 / 1 648 | +3,3 % / +2,5 % | +0,26 ms |
| Éolienne entière | 1 110 / 1 153 | 1 166 / 1 215 | +5,0 % / +5,3 % | +0,28 ms |
| Rotor de près | 120 / 133 | 258 / 282 | +139 ms | +0,71 ms |
| Gros plan du pont | 450 / 496 | 483 / 505 | +7,5 % / +1,8 % | +0,17 ms |

« Rotor de près » : sans éolienne, cette vue ne montre presque que du ciel,
d'où l'écart relatif ; c'est le coût absolu qui compte. La dernière colonne
ramène l'écart à un appareil qui rend la vue d'ensemble actuelle en 8 ms : au
plus +0,7 ms, **sous le budget de +2 ms**. À valider sur un vrai téléphone.

Une première série téléphone avait été faussée par deux mesures lancées en
même temps ; l'écart douteux (+50 % sur le pont) a été repris seul,
finement alterné, puis toute la série refaite seule.

- **Mémoire GPU** : géométrie +0,87 Mo (tous niveaux et le double pour
  l'ombre), carte d'ombre 3 Mo (1 Mo de couleur, 2 Mo de profondeur 16 bits),
  une texture de halo de 16 Ko.
- **Draw calls** : 97 → 113 dans la vue de lancement, passe d'ombre comprise ;
  +7 600 triangles.
- **Téléchargement** : +27 Ko (runtime de 695 872 à 723 165 octets).

**Interface** : le bouton ajouté allongeait la colonne d'outils. Elle
chevauchait le panneau du bas à 1280 × 800 (40 px) et, panneau ouvert, à
390 × 844 (6 px). Ses boutons font maintenant 38 px de haut sous 900 px de
hauteur d'écran (42 au-delà), et 35 px sur téléphone (39 avant). Mesuré dans
le DOM, connecté, sur 1440 × 756, 1280 × 800, 412 × 915, 390 × 844,
375 × 667 et 360 × 740, panneau fermé et ouvert : la colonne finit 1 px plus
haut qu'avant partout, sans aucun chevauchement nouveau. Les seuls restants
existent déjà dans la version actuelle (1440 × 756, et petits téléphones
panneau ouvert) et sont égaux ou moindres.

**Build scellé** : coffre inchangé hors entrée `runtime`, aucun fichier en
clair, connexion par mot de passe OK sur PC et téléphone. Parcours vérifié,
météo simulée : bouton éolienne / capot dans les deux sens, réglage, choix
mémorisé, état « En production » dans le panneau. Aucune erreur console, hors
la météo que le réseau du banc bloque (comme pour la version actuelle).

## 8. Limites

- Hauteur du moyeu, nacelle, inclinaison, pré-conicité, profil de pale,
  régime minimal, lois d'orientation et de pas : estimés. Ce sont des valeurs
  typiques, pas la logique du constructeur. La hauteur du moyeu est à
  confirmer si l'étude d'impact devient accessible ; l'accès réseau du banc
  était fermé à ces sites.
- Le vent est la prévision horaire à 10 m : pas de rafale, pas de rotation du
  vent avec l'altitude, pas de sillage des autres éoliennes. Aucune puissance
  n'est affichée.
- Les feux de jour et les feux intermédiaires de la tour ne sont pas
  représentés.
- Le banc local peut dépasser le délai de 3 s du premier rendu ; il est
  allongé dans le banc seulement.
