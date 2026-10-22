# 3D TEST — grue de pont ajoutée, instruments du pont supérieur retirés

Version TEST (`/3D/test/`) uniquement. Même coffre (identifiant, sel,
contrôle), même mot de passe. Seul le modèle de la fondation est rechiffré,
avec un IV neuf. Les autres ressources chiffrées sont reprises octet pour
octet. Le runtime est rescellé parce qu'il porte la liste des ressources ; son
code est identique, déchiffré et comparé en mémoire.

## Instruments retirés

Les équipements techniques gris fixés aux garde-corps du pont supérieur
(niveau 28,9 m LAT, autour du fût) sont retirés du modèle :

- trois cornes de brume ;
- trois coffrets à panneau incliné ;
- deux mâts avec boîtier sur bras ;
- une armoire ;
- un feu à dôme.

Avec eux partent leur visserie, leurs colliers et leurs presse-étoupe, soit
38 600 triangles. Le tri se fait par pièce (composante connexe du maillage),
dans l'emprise de chaque équipement. Une pièce de plus de 1,7 m n'est jamais
retirée.

Restent intacts :

- les garde-corps ;
- les panneaux FOU et leurs cadres ;
- les tiges orange ;
- l'échelle et son davit ;
- les colliers de câbles du fût.

## Grue de pont

Grue à flèche fixe et orientation manuelle, d'après la fiche de
caractéristiques du fabricant :

- charge de 1 t à 8,08 m de portée ;
- 5,585 m de l'embase au sommet de la tête ;
- tête d'orientation avec treuil ;
- flèche-caisson effilée, raidie à la racine par une jambe de force et un
  gousset ;
- tête inclinée sur le réa, câble, moufle rouge et crochet ;
- ligne de guidage rouge sous la flèche ;
- coffret électrique sur le fût ;
- manivelle d'orientation.

**Position.** L'embase repose sur le moignon de fût déjà présent dans le
modèle (Ø 0,47 m, sommet à 24,76 m LAT). Il est au centre de la plateforme en
saillie du pont inférieur, à 2 m du bord qui porte le panneau FOU. C'est le
cadre gris visible au pied de la grue sur la photo prise depuis le pont.

**Orientation.** La flèche est rangée au-dessus de la zone de dépose, comme
sur la vue de dessus : à l'intérieur du garde-corps extérieur, qu'elle longe
en s'en écartant de 9° vers le pont. Elle dégage la structure de 0,9 m au
plus près, à la queue de flèche au-dessus du garde-corps arrière. Le crochet
pend près de l'échelle du davit, comme sur la photo.

La grue est ajoutée en maillages séparés, avec les matériaux existants (acier
jaune, repères rouges, sombre, signalétique claire). Elle reçoit donc le même
traitement visuel que le reste de la structure et fait partie des collisions
de la caméra.

## Vérification

- **Tests** : suite complète 83/83, dont 3 nouveaux sur le modèle chiffré :
  - grue posée sur le moignon, 5,585 m de hauteur, moufle à 8,08 m de l'axe ;
  - flèche dégagée de la structure ;
  - aucun équipement compact restant sur le pont supérieur ; garde-corps et
    lettres FOU présents.

  Le test des équipements échoue sur l'ancien modèle et passe sur le nouveau.
- **Rendus du moteur de l'app**, avant/après :
  - le pont supérieur, sous les angles des captures annotées ;
  - la grue depuis le pont, de dessus, depuis la mer et dans l'ensemble.
- **Modèle** : 4,20 Mo au lieu de 3,85 Mo. Le modèle compte 345 800
  triangles au lieu de 383 800 ; le fichier grossit parce qu'il est recompressé
  sans le filtre de normales d'origine.
