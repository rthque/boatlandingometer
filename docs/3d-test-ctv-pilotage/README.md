# Sous-site 3D TEST — simulateur de pilotage du CTV

Cycle limité à `public/3D/test/`. La production `public/3D/`, les redirections
`public/3d/`, le site principal et le workflow ne changent pas. Même accès :
AES-256-GCM, PBKDF2-SHA-256 600 000 itérations, même coffre et même mot de
passe ; seul le runtime chiffré est reconstruit, les ressources chiffrées (GLB,
images, vidéo) sont reprises octet pour octet.

## Hors pilotage : rien ne change

Le simulateur ne s'active que sur demande. Tant qu'on ne prend pas la barre,
l'orbite, le time-lapse, le HUD, le CTV à quai, la mer, la lumière et la
fondation sont exactement ceux d'avant : le sillage existe mais reste masqué, et
le CTV est posé par le code d'accostage habituel. Contrôles :

- mêmes caméras, moteur d'avant contre moteur d'après : **0 pixel différent**
  sur 8 vues (PC 1280×800 et mobile 780×1688, quatre angles chacune) ;
- prendre la barre, naviguer, puis la quitter : **0 pixel différent** entre
  l'image d'avant et celle d'après (objectif, voile atmosphérique et pose du
  CTV restaurés).

## Prendre la barre

- Un bouton discret **« Prendre la barre »** à côté de « HUD · H » (et une
  icône de barre dans le rail d'outils quand le HUD est affiché). Il apparaît
  quand le modèle du CTV est chargé, en 3D uniquement.
- Au départ, le CTV est à **100 m** du boat landing, à l'arrêt, étrave vers les
  tubes. Le time-lapse se met en pause pendant le pilotage (la marée d'un
  accostage est une affaire de minutes) et reprend en quittant.
- **« Quitter la barre »** (ou Échap) ramène l'app exactement comme avant ;
  **« Recommencer »** replace le CTV au départ.

## Commandes

PC (touches physiques : les mêmes en AZERTY et en QWERTY) :

| Touches | Action |
|---|---|
| ↑ ↓ ou Z S | avancer · reculer, les deux moteurs (la manette monte progressivement, revient au neutre au relâcher) |
| ← → ou Q D | barre à gauche · à droite ; à l'arrêt, pivot sur place aux moteurs |
| Maj | petite vitesse (manette limitée à 30 %), pour accoster |
| R · F | moteur bâbord avant · arrière |
| U · J | moteur tribord avant · arrière |
| X · C | propulseur d'étrave vers bâbord · vers tribord |
| Espace | moteurs au neutre |
| V · Échap | vue arrière / passerelle · quitter la barre |
| souris | glisser : tourner la caméra · molette : zoom |

Un aide-mémoire repliable reprend ce tableau en bas à gauche.

Mobile : **deux manettes de gaz** verticales, une par moteur (bâbord à gauche,
tribord à droite), qui restent où on les laisse comme de vraies manettes ;
double tap = neutre. Elles sont **liées** par défaut (une seule main suffit pour
aller tout droit) et se délient d'un bouton pour manœuvrer moteur par moteur.
Au centre : deux boutons d'**étrave** (◀ ▶, à maintenir) et une **barre**
horizontale à ressort. Un doigt sur la scène tourne la caméra, deux doigts
zooment. Disposition vérifiée en portrait et en paysage.

## Physique

Ordres de grandeur d'un catamaran de 27 m, pas un modèle de manœuvrabilité
validé (module `lib/ctv-helm.ts`, testé seul) :

- **Propulsion** : deux hélices avec safrans, 42 kN chacune en avant, 55 % en
  arrière ; montée en régime progressive, passage obligé par le neutre et
  attente de l'inverseur avant de battre en arrière. Propulseur d'étrave de
  10 kN, inefficace au-delà de quelques nœuds.
- **Inertie** : 58 t, masses ajoutées en cavalement et en embardée ;
  résistance de carène calée pour **25 nœuds** en pointe. Mesuré : 10 nœuds en
  5 s, 23 nœuds en 20 s ; **arrêt d'urgence en marche arrière : 12 s, 75 m** ;
  giration barre toute à 21 nœuds : rayon ≈ 74 m, avec dérive et gîte
  extérieure ; pivot sur place aux moteurs ≈ 6 à 7°/s.
- **Flottaison** : le CTV échantillonne la **surface réellement affichée**
  (même fonction de houle que le rendu : hauteur, période, direction, phase,
  marée) sous ses deux coques, et ses mouvements de pilonnement, tangage et
  roulis suivent cette surface avec leur propre inertie et amortissement :
  aucune saccade (variation de tangage d'une image à l'autre mesurée sous
  0,001°). Assiette relevée et légère montée en déjaugeant.
- **Houle et courant** : la houle est celle de la prévision à l'heure affichée
  (celle du time-lapse au moment où l'on prend la barre). Au-delà des 7 jours de
  prévision, ou houle désactivée, la mer est le simple clapot neutre de l'app et
  le bateau flotte presque à plat. La pente de la houle pousse le bateau, la
  dérive de houle le décale dans le sens des vagues ; un **léger courant de marée** (au
  plus 0,6 nœud, portant à l'ENE au montant et à l'OSO au descendant) entraîne
  la coque, le sillage et l'écume.

## Accostage et collisions

- Les contacts sont cherchés sur **l'acier réel de la fondation** (le même index
  de collision que la caméra), avec une rangée de sphères sur la défense d'étrave
  et d'autres sur les étraves, les flancs, l'arrière et la superstructure.
- La défense d'étrave est un caoutchouc large à **face plate** : ses 17 sphères
  (rayon 40 cm, tous les 20 cm) se chevauchent et ne laissent que des creux
  d'environ 1 cm (les premières, simplement jointives, laissaient des creux de
  25 cm où un tube pouvait se loger).
- **Défaut corrigé avant livraison** : en accostant à 0,5 nd avec 1 m de
  décalage, le CTV recevait un coup de lacet de 11°/s, rebondissait de
  plusieurs mètres et affichait « Choc trop fort ». Rejoué sous-pas par
  sous-pas, la cause était une pénétration fictive de 66 cm : pour une sphère
  située au milieu des deux tubes, l'acier le plus proche saute du bord
  intérieur d'un tube à celui de l'autre, et le garde-fou anti-traversée
  gardait l'ancienne normale en l'appliquant au nouveau point. Il ne garde
  désormais l'ancien plan (point et normale ensemble) que si la sphère le
  traverse encore réellement. Un test reproduit le cas (1 240 kN de force
  fantôme avant, 0 après).
- **Défense d'étrave** : caoutchouc raide amorti, **frottement statique**
  (μ 0,9) : chaque point de contact est retenu là où il a touché jusqu'à μ × la
  force d'appui, puis glisse au-delà. Le bateau reste donc plaqué avec un peu
  de poussée, même sous la poussée latérale du propulseur d'étrave ou en
  arrivant décalé (0,9 m et 6° : tenu), et l'étrave pivote sur le point de
  contact pendant que l'arrière travaille dans la houle. Un premier essai avec
  un frottement seulement visqueux laissait l'étrave glisser hors des tubes sous
  une poussée latérale légère : c'est ce qui a été corrigé. Mesuré sur le vrai
  boat landing, version livrée : « Accosté · stable » par Hs 1,5 m à 30 % et à
  60 % de poussée, en arrivant décalé de 0,9 m avec 6° de cap, et sous le
  propulseur d'étrave à 60 % une fois accosté (9 cm de glissement en 17 s) ;
  arrivée trop rapide à 2 nd : alerte « Choc trop fort », rebond, puis accostage
  stable sans embardée. Par Hs 2 m l'étrave tient encore à 30 % mais travaille
  nettement (glissement jusqu'à 0,2 m/s, cap qui dérive de 5° en 17 s) : c'est
  la limite, comme pour les limites d'exploitation réelles.
- **Acier ailleurs** : contact dur et peu frottant (jambes, entretoises,
  plateformes) ; le bateau ne traverse rien.
- **Indicateurs** : distance au boat landing, vitesse d'approche (verte jusqu'à
  0,6 nd, orange au-delà, rouge au-delà de 1 nd près des tubes), décalage
  latéral, puis « Contact · tenez l'appui » / « ça glisse, poussez plus »,
  **« Accosté · stable »** après 3 s de contact sans glissement **face à
  l'échelle** : étrave à moins de 0,6 m de l'axe (les deux tubes sous la
  défense) et à moins de 10° du carré. Sinon le contact reste orange et dit
  quoi corriger : « décalé de 1,5 m, recentrez sur l'échelle » ou « de travers
  de 15°, redressez l'arrière ». Une première version acceptait 20° sans
  condition de décalage : on pouvait être « accosté » sur un seul tube, le
  portillon loin de l'échelle. Alertes **« Choc trop fort »** si le premier
  contact dépasse 0,5 m/s (≈ 1 nd) et **« Collision avec la fondation »** pour
  tout autre choc.
- Un décalage léger se rattrape comme à bord : relâcher l'appui et faire
  glisser l'étrave le long des tubes au propulseur d'étrave, puis repousser.
- « Accosté · stable » ne clignote pas : une vague qui décharge la défense un
  instant ne le défait pas, il ne retombe qu'après près d'une seconde de
  conditions non tenues ; et il se perd dès qu'on recule (le compteur était
  d'abord sans plafond : après une minute à quai, l'état restait « accosté »
  plus de 10 s après avoir quitté les tubes).

## Sillage

Dessiné **sur** la mer affichée, par la même fonction de houle, pour qu'il suive
les vagues sans flotter ni s'enfoncer ; exclu du reflet de l'eau.

- Un sillage d'hélice derrière chaque coque, plus large et plus blanc avec la
  vitesse ou la poussée, sur une eau aérée plus claire.
- Le **V** : une crête d'écume part de chaque épaule d'étrave et s'écarte
  (≈ 0,34 × la vitesse), en dentelle qui se défait avec l'âge.
- Remous de chaque hélice, **vers l'arrière en marche avant et le long des
  coques en marche arrière** ; bouillonnement latéral du propulseur d'étrave du
  côté où il refoule ; écume d'étrave proportionnelle à la vitesse ; gerbe au
  choc.
- Tout s'estompe dans le temps (traînées 10 à 20 s, remous 1 à 3 s) et dérive
  avec le courant.

## Caméra

- **Vue arrière** façon jeu de conduite : derrière et au-dessus du bateau,
  objectif plus large (55°), cap suivi avec un léger retard ; on la tourne au
  doigt ou à la souris, elle revient derrière le bateau 2,5 s après.
- **Vue passerelle** (V) : œil à 1,7 m au-dessus du pont de la timonerie, aux
  vitres avant, qui suit le tangage et le roulis ; on y voit le pont avant, le
  portillon de transfert et l'échelle du boat landing droit devant.
- La caméra ne traverse ni l'acier ni la surface de l'eau.

## Performance

- Physique en sous-pas de 1/240 s, contacts cherchés une fois par image et
  seulement près de l'acier. Mesuré par image (physique, contacts, sillage,
  caméra) : **0,5 ms en mer, 1 ms en appui sur le boat landing** (95 % sous
  2,3 ms, pire 3,7 ms), sur les 16,7 ms d'une image à 60 i/s.
- Sillage : quatre rubans et au plus 420 taches d'écume, géométrie mise à jour
  sur le processeur (quelques milliers de sommets), un seul passage
  transparent, pas de texture. Mesuré en rendu logiciel, sillage affiché ou
  masqué : **environ 2 % du temps d'image**.
- Le banc de contrôle n'a pas de GPU : il ne mesure que la fluidité logicielle.
  **Les 60 images/s sur PC et la fluidité sur un Android milieu de gamme sont à
  confirmer sur appareil.**

## Vérification

- Tests de la physique et des commandes (vitesse max, arrêt, pivot,
  inverseur, flottaison sans saccade, courant, accostage tenu, choc et
  collision, accosté seulement face à l'échelle, face plate de la défense,
  glissement devant l'axe du boat landing sans pénétration fantôme, rampes
  clavier, Maj, mélange clavier/tactile) :
  suite complète **72/72** ; TypeScript sans erreur, aucune nouvelle erreur de
  lint.
- Application réelle chiffrée, PC et mobile, pilotée uniquement par ses propres
  commandes (clavier sur PC, manettes tactiles sur mobile) : départ, navigation
  avec sillage, demi-tour, approche, contact et état « Accosté · stable »,
  puis sortie de la barre.
