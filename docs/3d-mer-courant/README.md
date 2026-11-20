# Lot 9 — mer et courant

Sur `/3D/test/` seulement. Demandes de Quentin du 20/11 :

1. une mer cohérente jusqu'à l'horizon ;
2. le courant réel à la date et à l'heure de la barre de temps ;
3. une eau qui avance avec ce courant ;
4. le CTV qui subit le courant en pilotage.

## 1. Une seule mer jusqu'à l'horizon

### La cause

Vue de haut et dézoomée, la mer avait deux régimes : le bon autour de la fondation, puis au-delà
des bandes, des motifs et une autre couleur. Il n'y a qu'une surface et un seul spectre, mais
trois mécanismes se relayaient mal.

- **Les sommets du maillage** dessinent les vagues près de la fondation. Plus loin, la grille
  s'élargit. Chaque vague s'efface du maillage là où la grille ne tient plus six sommets par
  longueur d'onde, c'est-à-dire entre 30 et 90 m de l'axe selon Hs.
- **Le shader du pixel** reprenait ces vagues dans la normale, mais seulement au-delà de 290 à
  390 m. Ce seuil datait de l'ancien bord de la mer, à 650 m.
- **Entre les deux**, rien ne les dessinait. Leur pente partait dans la rugosité du reflet du
  soleil. On voyait donc :
  - la bonne mer autour de la fondation ;
  - puis un anneau lisse, où les nuages se reflétaient comme dans un miroir ;
  - puis, d'un coup, des bandes de vagues nettes et une autre couleur.
- **Sur PC**, le phénomène s'aggravait au dézoom. Au-delà de 110 m de caméra, la scène passe sur
  une grille plus légère, qui lâche les vagues plus près de la fondation.
- **L'écume au loin** était une teinte moyenne uniforme, alors que de près elle se pose sur les
  crêtes. Par tempête, les plaques s'arrêtaient donc net.
- **En mode allégé**, la mer simplifiée (Phong) n'avait aucune reprise par le pixel. Au-delà de la
  grille, elle était plate.

### La correction

Les vagues que la grille fine tient près de la fondation sont les vagues de toute la mer : même
spectre, même direction, même période, même phase. Le principe :

- **Relève exacte** : là où les sommets lâchent une vague, la normale du pixel la reprend, pour
  exactement la part que les sommets ont lâchée. Il n'y a plus de seuil de distance.
- **Seul le détail fin s'estompe** : une vague s'efface progressivement quand le pixel devient
  trop grand pour la résoudre (sa phase tourne de 3 radians d'un bord à l'autre du pixel). Sa
  pente passe alors dans la rugosité du reflet. La variance totale est conservée, donc la
  couleur et l'éclat restent les mêmes à toute distance.
- **Vagues plus courtes que la grille** : elles sont de la rugosité partout, près de la fondation
  comme au loin. Avec les spectres des préréglages, la grille fine les tient toutes (de 4,3 m à
  230 m de longueur d'onde sur PC, de 5,3 m à 218 m sur téléphone).
- **L'écume** se pose sur les mêmes crêtes, celles que dessinent les sommets et celles que reprend
  le pixel. Au loin, le pixel en prend la part moyenne : toujours W de la surface, la fraction de
  Monahan, mais sur les crêtes.
- **La même reprise en mode allégé**, sur la normale de la mer Phong. Pour garder ce mode léger,
  elle prend au plus huit vagues par pixel, les plus courtes que le pixel résout : à énergie égale,
  ce sont elles qui portent le plus de pente, donc le motif.
- **Le passage de grille sur PC** ne change plus l'aspect : ce qu'une grille lâche, le pixel le
  reprend.

La mer garde son aspect actuel près de la fondation. Dans le rayon où les sommets dessinent
toutes les vagues, le shader n'ajoute rien et la boucle n'est même pas parcourue. Ce rayon vaut :

| Hs | PC | Téléphone |
| --- | --- | --- |
| 0,8 m | 39 m | 22 m |
| 1,9 m | 46 m | 31 m |
| 7,7 m | 91 m | 82 m |

Contrôle au pixel près, avec la phase des vagues figée, sur deux vues proches au téléphone : le
plancher de bruit (`main` contre `main`) est à 0 pixel sur l'une des vues. Toutes les
différences avec `main` sont situées au-delà de ce rayon, là où les vagues se prolongent
désormais au lieu de disparaître.

Comparaisons avant/après sur les vues hautes dézoomées, PC, téléphone et mode allégé, à 0,8 m,
1,9 m et 7,7 m : les captures sont dans le compte rendu de la PR. Elles ne sont pas dans le
dépôt (règle 5).

## 2. Le courant réel

### La source

**Open-Meteo Marine**, variables horaires :

- `ocean_current_velocity`, en km/h ;
- `ocean_current_direction`, en degrés : le cap vers lequel l'eau va, 0 = vers le nord.

C'est le modèle Météo-France SMOC, maille de 0,08°, marée comprise, environ 10 jours de
prévision. Le point est le même que pour la houle, et l'appel est celui qui demande déjà les
partitions de la houle (mer du vent, houle primaire et secondaire). Aucun appel n'est ajouté.

L'app convertit les km/h en m/s à la lecture (÷ 3,6), puis en nœuds pour l'affichage (1 nœud =
1,852 km/h). Entre deux heures, le vecteur est interpolé. Une renverse passe donc par l'étale au
lieu de tourner sur place.

### Rien d'inventé

- **Au-delà de la prévision du courant, aucun courant.** L'ancienne estimation tirée de la courbe
  de marée (0,6 nœud au plus) est supprimée.
- **La barre de temps** porte « fin prévision courant » et écrit « Au-delà de la prévision du
  courant : courant non prévu ». La houle, prévue plus loin, a son propre horizon.
- **Le panneau** et la pastille écrivent « non prévu ».
- **En pilotage**, le CTV n'a alors aucun courant, et la carte l'écrit.
- **Préréglage** : il fixe la mer, pas le courant. Le courant est celui de la prévision à l'heure
  affichée, ou aucun au-delà de celle-ci. Le texte de la fenêtre Météo le dit.
- **Pire 24 h** : le courant de la prévision à cette heure-là.

### L'affichage

- **Une pastille discrète sous la boussole** : une flèche bleue tournée vers où porte le courant,
  vue à l'écran comme le nord de la boussole, et la vitesse en nœuds. Elle ne prend aucune
  largeur dans la barre. Au-delà de la prévision, elle affiche « nd — ».
- **Dans la fenêtre de la boussole et dans le panneau d'informations**, par exemple : « Courant
  1,5 nd portant au 338° NNO · jusant ».
- **Flot ou jusant** : d'après la courbe de marée de l'app. Le flot quand l'eau monte, le jusant
  quand elle descend, l'étale sous 10 cm par heure.

## 3. L'eau avance avec le courant

Version simple, sans maille ni appel de dessin de plus.

- **Les vagues** : tout le champ de vagues est porté par le courant. La phase de chaque
  composante avance aussi de k·U (décalage Doppler d'une vague sur un courant). La physique lit
  les mêmes phases : le CTV flotte sur la mer qu'il voit.
- **Les rides et l'écume** se déplacent avec le courant. L'écume y ajoute toujours 3 % du vent.
- **Le sillage du courant** : une traînée d'eau brisée en aval de chacune des quatre jambes et du
  boat landing. Elle est d'autant plus longue et marquée que le courant est fort (12 m plus 40 m
  par m/s, au-delà de 5 cm/s). Le shader ne la calcule qu'à moins de 80 m de l'axe.
- **Le levage** recevait déjà le courant de la scène : le sac à la mer dérive avec ce courant
  prévu.

## 4. Le CTV subit le courant

Le simulateur calculait déjà toutes les forces de l'eau (traînée, safrans, propulsion) sur la
vitesse du navire par rapport à l'eau. Sa vitesse sur le fond est donc sa vitesse dans l'eau plus
le courant. Les tests le vérifient au milliardième sur une trajectoire à moteurs et barre
quelconques : même cap, même vitesse dans l'eau, et un écart de position égal à courant × temps.

**Dérive vérifiée à la main** : 1,5 nœud traversier pendant 60 s.

- 1,5 × 1852 / 3600 = 0,7717 m/s, × 60 s = **46,30 m**.
- Le simulateur, CTV entraîné par l'eau et moteurs au neutre : 46,30 m, au micromètre près.
- Parti à l'arrêt sur le fond, le CTV est emporté par la traînée latérale et atteint la vitesse du
  courant en moins d'une minute.

**Contre le boat landing**, la composante latérale du courant pousse la coque de côté. La traînée
latérale s'exerce un peu en arrière du milieu, donc l'arrière part en aval autour de l'étrave. Il
faut plus de poussée pour rester en place. Avec 1,5 nœud traversier :

- **Poussée minimale estimée** : traînée latérale divisée par le frottement du bow fender, soit
  (25 000 × 0,7717 + 45 000 × 0,7717²) / 0,9 = **51,2 kN**.
- **À 20 % des moteurs** (17 kN d'appui) : même barre toute, la coque pivote à 70° et l'étrave
  glisse de 3,2 m en 60 s.
- **À pleine poussée** (84 kN) : elle tient à 7° et à 1 cm près.

La carte de pilotage affiche, dès qu'il y a un courant :

- la vitesse sur le fond et la vitesse dans l'eau ;
- le courant traversier ;
- près du boat landing, l'appui minimal.

« Arrière » ne s'affiche plus pour une coque emportée de côté par le courant : il faut reculer
dans l'eau.

Inchangé :

- les wingrips (limite à Hs 1,5 m, 8 t) ;
- les alertes (choc, contact, accosté) ;
- la zone de navigation.

## Vérifications

- **Open-Meteo n'est pas joignable depuis cet environnement.** Les tests et le parcours de l'app
  utilisent des réponses simulées au format exact de l'API : `timeformat=unixtime`, tableaux
  horaires, courant en km/h. Le site réel reste à regarder une fois en ligne.
- **Suite privée** : 222 tests sur 222, dont 8 nouveaux (`tests/lot9.test.mjs`) :
  - conversion km/h en nœuds ;
  - sens du cap (0 = vers le nord, 90 = vers l'est, passage dans le repère de la scène) ;
  - flot et jusant ;
  - lecture de la réponse simulée ;
  - horizon propre au courant ;
  - aucun courant au-delà, préréglage compris ;
  - dérive à la main, vitesse sur le fond, appui contre le boat landing ;
  - shader sans seuil de distance.
- **Parcours dans l'app scellée, PC et téléphone** :
  - pastille « 1,5 », fenêtre et panneau « 1,5 nd portant au 338° NNO » ;
  - 11 jours plus tard, « courant non prévu » et « nd — » ;
  - retour à maintenant ;
  - à la barre, moteurs au neutre, la vitesse sur le fond monte vers celle du courant pendant
    que la vitesse dans l'eau reste nulle ;
  - aucune erreur console.
- **Budget** : voir ci-dessous.
- **Mode allégé** : même parcours sur téléphone avec `?safe=1` (pastille, fenêtre, au-delà de la
  prévision), aucune erreur console. La barre n'existe pas dans ce mode, comme avant.
- **Lint** : 0 erreur sur le dépôt. La source privée n'a aucune erreur nouvelle : les 32 restantes
  sont antérieures, les mêmes fichier par fichier et règle par règle. Build OK, `dist/3D` identique
  à `public/3D`.
- **Coffre** : inchangé hors entrée `runtime`. Archive `source-3d/` rafraîchie.

## Budget

Aucune maille, aucune texture, aucun appel de dessin de plus : 40 appels sur la vue proche et 58 sur
la vue haute, avant comme après. Le coût est dans le shader de la mer, qui dessine maintenant des
vagues là où il n'y en avait plus.

Temps de 30 images, rendu logiciel sans GPU (SwiftShader), Hs 1,9 m :

| | Vue proche, avant → après | Vue haute dézoomée, avant → après |
| --- | --- | --- |
| PC | 70,6 → 80,7 s (+14 %) | 36,5 → 48,5 s (+33 %) |
| Téléphone | 30,8 → 31,1 s (+1 %) | 25,8 → 26,8 s (+4 %) |
| Mode allégé | 5,4 → 5,7 s (+6 %) | 3,1 → 4,0 s (+28 %) |

Mode allégé : moyenne de deux passes, la mesure y est bruitée.

Ce qui tient ce coût :

- **Près de la fondation**, dans le rayon où les sommets dessinent tout, la boucle du pixel n'est
  pas parcourue.
- **Les composantes sont rangées** des plus longues aux plus courtes dans la boucle du pixel. Elle
  s'arrête à la première que le pixel ne résout pas.
- **En mode allégé**, huit vagues au plus par pixel.

Ce rendu logiciel est un plancher : sur un vrai GPU, une boucle de 16 à 32 itérations par pixel de
mer pèse peu. La hausse la plus forte (PC, vue haute) correspond à toute la mer entre 40 et 390 m
de l'axe, qui dessine désormais ses vagues.

## Limites

- **Le sillage du courant** est une traînée d'écume dessinée dans le shader, pas un écoulement
  calculé : pas de tourbillons alternés ni de vagues réfléchies.
- **L'appui minimal** ne compte que la traînée latérale et le frottement du bow fender. Les
  wingrips, le propulseur d'étrave et la barre aident en plus.
- **Le flot et le jusant** viennent de la courbe de marée de l'app (Dieppe), pas du courant
  prévu. À une renverse décalée, les deux peuvent ne pas coïncider pendant un moment.
- **Les plaques d'écume par tempête** (question ouverte) gardent leur aspect proche. Elles se
  prolongent maintenant au loin sur les crêtes.
