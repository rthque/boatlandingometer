# 3D TEST — éolienne : ombre de la fondation, coques pleines, réalisme

Version TEST (`/3D/test/`) uniquement. La production `/3D/`, le site
principal, le workflow et les redirections `/3d/` ne sont pas touchés. Même
coffre (identifiant, sel, contrôle, itérations), même mot de passe. Dans le
coffre, **seul le runtime change** : l'éolienne est toujours construite par le
code, et l'ombre de la fondation est calculée au chargement. Les photos
fournies restent privées : aucune n'est dans le dépôt.

## 1. Ombre de la fondation

**Cause réelle : ce n'est pas une régression de la #24.** L'historique du
code source a été remonté jusqu'à la première version reçue. Partout, seul le
CTV projette une ombre : la carte d'ombre intégrée (512 px sur ±23 m) suit le
CTV et ne dessine que lui. Ni la fondation ni la pince ne l'ont jamais
projetée, sur elles-mêmes ou sur l'eau. L'ombre de l'éolienne, ajoutée par la
#24, a rendu ce manque visible. Aucune des pistes évoquées n'était en cause :
la zone d'ombre n'a pas été recadrée, aucun `castShadow` ou `receiveShadow`
n'a été perdu, et la carte de l'éolienne ne remplace pas celle de la scène
(rendu de la #24 en mode capot identique au pixel près à celui d'avant).

**Correction.** Une carte d'ombre à part pour la fondation :

- 2048 px sur PC (1024 sur téléphone), cadrée sur la fondation et la pince
  telles que le soleil les voit, soit environ 4 cm par texel sur PC ;
- cadrée selon la direction réelle de la lumière. Le soleil suit le CTV, sa
  cible avec lui : sa direction est donc position moins cible. Une première
  version prenait sa seule position, à 16° de la lumière une fois le CTV
  placé, si bien que les ombres ne tombaient pas où la scène éclaire. Le
  contrôle d'alignement entre les deux cartes (plus bas) l'a détecté, et il
  refuse désormais toute carte qui ne suit pas le soleil de l'autre ;
- dessinée **une seule fois**, au chargement du modèle, puis seulement quand le
  capot de TP entre ou sort. La fondation et le soleil de la scène ne bougent
  pas : aucun coût par image hormis sa lecture, et aucun tremblement quand la
  caméra bouge ;
- reçue par la fondation elle-même, la pince, le CTV et la mer, sur la lumière
  du soleil seulement, au même endroit que les autres ombres. Sur la mer, elle
  retire le diffus et le reflet du soleil, pas la lumière remontant de l'eau :
  une ombre sur la mer n'y est jamais noire ;
- sur la fondation : décalage selon la normale de 6 cm contre l'acné (pour
  les deux cartes, bien en dessous des texels de celle de l'éolienne), et
  2,4 texels de pénombre. Avec un décalage trois fois plus fort, un motif fin
  près de l'échelle restait identique : ce n'était pas de l'acné, mais l'ombre
  réelle de la cage d'échelle, plus fine que les texels. La pénombre l'adoucit.

Le mode éolienne / capot ne touche pas à cette ombre : elle reste active dans
les deux, et seul le capot entre ou sort de ses projeteurs.

**Preuve** : même scène en mode capot puis en mode éolienne, 6 vues. Les
écarts admis sont la silhouette, l'ombre et le reflet de l'éolienne, et ceux
du capot qu'elle remplace.

| Vue | Ombre de la fondation (pixels, capot / éolienne) | Pixels qui changent entre les modes | Hors des zones admises |
| --- | --- | --- | --- |
| Lancement | 16 525 / 16 144 | 25 389 | 0 |
| Pont | 54 718 / 53 829 | 21 523 | 0 |
| Jambes et eau | 118 400 / 118 400 | 0 | 0 |
| Boat landing | 87 353 / 87 323 | 7 892 | 0 |
| Pont de près | 251 269 / 251 269 | 5 | 0 |
| Côté ombre | 28 423 / 26 386 | 15 490 | 0 |

**Tests ajoutés** (`sun-shadows`), pour que l'ombre ne disparaisse plus :

- chaque pièce de la fondation (modèle chiffré) projette dans les deux modes ;
  seul le capot suit le bouton ; l'ombre de la fondation reste allumée et sa
  carte est redessinée après chaque bascule ;
- le cadre de la carte contient toute la fondation vue du soleil : rien n'est
  coupé ;
- le cadre de la carte de l'éolienne la contient à tous les caps, toutes les
  positions du rotor et tous les pas ;
- la lumière du soleil des matériaux et de la mer est bien multipliée par les
  deux cartes ;
- les coordonnées de la carte de la fondation, déduites de celles de
  l'éolienne (voir les performances), sont bien sa propre projection : écart
  inférieur à 10⁻⁴ texel sur toute la fondation, la mer et la tour ; deux
  cartes cadrées sur des soleils différents sont refusées.

## 2 et 3. Nacelle et moyeu pleins

**Cause** : les faces du carter de la nacelle et des surfaces de révolution
(générateur, moyeu, collerettes) étaient tournées vers l'intérieur. On voyait
la face cachée de la coque, d'où l'aspect creux, et le moyeu semblait
transparent.

**Correction** : l'orientation est déterminée à la construction, pour les
parois comme pour les bouchons. Chaque pièce est un solide fermé : tour bouchée
aux deux bouts, pied de pale fermé dans le moyeu, collerettes pleines.
Matériau blanc satiné (rugosité 0,45), opaque. Le seul matériau translucide
reste le grillage rouge des garde-corps : panneaux fermés, faces avant
seulement, dessinés après l'opaque.

**Preuves** :

- test automatique (`turbine-solids`) : chaque pièce est fermée (après soudure
  par position, chaque arête est partagée par exactement deux faces) et de
  volume signé positif, à chaque niveau de détail ;
- rendu de débogage : faces avant en blanc, faces arrière en magenta, ces
  dernières comptées seulement où elles sont réellement visibles. Sur 96 vues
  (24 angles autour de la nacelle et du moyeu, 8 caps × 3 hauteurs dont 8 par
  dessous, à chacun des 3 niveaux de détail, plus 24 vues de l'éolienne
  entière) : **0 pixel de face arrière**, contre **6,7 millions** pour la
  géométrie de la #24 (jusqu'à 137 000 dans une seule vue) ;
- planche de 24 vues dans le moteur, avec les vrais matériaux : tout autour, à
  contre-jour et par dessous, aussi bas que la caméra de l'app le permet.

## 4. Réalisme

Planche photo / rendu sous des angles voisins : vue de côté, trois-quarts
avant, trois-quarts arrière par dessous, éolienne entière, pied de tour.
Chaque vue reçoit le vent qui place la nacelle comme sur la photo, côté soleil
ou côté ombre compris. Les écarts les plus visibles, et leur suite :

| # | Écart | Suite |
| --- | --- | --- |
| 1 | Blanc jaune au soleil : sRGB 227/227/206 contre 235/230/224 à 242/236/229 sur les photos | Corrigé : blanc calibré sur les photos et tone mapping neutre, comme la fondation. Le soleil de la scène est chaud, réglé pour la fondation, d'où une valeur de peinture légèrement bleutée qui rend le blanc photographié |
| 2 | Face à l'ombre presque aussi claire que la face au soleil, et bleue (174/212/234) : le volume ne se lisait pas | Corrigé sur l'éolienne seule : lumière indirecte ×0,62 et appoint bleu ×0,35, d'où 129/163/190 et le contraste des photos |
| 3 | Collerettes des pieds de pale en anneaux minces | Corrigé : jupe large et arrondie, qui épouse le pied de pale |
| 4 | Proportions de la nacelle | Corrigé, remesuré sur la vue de côté : carter de 12,6 × 6,4 m avec un bandeau supérieur droit et un bas arrondi, générateur de 7,8 m dans l'axe du moyeu, plateforme posée sur le carter (la dalle rapportée est supprimée) |
| 5 | Arrière vu de dos : une face plate en V | Corrigé : bandeau supérieur plat au-dessus d'un dôme lisse |
| 6 | Coin rouge en triangle | Corrigé : trapèze à dos vertical, sommet plat, pente vers le générateur |
| 7 | Nacelle technique en boîte, pieds de pale trop fins | Corrigé : forme arrondie ; pieds de pale de 4,5 m au lieu de 4,2 |
| 8 | Petits détails : hublot, trappes, boulons et lettres du moyeu, joints de viroles de la tour | Non repris : sous le pixel aux distances habituelles, ils scintilleraient et coûteraient en triangles |

La transition tour / pièce de transition (tour blanche sur la tête jaune) ne
montre pas d'écart notable. La planche finale est envoyée à part, les photos
étant privées.

## 5. Non-régression et performances

**Non-régression** par rapport à la #24, au pixel près, 6 vues par mode,
plancher de bruit 0. Chaque écart est classé : ombre de la fondation, ou
silhouette, ombre et reflet de l'éolienne (anciens et nouveaux).

| Mode | Pixels qui changent | Hors de ces zones |
| --- | --- | --- |
| Capot | 16 525 à 251 269 selon la vue, exactement l'ombre de la fondation | 0 sur les 6 vues |
| Éolienne | 35 195 à 251 269 | 0 sur les 6 vues |

**Performances**, mesurées sur le banc local (rendu logiciel, sans GPU : ce
sont des planchers, pas ce que fait un vrai appareil). La #24 et cette version
en pages alternées, mêmes caméras, rotor qui tourne, donc carte d'ombre de
l'éolienne redessinée à chaque image ; 6 tours sur PC, 4 sur téléphone.
Médiane du temps d'image en ms. Plancher de bruit, la #24 contre elle-même :
±1,3 %.

| Vue | PC 1280 × 800 | Téléphone 412 × 915 (× 2), processeur ralenti × 4 |
| --- | --- | --- |
| Vue d'ensemble | 1004,4 → 1010,9 (+0,6 %) | 1611,4 → 1625,7 (+0,9 %) |
| Éolienne entière | 718,3 → 728,9 (+1,5 %) | 1169,5 → 1154,0 (−1,3 %) |
| Rotor de près | 136,1 → 138,1 (+1,5 %) | 255,7 → 257,9 (+0,9 %) |
| Pont de près | 806,5 → 818,8 (+1,5 %) | 487,3 → 484,1 (−0,7 %) |

Le 95e centile reste entre −1,4 % et +2,8 %. Tout est dans les ±3 %, et
au plus à peine au-dessus du bruit. Rapporté à une image de 16,7 ms (60 images
par seconde), +1,5 % représente 0,25 ms, dans le budget de +2 ms : c'est une
extrapolation, faute de GPU pour le mesurer directement.

La première version coûtait 3 à 5 % de plus. La décomposition image par image
a montré où : la fondation compte tant de sommets que, de loin, elle se paie
presque pour eux seuls, et chacun se projetait dans les deux cartes. Trois
mesures, sans effet sur l'image, ont tout repris :

- **une seule coordonnée par sommet.** Les deux cartes sont orthographiques et
  regardent selon la même direction de soleil : elles ne diffèrent que d'une
  échelle et d'un décalage par axe. Chaque sommet se projette dans la carte de
  l'éolienne, et celle de la fondation s'en déduit dans le fragment, en trois
  multiplications-additions. Un test vérifie l'équivalence ;
- **une face tournée à l'opposé du soleil ne lit aucune carte** : elle n'en
  reçoit pas de lumière directe, le résultat est le même ;
- **la carte la moins chère est lue d'abord**, l'autre seulement là où il
  reste du soleil : une ombre complète ne peut que rester complète.

S'y ajoutent le nombre d'échantillons fixé à la compilation pour chaque
matériau, et la carte de l'éolienne dessinée avec son niveau de détail le plus
bas.

## 6. Limites

- Les valeurs estimées de la #24 restent estimées (hauteur du moyeu, lois
  d'orientation et de pas, profil des pales).
- Le blanc est calibré sur le rendu des photos (soleil de la scène, tone
  mapping), pas sur une référence de peinture.
- Le banc local peut dépasser le délai de 3 s du premier rendu ; il est
  allongé dans le banc seulement.
