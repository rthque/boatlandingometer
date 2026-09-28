# TEST — Tether line, mesures, houle et accès sobre

Ce dossier contient la source du nouveau cycle `/3D/test/`. La promotion du TEST visuel validé vers `/3D/` a été livrée séparément dans la PR #3. Ne pas remplacer la production avec ce cycle sans validation.

## Comportement

- Corde rouge de diamètre géométrique 14 mm, conservé du modèle précédent. Cosse, manchon, bride et matériaux conservés ; terminaison orientée vers le haut, plus de bout libre sous le clamp.
- Œil du clamp : 3,50 m LAT provisoire, cote fournie par le propriétaire. Extrémité haute : `(0,059 ; 22,48 ; 15,05)` m dans le repère de scène, sur la partie basse du crochet sous le SRL, identifiée visuellement sur la CAO. Identification et position à confirmer (ordre de grandeur ±5 cm). Courbure discrète, déport maximal ajouté 9 cm transversal / 7 cm vers l'avant ; pas de simulation d'effort.
- Aucun recalage du jacket : `Y_LAT = Y_STEP / 1000 + 0,4445 m`, hypothèse existante, non certifiée. L'alignement modèle/LAT reste à valider.
- Vue BL élargie pour inclure le SRL. Vue Tether oblique avant bâbord, œil dégagé. WC59 en poussée, affiché par défaut ; opacité 10 % en BL / 5,5 % en Tether pour la lecture. Collisions caméra conservées.
- Le diamètre réel de la corde n'est pas modifié. Comme les garde-corps validés, sa couverture visuelle minimale est stabilisée à distance (1,4 pixel physique, expansion de rayon plafonnée à 3 cm). Aucun déplacement de la géométrie utilisée pour les mesures.

## Mesures

Bouton règle, Distance ou Surface. Tap/clic = ajouter ; glisser = naviguer ; glisser un point existant = déplacer sur la surface. Deux doigts continuent à naviguer. Échap ferme le panneau en conservant les annotations. On peut réutiliser un point enregistré en le touchant sans le déplacer. Terminer conserve la mesure et commence un tracé vide.

Les mesures vivent uniquement dans la mémoire de l'onglet : aucune transmission, aucun enregistrement distant ou local persistant. Rechargement/déconnexion = perte des mesures. La copie est déclenchée explicitement par l'utilisateur et reste dans son presse-papiers. Les appels météo existants ne reçoivent aucune coordonnée de mesure.

- **Distance** : longueur 3D de segments droits, pas une longueur géodésique sur l'acier ; somme de polyligne, ΔZ signé et cote LAT de chaque point, affichage à deux décimales.
- **Surface** : polygone simple, fermeture par P1 ou Terminer. Aire dans le plan de Newell et périmètre 3D ; croisements/points alignés refusés. En cas de non-planéité, l'interface indique une aire projetée et l'écart au plan. Ce n'est pas une aire développée sur une surface courbe.
- **Peinture** : cercle ajusté aux intersections géométriques de la section du tube, avec rejet des plaques, coins et sections insuffisamment observées. Vérification par 24 sondes autour de la section. Deux points sur des cylindres compatibles donnent diamètre approximatif, circonférence et aire de bande complète, sans déduction des colliers ni obstacles. La continuité du tube entre points doit être vérifiée. Pour un tube incliné, longueur axiale = ΔLAT / |axe vertical| ; pas de proposition pour les tubes quasi horizontaux.
- **Aimantation** : arêtes franches (dièdre ≥30°) et sommets proches, rayon de 9 pixels CSS, surface visible. Diagonales de triangulation lisse exclues. Le maillage métrique est l'autorité ; l'amplification visuelle des éléments fins n'entre pas dans les mesures.
- **Loupe tactile** : agrandissement de l'image déjà affichée, sans second moteur 3D. En mode safe, copie immédiatement après le dessin avant l'effacement du tampon. Aucun OffscreenCanvas ajouté au mode safe.
- Les annotations restent visibles en naviguant ; les points masqués par la structure sont indiqués en pointillés. Le panneau liste les mesures, avec suppression individuelle, annulation, effacement et copie. Interface FR/EN.
- Si le modèle de secours est remplacé par le vrai modèle après la pose de points, ces mesures sont effacées avec un message : leurs surfaces de référence ont changé.

## Houle et données horaires

- Même point Open-Meteo (50,179694 N ; 1,172528 E), mêmes maxima séparés de Hs / vent / rafales de 08 à 18 h. Ajout de `wave_direction` à `wave_height,wave_period` et de `timeformat=unixtime`. Les maxima restent calculés par heure locale `Europe/Paris` ; la sélection horaire utilise les instants UTC, sans ambiguïté lors de l'heure répétée en octobre.
- La houle lit Hs, période et direction de l'heure affichée, jamais le maximum 08–18 h. Pas d'extrapolation hors d'une heure effectivement reçue. Une Hs nulle produit une mer plane ; une valeur absente n'est pas remplacée par une prévision artificielle.
- Douze composantes à phases différentes, fréquences irrégulièrement espacées et étalement directionnel. La variance spectrale est normalisée à `(Hs/4)²`. Interférences et groupes donnent des vagues variées et de rares grandes vagues proches de Hmax estimée. Aucun événement extrême artificiellement ajouté ; Hmax = 1,86 × Hs n'est ni un plafond ni une prévision de vague individuelle. C'est une approximation spectrale légère, pas le spectre complet de l'API ni une simulation hydrodynamique.
- Contrôle numérique sur 2 h, entrée de test Hs=2 m / T=7 s : Hs restituée 2,003 m, niveau moyen −0,00015 m, plus grande vague par passages ascendants 3,554 m pour Hmax estimée 3,72 m. Ces valeurs sont des entrées de test, jamais des données météo affichées par le site.
- La mer reste positionnée à la marée ; seules ses oscillations visuelles varient. Hauteur affichée, ligne peinte, clics, mesures et créneaux sont inchangés. Phases bornées et transition courte entre heures, sans saut de phase lors d'un changement de période.
- Calcul de déplacement et normales dans les shaders de l'eau existante, y compris en mode `safe=1`. Aucune modification du maillage par frame, aucun nouveau post-traitement ni moteur. Respect de la réduction des animations. Mouvement décoratif du CTV atténué par mer calme ; pas de modèle de réponse du navire.
- Sans prévision : petite ondulation neutre (borne analytique <7 cm), mention « Houle : pas de données pour cette date ». Si seule la période/direction manque, cadence/orientation de présentation ; valeurs inconnues affichées « — ». Ni curseur de houle, ni valeur météo inventée. Le bouton Houle du rail et le réglage existant commandent le même état.
- **Orientation à valider** : direction d'origine Open-Meteo appliquée avec nord = −Z et est = +X dans la scène. L'azimut géographique du jacket n'est pas connu ; il n'est pas présenté comme calé. Dispersion d'eau profonde illustrative, sans bathymétrie, courant ni déferlement.

Références : [Open-Meteo Marine API](https://open-meteo.com/en/docs/marine-weather-api) (horodatage, unités et direction d'origine) ; [NOAA/NDBC](https://www.ndbc.noaa.gov/faq/wavecalc.shtml) (Hs spectrale) ; [NOAA — distribution des vagues](https://www.vos.noaa.gov/MWL/aug_05/nws.shtml). Sources consultées le 28 septembre 2026.

## Connexion

Logo, Mot de passe, Se souvenir sur cet appareil, Entrer, FR/EN uniquement (et retour d'erreur si nécessaire). Titre initial et hydraté « Boatlandingometer 3D », sans localisation. Suppression des titres et textes d'introduction. Aucune modification de la dérivation de clé, des ressources ou de l'accès mémorisé.

## Accès et déploiement

Les sept ressources chiffrées et le manifeste sont repris octet pour octet du TEST validé. Même AES-GCM, PBKDF2 600 000 itérations, même mot de passe, même accès mémorisé. Aucun mot de passe ni GLB en clair dans la source, le build ou le ZIP.

1. Installer les dépendances avec le lockfile fourni.
2. `npm run typecheck`
3. `npm run build:test` → `out-test/` (base Vite `/3D/test/`).
4. Remplacer uniquement le contenu de `public/3D/test/` dans le dépôt principal ; supprimer les anciens bundles hachés devenus inutiles.
5. Conserver `/3D/`, `/3d/index.html`, `/3d/test/index.html`, le site principal et `.github/workflows/deploy.yml`.

La PR TEST est basée sur la branche `main` après la promotion #3 ; elle ne change aucun fichier de production. Ne pas exécuter `build:pages` pour livrer ce cycle sans validation préalable.

## Contrôles et limites

58 tests automatisés réussis, dont mesures 3D, polygones concaves/non plans, rejet des croisements, détection/rejet de cylindres, déplacement de points, fermeture par P1, tests sur le vrai GLB déchiffré en mémoire, visibilité de l'œil en BL/Tether, caméras hors WC59, chiffrements et mécanismes de récupération existants. TypeScript et build Vite vérifiés.

Exemple de contrôle sur le vrai tube BL : diamètre maillé ajusté ≈0,4504 m aux cotes 3,50 et 7,80 m. Il ne s'agit pas d'un diamètre nominal de fabrication certifié. Sur 96 échantillons intérieurs du cordage, distance minimale au jacket ≈0,106 m (hors terminaison et assemblage clamp ajouté).

Le navigateur de contrôle n'a pas WebGL disponible. Les interactions, traductions et formats 390×844 / 1200×844 ont été contrôlés dans le navigateur sur des composants réels et un banc de solides synthétiques. Le repli 2D du site reste fonctionnel. Les images du jacket avec WC59 sont des rendus géométriques Mesa EGL : pas des captures du rendu Three.js final, ni une mesure de performance mobile. Validation GPU et confort tactile sur le téléphone réel à poursuivre dans ce TEST ; 60 fps non mesurés ici.

### Contrôles complémentaires C / D

- Sélection horaire et maxima, absence de données, Hs=0, automne/printemps Europe/Paris, variance/dispersion des vagues, normales analytiques : 6 tests supplémentaires, 58 au total.
- Shaders réellement injectés dans Water / MeshPhong : compilation et édition de liens en OpenGL ES 3 via Mesa EGL, réussies pour normal et safe. Cela ne remplace pas la validation WebGL dans Chrome sur un téléphone.
- Navigateur : accès FR/EN, titre neutre, mise en page 390×844 / 1200×844 ; bouton Houle sans changement de marée ; date passée → absence de données ; heure 13:05 puis 08:04 → prévisions horaires différentes, maxima de journée inchangés. Repli 2D et clics encore fonctionnels. Aucune erreur applicative observée (messages de l'extension du navigateur exclus).
- Captures `login-phone.jpg`, `sea-no-data-phone.jpg`, `sea-hourly-desktop.jpg` : interface réelle en prévisualisation locale ; pour les deux captures marines, rendu de secours 2D, pas une preuve du rendu de houle 3D. Le navigateur de contrôle ne dispose toujours pas de WebGL. Les 60 fps sur téléphone restent à mesurer.
