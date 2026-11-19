# 3D : avant du CTV et wingrips (lot 7)

Trois changements sur `/3D/test/` : l'avant des deux coques du CTV, les wingrips
en mode pilotage, et les masses par défaut des sacs du module Levage.

## A. Étrave et avant des coques

L'avant de chaque coque était une face verticale plate. Il est refait d'après
une photo de référence privée (non commitée) :

- étrave élancée : presque verticale sous le bow fender, puis l'arête remonte
  en courbe depuis la quille jusqu'à la proue ;
- sections en V évasé qui se referment vers l'avant : les flancs s'affinent,
  et le bouchain remonte vers la proue ;
- le flanc extérieur monte jusqu'au bord du pont : plus de tablette sous le
  pont à l'avant. Le pont mouillé entre les coques suit leurs flancs.

Sont inchangés : la longueur hors tout, la largeur, la ligne de flottaison de
référence, l'arrière des coques, le bow fender noir et le bastingage.

Aucun nom ni indicatif n'est plus peint sur le modèle : ni sur la coque, ni à
l'arrière, ni sur le toit de la timonerie. Le marquage générique de la zone de
sauvetage reste.

Les deux modules des wingrips sont ajoutés sur le pont avant, de part et
d'autre, juste derrière le bow fender. Ce sont des caissons gris à tambour
rond, comme sur la photo. Les sangles partent d'un chaumard sur leur face
avant.

Le modèle est régénéré par son générateur paramétrique. Avec la même chaîne
d'outils, l'ancien modèle se reconstruit octet pour octet. Le nouveau modèle a
remplacé l'ancien dans le coffre, avec un IV et un nom de fichier neufs. Le
coffre garde son identifiant, son sel et son contrôle.

## B. Wingrips (mode « Prendre la barre »)

- **Engager :** le bouton « Wingrips » apparaît dans la colonne des actions,
  ou s'actionne avec la touche G au clavier. Il est grisé tant que le CTV
  n'est pas accosté : bow fender stable contre le boat landing, centré, droit,
  et vitesse sous 0,25 m/s.
- **Une fois engagés :** une sangle part de chaque module, entoure le tube du
  boat landing de son côté, et se met en tension (prétension de 2 t par
  sangle). Le capitaine peut alors mettre les moteurs au neutre : le bow
  fender reste appuyé, et le CTV reste « Accosté ». La boucle coulisse sur le
  tube, ce qui laisse le navire pilonner librement avec la houle.
- **Rupture :** au-delà de 8 t d'effort cumulé sur les deux sangles (houle,
  recul), les wingrips lâchent. Le panneau affiche alors « Wingrips lâchés ·
  effort X t, au-delà de 8 t ».
- **Relâcher :** le bouton « Relâcher » (ou G) libère les sangles. Le panneau
  affiche « Wingrips relâchés ».
- **Pendant l'engagement :** le panneau indique l'effort en cours, « Wingrips
  engagés · X t sur 8 t ».
- **Visuel :** une bande orange par côté, du chaumard au tube, avec une
  boucle autour du tube. C'est un seul petit maillage, affiché seulement
  quand les wingrips sont engagés.

Valeurs à confirmer par Quentin, toutes regroupées dans le code au même
endroit :

- 8 t appliquées à l'effort cumulé des deux sangles, et non à chaque sangle.
  Les sangles travaillent à environ 46° de l'axe du navire : une traction de
  recul de 55 kN suffit donc pour atteindre 8 t.
- Prétension de 2 t par sangle, et raideur de 600 kN/m par sangle.
- Seuil d'engagement : statut « Accosté » et moins de 0,25 m/s.

Ordres de grandeur obtenus avec ces valeurs, mer calme :

- Gaz au neutre, l'appui sur le boat landing reste d'environ 28 kN.
- Les sangles maintiennent le fender en appui jusqu'à environ 28 kN de
  traction vers l'arrière.
- Elles portent ensuite la charge jusqu'à 8 t.
- Marche arrière à fond, seule : environ 7 t ; elles tiennent. Avec la houle
  en plus, elles lâchent.

## C. Levage : masses par défaut

À l'ouverture du module, et à chaque changement de charge :

- 100 kg dans chaque sac de 240 L, soit 218 kg suspendus avec les sacs vides ;
- 200 kg dans le sac de 580 L, soit 227 kg suspendus.

Les curseurs restent réglables de 0 à 400 kg.

## Preuves

- **Fondation et mer identiques au pixel, CTV masqué** (bouton WC59), rendu à
  instant figé. Résultat : 0 pixel de différence avec `main` dans les vues
  FOU, BL et Tether, sur PC (1024 × 640) et sur téléphone (Pixel 7, mode
  allégé). Le plancher de bruit, `main` contre `main`, est aussi à 0.
- **CTV affiché :** les différences restent dans l'emprise du navire. Hors
  3D, l'interface est identique.
- **Captures avant/après :** mêmes caméras dans le vrai moteur, étrave de
  près (bâbord, trois-quarts avant, sous l'avant entre les coques, tribord),
  sur PC et téléphone. Elles sont gardées hors du dépôt.
- **Budget du CTV :** 12 maillages avant comme après, donc les mêmes draw
  calls (48 par image affichée, ombres comprises, avant et après).
  Triangles : 46 054 avant, 43 064 après (-2 990, soit -6,5 %). Le lettrage
  du nom retiré pèse plus que l'étrave et les modules ajoutés.
- **Sangles :** un seul objet, +4 draw calls par image affichée, et
  seulement pendant l'engagement.
- **Taille du modèle :** fichier de 1 055 Ko au lieu de 1 047 Ko.
- **Tests unitaires des wingrips :**
  - position des tubes et longueur des sangles ;
  - engagement refusé loin du boat landing, au contact pas encore stable, et
    à 0,5 m/s ; accepté une fois accosté ;
  - maintien gaz au neutre avec 6 kN de dérive vers l'arrière : toujours
    accosté, fender toujours en appui. Sans wingrips, la même dérive décolle
    l'étrave ;
  - rupture : 45 kN tenus (moins de 8 t au pic) ; 70 kN arrachent, effort
    signalé entre 8 et 8,8 t ;
  - relâchement : l'étrave repart.
- **Parcours dans le moteur réel** (harnais) : accostage, bouton prêt,
  engagement, puis 40 relevés gaz au neutre, tous « Accosté », appui
  d'environ 28 kN. Ensuite relâchement, sans erreur console. Marche arrière
  à fond : 6,95 t au plus, sangles tenues. Une surcharge forcée (sangles
  raccourcies de 8 cm, dans le banc seulement) les fait lâcher avec le
  message.
- **Dans l'app scellée, au téléphone :** le bouton « Wingrips » apparaît
  dans la colonne des actions, grisé tant que le CTV n'est pas accosté, avec
  son infobulle. La colonne de quatre boutons tient sans chevaucher la carte.
  L'approche automatique du banc n'a pas abouti : le courant estimé a fait
  dériver le CTV de côté, et le script ne corrige pas cet écart. Le banc
  s'est donc arrêté à 16 m. L'engagement et les messages « engagés »,
  « lâchés » et « relâchés » n'ont pas été vus dans l'app elle-même ; ils
  ont été vérifiés dans le moteur réel et dans les tests.
- **Suite privée :** tous les tests passent, y compris ceux du levage
  (masses par défaut).
- **Socle :** lint sans nouvelle erreur.
- **Coffre :** inchangé hors entrée `runtime`. Seuls le modèle du CTV et le
  module Levage changent dans le contenu déchiffré.
- **Archive `source-3d/` :** rafraîchie.

## Limites

- La forme est déduite d'une photo : ce ne sont pas des cotes de chantier.
- Les sangles sont droites et horizontales ; leur poids et leur frottement
  sur le tube sont ignorés.
- Une rupture lâche les deux sangles ensemble.
- La fluidité n'a pas été vérifiée sur un vrai appareil : le banc rend sans
  GPU.
