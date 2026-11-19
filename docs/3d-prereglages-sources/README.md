# Lot 1c — préréglages météo recalés sur une source

Les préréglages météo du lot 1a ont été recalés sur le climat de houle du site. La mer de chaque
préréglage vient maintenant d'une source citée. Le vent, le ciel et la pluie restent « à confirmer ».
Tout est dans `/3D/test/` seulement.

## Source

« Hydrodynamisme, dynamique hydrosédimentaire et géomorphologie, synthèse d'études », avril 2015.
La section 3.2 (p. 9) s'appuie sur la base de données de houle ANEMOC et sur une modélisation
côtière. Le superviseur a trouvé le document, l'a ouvert et l'a lu, et il en a transmis les valeurs.
Elle est citée ici, comme dans l'app, par son titre générique et sa date seulement (règle 8).

Valeurs reprises :

| Grandeur | Valeur au site |
| --- | --- |
| Hs moyenne, climat normal | 0,80 m |
| Hs dépassée 10 % du temps | 1,9 m |
| Hiver (octobre à mars) | Hs au-delà de 5 m, période de l'ordre de 12 s |
| Hs de retour 10 ans | 5,5 à 6,5 m |
| Hs de retour 100 ans | environ 7,7 m (plus de 8 m sur un haut-fond voisin) |
| Houle dominante | secteur ouest |
| Courant de marée, coefficient 115 | jusqu'à 0,70 à 1,12 m/s, vers le nord-est au flot et le sud-ouest au jusant |

La source ne donne pas le vent.

## Préréglages

Chaque valeur porte son origine dans le code (`prov` dans `lib/weather-choice.ts`). Il y en a trois :

- **source** : la valeur vient de la synthèse ;
- **déduite** : la valeur est calculée à partir d'une valeur sourcée, par la méthode du lot 1a ;
- **à confirmer** : la source ne donne pas la valeur.

| Préréglage | Hs | Tp | Houle | Vent (à confirmer) | Origine de la mer |
| --- | --- | --- | --- | --- | --- |
| Beau temps, mer d'huile | 0 | — | — | 1,2 m/s du NE | état de référence, à confirmer |
| Mer courante | 0,8 m | 4,0 s | ouest | 7 m/s, Beaufort 4 | Hs : source · Tp : à confirmer |
| Limite de transfert | 1,5 m | 5,5 s | ouest | 12 m/s, Beaufort 6 | seuils 🛑 de l'app, à confirmer |
| Mer agitée | 1,9 m | 6,0 s | ouest | 14 m/s, Beaufort 7 | Hs : source · Tp : à confirmer |
| Tempête d'hiver | 5 m | 12 s | ouest | 26 m/s, Beaufort 10 | Hs et Tp : source |
| Tempête décennale | 6 m | 12 s | ouest | 29 m/s, Beaufort 11 | Hs et Tp : source |
| Tempête extrême, centennale | 7,7 m | 12,5 s | ouest | 33 m/s, Beaufort 12 | Hs : source · Tp : déduite |

Les choix faits sur ces valeurs :

- **Les cinq valeurs demandées perdent la mention « à confirmer »** : 0,8 m, 1,9 m, 5 m et 12 s, 6 m,
  et 7,7 m avec sa période. La direction ouest (270°) remplace l'ouest-sud-ouest du lot 1a, parce que
  c'est le secteur que donne la source.
- **Hs décennale de 6 m** : c'est le milieu de la fourchette de 5,5 à 6,5 m.
- **Période** : la source ne précise pas de quelle période il s'agit. Ses 12 s sont prises comme
  période pic Tp, celle que pilotent les préréglages. La période moyenne affichée en découle par le
  spectre JONSWAP, comme au lot 1a.
- **Tempête décennale** : la méthode du lot 1a donne Tp = 4,5 √6 = 11,0 s. La période retenue est
  celle de la source, 12 s, que la source donne pour toute mer d'hiver au-delà de 5 m.
- **Tempête centennale** : Tp = 4,5 √7,7 = 12,5 s, arrondi à 0,5 s. C'est le milieu de la fourchette
  de 3,6 √Hs à 5 √Hs que DNV-RP-C205 (§3.5.5) donne pour une mer du vent JONSWAP. Ce résultat est
  au-dessus du plancher de 12 s de la source, donc gardé. Il est marqué « déduite » et non « à confirmer ».
- **Périodes de la mer courante et de la mer agitée** (4,0 s et 6,0 s) : la source n'en donne pas,
  donc elles restent « à confirmer ». Elles sont calculées par la même formule.
- **Préréglages hors source** : le beau temps et la limite de transfert, qui repose sur les seuils
  de l'app (1,5 m et 12 m/s), restent entièrement « à confirmer ». Les préréglages du lot 1a à
  0,5 m, 1,0 m, 3,0 m et 4,5 m sont retirés, faute de source. Il y a toujours 7 préréglages, du
  plus calme au plus fort.
- **Vent, ciel et pluie** : tous à confirmer. Le vent est placé dans la classe de Beaufort que
  demande la mer, dans cette mer à fetch limité. À 33 m/s, la tempête centennale est en force 12 :
  c'est une extrapolation des préréglages précédents, à confirmer avant tout usage. Les intensités de
  pluie restent dans les classes de l'AMS.
- **Classes OMM** : toutes les mers restent dans leur classe de Douglas (OMM-n° 306, code 3700),
  vérifiée par un test.

Dans l'app :

- l'en-tête des préréglages indique « mer : synthèse d'études 2015 · vent à confirmer » ;
- chaque préréglage dit ce qu'il représente et la liste de ce qui reste à confirmer
  (« à confirmer : Tp, vent, ciel, pluie », par exemple) ;
- le bas du sélecteur cite la source en entier ;
- la légende de la mer dit « préréglage sourcé (synthèse 2015) · vent et ciel à confirmer » ;
- la fiche « Sources, repères et limites » gagne une section « Préréglages météo », avec les valeurs
  et la méthode.

## Courant de marée : signalé, non modifié

Sans prévision de courant, ce qui est le cas de tous les préréglages, le pilotage, le levage et les
cordes utilisent l'estimation tirée de la courbe de marée. Cette estimation est proportionnelle à la
vitesse de montée de l'eau et **plafonne à 0,6 nœud, soit 0,31 m/s**. Le plafond est atteint
par deux jours sur trois aux coefficients 80 à 89, et par tous à partir de 90. Par coefficient 115 à 120, elle donne 0,31 m/s.

Le courant de l'app ne dépasse donc pas 1,12 m/s : **il est 2,3 à 3,6 fois plus faible que la source**,
qui donne 0,70 à 1,12 m/s. Le sens est cohérent avec la source : vers 60° vrai au flot (nord-est) et
vers 240° au jusant (sud-ouest). Comme demandé, rien n'est changé. Pour l'aligner sur la source, il
faudrait relever le plafond vers 0,7 à 1,1 m/s par vives-eaux.

Mesure : `bench/tide-current-check.mjs` dans la source privée sur tous les jours de juin 2026 à décembre 2028. La plus
forte montée de l'eau est de 2,9 m/h, au coefficient 120.

## Preuves

- **Tests** : `tests/heading-weather.test.mjs` vérifie :
  - les valeurs de la source et leur origine ;
  - les périodes (12 s au-delà de 5 m, 12,5 s pour la centennale) ;
  - la liste de ce qui reste à confirmer ;
  - les classes de Douglas, de Beaufort et de pluie ;
  - la citation de la source.

  Chaque préréglage produit un spectre dont Hs est exacte.
- **Captures** : chaque préréglage recalé dans l'app scellée, sur PC et sur téléphone, avec le
  sélecteur et la fiche des sources. Elles sont prises par le banc privé et ne sont pas commitées.
- **Contrôles habituels** : suite privée verte, lint public à 0 erreur, build OK, `dist/3D` identique
  à `public/3D`, coffre inchangé hors entrée `runtime`, ressources déchiffrées identiques à `main`,
  archive `source-3d/` rafraîchie (même coffre d'archive, IV neuf).

## Limites

- Le vent, le ciel et la pluie des préréglages ne sont pas sourcés.
- Les Hs de la source sont des valeurs au site. Le haut-fond voisin, où la centennale dépasse 8 m,
  n'est pas représenté.
- Par vent de 29 et 33 m/s (tempêtes décennale et centennale), l'écume existante forme de grandes
  plaques peu réalistes, déjà notées au lot 1a (couverture de Monahan plafonnée à 20 %). Ce lot ne
  la modifie pas ; ces deux vents sont eux-mêmes à confirmer.
- La nature de la période de la source (pic ou moyenne) n'est pas précisée. Si c'était une période
  moyenne, la période pic des tempêtes serait plus longue, vers 14 s.
