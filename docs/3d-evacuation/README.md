Lot 12 : techniciens réalistes et évacuation d'un blessé au brancard
=====================================================================

Branche claude/3d-lot12-evacuation, partie du dernier commit de la PR du lot 11 (f97bb50). Elle
s'empile sur les PR des lots 9, 10 et 11, encore ouvertes.

Ce qui change, dans le module Cordes seulement (la scène de base ne bouge pas).

1. Techniciens redessinés d'après les photos de l'équipe
-------------------------------------------------------

- Combinaison orange haute visibilité, épaules et haut des bras bleu marine (et le bas des jambes
  pour l'un des trois), bandes réfléchissantes grises au torse, au dos, aux bras et deux sur chaque
  jambe ; chaussures de sécurité noires ; gants gris.
- Casque d'alpinisme orange ou blanc, sous un chapeau à large bord pour l'un d'eux ; lunettes sur le
  casque ; coquilles du casque radio ; cache-cou.
- Harnais complet noir, dosseret et ceinture jaunes, anneau dorsal, anneau sternal, anneau ventral ;
  de près seulement (détail fin) : mousquetons autour de la ceinture, descendeur, bloqueurs de poitrine
  et de poing, longe en Y, corde lovée, sac à corde, petit seau à outils jaune, micro du casque radio.
- Aucun visage (une tête sans traits), aucun nom, aucun logo, aucun texte de marque.
- La couleur propre de T1, T2 et T3 (avant : le harnais) est devenue un brassard au bras gauche.
- Postures : les cinq existantes (debout, longé, suspendu, montée, descente), plus « À genoux »
  (genou droit au sol près du blessé, pied gauche posé, mains vers le sol devant) et
  « Accompagnateur » (suspendu près du brancard, une main sur son cadre, l'autre sur la corde). À
  genoux, le point d'attache ventral descend de 0,43 m : posé au sol ou en changeant de posture, le
  technicien garde les pieds et le genou sur le pont.
- Un technicien reste un seul maillage (un appel de dessin), reconstruit quand sa posture change :
  4 128 triangles de loin, 9 120 de près avec le détail fin, 2 400 en mode léger (téléphone, mode
  allégé). Reconstruction : 0,8 ms de loin, 2,5 ms de près, 0,5 ms en mode léger (moyenne sur 200).

2. Le brancard et le mannequin de secours
-----------------------------------------

Modèle : Skylotec CONREST, SAN-9100, EN 1497:2007, 9,1 kg, charge maximale 150 kg. Brancard court
qui maintient la tête, le dos et le bassin.

- Dessin d'après les photos : brancard souple noir à rabats latéraux, plaque de glisse dessous,
  plaque de tête rigide à poignées orange, sac à pieds noir à bande réfléchissante jaune, sangles
  noires et grises sur le torse, le bassin et les jambes ; de près : boucles des sangles, boucles de
  bras, points d'ancrage marqués en orange, étiquette blanche du sac. Mannequin en combinaison
  orange, cagoule jaune fluo à bande grise, harnais sur la combinaison, bras croisés.
- Deux modes de levage. À l'horizontale par la patte d'oie : deux brins de corde avec leurs
  bloqueurs orange vers la tête et le torse, une sangle noire vers le sac à pieds, réunis sur un
  anneau. À la verticale par la sangle en tête. Posé sans rien d'accroché, la patte d'oie repose sur
  le mannequin.
- Encombrement : 1,9 m sur 0,5 m. À la verticale, l'empreinte (0,59 × 0,31 m) passe la trappe de
  0,80 × 1,00 m ; à l'horizontale non (alerte).
- Un seul maillage (un appel de dessin en plus) : 1 444 triangles de loin, 3 532 de près.

Dans le module :
- outil « Brancard » de l'onglet Placer : un toucher sur un pont le pose à plat (l'anneau à
  0,916 m au-dessus du pont), sur une paroi il le suspend devant, sur la trappe ouverte il le passe
  dessous à la verticale ; dans la nacelle comme ailleurs. Un brancard au plus par étape ;
- choix du mode (horizontale, patte d'oie ; verticale, sangle en tête), « Posé au sol »,
  orientation, hauteur, accompagnateur (un technicien de l'étape, longé à son anneau), masse de la
  victime avec deux préréglages : mannequin 40 kg, victime réelle 100 kg ;
- onglet Matériel : corde de levage et corde d'assurance (ancrage, Y, fractionnements et déviateurs,
  comme les cordes d'un technicien), ligne de guidage du pied du brancard vers un ancrage ou tenue
  par un technicien ; les mouflages (3:1, 5:1, 9:1, Jag 4:1) peuvent hisser le brancard ;
- depuis la nacelle, ses cordes passent la trappe et descendent jusqu'au pont ou à la mer comme celles
  d'un technicien ;
- sur la timeline, le brancard se déplace et bascule : d'une étape à l'horizontale à une étape à la
  verticale, il pivote autour de son anneau ;
- deux exemples complets (onglet Placer, « Évacuation d'un blessé ») : depuis la plateforme du boat
  landing (pont sondé sur le modèle ; patte d'oie, Y A1–A2, assurance sur A3, Jag 4:1, accompagnateur,
  ligne de guidage, descente devant le boat landing) et par la trappe de la nacelle (à la verticale,
  Jag 4:1 sur un œil, descente le long de la tour jusqu'au pont ou à 3 m de la mer selon le cap).

3. Charges et calculs
---------------------

Charge du brancard = victime + brancard + accompagnateur (à la masse de calcul, 100 kg), × g, sans
coefficient. Elle s'applique à ses cordes (effort par brin d'un Y, déviateurs), à leurs ancrages, à
la chaîne d'assurage, au mouflage qui le hisse et à la chute sur sa corde d'assurance. Alertes :
victime au-delà de la charge maximale (150 kg) ; brancard suspendu sans corde, ou sur une seule ;
brancard à l'horizontale par la trappe ; corde du brancard par une trappe fermée ; accompagnateur
absent de l'étape ; chute sur la corde d'assurance au-delà de 6 kN. Un accompagnateur longé au
brancard n'a pas l'alerte « aucune corde » : il pend sur celles du brancard.

Vérification à la main (g = 9,81 ; Jag 4:1, rendement 0,91 par réa, avantage
0,91 + 0,91² + 0,91³ + 0,91⁴ = 3,1774 ; effort sur l'ancrage du Jag = 4,1774 × effort de hissage ;
chute de facteur 0,3 sur la corde d'assurance, raideur 0,981 / 0,035 = 28,03 kN,
F = W·(1 + √(1 + 2 × 0,3 × 28,03 / W))) :

    cas                                  masse      W         hissage Jag          ancrage Jag   chute
    mannequin + brancard                 49,1 kg    0,482 kN  0,152 kN (15,5 kg)   0,633 kN      3,37 kN
    mannequin + brancard + accomp.      149,1 kg    1,463 kN  0,460 kN (46,9 kg)   1,923 kN      6,63 kN  > 6
    victime réelle + brancard           109,1 kg    1,070 kN  0,337 kN (34,3 kg)   1,407 kN      5,45 kN
    victime réelle + brancard + accomp. 209,1 kg    2,051 kN  0,646 kN (65,8 kg)   2,697 kN      8,27 kN  > 6

Le test privé (tests/lot12.test.mjs) retrouve ces valeurs au millionième dans les fonctions du module.
À noter pour la formation : avec l'accompagnateur, une chute de facteur 0,3 sur la corde d'assurance
dépasse les 6 kN dès le mannequin (le modèle de Wexler majore, il ignore ce qu'absorbent nœuds, harnais
et corps).

4. Correctif du lot 6c : toucher sur un œil d'ancrage de la nacelle
-------------------------------------------------------------------

Cause : l'œil est un anneau de 9 cm sous la poutre. Un toucher visé sur son centre passait par le trou
de l'anneau ; selon l'angle, le rayon frôlait le dessous de la poutre (point à moins de 30 cm de l'œil :
aimanté) ou passait dessous et touchait plus loin (pas d'aimantation).
Correctif : les œils sont pris sur le rayon lui-même. Le plus proche à moins de 12 cm du rayon, devant
la caméra et pas derrière ce que le rayon touche en premier, est retenu.
Preuves : test privé, 10 positions de caméra par œil (dont 4 à hauteur du dessous de la poutre, le
cas rasant), 40 touchers sur 40, aucune aimantation à 25 cm d'un œil ni sur le plancher ; au banc
(harnais, même méthode que le lot 6c), voir plus bas.

5. Budget et mode allégé
------------------------

- Module Cordes scellé : 157 028 octets (115 596 au lot 11), sous le plafond de 200 000 du test :
  le plafond actuel suffit, pas de nouveau plafond à proposer. Module Levage inchangé (75 308).
- Code de base (page et worker) identique octet pour octet au lot 11 ; seule la ressource
  /modules/ropes change dans le coffre.
- Appels de dessin du module : un pour tout le matériel, un par technicien, un pour le brancard.
  Détail fin construit seulement à moins de 9 m (techniciens) ou 10 m (brancard) de la caméra,
  retiré 2 m plus loin, jamais en mode léger.
- Mode léger du module (téléphone, mode allégé, matériel faible) : moins de segments, aucun détail
  fin.
