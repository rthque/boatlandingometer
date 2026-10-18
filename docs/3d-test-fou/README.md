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
CTV. Les ajouts du moteur ne concernent que la caméra au lancement.

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
- Orbite automatique lente (360° en 60 s, plongée 30°), distance fixe calculée
  pour garder fondation, boat landing et CTV dans le cadre sur tout le tour.
  Arrêt à la première interaction (souris, tactile, molette, clavier).
  Désactivée si le système demande de réduire les animations.
- Time-lapse démarré à l'heure courante, une journée simulée toutes les
  6 secondes ; marée, heure, courbe et houle suivent la même horloge. Pause et
  reprise depuis le rail d'icônes du HUD (et toujours depuis le panneau du bas).

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
