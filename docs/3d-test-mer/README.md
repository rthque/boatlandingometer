# 3D TEST — mer et fond à l'heure affichée

Version TEST (`/3D/test/`) uniquement. La production `/3D/`, le site
principal, le workflow et les redirections `/3d/` ne sont pas touchés. Même
coffre (identifiant, sel, contrôle, itérations), même mot de passe : seul le
runtime change. Les photos de comparaison et le plan fourni restent hors du
dépôt.

Seconde PR du jumeau numérique de l'environnement, après le ciel (PR 1). La
mer prend la lumière, le ciel et le vent de celle-ci.

## Ce qui change

- **Une seule surface.** La mer dessinée, la flottaison et les contacts du
  CTV (à quai comme à la barre), la caméra et le simulateur utilisent la même
  fonction de hauteur d'eau : niveau de marée de l'app + vagues.
- **Vagues** reconstituées à partir de la prévision : mer du vent, houle et
  houle secondaire, chacune avec son spectre, croisées.
- **Écume** : moutons selon le vent, écume au pied des jambes quand la houle
  frappe, traînées dans le vent par vent fort.
- **Optique de l'eau** : couleur et turbidité d'une eau côtière de Manche
  orientale selon la saison, reflet du ciel de la PR 1 facette par facette
  (chaque facette reflète le ciel dans sa propre direction ; le miroir ne
  garde que ce qui se dresse sur la mer : structure, CTV), scintillement du
  soleil (ou de la lune) selon le vent, jusqu'à l'horizon.
- **Courant de surface** de la prévision au simulateur (à la place du courant
  fictif) et pour la dérive de l'écume ; sans prévision, l'ancienne estimation
  tirée de la courbe de marée, signalée « estimé ».
- **Fond marin** à la profondeur réelle, de la nature réelle, invisible depuis
  la surface ; vue crédible sous l'eau si la caméra plonge.
- **CTV à quai** : il flotte sur la vraie mer (décision), avec les modes de
  pilonnement, tangage et roulis du simulateur ; l'étrave reste contre le boat
  landing. Par mer plate, sa pose est exactement l'ancienne.
- Panneau « Conditions marines » : mer du vent, houle, houle secondaire et
  courant de l'heure affichée.
- Petite correction : la scène suit désormais aussi un changement de ciel
  seul (prévision arrivée sans changement d'heure), oubli de la PR 1.
- Rien d'autre ne change (vérifié au pixel près, plus bas).

## Données et sources

| Donnée | Source | Rôle |
| --- | --- | --- |
| Hauteur significative combinée, période, direction | Open-Meteo Marine, prévision horaire (déjà affichée par l'app) | hauteur totale des vagues dessinées |
| Mer du vent, houle, houle secondaire : hauteur, période moyenne, période pic, direction | Open-Meteo Marine, requête séparée | spectre de chaque système de vagues |
| Courant de surface (vitesse, direction vers laquelle il porte) | Open-Meteo Marine (courants fusionnés, marée comprise) | simulateur, dérive de l'écume |
| Vent à 10 m | Open-Meteo (déjà utilisé par l'éolienne) | moutons, rides, scintillement |
| Profondeur au point | EMODnet Bathymétrie, MNT rapporté au LAT : 20,3 m sous le LAT (cellule : 20,1 à 20,5 m ; à 150 m : 19,8 à 20,5 m) | dispersion des vagues, fond dessiné |
| Nature du fond | EMODnet Géologie, substrat 1:250 000, d'après la carte des sédiments superficiels du SHOM au 1:50 000 : sables graviers (sédiment grossier) ; sables et graviers alentour | aspect du fond |
| Spectre des vagues | JONSWAP (Hasselmann et al. 1973), étalement directionnel cos²ˢ (Longuet-Higgins et al. 1963), plus large pour les vagues courtes de la mer du vent (Mitsuyasu et al. 1975) ; rapport période moyenne / période pic (DNV-RP-C205) | vagues |
| Dispersion | ω² = g k tanh(k h), à la profondeur réelle + la marée | longueur des vagues |
| Moutons | Monahan et O'Muircheartaigh (1980) : W = 3,84·10⁻⁶ U10^3,41 | part de la surface blanchie |
| Rugosité de la surface | Cox et Munk (1954) : pente quadratique moyenne 0,003 + 0,00512 U10 | scintillement, rides |
| Eau pure | absorption Pope et Fry (1997), Smith et Baker (1981) ; rétrodiffusion Morel (1974) | couleur, turbidité |
| Constituants | phytoplancton (forme simplifiée d'après Prieur et Sathyendranath 1981), matière dissoute colorée (Bricaud et al. 1981), particules minérales (Babin et al. 2003) ; cycle saisonnier des matières en suspension et de la chlorophylle d'après les climatologies satellite de Gohin (2011) (ordre de grandeur, pas une mesure du jour) | couleur, turbidité |
| Réflectance et transparence | Gordon et al. (1988), Lee et al. (2002) ; disque de Secchi : Tyler (1968) ; visibilité sous l'eau : Zaneveld et Pegau (2003) | couleur de l'eau, brume sous l'eau |
| Couleur | observateur CIE 1931 (approximation analytique de Wyman, Sloan et Shirley 2013) | spectre → couleur affichée |
| Repères verticaux du jacket | plan de traitement de surface fourni (privé) : LAT, MUDLINE, JACKET B.O.S. | calage du fond et des jambes |

Les champs mer du vent, houle et courant arrivent par leur propre requête : un
refus de ces champs ne touche ni la hauteur des vagues ni le vent. Le courant
est interpolé heure par heure comme un vecteur : à l'étale, il passe par zéro.

## Une seule surface

`hauteur(x, z, t) = marée(t) + Σ aᵢ fᵢ(x, z) sin(kᵢ·(x, z) + φᵢ(t))`

- Une seule implémentation (`sea-state.ts`) : le shader de la mer est généré à
  partir d'elle, et la physique lit les mêmes valeurs que le GPU (phases
  intégrées en double précision côté CPU).
- La mer dessinée est une grille fixe : 0,5 m de pas jusqu'à 50 m de la
  fondation quand la caméra en est à moins d'une centaine de mètres (0,8 m
  jusqu'à 29 m sur téléphone), plus lâche au-delà ; vue de plus loin, une
  grille aussi légère que l'ancienne mer, dont les triangles ne tombent pas
  sous le pixel. Une vague n'est dessinée en géométrie que là où la grille
  tient six sommets par longueur d'onde (`fᵢ`) ; au-delà, la même vague
  continue dans le calcul de chaque pixel (les quatre plus longues ; les plus
  courtes et celles qu'un pixel ne peut tenir passent dans la rugosité du
  scintillement, variance de pente pour variance de pente), et la physique ne
  la voit pas plus que l'écran ne la dessine. La portée de chaque vague est
  dans les mêmes uniformes que lit la physique : la surface reste une.
- À quai, le CTV échantillonne cette surface sous ses deux coques (10 points)
  et y répond avec les modes du simulateur ; à la barre, idem, avec en plus
  les contacts réels avec l'acier.

## Fond marin et calage vertical

- Fond dessiné à 20,3 m sous le LAT, légèrement incliné comme le MNT, sables
  graviers. Vu depuis la surface, 20 m d'eau trouble ne laissent rien passer :
  le pixel est la couleur de l'eau elle-même (vérifié : son éclairage
  multiplié par mille ne change aucun pixel). Il n'est donc dessiné que
  lorsque la caméra passe sous la surface.
- Écarts chiffrés avec les repères du plan, sans toucher la fondation :
  - fond EMODnet **0,3 m sous la ligne MUDLINE** du plan ;
  - pointes des jambes du modèle (fin des stab-in, à 0,2 m près) : **de 0,4 m
    au-dessus à 1,0 m au-dessous** de celle que le plan dessine ; moyenne des
    quatre : 0,1 m sous elle ;
  - la ligne JACKET B.O.S. du plan est **1,4 m sous le point le plus bas du
    modèle** : le plan y arrête les pieux, que le modèle ne contient pas ;
  - les jambes entrent dans le fond 4,4 à 5,8 m au-dessus de leurs pointes :
    aucune jambe ne flotte, aucune ne dépasse sous le fond.
  Ces écarts sont compatibles avec le calage LAT provisoire du modèle, qui
  reste à valider sur levé.

## Sous l'eau

Brouillard vert de la couleur de l'eau à la profondeur de la caméra, portée
égale à la visibilité réelle de la saison (1,5 m en hiver à 5,6 m en été),
lumière qui baisse avec la profondeur, exposition qui s'adapte en partie, et la
surface vue d'en dessous (fenêtre de Snell, réflexion totale au-delà).

## Téléphones et palier « appareil léger »

- Téléphone : 16 vagues, grille de 0,8 m de pas près de la fondation, une seule
  échelle de rides. Quand le téléphone reste sous 48 images par seconde, le
  repli automatique qui retirait déjà le détail fin de la fondation allège
  aussi la mer : plus de rides texturées (leur pente passe dans la rugosité),
  plus de texture dans l'écume des jambes, plus de miroir (le ciel reste
  reflété facette par facette ; seul le reflet de la structure et du CTV, déjà
  brisé par les vagues, disparaît).
- Appareil léger : même fonction de hauteur avec 16 vagues, mer opaque simple
  de la couleur de l'eau ; le CTV y flotte aussi. Ni écume, ni fond, ni vue
  sous l'eau.

## Preuves

### Une seule surface

- Même code : le shader de la mer contient mot pour mot la fonction générée
  (vérifié sur le shader compilé), et la physique lit les mêmes uniformes.
- Hauteur calculée par le GPU à chaque sommet dessiné, relue et comparée à la
  fonction de la physique, trois états de mer : écart maximal **0,23 mm**
  (grille fine, 90 601 sommets), **0,24 mm** (grille de loin, 21 025 sommets),
  **0,27 mm** (téléphone, 25 921 sommets) : l'arrondi des flottants 32 bits.
- Entre les sommets, sur l'emprise du CTV à quai et de son approche (28 m ×
  44 m), plus grand écart des triangles à la fonction : 0,5 à 0,8 cm sur PC,
  0,7 à 2,1 cm sur téléphone.

### Hauteur significative mesurée sur la surface générée

4 écarts-types de l'élévation, sur 30 min et quatre points du quai et de
l'approche :

| Cas | Prévision | PC | Téléphone |
| --- | --- | --- | --- |
| calme (mer du vent 0,2 m / 3,3 s, houle 0,2 m / 9 s) | 0,30 m | 0,301 m | 0,285 m |
| petite mer (mer du vent, houle, houle secondaire) | 0,84 m | 0,841 m | 0,816 m |
| mer formée croisée (2 m / 5,6 s et 1,5 m / 10,5 s) | 2,50 m | 2,524 m | 2,478 m |

Tous à moins de 5 % (seuil 10 %).

### Moutons

Part de la surface blanchie par le shader (même texture, mêmes seuils) contre
Monahan : 0,44 % pour 0,46 % à 8 m/s, 1,78 % pour 1,84 % à 12 m/s, 4,72 % pour
4,90 % à 16 m/s.

### Fond invisible depuis la surface

- Calcul pour chaque mois et la plus basse marée : ce que le fond ajoute à un
  pixel vu d'en haut reste sous un 255ᵉ de la sortie (de l'ordre de 10⁻⁸).
- Vérifié au rendu : fond éclairé mille fois plus fort, image identique au
  pixel près, en novembre à l'opacité par défaut comme en juillet (eau la plus
  claire), à marée basse et à l'opacité minimale de 5 %.
- Optique saisonnière obtenue : disque de Secchi de 2,5 m (hiver) à 8,6 m
  (été) ; visibilité sous l'eau de 1,5 à 5,6 m.

### Accostage au simulateur sur la mer dessinée

Sur l'acier réel (modèle chiffré), la mer et le courant du cas, un pilote
scripté : approche à 0,2 m/s, puis poussée continue, propulseur d'étrave et
barre pour rester dans l'axe de l'échelle.

| Cas | Accosté après | Contact | Temps « accosté » ensuite | Glissement max | Débattement de l'étrave | Chocs |
| --- | --- | --- | --- | --- | --- | --- |
| mer plate, poussée 40 % | 20 s | 0,19 m/s | 100 % | 0 | 0 | 0 |
| calme Hs 0,3 m + courant 0,3 m/s, 40 % | 26 s | 0,19 m/s | 100 % | 0,04 m/s | 0,04 m | 0 |
| petite mer Hs 0,8 m + courant 0,3 m/s, 100 % | 21 s | 0,20 m/s | 91 % | 0,39 m/s | 0,56 m | 0 |
| calme, depuis 15 m à 0,3 m/s | 88 s | 0,29 m/s | 100 % | 0,04 m/s | 0,03 m | 0 |
| petite mer, depuis 15 m | 61 s | 0,29 m/s | 90 % | 0,36 m/s | 0,56 m | 0 |

Par petite mer, l'étrave glisse par moments sur les tubes au passage des plus
grosses vagues (statut repassant brièvement de « accosté » à « contact »).
Ce n'est pas nouveau : sur la mer d'avant, même pilote, à Hs 0,8 m le temps
« accosté » était de 74 à 79 % à 60 % de poussée et de 98,5 % à pleine
poussée ; à Hs 1 m, de 50 % et 82 % (contre 52 % et 77 % maintenant) ; à
Hs 0,5 m, 100 % dans les deux cas. Le glissement tient au frottement du fender
et à la poussée du simulateur, inchangés ici.

### Non-régression

Six vues, en modes éolienne et capot, mer et fond masqués, mer lointaine du
dôme tenue à sa couleur d'avant (elle fait partie de cette PR, et l'acier en
reflète l'environnement) : **0 pixel** de différence avec l'actuel
`/3D/test/`, plancher de bruit 0. Par mer plate, le CTV à quai est exactement
à son ancienne pose (test).

### Performances

Banc sans GPU, deux builds en pages alternées, même taille d'image, médianes
(ms par image, rendu logiciel : les temps sont des planchers, les écarts ce
qui compare).

PC, palier complet (3 tours) :

| Vue | Avant | Après | Écart |
| --- | --- | --- | --- |
| vue de lancement | 1004 | 1099 | +9,4 % |
| mer, caméra basse | 810 | 845 | +4,3 % |
| éolienne | 756 | 788 | +4,2 % |
| gros plan du pont | 788 | 822 | +4,2 % |

Téléphone (Android émulé, densité 2, processeur ralenti 4 fois), palier choisi
par l'app : le repli sous 48 images/s s'est déclenché à chaque tour et allège
aussi la mer (3 tours) :

| Vue | Avant | Après | Écart |
| --- | --- | --- | --- |
| vue de lancement | 1586 | 1488 | -6,2 % |
| mer, caméra basse | 1417 | 1354 | -4,4 % |
| éolienne | 1161 | 1126 | -3,0 % |
| gros plan du pont | 445 | 434 | -2,4 % |

Téléphone, palier complet (repli empêché, pour information, 2 tours) :

| Vue | Avant | Après | Écart |
| --- | --- | --- | --- |
| vue de lancement | 1662 | 1714 | +3,1 % |
| mer, caméra basse | 1493 | 1498 | +0,4 % |
| éolienne | 1268 | 1290 | +1,8 % |
| gros plan du pont | 482 | 555 | +15,1 % |

Ramenés à 16,7 ms par image pour la vue de lancement (méthode de la PR 1) :
**+1,6 ms** sur PC dans la vue de lancement, 0,7 ms dans les autres vues ;
JavaScript de la mer 0,013 ms par image. Sur téléphone, le palier réellement
utilisé coûte moins qu'avant (le miroir est passé de 512 à 256 pixels et le
repli retire les petites choses de la mer). Seul dépassement : le gros plan du
pont sur téléphone en palier complet (+15 %), quand le repli n'a pas encore eu
lieu ; à confirmer sur un vrai téléphone.

Une première version coûtait +106 à +170 % sur PC : grille fine partout (des
triangles plus petits que le pixel), vagues manquantes recalculées par pixel,
fond toujours dessiné. D'où la grille selon la distance, la rugosité à la place
des vagues non dessinées, le fond dessiné seulement sous l'eau, le miroir
réduit et le repli des téléphones.

### Planche de comparaison

Quatre états de mer (calme, petite mer, mer formée, nuit avec lune) face à des
photos Wikimedia Commons sous licence libre, gardées hors du dépôt et envoyées
à part. Écarts relevés : mer un peu plus bleue que sur les photos (le ciel du
banc est d'un bleu plus soutenu) ; petite mer plus lisse et plus régulière
que sur la photo au-delà d'une centaine de mètres (les vagues que la grille
ne dessine plus n'y restent que dans la rugosité, choix fait pour tenir le
budget de performances) ; mer formée moins chaotique, moutons plus réguliers ;
la nuit, le chemin de lune et sa continuité jusqu'à l'horizon sont rendus.

### Tests

Suite privée **147 / 147** (dont 10 nouveaux tests de la mer et de
l'accostage). `npm run lint` : 0 erreur. `npm run build` OK et `dist/3D`
identique à `public/3D`.

## Limites

- Les vagues sont une réalisation statistique de la prévision : hauteur,
  périodes, directions et étalement sont ceux du modèle, pas la forme de
  chaque vague. Vagues linéaires (crêtes pas plus pointues que les creux).
- Couleur de l'eau tirée de valeurs saisonnières typiques, pas d'une mesure
  du jour ; la teinte rend plutôt bien le vert-gris, le ciel bleu y pèse un
  peu plus que sur les photos.
- La transparence réglable de la mer reste un outil d'inspection : elle laisse
  voir la structure immergée, pas le fond.
- Accostage par petite mer : voir le tableau ; le glissement intermittent de
  l'étrave au-delà d'environ 0,8 m de Hs existait déjà avant cette PR et tient
  à la physique du simulateur (poussée, frottement du fender), pas à la mer.
- Le banc de mesure est sans GPU (rendu logiciel) : les temps sont des
  planchers, les pourcentages ce qui compare.
