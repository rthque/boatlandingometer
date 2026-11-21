# Lot 11 — SRL et clamp réalistes

Demandes de Quentin du 20/11, d'après ses photos. Les photos ont servi de référence seulement : elles ne
sont pas dans le dépôt, ni les numéros de repère ou les inscriptions qu'elles portent.

Branche `claude/3d-lot11-srl`, empilée sur le lot 10 (PR #44, elle-même sur la #43).

## 1. Les trois SRL de la fondation

### Deux modèles

| | 15 m, type 1 | 25 m, type 2 |
|---|---|---|
| Où | échelle intermédiaire, échelle de la girder platform | échelle du boat landing |
| Référence | 62816-00LE | 62827-00LE |
| Encombrement | 330 × 279 × 191 mm, 12 kg (fiche du fabricant) | 330 × 330 × 200 mm, 22 kg (étiquette) |
| Moyeu | orange, octogonal, vis inox | noir et chromé, quatre vis, sous une couronne inox vissée |
| Étiquette latérale | verte « TYPE 1 » | verte « TYPE 2 » |

Deux MSA Sealed SRL, EN 360:2002, câble inox de 5 mm. Pour le 25 m, l'étiquette donne aussi une chute
libre de 0,6 m au plus et une force d'arrêt de 6 kN en pointe, 4 kN en moyenne.

Communs aux deux modèles :
- boîtier orange brillant, capot arrière noir avec un disque en relief à la place du logo ;
- face avant à disque noir étiqueté : une grille de pictogrammes générique, sans logo ni texte ;
- poignée orange en bas à l'avant, étiquette verte d'inspection sanglée sur la poignée ;
- guide-câble en caoutchouc noir en bas, puis le câble inox, l'embout noir et le mousqueton.

Fixation, d'après les photos :
- le support est un fourreau carré inox glissé sur le bout du bras d'ancrage jaune, serré par deux
  goujons filetés à deux écrous chacun ;
- une patte inox coudée descend le long du fourreau, articulée sur un boulon, et se boulonne sur le haut
  du boîtier par deux vis ;
- une plaque repère rouge, vierge, est attachée au bras par un collier vert.

### Remplacement des boîtiers de la CAO

Le modèle de la fondation portait déjà, au bout de chaque bras, un boîtier galvanisé de 0,46 m et son
support. Au chargement, ces triangles sont retirés et les modèles des photos sont posés à leur place
(`stripCadSrl`). Le tri porte sur trois boîtes mesurées sur le modèle, une par boîtier et son support, avec
1 cm de marge : 1 779 triangles retirés, tous dans l'acier galvanisé. Aucune autre pièce galvanisée ne se
trouve à moins de 0,6 m de ces boîtes.

Bouts des bras mesurés sur le modèle (axe, bout libre) : boat landing vers +z à 23,00 m, échelle
intermédiaire vers +z à 27,68 m, girder platform vers −z à 31,20 m.

Chaque SRL pend 5 cm en retrait du bout de son bras. Sous l'axe du bras, on compte :
- 8 cm jusqu'au haut du boîtier ;
- le boîtier lui-même ;
- 25 cm pour le guide, le câble, l'embout et le mousqueton.

Le crochet est la barre basse du mousqueton, là où la corde est nouée. Il descend donc :
- au boat landing à 22,37 m, soit 0,11 m plus bas et 0,13 m plus loin que le dessous du boîtier de la
  CAO ;
- sur l'échelle intermédiaire à 27,10 m ;
- sur la girder platform à 30,62 m.

Les cordes vont désormais jusqu'à ces crochets.

## 2. Le clamp à 3,50 m

D'après la photo :
- deux mâchoires inox serrent le barreau jaune par une longue tige filetée qui monte devant lui ;
- un écrou et un contre-écrou sont serrés sous la mâchoire basse ;
- l'œil forgé est en haut, sur une embase ronde ;
- la corde rouge tressée passe sur une cosse inox engagée dans l'œil ;
- une goupille inox à tête bombée traverse les deux brins au-dessus de la cosse ;
- la queue porte deux colliers noirs et du ruban noir, puis la corde continue, plus fine, jusqu'au SRL.

Vue d'en haut comme sur la photo, la tige monte vers l'œil : le clamp tient donc le barreau situé sous
l'œil. L'œil reste à 3,50 m LAT, la cote de Quentin, et le barreau tenu est celui de 3,29 m. Les barreaux
sont espacés de 0,28 m et l'œil est à 0,21 m au-dessus du barreau. Le même décalage s'applique aux deux
autres échelles : leur œil n'a pas bougé et reste à environ 1,1 m au-dessus de leur plancher de départ.

Diamètres retenus, à confirmer :
- corde de 12 mm dans la boucle ;
- 10 mm au-delà de la queue (contre 14 mm jusqu'ici) ;
- tige M12.

## 3. Rendu et budget

Toutes les pièces lisent leur couleur, leur rugosité et leur caractère métallique dans un petit atlas
fait en code : cases de palette, disque étiqueté, étiquettes TYPE 1 et TYPE 2. Les trois SRL, les trois
clamps et les trois cordes partagent donc une seule matière.

L'ensemble est fusionné en un seul maillage pour les volumes, soit un appel de dessin. Le détail fin,
par site, ne s'affiche que de près : boulons, écrous, filets de la tige, goujons, colliers, ruban,
goupille, étiquette d'inspection, disque en relief.
- portée : 9 m pour un clamp, 8 m pour un SRL ;
- au plus les trois sites les plus proches à la fois ;
- l'ensemble ne coûte donc jamais plus de 4 appels de dessin, vérifié sur une grille de 0,5 m autour de
  la fondation ;
- au lot 10, le seul clamp du boat landing en coûtait 18, plus 1 pour les tag lines.

En mode allégé, le détail fin n'est pas construit du tout.

## Vérifications

### Tests et contrôles du projet

- Suite privée : 236 tests sur 236. Les tests du lot 11 (`tests/lot11.test.mjs`) couvrent :
  - les deux modèles, leurs dimensions dans l'encombrement des étiquettes et leurs pièces ;
  - l'étiquette TYPE 2 au boat landing et TYPE 1 sur les deux échelles du haut, chacune lisant son
    rectangle de l'atlas ;
  - le fourreau autour du bout de chaque bras, le crochet sur la barre basse du mousqueton, les crochets
    de la configuration égaux aux crochets calculés ;
  - l'ordre des pièces du clamp (goupille au-dessus de la cosse, colliers puis ruban, contre-écrou sous
    l'écrou) ;
  - les appels de dessin, et le retrait des boîtiers sur le vrai modèle ;
  - le dégagement des SRL par rapport à l'acier : 5,8 cm au boat landing, 5,4 cm sur l'échelle
    intermédiaire, 4,7 cm sur la girder platform.
- Les tests du lot 8 sont mis à jour : clamp sur le barreau du dessous, corde de 10 mm, crochets des SRL.
  Dégagement des cordes par rapport à l'acier : tether 3,4 cm, tag line intermédiaire 3,8 cm, girder
  platform 4,3 cm.
- Lint public à 0 erreur. Lint privé : aucune erreur dans les fichiers du lot, les erreurs restantes sont
  antérieures.
- Build OK, `dist/3D` identique à `public/3D`.
- Coffre inchangé hors entrée `runtime` : seuls le runtime et les deux modules, rescellés à chaque
  build, changent de fichier. Les 13 ressources déchiffrées sont identiques octet pour octet
  (`compare-runtime.mjs`).
- Mot de passe absent du dépôt. Archive `source-3d/` rafraîchie (même coffre, IV neuf), restaurée à
  l'identique : 347 fichiers.

### Le reste de la scène ne bouge pas (moteur, PC 1024 × 640 et téléphone)

Comparaison au pixel près sur six vues : FOU, BL, Tether, SRL du boat landing de face, SRL de l'échelle
intermédiaire de face, clamp. La base est le lot 10.

| | Plancher (base contre base) | Sans l'ensemble SRL et clamps | Avec |
|---|---|---|---|
| PC | 0 sur les six vues | 0 sur les six vues | 1 511 (FOU) à 94 790 (clamp) pixels |
| Téléphone | 0 sur les six vues | 0 sur les six vues | 2 305 (FOU) à 143 233 (SRL de face) pixels |

Dans la colonne « sans », l'ensemble est masqué des deux côtés et les boîtiers de la CAO sont retirés
de la base comme le fait ce lot. La carte d'ombre de la fondation est redessinée. Tout l'écart vient donc
des SRL, des clamps et des cordes.

### Budget (appels de dessin par image, médiane de 9 images)

| Vue | Lot 10 | Lot 11 | Lot 10 allégé | Lot 11 allégé |
|---|---|---|---|---|
| FOU (PC) | 136 | 64 | 34 | 32 |
| BL (PC) | 106 | 40 | 60 | 24 |
| Tether (PC) | 104 | 40 | 54 | 20 |
| SRL du boat landing de face (PC) | 32 | 32 | 22 | 10 |
| SRL intermédiaire de face (PC) | 34 | 36 | 26 | 26 |
| Clamp (PC) | 74 | 46 | 50 | 20 |

Hors mode allégé, le lot 11 donne les mêmes appels de dessin sur téléphone. Les triangles varient de
−1 000 (FOU) à +42 000 (clamp) selon la vue, sur 1,2 à 1,5 million au total. Le temps de rendu reste dans le bruit du banc : 0,3 à
1,7 ms par rendu forcé en rendu logiciel. La baisse des appels de dessin vient des 18 pièces du clamp du
lot 10, dessinées séparément dans chaque passe, aujourd'hui fusionnées.

### App scellée (PC 1024 × 640 et téléphone, instant figé, interface masquée)

Connexion par mot de passe acceptée et aucune erreur console, en mode normal (rendu dans un worker) comme
en mode allégé (`?safe=1`), sur PC et sur téléphone. Le plancher (`main` contre `main`) est à 0 pixel
sur les trois vues.

| Vue | Normal PC | Normal téléphone | Allégé PC | Allégé téléphone |
|---|---|---|---|---|
| FOU | 285 | 189 | 22 | 11 |
| BL | 2 305 | 3 497 | 428 | 591 |
| Tether | 3 670 | 10 563 | 1 113 | 1 916 |

Les pixels comptés sont ceux qui diffèrent du lot 10. En mode allégé, l'écart se limite à une bande de
25 à 33 pixels de large le long de la corde, plus fine, et autour du clamp, sous l'eau à cet instant.

### Mode allégé : levage et ActSafe (le lot 10 n'en avait pas eu)

Le parcours du lot 10 a été rejoué sur l'app scellée en mode allégé (`?safe=1`), avec le préréglage
« Mer agitée » (14 m/s).

| | PC | Téléphone |
|---|---|---|
| Écart de la chaîne au câble par vent fort, sacs vides | 1,3 à 2,4° (câble entre 26 et 41°) | 1,7 à 2,4° (câble entre 30 et 41°) |
| Montée chronométrée, ActSafe sur la charge | 4,86 m en 12,2 s (12,1 s calculés) | 4,85 m en 12,0 s (12,1 s calculés) |
| Montée chronométrée, ActSafe sur la pivot bar | 4,54 m en 12,1 s, à 0,40 m/s | 4,72 m en 12,1 s (11,8 s calculés) |
| Alerte au-delà de 200 kg | à 218 kg | à 218 kg |
| Refus au-delà de 250 kg | à 258 kg, corde immobile (20,51 m avant et après) | à 258 kg, corde immobile (22,13 m avant et après) |
| Erreurs console | aucune | aucune |

Les deux montages se déroulent étape par étape jusqu'à la plateforme, comme en mode normal.

Au premier passage sur téléphone, le montage sur la pivot bar a échoué. Le banc a placé la flèche au
milieu de la zone utile lue au départ (146–210°), mais le sac de lest s'est posé hors du pont du CTV.
L'app a alors bloqué l'étape (« sac de lest à l'eau »), comme prévu, et le banc, qui n'attendait pas ce
cas, a continué. Sur un téléphone neuf, le montage sur la pivot bar et les alertes ont été rejoués seuls
et ont réussi, avec une zone utile de 136–206° : la position du CTV varie d'une session à l'autre. Le module de levage est identique à l'octet près
à celui du lot 10.

Sur PC, pour le montage sur la pivot bar, la hauteur ÷ vitesse donne 11,3 s, contre 12,1 s mesurées.
Cet écart de 0,8 s n'est pas expliqué. La vitesse lue reste 0,40 m/s, soit 24 m/min. Sur téléphone, on
mesure 12,1 s pour 11,8 s calculées, proche du chronométrage du lot 10 en mode normal (12 s pour 11,8 s).

## Questions ouvertes

- Diamètre de la corde rouge : 12 mm dans la boucle, 10 mm au-delà, à confirmer.
- Encombrement exact du 15 m : la fiche du fabricant et un revendeur ne donnent pas la même valeur ;
  retenu 330 × 279 × 191 mm (fiche du fabricant).
- Le barreau tenu par le clamp (celui sous l'œil) et la hauteur de l'œil sur les deux échelles du haut
  restent à confirmer, comme au lot 8.
- Le bras du boat landing est rouge dans la CAO sur toute sa longueur ; sur la photo, il est jaune avec
  une bande rouge. La couleur de la CAO est conservée.
