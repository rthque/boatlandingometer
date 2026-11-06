# 3D TEST — ciel, nuages, lumière, soleil et lune à l'heure affichée

Version TEST (`/3D/test/`) uniquement. La production `/3D/`, le site
principal, le workflow et les redirections `/3d/` ne sont pas touchés. Même
coffre (identifiant, sel, contrôle, itérations), même mot de passe : seul le
runtime change. Les photos de comparaison restent hors du dépôt.

Première des deux PR du jumeau numérique de l'environnement. La seconde (mer
et fond) s'appuiera sur le même objet « conditions » : vent, visibilité et
carte du ciel y sont déjà.

## Ce qui change

- Le ciel, les nuages, la brume, la pluie, le soleil, la lune et toute la
  lumière de la scène suivent l'heure affichée par l'app (réelle ou choisie)
  et la prévision horaire au point de la fondation.
- La scène est de jour ou de nuit selon le soleil, plus selon le thème : le
  bouton jour / nuit ne pilote plus que l'interface.
- Feux de balisage maritime : non ajoutés (décision). Les feux d'aviation de
  la nacelle restent et s'allument au coucher du soleil.
- Rien d'autre ne change : cadrage, CTV, simulateur et éolienne (vérifié au
  pixel près, plus bas).

## Données et sources

| Donnée | Source | Rôle |
| --- | --- | --- |
| Couverture nuageuse basse, moyenne, haute (%) | Open-Meteo, prévision horaire, même requête horaire et même fuseau que l'app | quantité et aspect des trois couches, lumière transmise |
| Visibilité (m) | Open-Meteo | brume (Koschmieder : densité 3,912 / V), turbidité de l'air |
| Précipitations (mm/h), code météo OMM | Open-Meteo | pluie ou bruine |
| Vent à 850, 500 et 250 hPa | Open-Meteo | dérive de chaque couche de nuages |
| Position du soleil | algorithme du calculateur solaire de la NOAA (Meeus, chap. 25) | direction de la lumière, des ombres, du disque |
| Position et phase de la lune | Meeus, chap. 47 (31 termes en longitude et distance, 13 en latitude), parallaxe topocentrique, phase chap. 48, éclat selon la phase (Allen) | direction et lumière nocturnes, disque |
| Réfraction | Saemundsson (Meeus 16.4) | position apparente près de l'horizon |
| Ciel clair | Preetham, Shirley et Smits (1999) | couleur et forme du ciel |
| Ciel couvert | ciel couvert normalisé CIE, (1 + 2 sin h) / 3 | plafond gris |
| Masse d'air | Kasten et Young (1989) | jaunissement puis rougissement du soleil bas |
| Nuages et éclairement | Kasten et Czeplak (1980), G = G_clair (1 − 0,75 N^3,4) | lumière directe et diffuse sous les nuages |
| Référence du test astronomique | SOFA (UAI) via ERFA et Astropy, hors ligne | contrôle des positions |

Les nuages ont leur propre requête : si le service refuse ces champs, le vent
et la houle n'en sont pas affectés. Les valeurs sont interpolées entre deux
heures consécutives (directions par le plus court chemin, code météo de
l'heure la plus proche), jamais à travers un trou.

**Repli** : sans prévision pour l'heure affichée (passé, au-delà de 7 jours,
service indisponible), le ciel est neutre (voile uniforme, brume habituelle,
aucun nuage dessiné, pas de pluie) et un badge le dit : « Ciel neutre : pas
de météo pour cette heure ». Le soleil et la lune restent à leur place.

## Soleil et lune

Test contre la référence SOFA, 72 instants répartis sur 2026-2028, position
topocentrique sans réfraction :

| | Écart maximal | Seuil |
| --- | --- | --- |
| Soleil | 0,008° | 0,5° |
| Lune (parallaxe comprise, jusqu'à 0,95°) | 0,026° | 0,5° |
| Fraction éclairée de la lune | 0,00003 | 0,01 |
| Réfraction, soleil levé | 0,035° | 0,05° |

Le disque de la lune est une sphère éclairée depuis la direction du soleil :
la fraction éclairée et l'inclinaison du terminateur sont justes par
construction.

## Ciel et nuages

- Ciel clair de Preetham, turbidité tirée de la visibilité, dont seules la
  forme et la couleur sont gardées : la luminosité est celle du modèle de
  lumière, si bien que le ciel et l'éclairage des surfaces ne peuvent pas se
  contredire. Crépuscule puis nuit prennent le relais sous l'horizon.
- Trois couches (vers 1,2, 4 et 9 km) découpées dans une seule texture de bruit
  précalculée, égalisée : une couverture de 30 % laisse 70 % de ciel. À
  couverture complète, la couche se ferme en plafond gris sans relief, ombré
  comme le ciel couvert CIE (plus sombre vers l'horizon). Chaque couche dérive
  avec le vent de son altitude, en temps réel ; immobile si l'appareil
  demande moins d'animation.
- Brume : bande d'environ deux degrés par air limpide, plus large et plus
  laiteuse quand la visibilité baisse ; le brouillard estompe le ciel entier.
- Au-delà de l'eau dessinée (650 m), le dôme dessine la mer lointaine
  (Fresnel d'une mer ridée, reflet du ciel quelques degrés au-dessus de
  l'horizon) ; le bord de l'eau dessinée s'y fond exactement.
- Ciel calculé dans une petite carte cubique (192 texels par face, 128 sur
  téléphone), deux faces par image : tout le ciel est de basse fréquence. À
  l'écran, une lecture de texture par pixel, plus les deux disques nets du
  soleil et de la lune, vus à travers ce que les nuages en laissent. La
  carte d'environnement (reflets de l'acier) est filtrée depuis ce même cube.

## Lumière et ombres

Le calcul se fait en éclairement physique (beam de Beer-Lambert sur la masse
d'air, diffus du ciel clair, crépuscule, effet des nuages par couche, lune et
lueur du ciel nocturne), puis il est ramené aux unités du rendu. Ancrage :
par ciel clair, soleil à 52,5° (là où se tenait l'ancien soleil fixe), la
lumière directe, celle du ciel et l'environnement retrouvent exactement leurs
valeurs d'avant (3,3 ; 2,2 ; 0,6), avec les mêmes couleurs : l'étalonnage des
peintures sur photographies garde son sens.

- L'exposition s'adapte comme un appareil photo mesure la scène (ciel et
  surfaces éclairées), en partie seulement : un temps couvert reste un peu plus
  sombre qu'un grand soleil, une nuit de pleine lune nettement plus sombre mais
  lisible. Aucune lumière n'est ajoutée qui ne vienne du ciel, du soleil, de la
  lune ou des feux.
- Ombres : les trois cartes (CTV, fondation, éolienne) suivent le soleil, ou la
  lune la nuit. Elles sont recadrées ensemble dès qu'il a bougé de 0,25°, au
  plus 15 fois par seconde pendant un time-lapse rapide. Sous les nuages, la
  lumière directe s'efface et la pénombre s'élargit : les ombres s'adoucissent
  puis disparaissent par temps couvert.
- La mer suit la même lumière : reflet du soleil (ou de la lune), lumière dans
  l'eau. Son aspect propre (couleur, rides, écume) est l'objet de la PR 2.
- Pluie ou bruine quand la prévision l'annonce : traînées fixes dans le monde
  autour de la caméra, vitesse de chute réelle, inclinées par le vent.
- Transitions : la prévision est interpolée heure par heure ; un saut de
  l'heure affichée (autre jour, « maintenant », calendrier) ou l'arrivée de la
  météo s'interpole en 1,5 s au lieu de couper.
- Palier « appareil léger » : dégradé de ciel teinté par la couverture,
  soleil et brume réels, sans nuages dessinés ni pluie ni cube.

## Preuves

**Planche des 4 situations** (rendu à heure et météo fixées, cadrage voisin de
la photo) comparée à 4 photographies Wikimedia Commons sous licence libre
(2 en CC BY-SA 4.0, 1 dans le domaine public, 1 en CC BY 3.0 ; crédits complets
avec la planche, hors dépôt). Écarts relevés :

| Situation | Conforme | Écart restant |
| --- | --- | --- |
| Ciel clair | ciel bleu, soleil franc, ombres nettes | bleu un peu plus pâle vers l'horizon que sur la photo (air exceptionnellement limpide ce jour-là) ; mer trop claire et trop lisse (PR 2) |
| Mi-couvert | voile de nuages moyens, trouées, lumière adoucie | nuages plus doux que sur la photo (ciel calculé en basse résolution) ; mer trop claire (PR 2) |
| Couvert bas | plafond gris homogène, plus sombre vers l'horizon, lumière plate, aucune ombre | mer trop claire et trop calme (PR 2) |
| Nuit avec lune | ciel bleu nuit, nuages éclairés par la lune, disque et halo, fondation lisible | pas d'étoiles (choix : elles scintilleraient) ; la photo, en pose longue, éclaircit davantage les nuages |

**Soleil et lune** : voir plus haut (écart maximal 0,008° et 0,026° pour un
seuil de 0,5°).

**Ombre de la fondation par grand soleil** : présente, comptée en éteignant sa
seule carte (pixels assombris de plus de 6 niveaux), éolienne affichée. Le test
ajouté par la PR #25 passe toujours.

| Vue | Midi d'été, soleil à 63° | Après-midi d'automne, soleil à 38° |
| --- | --- | --- |
| Lancement | 11 029 | 13 724 |
| Pont | 51 653 | 76 439 |
| Jambes et eau | 63 635 | 110 328 |
| Boat landing | 107 837 | 85 518 |

**Non-régression**, au pixel près, contre la version actuelle de `/3D/test/` :
avec l'ancien ciel figé (paramètre du banc, jamais réglé par l'app), 0 pixel de
différence sur 6 vues, en mode éolienne comme en mode capot ; plancher de bruit
(la version actuelle contre elle-même) : 0. Cadrage, CTV, simulateur et
éolienne sont donc inchangés.

**Transitions** : après un saut de 30 h de l'heure affichée, l'image suivante
montre encore l'ancien ciel (début du fondu) et celle d'après, 1,3 s plus tard,
en est à 96 % (lumière directe 0,075 sur le chemin de 1,447 à 0,005,
couverture basse 0,91 sur celui de 0,10 à 0,95). Sur un appareil à 60 images
par seconde, le fondu dure environ 90 images. Fonction de fondu testée à part.

**Pas de scintillement** : nuages figés, deux images successives sont
identiques au pixel près, de jour comme de nuit. Le ciel n'a aucune texture
plus fine qu'un texel de cube, et ses textures sont filtrées et mipmappées.

**Performances**, banc local sans GPU (rendu logiciel), version actuelle et
cette version en pages alternées, mêmes caméras, ciel mi-couvert (les trois
couches actives), mise à jour du cube comprise. Médiane du temps d'image :

| Vue | PC 1280 × 800 | Téléphone 412 × 915 (× 2), processeur × 4 |
| --- | --- | --- |
| Lancement | 1146 → 1224 ms (+6,8 %) | 1948 → 2056 ms (+5,5 %) |
| Éolienne entière | 828 → 880 ms (+6,2 %) | 1399 → 1479 ms (+5,7 %) |
| Rotor de près | 153 → 211 ms (+37,8 %) | 310 → 405 ms (+30,7 %) |
| Pont de près | 928 → 984 ms (+6,0 %) | 555 → 676 ms (+21,7 %) |

L'écart est à peu près constant en millisecondes (+51 à +78 ms sur PC, +80 à
+121 sur téléphone) : c'est le ciel dessiné, une lecture de texture par pixel
de ciel, là où l'ancien fond uni ne coûtait rien. Les vues légères gonflent donc
en pourcentage. Ramené à un appareil sur lequel la vue de lancement prend
16,7 ms (60 images par seconde), cet écart vaut 0,75 à 1,14 ms sur PC et 0,69
à 1,03 ms sur téléphone. S'y ajoutent 0,09 ms de calcul JavaScript par image,
et, seulement pendant un time-lapse rapide, le redessin de l'ombre de la
fondation (au plus 15 fois par seconde, environ 0,45 ms en moyenne). Total
≤ 1,7 ms, sous le budget de +2 ms. C'est une extrapolation, faute de GPU pour
le mesurer directement. Une première version calculait tout le ciel à pleine
résolution et coûtait +13 à +105 % : c'est ce qui a conduit au cube.

**Tests** : suite privée 137 / 137, dont l'éphéméride contre SOFA, la lecture et
l'interpolation des données, le repli, l'ancrage de la lumière, les nuages, la
nuit, la pluie et le fondu.

## Limites

- Les nuages sont une texture procédurale animée, pas une simulation : leur
  quantité, leur altitude, leur teinte et leur dérive suivent la prévision,
  leur forme exacte non.
- La turbidité vient de la seule visibilité, sans données d'aérosols.
- Pas d'étoiles : des points d'un pixel scintilleraient.
- Le banc de mesure est sans GPU (rendu logiciel) : les temps sont des
  planchers, les pourcentages ce qui compare.
