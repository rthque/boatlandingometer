# Lot 6c — cordes depuis la nacelle

Sur `/3D/test/` seulement. Demande de Quentin (IRATA 3) : le cordiste doit pouvoir descendre
depuis la trappe située sous la nacelle, donc équiper des cordes depuis la nacelle. Tout se fait
dans le module Cordes ; module fermé, la scène est inchangée.

## Ce qui change

### 1. La trappe sous la nacelle (à confirmer)

Ni ses dimensions ni sa position n'ont été fournies. Voici la proposition, marquée « à confirmer »
dans le panneau :

- **Ouverture** : 0,80 m de large sur 1,00 m de long, dans le fond de la nacelle.
- **Position** : dans l'axe de la nacelle, centrée 7,2 m en arrière de l'axe de la tour.
- **Dégagements** : 4,3 m de la tour en haut, 1,3 m derrière le carénage sous la nacelle. La
  corde pend donc loin de la tour.
- **Trappe** : le couvercle s'articule sur son bord avant et s'ouvre vers le bas, à 100°. Vue de
  dessous, elle a un joint sombre et un liseré jaune de 6 cm.
- **Fût** : la trappe traverse un fût jaune jusqu'au plancher, 0,75 m plus haut.
- **Intérieur** :
  - un plancher en caillebotis de 3,8 m sur 3,4 m autour de la trappe ;
  - deux poutres transversales sur poteaux, l'une au-dessus de la trappe, l'autre 1,2 m en
    arrière ;
  - sous ces poutres, quatre œils d'ancrage jaunes, à 0,4 m de part et d'autre de l'axe et à
    2,15 m du plancher, donc à portée de main.

Ces choix tiennent dans la coque telle qu'elle est dessinée. Son fond n'est plat que sur 0,80 m
de large, d'où la largeur de la trappe. Un test le vérifie à partir des cotes de la nacelle.

La trappe s'ouvre ou se ferme **étape par étape**, avec le bouton « Ouvrir la trappe » de l'onglet
Placer. Le couvercle bascule en s'animant.

### 2. Ancrages dans la nacelle

- **Nacelle transparente** : le bouton rend la coque transparente pour voir et toucher
  l'intérieur.
- **Pose** : avec l'outil Ancrage, comme sur la structure, on touche une poutre ou un œil
  d'ancrage. L'ancrage est posé là où l'on touche.
- **Aimantation** : un toucher à moins de 30 cm d'un œil s'accroche exactement sur lui (« Accroché
  à l'œil d'ancrage E1 »).
- **Techniciens** : avec l'outil Technicien, un toucher sur le plancher met le technicien debout,
  un toucher sur une paroi le met suspendu devant. Les techniciens sont aimantés comme sur la
  structure.
- **Repère de la nacelle** : ancrages et techniciens posés dans la nacelle sont gardés dans son
  repère. Ils tournent avec son lacet quand l'heure de la scène change. Dans les listes, ces
  ancrages portent la mention « nacelle ».

### 3. Les cordes : de la nacelle, par la trappe, le long de la tour

- **Passage par la trappe** : une corde ancrée dans la nacelle et dont le technicien est dehors
  passe par la trappe. Elle la traverse là où elle pendrait, à 8 cm au moins du bord. Deux cordes
  passent donc en deux points distincts.
- **Trappe fermée** : si la trappe de l'étape est fermée, une alerte le dit (« elle passe par la
  trappe, qui est fermée »).
- **Lacet** : les cordes suivent le lacet de la nacelle.
- **Longueurs**, dans l'onglet Calculs, pour chaque corde :
  - longueur jusqu'au harnais, comme avant ;
  - longueur jusqu'en bas : de l'ancrage, ou des deux pour un Y, par la trappe et les points
    intermédiaires jusqu'au point le plus bas qui tient la corde, puis à la verticale jusqu'en
    bas ;
  - boucles de fractionnement et brins de Y compris, sans réserve.
- **En bas, le pont ou la mer** : « en bas » est le premier pont de la plateforme sous ce point ou,
  à défaut, la mer, au niveau de l'eau calme à l'heure de la scène. La scène sonde la structure
  pour le savoir, et une étiquette au pied de la corde l'affiche (« T1 · pont · 98,8 m de
  corde »).
- **Cordes équipées, technicien encore dedans** : trappe ouverte, les cordes descendues sont
  dessinées jusqu'en bas, et leur longueur est donnée.
- **Déviateurs et fractionnements sur la tour** : avec l'outil Ancrage, on touche la tour pour
  poser un ancrage. On s'en sert ensuite comme fractionnement ou déviateur dans l'onglet Matériel.
  La déviation est mesurée depuis la trappe.
- **Ce qui reste valable** : les deux cordes indépendantes, les alertes existantes (« une seule
  corde », « un seul point d'ancrage », le Y, les marges de la chaîne, la force de choc) et la
  chaîne d'assurage.

### 4. Techniciens dans la nacelle et en descente

- **Sous la trappe** : trappe ouverte, un toucher sur l'ouverture met le technicien sur corde, sous
  la trappe, face à la tour.
- **Réglette « Sous la trappe »** : elle règle sa profondeur au dixième de mètre. Elle va jusqu'au
  pont ou à la mer sondé sous la trappe.
- **Exemple de descente** : un bouton de l'onglet Placer crée un scénario en cinq étapes. Il est
  construit pour l'orientation de la nacelle du moment.
  1. Dans la nacelle, trappe fermée : T1 et T2 préparent le matériel.
  2. Mise en place : longes, deux cordes indépendantes (travail sur A1, secours sur A2), trappe
     ouverte, cordes descendues.
  3. T1 passe la trappe et se met sur ses cordes. T2 reste longé, prêt à intervenir.
  4. Descente le long de la tour.
  5. Arrivée à 2 m du pont, ou de la mer : l'étape dit alors qu'un bateau doit attendre.

La timeline interpole la descente d'une étape à l'autre.

### 5. Caméra

Trois cadrages s'ajoutent au cadrage d'ensemble (◎) :

- « Cadrer la nacelle » : vue de l'arrière, un peu au-dessus, sur la nacelle transparente ;
- « Cadrer la trappe » : vue d'aussi bas que la caméra le permet, sur la trappe et le couvercle ;
- « Cadrer T1 » : vue rapprochée sur le technicien choisi, utile en pleine descente.

## Preuves

### Longueurs vérifiées à la main

Les longueurs sont vérifiées trois fois : par les tests, recalculées à part en Python, et relues
dans l'app scellée.

- **Corde depuis l'œil A1** (0,4 m sur le côté, 2,84 m au-dessus du plan de la trappe), technicien
  1,5 m sous la trappe, dans son axe :
  - la corde passe à x = −0,4 + 0,4 × 2,84 / 4,04 = −0,119 m ;
  - longueur √(0,4² + 4,04²) = 4,060 m ;
  - pour un pont à 40,000 m LAT : 2,854 m jusqu'à la trappe, puis 124,287 − 40 = 84,287 m, soit
    87,141 m.
- **Ancrage à 1,5 m sur la poutre** : la corde est tenue par le bord de l'ouverture, à x = 0,32 m.
  La longueur vaut √(1,18² + 2,84²) + √(0,32² + 1,2²) = 3,075 + 1,242 = 4,317 m.
- **Déviateur sur la tour** à 100 m LAT, où la tour a 2,568 m de rayon : l'angle et l'effort
  2·F·sin(δ/2) sont recalculés à partir des vecteurs trappe → déviateur → harnais. La chaîne compte
  le même effort.
- **Dans l'app scellée** (exemple de descente, nacelle au cap 0) :
  - la scène sonde le pont à 28,315 m LAT sous la trappe, qui est à 124,287 m ;
  - étape 2 : « 2,84 + 95,97 m » soit 98,8 m ; à la main, √(0,08² + 2,84²) = 2,841 m (la corde
    tenue par le bord, 8 cm à l'intérieur) plus 124,287 − 28,315 = 95,972 m, soit 98,81 m ;
  - étape 4, T1 à 47,99 m sous la trappe : 50,83 m jusqu'au harnais ; à la main,
    2,841 + √(0,32² + 47,986²) = 50,828 m ;
  - étape 2, T1 encore dans la nacelle : 1,18 m de l'œil au harnais ; à la main,
    √(0,4² + 1,11²) = 1,180 m.

### Pont ou mer selon le cap (harnais)

Sous la trappe, tous les 15° de cap, la corde tombe :

- 9 fois sur un pont à 24,6 m ou 28,3 m LAT, soit 96,0 à 99,7 m de descente ;
- 9 fois sur un pont plus bas, à 17,3 m ou 18,8 m, soit 105,5 à 107,0 m ;
- 6 fois dans la mer, à 105°, 165°, 195°, 255°, 285° et 345°, soit 122,1 m à la marée du banc.

Le sondage du module au cap du moment donne le même pont que le sondage indépendant du banc.

### Touchers (harnais)

- Œil visé ou poutre touchée à 27 cm de l'œil : l'ancrage s'accroche à l'œil E1, en (−0,40 ;
  2,54 ; −7,20) dans le repère de la nacelle.
- Plancher : normale vers le haut, donc technicien debout.
- Trappe ouverte vue de dessous : le toucher est reconnu sur la trappe.
- Tour : le toucher est reconnu sur la tour.

### Budget du module (harnais, appels de dessin et triangles par image)

| Cas | Caméra plateforme | Caméra nacelle |
| --- | --- | --- |
| Module fermé | 56 · 1 473 584 | 38 · 162 384 |
| Ouvert, sans rien dans la nacelle | 56 · 1 473 584 | 38 · 162 384 |
| Scénario plateforme, ancien module | 62 · 1 476 256 | 42 · 163 248 |
| Scénario plateforme, nouveau module | 62 · 1 476 256 | 42 · 163 248 |
| Scénario complet nacelle (3 techniciens, déviateur sur la tour, trappe ouverte) | 62 · 1 478 256 | 50 · 168 452 |
| Refermé | 56 · 1 473 584 | 38 · 162 384 |

- **Coût hors nacelle** : rien. L'intérieur de la nacelle n'est dessiné que lorsqu'une étape s'en
  sert ou que la coque est transparente. Le scénario de la plateforme coûte exactement ce qu'il
  coûtait.
- **Scénario complet** :
  - le module dessine au plus sept objets : le matériel, trois personnages, l'intérieur, le
    couvercle et l'ouverture ;
  - il n'a aucune texture et ajoute 3 000 triangles environ.
- **Code** : le module chiffré passe de 91,8 à 115,6 Ko, sous le plafond de 0,2 Mo. Il n'est
  toujours chargé qu'à l'ouverture.
- **À la fermeture**, le groupe de lacet retrouve ses enfants et la coque ses matériaux d'origine.

### Socle identique module fermé

Rendu à instant figé, calques HTML masqués, sur PC et téléphone : `main` contre `main` (plancher
de bruit), `main` contre ce lot module jamais ouvert, et `main` contre ce lot module ouvert puis
refermé. Résultats ci-dessous.

### Captures, mode allégé, contrôles habituels

- **Captures** : sur PC (1280×800) et téléphone (Pixel 7), trappe fermée vue de dessous et de
  l'intérieur, cordes depuis la nacelle trappe ouverte, technicien sous la trappe, descente le long
  de la tour, arrivée. Elles ne sont pas commitées.
- **Mode allégé** (`?safe=1`, téléphone) : exemple, cordes depuis la nacelle, descente et calculs,
  sans erreur.
- **Console** : aucune erreur dans aucun parcours.
- **Suite privée** : 214/214, dont 7 nouveaux tests (`tests/lot6c.test.mjs`) :
  - repère de la nacelle confronté au groupe de lacet de l'éolienne, à six caps ;
  - trappe dans le gabarit de la coque ;
  - longueurs à la main ;
  - corde descendue technicien dedans ;
  - déviateur et fractionnement sur la tour ;
  - lacet et interpolation ;
  - sauvegarde.
- **Projet** :
  - lint public à 0 erreur, build OK, `dist/3D` identique à `public/3D` ;
  - coffre inchangé hors entrée `runtime` ;
  - dans le runtime, seuls le code de l'app et le module Cordes changent ; le module Levage et les
    ressources sont identiques à `main` ;
  - archive `source-3d/` rafraîchie (même coffre d'archive, IV neuf).

## Limites

- **Trappe, plancher, poutres et œils** : une proposition à confirmer. Les cotes sont regroupées
  dans un seul fichier de la source et se changent sans toucher au reste.
- **La corde pend à la verticale** depuis son point le plus bas. Le vent et le balancement ne sont
  pas simulés.
- **« En bas »** est la première surface de la structure sous ce point. Une main courante ou un
  garde-corps compte comme tel s'il est dessous.
- **La mer** est prise au niveau de l'eau calme, sans la houle.
- **L'exemple de descente** est construit pour l'orientation de la nacelle au moment de sa création.
  Si la nacelle tourne ensuite, les cordes et les longueurs suivent, mais la dernière étape garde sa
  profondeur.
