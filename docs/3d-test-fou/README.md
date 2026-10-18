# Sous-site 3D TEST — retour au rendu de production, panneaux FOU, intérieur dégagé

Cycle limité à `public/3D/test/`. La production `public/3D/`, les redirections
`public/3d/`, le site principal et le workflow ne changent pas.

## Base : le rendu de production, à l'identique

Le cycle « matières » précédent (habillage photo KTX2, shader triplanaire,
occlusion ambiante, intérieur fictif, planches de comparaison) est entièrement
retiré du source. Contrôle : le source restauré, recompilé avec la même
chaîne d'outils, redonne **octet pour octet** les bundles publiés dans
`public/3D/` pour le moteur 3D, son worker, la scène et la feuille de style.
Seule l'entrée d'accès diffère (amorçage du runtime chiffré du TEST).

Aucun paramètre de rendu n'est modifié : matériaux, couleurs, éclairage,
environnement, tone mapping, ombres, antialiasing, résolution/DPR, mer, houle,
CTV. Les ajouts du moteur ne concernent que la caméra : le lancement et son
plan proche (voir plus bas).

## Modèle 3D (GLB chiffré)

Partie du GLB de production. Les maillages non concernés gardent leurs données
compressées d'origine octet pour octet ; les maillages modifiés sont
ré-encodés sans perte (Meshopt, quantification d'origine conservée).
Validateur glTF : 0 erreur, 0 avertissement. 3,85 Mo au lieu de 5,69 Mo.

- **Panneaux d'identification (4)** : l'ancien identifiant est remplacé par
  `FOU`. La plaque est ajourée comme l'original et les lettres sombres
  remplissent les ajours, dans le plan de la face (pas de lettres flottantes,
  pas de scintillement à distance). Même police que l'original (Arial condensé
  à 77 %, reconnu sur la géométrie : recouvrement 0,80–0,91 par lettre), même
  hauteur de 1 m, même ligne de base, même écart entre lettres, centré sur la
  plaque. Faces avant uniquement, comme l'original : jamais lu à l'envers.
- **Intérieur de la pièce de transition** : tous les éléments gris de la salle
  intérieure sont retirés du GLB (armoires et coffrets, chemins de câbles,
  poteaux et supports, anneaux au sol, plaques et rails de paroi, bande au sol).
  Rien n'est ajouté ; la structure jaune est intacte. La partie des anneaux qui
  dépasse sous le plancher, visible de l'extérieur, est conservée.
- **Conservé volontairement** : la plateforme haute (sous la bride) avec son
  échelle et son mât qui dépassent du sommet. Ils font partie de la silhouette
  extérieure et de la boîte qui cadre la vue FOU : les retirer décalait tout le
  cadrage de la vue large.

## Lancement

- Mode immersif par défaut : seul « HUD · H » est affiché ; H fonctionne
  toujours.
- Orbite automatique lente vers la gauche (360° en 60 s, plongée 30°), arrêtée
  à la première interaction (souris, tactile, molette, clavier) et désactivée si
  le système demande de réduire les animations.
- Cadrage serré, une seule distance pour tout le tour : enveloppe convexe des
  sommets réels de la fondation (acier émergé, sous la plus basse mer) et du CTV
  (pris à marée basse et haute), champ de vision et format réels de l'écran,
  marge de 4 %. La distance est la plus courte qui garde tout visible sur les
  72 positions du tour ; le centre est réglé pour rapprocher au mieux la caméra
  du sujet, puis la marge verticale est répartie également en haut et en bas.
  En portrait, c'est le CTV vu de travers qui fixe la distance ; en paysage,
  la hauteur de la fondation. Distance mesurée : 151 → 90 m sur PC 1280×800,
  247 → 172 m sur mobile 390×844.
- Les sommets sont lus par tranches de quelques millisecondes par image : le
  calcul n'interrompt jamais le rendu. En attendant le CTV, son encombrement
  prévu tient sa place dans le cadre.
- Trait rouge de hauteur absent au lancement. Il apparaît au premier clic ou
  toucher sur le métal de la fondation, à la cote touchée, puis fonctionne
  comme avant. Une hauteur choisie dans le HUD (saisie, curseur, courbe,
  préréglage) l'affiche aussi : la régler sans la voir serait incompréhensible.
  Masqué, il est simplement placé très loin sous l'acier : aucune variante de
  shader, rien n'est recompilé. La vue 2D de secours suit la même règle.
- Time-lapse démarré à l'heure courante, une journée simulée toutes les
  6 secondes ; marée, heure, courbe et houle suivent la même horloge. Pause et
  reprise depuis le rail d'icônes du HUD (et toujours depuis le panneau du bas).

## Points noirs scintillants sur le CTV (mobile)

- **Cause** : précision du tampon de profondeur, pas les ombres. Le plan
  proche de la caméra restait à 0,1 m pour un plan lointain à 1 800 m ; à la
  distance de l'orbite mobile (172 m), un pas de profondeur valait alors
  environ 1,8 cm. Or les décors du CTV sont posés à quelques millimètres de la
  coque (livrée jaune à 7 mm du bleu, marquages, vitrages, embase du mât) :
  sous ce seuil, la carte graphique ne sait plus lequel est devant, et le
  gagnant change d'une image à l'autre quand le navire monte avec la marée et
  que la caméra tourne.
- **Écartés par mesure** : ombres (rendre les ombres du CTV par la face arrière
  ne change rien), normales, faces doubles, texture d'occlusion et mipmaps. Le
  correctif de profondeur seul ramène le scintillement au niveau du simple
  déplacement de la caméra ; ces autres pistes, inchangées, ne laissent donc
  rien à corriger.
- **Correctif** : à chaque image, le plan proche est porté à la moitié de la
  distance qui sépare la caméra de ce qui est dessiné de plus proche (boîtes de
  la fondation, du CTV et de la pince, surface de la mer houle comprise),
  arrondi à une puissance de deux et jamais sous 0,1 m. Rien ne peut donc être
  coupé ; en vue rapprochée il retombe à 0,1 m comme avant. À l'orbite il vaut
  32 m sur mobile et 16 m sur PC : le pas de profondeur à 172 m passe de
  1,8 cm à 0,06 mm.
- **Inchangés** : matériaux, couleurs, ombres, antialiasing, résolution, mer,
  GLB. Seule la profondeur stockée change, et elle n'intervient que pour
  départager des surfaces superposées.
- **Mesuré** (émulation mobile 780×1688, 12 images consécutives, orbite
  −0,1° et marée +1,2 cm par image) : pixels qui clignotent (aller-retour
  d'une image à l'autre) 2 796 → 530 sur toute l'image ; ceux qui restent sont
  le crénelage des rambardes et échelles plus fines qu'un pixel, que
  l'antialiasing, inchangé, traite comme avant. Fondation seule, mêmes angles :
  0,03 à 0,2 % de pixels différents, isolés, aux endroits où deux surfaces
  étaient à égalité de profondeur ; son propre clignotement passe de 234 à
  115 pixels.

## Vérification

- Rendus prod/test avec les mêmes caméras (même code moteur, rendu
  déterministe : bruit mesuré à 0 pixel) : vue large 0,03 % de pixels
  différents, tous sur les panneaux et leur reflet ; boat landing 0,12 %
  (panneau, plus le bord des anneaux sous le plancher) ; vue large mobile
  0,04 % ; nuit 0,03 %. Panneau et intérieur : différences limitées aux zones
  demandées.
- 61 tests du source réussis, TypeScript sans erreur.
- PC et téléphone : au lancement seul « HUD · H » est visible, l'orbite et le
  time-lapse tournent, H ou le bouton affichent le HUD, la pause fige l'heure.
  Le banc de contrôle n'a pas de GPU : les fps et la fluidité réelle sont à
  confirmer sur appareil.

## Accès

Même schéma : AES-256-GCM, PBKDF2-SHA-256 600 000 itérations, même coffre
(identifiant, sel, contrôle) et même mot de passe, donc l'option « se souvenir »
reste valable. Application, styles et ressources sont chiffrés ; seul l'écran de
connexion neutre est public. Les six autres ressources sont reprises octet pour
octet ; seul le GLB est rechiffré avec un IV neuf.
