# Lot 1b — le temps de la scène et le boatlandingometer comme fonction

Sur `/3D/test/` seulement. D'après les réponses de Quentin du 19/11 : météo actuelle à
l'ouverture, pas de 10 cm, défilement sur 14 jours. Les commandes suivent la maquette validée.

## Ce qui change

### 1. Ouverture

Rien ne change à l'ouverture : la même vue 3D, la caméra cinématique qui tourne autour de la
fondation jusqu'au premier geste, et la météo actuelle. Seule nouveauté visible : la barre de temps,
en bas, réglée sur maintenant.

### 2. Le boatlandingometer devient une fonction

- C'est un bouton au même niveau que « Prendre la barre », « Levage » et « Cordes ». Sur téléphone,
  il est libellé « Blmeter ». Il est aussi dans la colonne d'outils du mode HUD.
- Une seule fonction est ouverte à la fois : ouvrir le boatlandingometer ferme le levage ou les
  cordes, et l'inverse. Prendre la barre le ferme.
- **Trait rouge** : il n'apparaît que quand la fonction est ouverte. Il est posé d'office à la
  hauteur cible, 2,20 m. Un clic sur le métal ne fait rien quand la fonction est fermée. Ouverte, il
  règle la hauteur cible, comme avant.
- **Panneau**, d'après la maquette :
  - bandeau de 14 jours, avec le coefficient, 🛑 les jours de mer ou de vent forts prévus, et 📅
    pour le calendrier au-delà ;
  - hauteur d'eau en grand, boutons − / + au pas de 10 cm (maintenus, ils défilent). La hauteur
    pilote l'heure, comme avant ;
  - courbe de marée comme timeline : on glisse le doigt n'importe où dessus. Elle montre PM et BM,
    les créneaux de jour en vert, la cible en pointillé ambre et le curseur rouge avec son heure. Une
    double tape ramène à maintenant ;
  - hauteur cible sur sa ligne, − / + au pas de 10 cm ou saisie, avec le nombre et la durée des
    créneaux de jour ;
  - gros boutons : créneau précédent et suivant (sous la cible, de jour, cherchés sur 14 jours),
    time-lapse (pause, vitesse ×1 à ×24, arrêt) et maintenant.
- **Disposition** :
  - sur téléphone en portrait, une feuille du bas à trois positions, avec le bandeau des jours en
    haut de l'écran, sous la barre météo ;
  - sur PC et téléphone en paysage, le même panneau en bas à gauche.

  À la position la plus haute, la feuille ajoute la liste des créneaux, les passages de l'eau et les
  marées du jour.
- L'ancien panneau du bas (curseurs d'heure, d'eau et de cible) disparaît. Ses détails restent dans
  le panneau d'informations du mode HUD.

### 3. Changer la date et l'heure : la barre de temps

- En bas de la scène principale, façon Windy : une bande de 14 jours glisse sous une aiguille fixe.
  - On la glisse au doigt ou à la souris, on tourne la molette, ou on touche un moment pour l'amener
    sous l'aiguille.
  - Au clavier : flèches ±1 h, pages ±1 jour, Début pour maintenant.
  - La bande montre les jours, les heures et la nuit.
- **Retour à maintenant en un geste** : double tape sur la barre, ou le bouton « Maintenant ».
- La mer, le ciel, le soleil, la marée et l'éolienne suivent l'heure choisie.
- La barre est cachée quand une fonction est ouverte : pilotage, levage, cordes, boatlandingometer.
  Le panneau du boatlandingometer a ses propres commandes de temps.
- **Horizon de la prévision** : l'app demande maintenant 14 jours à Open-Meteo. Si la demande est
  refusée, elle redemande 7 jours, l'ancienne durée. L'horizon est lu dans les données reçues, séparément
  pour la mer et pour la météo.
  - Au-delà, la bande est hachurée, avec un repère « fin prévision mer » ou « fin prévision météo ».
  - Quand l'heure choisie est au-delà, la barre le dit : « Au-delà de la prévision marine : houle non
    prévue », ou météo, ou les deux.
  - Sans aucune prévision, elle affiche « Prévision indisponible ».
  - Rien n'est inventé au-delà de l'horizon : la mer est sans houle, le ciel neutre, l'éolienne à
    l'arrêt, et les légendes le disent, comme avant.

### 4. Pire météo de jour

- La pire heure des 24 h est choisie parmi les heures de jour seulement : le soleil doit être
  au-dessus de l'horizon au milieu de l'heure, l'instant que la scène montre.
- En la choisissant, la scène va à cette heure, pour qu'on la voie de jour.

### 5. Wingrips

Sur la vue principale, les wingrips du CTV accosté ne sont plus dessinés quand la Hs dépasse 1,5 m :
ils lâcheraient. Le test porte sur la Hs affichée, au dixième, comme les 🛑 : 1,54 m s'affiche
« 1,5 m » et garde les wingrips. Sans prévision, ils restent dessinés. Le pilotage n'est pas
concerné : on y engage les wingrips soi-même, et leur effort est simulé.

### 6. L'éolienne face au vent prévu

Vérifiée, rien à corriger. La nacelle suit le vent prévu à la date et à l'heure de la scène :

- le contrôleur s'aligne exactement au saut d'heure ;
- la nacelle affichée le rejoint à 15° par seconde.

Seul ajout : le cap affiché est transmis avec le cap du contrôleur, pour la preuve.

## Preuves

### Tests (suite privée, `tests/lot1b.test.mjs`)

- **Défilement** : 14 jours depuis minuit à Paris (et non UTC). Glisser de 96 px à 8 px/h avance
  de 12 h. L'heure est arrondie à 10 min et reste dans les 14 jours. Aller-retour heure ↔ date
  exact, changements d'heure compris.
- **Horizon** : lu dans les données, mer et météo séparément. Au-delà, la scène ne reçoit pas de mer.
- **Boatlandingometer** : 🛑 sur le nombre affiché ; pas de 10 cm ; créneaux de jour sous la cible ;
  créneau suivant et précédent ; aucun créneau quand la cible n'est jamais atteinte.
- **Pire météo de jour** : une houle de nuit plus forte est écartée ; la pire heure a le soleil levé ;
  sans heure de jour, pas de pire heure.
- **Wingrips** : dessinés jusqu'à 1,5 m affiché, absents au-dessus. Parmi les préréglages, ils
  restent jusqu'à « limite de transfert » et disparaissent dès « mer agitée ».
- **Lacet** : un vent qui tourne sur 14 jours passe par le repère de la scène (cap de 68°), puis par
  le contrôleur, puis revient en cap vrai.
  - Après chaque saut d'heure de la barre, l'écart au vent vrai est nul.
  - Suivi minute par minute, l'écart reste sous 9° (8,2° au plus) : c'est le seuil de déclenchement
    du lacet, 8°, plus le retard de son filtre.
  - Sans vent prévu, l'éolienne s'arrête et garde son cap.

### Banc privé (`bench/lot1b-flow.mjs` et `bench/lot1b-wingrips.mjs`)

Le banc tourne dans l'app scellée, avec une prévision simulée : 14 jours demandés, la mer fournie
pour 8 jours et la météo pour 11.

Il couvre trois écrans : PC (1280x800), téléphone en portrait (412x839) et téléphone en paysage
(839x412). Les captures ne sont pas commitées.

- **Ouverture** : météo actuelle, caméra en mouvement, barre sur « maintenant », aucun panneau.
- **Défilement** :
  - la barre glissée avance l'heure ; au-delà de l'horizon marin, la mention s'affiche et la
    légende de la mer dit « pas de données » ;
  - la double tape ramène à maintenant.
- **Éolienne**, cap affiché contre le vent prévu, en cap vrai : écart de 0° à l'ouverture, 0°
  après le défilement, 0° au-delà de l'horizon marin (la météo y est encore prévue).
  - Le rendu logiciel du banc ne tourne qu'à quelques images par seconde : la nacelle a mis jusqu'à
    deux minutes pour rejoindre le contrôleur.
  - Le contrôleur, lui, est aligné dès le saut.
- **Trait rouge**, compté en pixels rouges purs, dont ceux des marques peintes, toujours là :
  - fermé, six clics sur l'acier ne changent rien : 18 à 42 pixels selon l'écran, aucun panneau ;
  - ouvert, un clic sur l'acier règle la cible (20,4 à 24,6 m) et le trait apparaît : 446 à
    10 537 pixels ;
  - refermé, on retombe à 21, 42 et 27 pixels, et les clics ne font plus rien.
- **Module** : bandeau de 14 jours plus le calendrier ; + met l'eau au dixième suivant (3,52 m
  donne 3,60 m) ; + sur la cible ajoute 10 cm ; la courbe glissée change l'heure ; créneau
  suivant ; time-lapse lancé puis arrêté ; trois positions de la feuille.
- **Pire météo** : la houle de nuit de 2,5 m est écartée. La pire heure retenue est vendredi
  10:00 (1,4 m), et la scène s'y place, à 10:30.
- **Wingrips** : gros plan sur l'étrave, houle figée, préréglage 1,5 m puis 1,9 m. Le même cadre
  compte 251 pixels de sangle bleue à 1,5 m et 9 à 1,9 m, du bruit sans sangle visible.
- **Mode allégé** (`?safe=1`) : ouverture, défilement et module, sans erreur.
- Aucune erreur console dans aucun parcours.

### Contrôles habituels

Suite privée 207/207, lint public à 0 erreur, build OK, `dist/3D` identique à `public/3D`, coffre
inchangé hors entrée `runtime`, archive `source-3d/` rafraîchie (même coffre d'archive, IV neuf).
Dans le runtime, seul le code de l'app change : les ressources et les deux modules sont identiques à
`main`.

## Limites

- Open-Meteo n'est pas joignable depuis le conteneur du banc : la demande sur 14 jours et son repli
  sur 7 n'ont été vérifiés qu'avec une prévision simulée. Sur le site réel, l'horizon affiché sera
  celui que le service renvoie.
- La pire météo reste cherchée dans les 24 h qui suivent : la nuit, ce sont les heures de jour de
  la journée suivante.
- Le bandeau du module ne montre 🛑 que les jours couverts par la prévision. Au-delà, il ne montre
  que le coefficient.
