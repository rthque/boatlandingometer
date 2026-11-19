# 3D : retouches du CTV (lot 7b)

Quatre retouches demandées par Quentin, sur `/3D/test/`.

## 1. Le nom du navire, repeint sur la coque

- Le nom revient sur les deux bords, comme avant le lot 7 :
  - à l'avant, sur le flanc bleu, en blanc ;
  - à l'arrière, sur la livrée jaune, en noir.
- Même place, même taille, même police (sans empattement, grasse), même couleur.
- Le nom vient de la fiche du modèle, dans la source chiffrée. Il n'est écrit ni dans cette note ni dans les commits.
- L'indicatif et le nom sur le toit, présents avant le lot 7, ne sont pas repeints : la demande porte sur la coque.

Comment il est posé :

- La coque refaite au lot 7 n'est plus tout à fait plane à cet endroit. Chaque nom est donc appliqué sur la surface qu'il recouvre (rétraction), à 12 mm.
  - À 3 mm, les deux derniers caractères du nom avant disparaissaient dans la coque : la simplification de la livraison déplace le flanc d'environ 5 mm. Un lancer de rayons dans le moteur l'a montré, puis a confirmé la correction.
  - Le nom d'avant le lot 7 était, lui, à environ 3 cm de la coque.
- L'occlusion ambiante cuite assombrissait les lettres, dont les îlots de texture sont minuscules. Leurs coordonnées de texture pointent maintenant sur une zone non occultée de la texture, comme il se doit pour une peinture sur un flanc dégagé.

Coût : +888 triangles et le même nombre de maillages (12). Les lettres rejoignent les maillages blanc et noir existants, donc aucun draw call de plus. Le modèle livré pèse 1,05 Mo.

## 2. Les sangles des wingrips en bleu

Les sangles passent de l'orange au bleu (`#1f63d6`), en pilotage comme dans la vue par défaut.

## 3. Wingrips accrochés d'office dans la vue par défaut

- Dans la vue par défaut, le CTV posé au boat landing a ses deux sangles tracées d'office : du chaumard de chaque module, à l'avant du pont, jusqu'à son tube, avec la boucle autour du tube.
- Elles suivent la pose du CTV (houle comprise).
- Elles s'estompent avec lui dans les vues BL et Tether, et disparaissent quand le CTV est masqué.
- En pilotage, rien ne change : le CTV part sans sangles, et il faut les engager (accosté, presque arrêté), comme au lot 7.
- En quittant le pilotage, les sangles d'office reviennent.

## 4. Son de collision en pilotage

Le choc du bow fender sur le boat landing, ou de la coque sur l'acier, sonne selon la vitesse d'impact. Le son est généré (Web Audio) : aucun enregistrement, rien à licencier.

- **Seuil** : 0,08 m/s. En dessous, rien ne sonne. Le travail du fender sur les tubes dans la houle reste au gémissement du caoutchouc, qui existait déjà.
- **Volume** : il monte en décibels avec le logarithme de la vitesse, de −30 dB au seuil au plein niveau à 1,5 m/s.
  - accostage normal, 0,3 m/s : −16,5 dB, discret ;
  - limite « dur », 0,5 m/s : −11,2 dB ;
  - 1 m/s, choc violent : −4,1 dB ;
  - à partir de 1,5 m/s : plein niveau.
- **Timbre** : il s'éclaircit avec la vitesse. Le filtre du bruit s'ouvre, le coup sourd part plus haut et dure plus longtemps.
  - Au-delà du choc dur (0,5 m/s), l'acier du boat landing résonne et la coque craque.
  - Sur l'acier nu, résonance et craquement sonnent dès le seuil.

## Preuves

### Captures avant/après

Les captures sont gardées hors du dépôt. Elles opposent `main` et ce lot, dans le vrai moteur et aux mêmes caméras, sur PC (1024 × 640) et sur téléphone (Pixel 7) :

- le nom, à l'avant et à l'arrière ;
- les sangles bleues des deux bords ;
- la vue d'ensemble ;
- la vue par défaut de l'app scellée, y compris en mode allégé.

L'état des sangles est relevé par le banc. Avant : orange (`#ff8a1f`), masquées dans la vue par défaut. Après : bleues (`#1f63d6`), visibles.

### Son de collision

Tests de la suite privée :

- silence en deçà du seuil (0 ; 0,05 ; 0,08 m/s ; valeurs invalides) ;
- volume, clarté et durée qui croissent avec la vitesse ;
- valeurs faites à la main : 0,3 m/s donne −16,47 dB (gain 0,150) ; 0,5 m/s donne −11,24 dB ; 1 m/s donne −4,15 dB ;
- plein niveau à 1,5 m/s et au-delà ;
- acier nu plus clair, qui résonne et craque dès le seuil ;
- par la chaîne des signaux : 0,07 m/s ne déclenche rien, 0,12 m/s déclenche un choc.

Son réellement rendu dans Chromium (OfflineAudioContext, graphe du pilotage, tous les autres sons au repos), pour 13 vitesses, fender et acier :

- zéro échantillon non nul jusqu'à 0,08 m/s ;
- un niveau efficace qui monte à chaque palier jusqu'à 1,5 m/s, puis plafonne ;
- fender : −49 dB à 0,09 m/s, −35,4 dB à 0,3 m/s, −22,5 dB à 1 m/s, −19,3 dB à 1,5 m/s, le pic passant de 0,12 à 0,87 entre 0,3 et 1,5 m/s ;
- la part des aigus croît aussi avec la vitesse.

### Wingrips

Test de la suite privée :

- sangles bleues ;
- dans la vue par défaut, chaque bande part du chaumard de son module, quelle que soit la pose du CTV, et sa boucle entoure son tube à la même hauteur ;
- estompées avec le CTV, masquées avec lui ;
- en pilotage, absentes tant qu'elles ne sont pas engagées ;
- de retour en quittant le pilotage.

Les tests existants du lot 7 (engagement, tenue, rupture à 8 t) passent sans changement.

### Reste de la scène identique au pixel hors CTV

Dans l'app scellée, à instant figé, calques HTML masqués, `main` contre ce lot, avec un plancher `main` contre `main` à 0 :

- **CTV masqué** (bouton WC59) : 0 pixel de différence en vues FOU, BL et Tether, sur PC et sur téléphone, ainsi qu'en mode allégé.
- **CTV affiché** : les différences restent sur le CTV (nom, sangles, texture d'occlusion re-cuite). En vue Tether, la caméra regarde à travers le CTV estompé, qui couvre tout l'écran : les écarts y sont de 10 niveaux sur 255 au plus.

### Mode allégé

En `?safe=1` sur téléphone : rendu normal, aucune erreur console, et 0 pixel de différence hors CTV.

### Contrôles habituels

- **Suite privée** : 192 tests, tous verts.
- **Lint public** : 0 erreur.
- **Lint de la source privée** : aucune nouvelle erreur.
- **Build** : OK, et `dist/3D` est identique à `public/3D`.
- **Coffre** : identifiant, sel, itérations et contrôle inchangés ; seule l'entrée `runtime` change.
- **Ressources chiffrées** : seul le CTV change parmi les 13 ressources déchiffrées ; il est remis dans le coffre avec un IV et un nom de fichier neufs.
- **Archive `source-3d/`** : rafraîchie (même coffre d'archive, IV neuf, 312 fichiers). Elle se restaure à l'identique.
- **Mot de passe** : absent du dépôt et des commits.
- **Nom du navire** : absent de cette note et des commits.

## Limites

- Le volume réel dépend aussi de la distance à la caméra et du réglage du son, comme les autres sons du pilotage.
- La fluidité n'a pas été vérifiée sur un vrai appareil : le banc rend sans GPU.
