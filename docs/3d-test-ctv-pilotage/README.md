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
- **Houle et courant** : la pente de la houle pousse le bateau, la dérive de
  houle le décale dans le sens des vagues ; un **léger courant de marée** (au
  plus 0,6 nœud, portant à l'ENE au montant et à l'OSO au descendant) entraîne
  la coque, le sillage et l'écume.

## Accostage et collisions

- Les contacts sont cherchés sur **l'acier réel de la fondation** (le même index
  de collision que la caméra), avec une rangée de sphères sur la défense d'étrave
  et d'autres sur les étraves, les flancs, l'arrière et la superstructure.
- **Défense d'étrave** : caoutchouc raide amorti, frottement 0,9 sur les tubes :
  le bateau reste plaqué avec un peu de poussée, l'étrave pivote sur le point de
  contact pendant que l'arrière travaille dans la houle. Mesuré sur la
  physique seule : tenu par mer calme à 20 % de poussée, par Hs 0,8 m à 30 % ;
  au-delà de Hs 1,2 m l'étrave glisse par moments même à forte poussée, ce qui
  est le comportement attendu près des limites d'exploitation.
- **Acier ailleurs** : contact dur et peu frottant (jambes, entretoises,
  plateformes) ; le bateau ne traverse rien.
- **Indicateurs** : distance au boat landing, vitesse d'approche (verte jusqu'à
  0,6 nd, orange au-delà, rouge au-delà de 1 nd près des tubes), décalage
  latéral, puis « Contact · tenez l'appui » / « ça glisse, poussez plus »,
  **« Accosté · stable »** après 3 s de contact aligné sans glissement, et une
  alerte **« Choc trop fort »** si le premier contact dépasse 0,5 m/s (≈ 1 nd)
  ou **« Collision avec la fondation »** pour tout autre choc.

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
  vitres avant, qui suit le tangage et le roulis.
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
  collision, rampes clavier, Maj, mélange clavier/tactile) ; TypeScript sans
  erreur, aucune nouvelle erreur de lint.
- Application réelle chiffrée, PC et mobile, pilotée uniquement par ses propres
  commandes (clavier sur PC, manettes tactiles sur mobile) : départ, navigation
  avec sillage, demi-tour, approche, contact et état « Accosté · stable »,
  puis sortie de la barre.
