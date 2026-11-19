# 3D : module Cordes v2 (lot 6b)

Sur `/3D/test/`, le module Cordes (lot 6) intègre les réponses de Quentin :

- un nouveau mouflage, le Jag System ;
- des grillons en deux longueurs ;
- la chaîne d'assurage, élément par élément, avec ses marges ;
- un cas de secours à deux personnes ;
- la force de choc d'une chute.

Le module reste un outil pédagogique. Il ne remplace ni la formation ni le plan de sauvetage.

## Confirmé par Quentin

- Technicien équipé : 100 kg.
- Seuils du Y : avertissement à partir de 90°, alerte à partir de 120°.

Ces trois valeurs ne portent plus la mention « à confirmer ». Elles sont marquées « confirmé » dans les réglages.

## Mouflage Petzl Jag System

- 4:1, réas sur roulement à billes, longueur déployée de 1, 2 ou 5 m, au choix dans l'onglet Matériel.
- Montage modélisé : deux poulies doubles, le bout de la corde sur la poulie d'ancrage, et le brin de hissage qui sort de la poulie d'ancrage. Quatre brins portent donc la poulie de charge.
  - Charge = H × (η + η² + η³ + η⁴) : 4 sans pertes.
  - Avec η = 0,91 : 0,91 + 0,8281 + 0,753571 + 0,68574961 = 3,177, soit 3,18:1 réel.
- **Rendement : 0,91 par réa**, valeur de la fiche technique Petzl du Jag System (« efficiency 91 % »). La même fiche donne une résistance de 16 kN, reprise comme résistance du Jag dans la chaîne d'assurage.
- À confirmer : la fiche ne dit pas si les 91 % valent par réa ou pour le système. Le module les applique à chaque réa, ce qui est le cas le plus prudent. Appliqués au système entier, ils donneraient 3,64:1.
- Le calcul affiche aussi l'effort sur l'ancrage et le nombre de reprises. Exemple : 5,1 m à hisser avec un Jag de 5 m demandent 2 reprises.
- Les autres mouflages (3:1, 5:1 complexe, 9:1) ne changent pas. Leur rendement de 0,9 reste « à confirmer ».

## Grillons : 2 m ou 5 m

- La longueur se choisit par deux boutons (2 m, 5 m), à la place de la plage réglable.
- Un grillon neuf prend 2 m si l'ancrage est à portée, 5 m sinon.
- Les scénarios enregistrés avant ce lot sont convertis à l'ouverture, à la longueur la plus proche : jusqu'à 3,5 m, ils passent à 2 m ; au-delà, à 5 m.

## Chaîne d'assurage

Pour chaque corde, chaque grillon, chaque main courante et chaque mouflage, l'onglet Calculs liste les éléments de la chaîne :

- ancrage ;
- sangle en tête d'alouette ;
- connecteur ;
- corde avec son nœud ;
- appareil (descendeur ou antichute) ;
- longe ;
- Jag.

Pour chaque élément, il donne la résistance, l'effort statique, l'effort en chute et la marge (résistance / effort). Le maillon le plus faible est signalé.

Effort selon l'angle :

- **Brin de Y** : F / (2·cos(θ/2)). À 160°, 1 / (2 × cos 80°) = 2,88 F.
  - 1 technicien (0,98 kN) : 2,82 kN par brin.
  - Secours à 2 (200 kg, 1,962 kN) : 5,65 kN par brin. Une sangle de 16 kN y garde une marge de 2,83.
- **Déviateur** : 2·F·sin(δ/2).
- **Ancrage de main courante** : la tension de la corde, T = F·√(f² + (L/2)²) / (2f).
- **Mouflage** : l'ancrage reprend la charge et l'effort de hissage. Pour le Jag sans pertes : 4 + 1 = 5 fois l'effort de hissage.
- **Fractionnement** : son ancrage prend toute la charge. L'ancrage de tête aussi, par prudence, s'il devait reprendre la charge.
- **Ancrage partagé** : compté chaîne par chaîne, sans cumul, puisqu'une seule chaîne est chargée à la fois. Cette hypothèse est à confirmer.

Chaque ancrage peut recevoir sa propre résistance (onglet Matériel, « Résistance des ancrages »), par exemple un anneau de levage plus faible.

Résistances par défaut, toutes « à confirmer » sauf celle du Jag :

| Élément | Défaut |
| --- | --- |
| Ancrage | 15 kN, le minimum de l'ICOP IRATA |
| Sangle en tête d'alouette | 16 kN, l'exemple de Quentin |
| Connecteur | 22 kN |
| Corde avec son nœud | 15 kN |
| Appareil | 15 kN |
| Longe | 15 kN |
| Jag | 16 kN, fiche Petzl |

## Secours à 2 personnes

- Chaque étape peut passer en « Secours à 2 personnes » (onglet Calculs). Toutes les charges y sont doublées : 200 kg avec le technicien de 100 kg.
- L'exemple gagne une 5ᵉ étape de secours. Un sauveteur, non dessiné, descend T1 sur ses cordes.
- Les alertes s'y allument :
  - force de choc de 8,0 kN sur la corde de secours, au-delà de 6 kN ;
  - maillon le plus faible : l'ancrage de la corde de secours, avec une marge de 1,9.

## Force de choc d'une chute

Méthode : modèle élastique linéaire de Wexler (« The theory of belaying », American Alpine Journal, 1950). C'est la base du calcul de la force de choc UIAA.

F = W · (1 + √(1 + 2 · f · EA / W)), avec :

- W, le poids qui tombe ;
- f, le facteur de chute ;
- EA, la raideur de la corde ou de la longe, tirée de son élongation sous une charge de référence : EA = charge / élongation.

Le modèle néglige ce qu'absorbent les nœuds, le harnais, le corps et le glissement des appareils. Il majore donc la force, ce qui va dans le sens de la sécurité.

Valeurs par défaut, toutes « à confirmer » :

- **Corde de secours** : élongation de 3,5 % sous 0,981 kN (mesure EN 1891, de 50 à 150 kg), facteur de chute de 0,3. Pour 100 kg, F = 5,16 kN ; pour 200 kg, 8,03 kN.
- **Grillon** : élongation de 8 % sous 0,785 kN (corde dynamique, 80 kg), facteur 1. Pour 100 kg, F = 5,48 kN.

La force de choc s'applique à toute la chaîne de la corde de secours, ou du grillon, et se répartit dans le Y et les déviateurs comme la charge statique. La corde de travail est comptée en statique.

## Règles IRATA appliquées

Source : code de pratique IRATA (ICOP).

- **Force de choc** : 6 kN au plus sur le technicien. Au-delà, alerte.
- **Marge** : l'ICOP fixe 15 kN par ancrage, soit un coefficient de 2,5 sur ces 6 kN. Le module applique ce coefficient à chaque élément : sous une marge de 2,5, le maillon le plus faible passe en alerte, dans la liste des alertes et sur la scène.

Le maillon le plus faible est toujours affiché dans l'onglet Calculs, même sans alerte.

Ces deux seuils sont réglables, avec la mention « IRATA ICOP ».

## Preuves

### Calculs vérifiés contre des cas faits à la main

Dans la suite privée, cinq nouveaux tests :

- **Y à 160°** :
  - 1 / (2 × cos 80°) = 2,8794 fois la charge ;
  - 200 kg (1,962 kN) : 5,649 kN par brin, directement et à travers la chaîne d'assurage, avec un Y construit à 160° par sa géométrie ;
  - 1 technicien : la moitié.
- **Jag** :
  - 4:1 sans pertes ;
  - 3,17742061:1 avec 0,91 par réa ;
  - brins de 1 ; 0,91 ; 0,8281 ; 0,753571 ; 0,68574961 ;
  - équilibre de l'ancrage, 4 + 1 = 5 ;
  - effort de hissage et nombre de reprises.
- **Force de choc** :
  - facteur 1 : 8,461 kN ;
  - facteur 0 : deux fois le poids ;
  - corde de secours à 0,3 : 5,160 kN ;
  - grillon à 1 : 5,477 kN ;
  - corde plus raide ou facteur plus fort : force plus forte.
- **Chaîne** :
  - ancrage faible signalé en alerte ;
  - grillon (ancrage, connecteur, longe) ;
  - main courante (la tension sur chaque ancrage) ;
  - déviateur (2·F·sin(δ/2)) ;
  - alerte de force de choc à 200 kg ;
  - aucune alerte quand tout tient.
- **Enregistrement** :
  - grillons convertis en 2 m ou 5 m ;
  - Jag limité à 1, 2 ou 5 m ;
  - drapeau de secours et résistances d'ancrage contrôlés ;
  - réglages d'avant ce lot complétés par les valeurs par défaut.

### Dans l'app scellée

Captures PC (1280 × 800) et téléphone (Pixel 7), gardées hors du dépôt :

- grillons 2 m / 5 m ;
- chaîne d'assurage à l'étape 2 ;
- étape de secours avec ses deux alertes ;
- Jag de 5 m ajouté à l'étape 4 (matériel et calculs) ;
- réglages ;
- en mode allégé du téléphone (`?safe=1`), l'étape de secours.

Aucune erreur console, et la fermeture du module ne laisse rien derrière elle.

### Socle identique au pixel, module fermé

- À instant figé, calques HTML masqués : 0 pixel de différence avec `main`, sur PC et sur téléphone, que le module n'ait jamais été ouvert ou qu'il ait été ouvert puis refermé. Le plancher `main` contre `main` est aussi à 0.
- L'interface hors 3D est identique.
- Le code de l'app est identique octet pour octet à `main` (même index, même worker, mêmes styles). Seule change la ressource chiffrée du module Cordes : 77 276 → 91 814 octets, chargée seulement à l'ouverture.

### Budget

Dans le moteur, scénario complet : trois techniciens, Y, déviateur, main courante, grillons et mouflage, ici un Jag.

- **Draw calls** : 86, comme avec le module du lot 6 (un 3:1 à la place du Jag).
- **Triangles** : +32 par image, ombres et reflets compris. Le Jag a quatre brins au lieu de trois.
- **Module fermé** : rien ne change.

### Mode allégé du téléphone

En `?safe=1` (rendu `safe-dom-dpr1`), le module s'ouvre et calcule l'étape de secours avec les mêmes alertes, sans erreur console.

### Contrôles habituels

- **Suite privée** : 190 tests, tous verts.
- **Lint public** : 0 erreur.
- **Build** : OK, et `dist/3D` est identique à `public/3D`.
- **Coffre** : identifiant, sel, itérations et contrôle inchangés ; seule l'entrée `runtime` change.
- **Archive `source-3d/`** : rafraîchie (même coffre d'archive, IV neuf, 310 fichiers). Elle se restaure à l'identique.
- **Mot de passe** : absent du dépôt et des commits.

### Banc

À 2560 × 1600 (DPR 2), le rendu logiciel du banc a livré des vues 3D noires une fois sur deux sur PC. Les captures sont donc faites à DPR 1, comme au lot 6 : aucune vue noire. Le code de rendu étant identique à `main`, ce n'est pas un effet du lot, mais `main` n'a pas été mesuré dans cette configuration.

## Limites

- Statique et élastique : pas de glissement des appareils, pas d'absorbeur, pas de frottement sur les arêtes.
- Le sauveteur du cas de secours n'est pas dessiné : seule la charge change.
- Le rendement du Jag s'applique à chaque réa (voir plus haut).
- La fluidité n'a pas été vérifiée sur un vrai appareil : le banc rend sans GPU.
