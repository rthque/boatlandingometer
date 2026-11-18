# 3D : accès sur cordes (lot 6)

Module « Cordes » de `/3D/test/`. On y monte un scénario d'accès sur cordes
sur la fondation, étape par étape : ancrages, techniciens, cordes, grillons,
mains courantes, mouflages. Les efforts et les longueurs s'affichent au fur et
à mesure.

Mention fixe, toujours visible en tête du panneau : « Outil pédagogique : ne
remplace ni la formation ni le plan de sauvetage. »

Le module est chargé seulement à l'ouverture, et chiffré à part comme le
module Levage. Tant qu'il est fermé, rien ne change dans le socle. Les deux
modules ne s'ouvrent pas en même temps : ouvrir l'un ferme l'autre.

## Utilisation

Le bouton « Cordes » se trouve dans la barre d'outils, et dans les actions
d'angle en mode immersif. Le panneau a cinq onglets.

- **Placer** : choisir un outil, puis toucher la structure.
  - « Ancrage » pose un ancrage à l'endroit touché.
  - « Technicien » pose le technicien choisi (T1, T2 ou T3). Sur un sol, il
    est debout ; sur une paroi ou un tube, il est suspendu devant, face à la
    structure.
  - « Effacer » retire un ancrage, avec tout ce qui y est accroché, ou un
    technicien.
  - Toucher un technicien le sélectionne. On règle ensuite sa posture
    (debout, longé, suspendu, montée, descente), son orientation et sa
    hauteur.
- **Matériel** : pour le technicien choisi, deux cordes indépendantes,
  travail et secours. Pour chacune :
  - son ancrage, ou un Y sur deux ancrages, avec la longueur des brins ;
  - des points intermédiaires, fractionnements ou déviateurs.

  On y règle aussi :
  - jusqu'à deux grillons, avec leur longueur ;
  - les mains courantes aériennes entre deux ancrages, avec leur flèche ;
  - les mouflages 3:1, 5:1 et 9:1, sur un ancrage, pour hisser un technicien.
- **Calculs** : les chiffres de l'étape affichée (voir plus bas).
- **Réglages** : les valeurs par défaut, toutes réglables.
- **Scénarios** : ouvrir, nommer, créer, dupliquer ou supprimer un scénario ;
  exporter et importer un fichier chiffré.

Les ancrages, les techniciens, les Y, les mains courantes et les mouflages
portent des étiquettes dans la vue. Elles sont en HTML : rouge pour une
alerte, ambre pour un avertissement. Les alertes de l'étape sont aussi
listées en tête du panneau, quel que soit l'onglet ouvert.

Au premier usage, le module propose un exemple de quatre étapes :

1. un technicien longé sur deux points, sur la plateforme au-dessus du boat
   landing ;
2. il installe sa corde de travail sur un Y et sa corde de secours sur un
   troisième ancrage ;
3. il passe le bord ;
4. il descend face à l'échelle.

Ses points sont trouvés en sondant le modèle : le plancher, le bord, les
sommets des poteaux et des garde-corps du bord pour les ancrages, et l'avant
du boat landing. Aucune coordonnée n'est supposée. Le bouton « Exemple » de
l'onglet « Scénarios » le recrée.

## Frise des étapes

Une ligne horizontale porte un point par étape, et une boule qui se glisse au
doigt ou à la souris. Entre deux points, la scène est interpolée : chaque
technicien présent des deux côtés se déplace, tourne et change de posture
progressivement. Le reste change à mi-chemin : matériel, ancrages, et
technicien qui arrive ou qui part. Au lâcher, la boule revient sur l'étape la
plus proche.

Les boutons servent à :

- passer à l'étape précédente ou suivante ;
- lancer ou arrêter la lecture (3 s par étape) ;
- ajouter une étape, copie de l'étape en cours, placée juste après ;
- supprimer l'étape en cours ;
- avancer ou reculer l'étape d'un rang.

Chaque étape a son texte. Il s'affiche au-dessus de la scène.

Une modification s'applique toujours à une étape. Si la boule est entre deux
étapes, elle s'applique à la plus proche. Sur téléphone, la frise et le
panneau démarrent réduits.

## Techniciens

Ce sont des personnages simples et articulés, sans texture : combinaison,
bottes et visage en couleurs unies, harnais et casque à la couleur du
technicien (T1 orange, T2 vert, T3 violet). Chaque technicien est un seul
objet. Les postures sont définies par les angles des articulations, ce qui
permet de les mélanger pendant l'interpolation. Les cordes et les grillons
s'attachent au point ventral du harnais.

## Calculs

Ce sont des calculs statiques : le technicien est immobile, sans facteur
dynamique.

- **Charge de calcul** : masse du technicien équipé × g, soit 100 kg ×
  9,81 = 0,98 kN, sans coefficient (à confirmer).
- **Longueur d'une corde** : de l'ancrage au harnais, en passant par les
  points intermédiaires. Elle comprend les deux brins d'un Y et une boucle de
  0,5 m par fractionnement (à confirmer), mais pas la réserve en bas de corde.
- **Ancrage en Y** (Y symétrique) :
  - l'angle entre les brins vient de l'écart des ancrages et de la longueur
    des brins ;
  - l'effort par brin vaut F / (2·cos(θ/2)) ;
  - avertissement à partir de 90°, alerte à partir de 120° (à confirmer) ;
  - alerte aussi si les brins sont trop courts pour l'écart des ancrages.
- **Déviateur** : angle de déviation δ et effort sur le déviateur,
  2·F·sin(δ/2).
- **Main courante aérienne**, chargée en son milieu, de portée L et de
  flèche f :
  - tension à chaque ancrage : T = F·√(f² + (L/2)²) / (2f) ;
  - longueur de corde chargée : 2·√(f² + (L/2)²).
- **Mouflages**, calculés brin par brin, avec un rendement de poulie η de
  0,9 (à confirmer). À chaque poulie, la tension baisse de η dans le sens du
  hissage. Une poulie transmet la somme de ses deux brins à ce qui la porte.
  - 3:1 (en Z) : 1 + η + η², soit 2,71 ;
  - 5:1 en montage complexe (à confirmer) : 1 + η + 2η² + η³, soit 4,25.
    C'est un 3:1 dont la poulie fixe est mobile : sa sangle passe sur une
    poulie à l'ancrage et redescend sur la charge ;
  - 9:1 : un 3:1 sur le brin de hissage d'un 3:1, (1 + η + η²)², soit 7,34.

  Le panneau affiche l'avantage théorique et l'avantage estimé, l'effort de
  hissage pour la charge de calcul, et la tension de chaque brin.
- **Alertes par technicien** :
  - sur corde (suspendu, montée ou descente) : aucune corde, ou une seule
    corde ;
  - hors de la posture debout : un seul point d'ancrage pour l'ensemble des
    cordes et des grillons, ou aucune attache ;
  - grillon plus court que la distance du harnais à son ancrage
    (avertissement).
- **Main courante** : avertissement au-delà de 3 kN par ancrage, alerte
  au-delà de 6 kN.

## Valeurs par défaut, à confirmer par Quentin

Elles sont toutes réglables dans l'onglet « Réglages » et enregistrées avec
chaque scénario. Le panneau les marque « à confirmer ».

| Valeur | Défaut |
| --- | --- |
| Y : avertissement, alerte | 90°, 120° |
| Rendement d'une poulie | 0,9 |
| 5:1 | montage complexe |
| Grillons | de 0,3 à 2 m |
| Masse de calcul | 100 kg, sans coefficient |
| Main courante : flèche par défaut | 10 % de la portée |
| Main courante : avertissement, alerte | 3 kN, 6 kN par ancrage |
| Boucle d'un fractionnement | 0,5 m |
| Brins d'un Y neuf | 1 m |

Pour la main courante, les valeurs proposées sont celles-ci. Avec 100 kg en
son milieu, une flèche de 10 % donne environ 2,5 kN par ancrage, sous
l'avertissement. Une flèche de 5 % donne environ 4,9 kN (avertissement), et
4 % dépasse 6 kN (alerte). Diviser la flèche par deux double à peu près la
tension.

## Sauvegarde chiffrée

- **Une seconde clé, tirée du mot de passe à la connexion.** La page d'accès
  fait toujours un seul calcul PBKDF2, avec les mêmes paramètres qu'avant.
  - Sa sortie redonne la clé du coffre. Le contrôle du mot de passe ne change
    pas.
  - Elle donne aussi, par HKDF avec une étiquette propre, une clé séparée
    pour les scénarios.
  - Les deux clés ne sont pas exportables. Les octets intermédiaires sont
    effacés dès l'import des clés.
- **« Se souvenir sur cet appareil »** garde aussi la clé des scénarios, dans
  une base distincte de celle du jeton d'accès. La page d'accès de la
  production actuelle, plus ancienne, ne la touche pas.
  - Une session mémorisée par une version précédente s'ouvre normalement. Le
    module fonctionne alors en mémoire et indique comment activer la
    sauvegarde : se déconnecter, puis se reconnecter avec le mot de passe.
- **Enregistrement automatique sur l'appareil**, une demi-seconde après
  chaque modification. Le chiffrement est AES-GCM, avec un IV neuf à chaque
  fois. L'identifiant du coffre et le type de données sont liés au
  chiffrement.
- **Export et import** : un fichier `.blo` chiffré de la même façon. Il
  s'ouvre sur tout appareil connecté avec le même mot de passe. Un fichier
  abîmé, ou d'un autre type, est refusé.
- **Rien en clair**, ni sur l'appareil ni dans un fichier exporté.

### Rotation du mot de passe : exporter les scénarios avant

Une rotation change la clé des scénarios. Après elle, les scénarios
enregistrés ne sont plus lisibles avec le nouveau mot de passe. **Il faut
donc exporter ses scénarios avant une rotation.**

Chaque enregistrement porte l'identifiant, le sel et le nombre d'itérations
de son coffre, qui sont des données publiques. Après la rotation, le module
reconnaît un fichier, ou une copie sur l'appareil, qui vient d'un ancien
coffre. Il demande alors l'ancien mot de passe, l'ouvre, puis le réenregistre
avec le mot de passe actuel. L'ancien mot de passe n'est pas gardé.

Sans l'ancien mot de passe, ces scénarios sont perdus. La copie de
l'appareil n'est pas écrasée tant qu'on ne l'a pas récupérée ou abandonnée.

## Limites

- Accroche des points : à l'endroit touché sur la surface du modèle.
  - Un ancrage n'est pas posé à moins de 30 cm d'un autre.
  - Un technicien posé sur un sol y est mis debout.
  - Pas d'accroche aux nœuds de la structure : le modèle ne donne pas les
    axes des membrures, et les détecter n'était pas fiable.
- Les cordes sont droites d'un point à l'autre. Elles ne contournent pas la
  structure et ne frottent pas sur les arêtes ; c'est aux points
  intermédiaires de le représenter. Les mouflages sont schématiques.
- Le CTV n'est jamais un point d'ancrage : il bouge avec la houle.
- Le Y est supposé symétrique, chargé dans l'axe.

## Base commune avec le futur module ART

La frise, les techniciens et la sauvegarde chiffrée sont dans un dossier
partagé de la source privée. Ils sont compilés dans chaque module qui s'en
sert, sans changer le socle.

## Preuves

- **Tests des calculs**, sur des cas calculés à la main (`ropes`, 9 tests) :
  - Y à 60°, 90° et 120° : 0,577 F, 0,707 F et 1,00 F par brin ;
  - angle tiré de la géométrie, point de jonction du Y ;
  - mouflages 3:1, 5:1 et 9:1 : exactement 3, 5 et 9 avec η = 1 ;
    2,71, 4,249 et 7,344 avec η = 0,9 ; tension de chaque brin ;
  - main courante : portée 10 m et flèche 1 m, T = √26 / 2 F ; seuils
    vérifiés à 10 % et à 4 % de flèche ;
  - longueurs sur des lignes simples (droite, fractionnement, Y,
    déviateur) ; effort sur un déviateur à 0°, 90° et 180° ;
  - alertes : aucune corde, une seule corde, un seul point, Y au-delà des
    seuils, brins trop courts, grillon trop court ;
  - interpolation de la frise, bascule du matériel à mi-chemin ; retrait
    d'un ancrage avec tout ce qui y est accroché ;
  - contrôle des données relues ;
  - clé des scénarios : clé du coffre inchangée et clés non exportables ;
    un enregistrement sur l'appareil ou un export chiffré ne contient rien
    en clair et se rouvre ; un fichier d'un autre type, ou abîmé, est
    refusé ; même clé sur un second appareil ; après une rotation, le
    fichier est reconnu comme ancien, l'ancien mot de passe le rouvre et un
    mauvais est refusé.
- **Suite privée** : 177 tests sur 177. Le test des modules à la demande
  couvre maintenant Levage et Cordes : chacun est scellé à part, sans
  import, absent du runtime chargé d'office, et sous son budget.
- **Parcours dans l'app scellée** (navigateur, PC 1280 × 800 et téléphone
  Pixel 7) :
  - un seul fichier chiffré est téléchargé au clic, et rien avant ;
  - l'exemple est construit ; on avance aux étapes 2 à 4 avec leurs textes ;
  - la boule glissée entre les étapes 3 et 4 affiche « Étape 3→4 », puis
    revient sur l'étape 3 au lâcher ;
  - l'onglet « Calculs » affiche bien les longueurs, le Y (61° pour 0,57 kN
    par brin) et les grillons ;
  - toucher la structure avec l'outil « Ancrage » pose A4 ;
  - l'enregistrement sur l'appareil est chiffré, sans aucun texte du
    scénario en clair ;
  - l'export donne un fichier `.blo` chiffré, et son import ajoute le
    scénario ;
  - après fermeture, il ne reste rien du module dans la page ; après
    rechargement et reconnexion, le scénario est retrouvé ;
  - aucune erreur console. Seules restent les quatre requêtes de
    prévision coupées par le banc, comme sur `main`.
- **Sessions mémorisées** (« Se souvenir sur cet appareil ») :
  - un jeton neuf rouvre l'app sans mot de passe, avec la sauvegarde
    active ;
  - un jeton mémorisé par le build de `main` ouvre aussi le nouveau build ;
    le module dit alors que la sauvegarde est indisponible et comment
    l'activer ;
  - aucune erreur dans les deux cas.
- **Socle, module fermé** : rendu à instant figé, mouvement réduit,
  prévisions coupées, calques HTML masqués.

  | Vue | Plancher `main` contre `main` | Module jamais ouvert | Module ouvert puis refermé |
  | --- | --- | --- | --- |
  | PC 1024 × 640 | 0 pixel | 0 pixel | 0 pixel |
  | Téléphone 412 × 839 (mode allégé) | 0 pixel | 0 pixel | 0 pixel |

  Avec les calques HTML, la seule différence est le bouton « Cordes »,
  ajouté dans la barre d'outils et dans les actions d'angle.
- **Ajustement après ce test** : la frise a été remontée au-dessus des
  boutons d'angle, et l'exemple refait. Seul le module à la demande a
  changé : le runtime chargé d'office est identique octet pour octet à
  celui qui a été comparé au pixel.
- **Budget du module**, mesuré dans le moteur, à caméra fixe :
  - ouvert sans rien à dessiner, puis refermé : aucun draw call de plus ;
  - avec un scénario complet (trois techniciens, un Y, un déviateur,
    une main courante, un mouflage, cinq ancrages) : +5 draw calls par
    rendu, soit 84 contre 74 par image affichée, qui compte deux rendus ;
  - environ 4 200 triangles de plus, aucune texture ;
  - code de 77,3 Ko, sous l'objectif de 0,2 Mo.
- **Contenu déchiffré** comparé à `main` :
  - les 11 ressources et le module Levage sont identiques ;
  - le module Cordes s'ajoute ;
  - le runtime chargé d'office change pour le câblage des modules et la
    seconde clé ;
  - le coffre ne change que par son entrée `runtime`. La page d'accès vient
    du gabarit privé.
- **Archive `source-3d/`** : rafraîchie sur le même coffre. Restaurée, elle
  redonne les 295 fichiers de la source, plus les ressources chiffrées
  reprises de `/3D/test/`, soit 307 fichiers identiques à la source. Un
  mauvais mot de passe est refusé sans rien écrire.
- **Vérifications d'usage** :
  - `npm run lint` : 0 erreur ;
  - `npm run build` OK, et `dist/3D` est identique à `public/3D` ;
  - aucun mot de passe dans le dépôt.
- **Captures** PC et téléphone (exemple étape par étape, entre deux
  étapes, calculs, pose d'un ancrage, scénarios) : hors du dépôt (règle 5).
- **Fluidité** : non vérifiée sur un vrai appareil, le banc n'a pas de GPU.
