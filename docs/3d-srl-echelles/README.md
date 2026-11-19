# 3D : SRL et tag lines des deux autres échelles extérieures (lot 8)

Sur `/3D/test/`, l'échelle intermédiaire et l'échelle de la girder platform
reçoivent la tag line du boat landing, avec son clamp. C'est le même modèle,
accroché selon la même logique.

## Les trois échelles extérieures du modèle

- **Boat landing** : de la mer à la plateforme intermédiaire (plancher vers
  19,8 m). Le SRL est en haut de l'échelle, avec son crochet vers 22,5 m. Le
  clamp de la tag line est à 3,50 m. Rien ne change sur cette échelle.
- **Échelle intermédiaire** : échelle inclinée, de la plateforme
  intermédiaire jusqu'au sommet du girder (vers 28,3 m). Elle penche d'environ
  8° vers la structure.
- **Échelle de la girder platform** : échelle verticale, de la girder platform
  (plancher vers 24,6 m) jusqu'au sommet du girder. Ses montants se
  prolongent au-dessus de ce niveau.

Les hauteurs sont en LAT proposé, avec le même calage que le reste de la
scène.

## Les SRL : déjà dans le modèle, réutilisés

Le modèle CAO de la fondation porte déjà, sur ces deux échelles, la même pièce
de SRL que sur le boat landing : un carter galvanisé suspendu à un bras rouge
de point d'ancrage. La hauteur du carter est la même à 2 cm près, et son
crochet est au point le plus bas.

- Échelle intermédiaire : crochet vers 27,16 m, sous le bord du sommet du
  girder, au-dessus des derniers barreaux.
- Échelle de la girder platform : crochet vers 30,67 m, sur le prolongement
  des montants au-dessus du sommet du girder.

Aucun SRL n'est donc ajouté : ceux du modèle sont réutilisés tels quels, sans
aucun triangle de plus. Seuls le clamp et la tag line rouge, absents du
modèle, sont ajoutés.

## Clamp et tag line : même modèle, même logique

Le même générateur que celui du boat landing construit chaque ensemble :
clamp inox à deux mâchoires sur le barreau, œil, manille, cosse, épissure, et
corde rouge de 14 mm qui monte devant les barreaux jusqu'au crochet du SRL.

- **Ancrage** : sur un barreau de l'échelle, comme au boat landing.
- **Côté** : celui du grimpeur. Sur l'échelle intermédiaire, c'est le même
  côté qu'au boat landing (face au large). Sur l'échelle de la girder
  platform, le crochet du SRL pend de l'autre côté des barreaux : le clamp et
  la corde y sont donc retournés et suivent le léger biais de l'échelle
  (environ 7°).
- **Hauteur** : au boat landing, le clamp tient le bas de la tag line à portée
  de main depuis le point de départ de la montée. Sur les deux autres
  échelles, le point de départ est un plancher. Le clamp est donc posé sur le
  barreau situé à environ 1,1 m au-dessus de ce plancher :
  - échelle intermédiaire : barreau à 20,99 m, œil à 20,93 m, soit 1,10 m
    au-dessus du plancher ;
  - échelle de la girder platform : barreau à 25,77 m, œil à 25,70 m, soit
    1,09 m au-dessus du plancher.
- **Cheminement** : la corde part du clamp, monte devant les barreaux en
  suivant la pente de l'échelle, puis rejoint le crochet relevé du SRL. Elle
  ne touche l'acier qu'au crochet. Au plus près, elle passe à 5,2 cm de
  l'échelle intermédiaire et à 4,0 cm de l'échelle de la girder platform
  (10,6 cm au boat landing).

Positions à confirmer, car elles ne sont pas lisibles dans le modèle :

- la hauteur du clamp sur les deux échelles (le barreau à environ 1,1 m
  au-dessus du plancher de départ est un choix, pas un relevé) ;
- le côté du clamp sur l'échelle de la girder platform, déduit de la position
  du crochet du SRL ;
- le nom des échelles : « intermédiaire » pour l'échelle inclinée qui part de
  la plateforme intermédiaire, « girder platform » pour l'échelle verticale
  qui part de la girder platform.

Le panneau d'information de la scène le dit, en français et en anglais.

## Preuves

- **Captures avant/après des deux échelles**, dans le vrai moteur, aux mêmes
  caméras, sur PC (1024 × 640) et sur téléphone (Pixel 7). Pour chaque
  échelle, le bas (clamp et départ de la corde) et le haut (corde et crochet
  du SRL). Elles sont gardées hors du dépôt.
- **Reste de la scène identique au pixel**, à instant figé :
  - Dans le moteur, les tag lines ajoutées sont masquées et la carte d'ombre
    de la fondation est recalculée sans elles. Résultat : 0 pixel de
    différence avec `main` dans les 8 vues (les deux échelles de près, une
    vue d'ensemble, FOU, BL, Tether), sur PC et sur téléphone. Le plancher de
    bruit, `main` contre `main`, est aussi à 0.
  - Avec les tag lines affichées, les différences restent dans leur emprise.
    Ce sont la corde, le clamp et leur ombre sur les barreaux.
- **Dans l'app scellée**, avec `main` contre ce lot (plancher à 0 partout) :
  - PC : la corde de l'échelle intermédiaire se voit en FOU (132 pixels) et
    au fond de la vue BL (359 pixels). Tether : 0 pixel.
  - Téléphone : 86 pixels en FOU, 492 en BL, 0 en Tether.
  - Hors 3D, l'interface est identique.
- **Mode allégé du téléphone** (`?safe=1`, canvas classique sans ombres ni
  reflets) : rendu normal, aucune erreur console. Les seules différences avec
  `main` sont les cordes : 3 pixels en FOU, 67 en BL, 0 en Tether. Sans
  `?safe=1`, le téléphone tourne avec la mer « mobile » ; c'est la mesure
  ci-dessus.
- **Budget** (moteur, médiane de 15 images) :
  - les deux ensembles ajoutés (clamps et tag lines des deux échelles) ne
    forment qu'**un seul objet, avec un seul matériau** : 1 maillage et
    9 152 triangles ;
  - par image affichée, ombres et reflets compris : **+4 draw calls** en vue
    FOU (132 → 136) et dans la vue d'ensemble, +2 en vue BL (104 → 106), sur
    PC comme sur téléphone ;
  - triangles : +2,8 % en vue FOU (1 440 924 → 1 480 908), +1,3 % en BL ;
  - les SRL eux-mêmes ne coûtent rien de plus : ce sont ceux du modèle ;
  - comment : les pièces des deux ensembles sont fusionnées en une seule
    géométrie. Les quatre matériaux du clamp (inox, élastomère, rouge,
    jaune) deviennent quatre texels de deux petites textures (couleur ;
    rugosité et métal), avec exactement les mêmes valeurs. Chaque pièce lit
    son texel par ses coordonnées de texture. L'élargissement des profils
    fins à distance reste actif sur la corde seule ;
  - sans perte visuelle : la version en un seul objet est identique au pixel
    à une première version en 5 objets (un par matériau) dans 15 vues sur 16.
    La 16ᵉ, la vue d'ensemble au téléphone, diffère d'un seul pixel. Une
    construction pièce par pièce, comme au boat landing, aurait fait 36
    objets ;
  - conséquence : ces deux clamps ne servent pas de point d'accroche pour
    l'outil de mesure (un seul objet, marqué comme non mesurable, comme les
    pièces rouges et noires du clamp du boat landing).
- **Tests** (suite privée, nouveau fichier) :
  - un clamp par échelle, œil entre 1,0 et 1,2 m au-dessus du plancher, du
    côté du grimpeur ;
  - corde terminée sur le crochet relevé, sans bout libre sous le clamp ;
  - mêmes pièces que le clamp du boat landing ;
  - un seul maillage et un seul matériau, à géométrie identique à la
    construction pièce par pièce, et chaque pièce lit exactement la couleur,
    la rugosité et le métal de son matériau d'origine ;
  - clamp du boat landing inchangé (18 pièces) ; rien sur le modèle de
    secours ;
  - un test existant mesurait la boîte englobante de tout le groupe du clamp
    du boat landing, qui porte maintenant aussi les deux autres échelles. Il
    est restreint aux pièces du boat landing, ce qui garde son intention
    (clamp compact, moins de 25 cm) ;
  - sur le modèle chiffré : un SRL de même hauteur que celui du boat landing
    au-dessus de chaque crochet, et une corde qui ne touche pas l'acier.
- **Coffre** : identifiant, sel, itérations et contrôle inchangés ; seule
  l'entrée `runtime` change. Les 13 ressources déchiffrées sont identiques
  octet pour octet ; seul le code change.
- **Suite privée, lint, build, archive** : SUITE

## Limites

- Les hauteurs du clamp sont un choix raisonné, pas un relevé (voir plus
  haut).
- La corde est une courbe fixe, comme au boat landing : ni mou, ni vent, ni
  poids.
- La fluidité n'a pas été vérifiée sur un vrai appareil : le banc rend sans
  GPU.
