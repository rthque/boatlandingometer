# 3D TEST — son du pilotage, mode clair, ouverture sur l'instant présent

Version TEST (`/3D/test/`) uniquement. Même coffre, même mot de passe, mêmes
ressources chiffrées : seul le runtime chiffré et sa ligne dans `vault.json`
changent. Aucun fichier audio n'est ajouté : tous les sons sont générés en direct
par le code (Web Audio), il n'y a donc ni licence à documenter ni ressource de
plus à chiffrer.

## Ouverture

- **Mode clair par défaut.** Le mode nuit reste dans les paramètres et le choix
  est mémorisé sur l'appareil. La clé de mémorisation est nouvelle
  (`blo-3d-theme-v2`) : un choix « nuit » enregistré quand la nuit était le
  défaut ne garde pas un navigateur dans le noir.
- **Plus de time-lapse au lancement.** L'app s'ouvre sur le moment présent
  (marée actuelle, mise à jour chaque minute) et sur la houle annoncée pour
  cette heure. Le time-lapse reste dans le HUD (lecture, vitesse) ; l'orbite de
  lancement est inchangée.
- **Pilotage : manettes séparées par défaut**, chaque manette pilotant son
  moteur. Le bouton reste à sa place et permet de les lier.

## Son du pilotage

Le son démarre avec « Prendre la barre » (le clic est le geste que les
navigateurs exigent avant tout son) et s'éteint en fondu en quittant la barre ;
hors pilotage, l'app reste silencieuse. Paramètres : « Son du pilotage »
(activé/coupé) et volume, mémorisés sur l'appareil.

| Son | Déclencheur |
| --- | --- |
| Moteur diesel bâbord, moteur diesel tribord | Chacun suit sa propre manette : ralenti à 650 tr/min, montée en régime jusqu'à 2 300 tr/min avec l'inertie du moteur, marche arrière comprise. Timbre de V8 4 temps, plus clair en charge ; les deux moteurs ne tournent jamais exactement au même régime (léger battement) |
| Inverseur | « Clac » de l'inverseur à chaque embrayage, en avant ou en arrière |
| Brassage des hélices | Poussée des deux moteurs |
| Cavitation | Forte poussée sur une coque lente, surtout en marche arrière |
| Propulseur d'étrave | Sifflement du moteur qui monte avec la charge, bouillonnement du tunnel, du côté où l'eau est chassée |
| Eau le long de la coque | Vitesse |
| Clapot sur les deux coques | Houle affichée ; petites claques de vagues plus fréquentes et plus fortes dans une mer plus grosse |
| Coups de mer | Coque qui retombe vite sur la surface (étrave, puis chaque coque), selon la mer et la vitesse |
| Vent | Vent prévu du jour, plus le vent apparent dû à la vitesse ; rafales lentes ; très atténué en passerelle |
| Défense en appui | Grincement en glissement sous charge ; gémissement du caoutchouc quand une vague charge ou décharge l'appui |
| Contact avec le boat landing | Gradué par la vitesse d'arrivée : écrasement doux du caoutchouc en push-on, choc sourd dans toute la coque si l'arrivée est rapide, et l'acier du boat landing qui résonne au-delà de 0,5 m/s (environ 1 nd) |
| Coque contre l'acier (hors défense) | Choc métallique et raclement |

**Spatialisation.** Chaque source est placée sur le bateau (salle des machines
bâbord et tribord, étrave, coque) et entendue depuis la caméra : panoramique
gauche/droite et atténuation avec la distance, en poursuite comme en vue
libre. En vue passerelle, la timonerie filtre le dehors : moteurs sourds sous
les pieds, vent et souffle atténués.

**Mixage.** Tous les niveaux suivent des rampes lissées, chaque son ponctuel
commence et finit à zéro, et un limiteur en fin de chaîne protège contre la
saturation quand plusieurs sons s'additionnent. Sur téléphone, le graphe est
plus léger : fréquence d'échantillonnage réduite, moins d'harmoniques, un
modulateur de moins. Onglet masqué : le son est suspendu.

## Vérification

- Tests : suite complète **80/80**, dont 8 nouveaux sur le son :
  - régime de chaque moteur selon sa manette, en avant comme en arrière ;
  - niveaux bornés entre 0 et 1, quel que soit le rapport reçu ;
  - eau, vent, étrave et cavitation selon la situation ;
  - placement gauche/droite et atténuation avec la distance ;
  - « clac » d'inverseur une fois à chaque embrayage ;
  - choc gradué selon la vitesse d'arrivée, l'acier ne résonnant qu'au-delà du seuil ;
  - gémissement de la défense seulement quand la charge varie ;
  - choc et coups de mer mesurés sur le vrai moteur de pilotage.

  TypeScript sans erreur, aucune nouvelle remarque de lint.
- **Mixage, rendu hors ligne** du graphe réel sur une séance scriptée de 40 s :
  - séquence : ralenti, pleine puissance, passerelle, marche arrière, étrave,
    appui, choc fort, coque contre l'acier, mer de face ;
  - crête maximale 0,71 et aucun échantillon écrêté ;
  - aucun clic au détecteur de discontinuités ;
  - coût : 40 s rendues en 2 s sur PC et en 0,9 s avec le graphe mobile.
- **Application réelle chiffrée**, avec une sonde sur la sortie audio :
  - aucun son avant « Prendre la barre » ;
  - le contexte audio démarre avec la barre et le niveau suit la vitesse
    (−34 dB à l'arrêt, −23 dB à 19 nd) ;
  - choc audible au contact ;
  - silence et contexte suspendu après « Quitter la barre ».
- **Pilotage complet jusqu'à « Accosté · stable »** avec le son :
  - PC au clavier ;
  - mobile aux deux manettes, séparées dès la prise de barre.
- **Ouverture** : mode clair, date et heure du moment, aucun time-lapse en
  cours, houle de la prévision de l'heure. Les réglages montrent « Son du
  pilotage » et « Volume ».
- **Hors pilotage, comparaison avec `main`** au même instant, chaque version
  réglée sur le même thème :
  - **0 pixel différent** en nuit et en jour, sur PC (1280×800) et sur mobile ;
  - sur mobile, la comparaison en jour se fait à densité 1 : à densité réelle,
    la résolution adaptative de l'app se stabilise à des niveaux différents
    d'une ouverture à l'autre sur ce banc sans carte graphique.

Reste à juger à l'oreille sur un vrai appareil : timbre des moteurs, équilibre
des niveaux et rendu sur un haut-parleur de téléphone.
