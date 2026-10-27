# 3D — un build indépendant de son dossier

But : que les prochaines mises en production soient une simple copie de
`public/3D/test/` vers `public/3D/`, sans mot de passe ni rechiffrement.

Cette PR ne touche pas `/3D/`. Elle reconstruit seulement `/3D/test/` avec la
nouvelle règle. Même coffre (identifiant, sel, contrôle), même mot de passe ;
dans le coffre, seul le runtime change.

## Ce qui liait le build à son dossier

Le runtime déchiffré de la version précédente contenait `/3D/test/` en dur à
13 endroits :

- l'URL du worker de rendu ;
- les URL des décodeurs Draco, dans la page et dans le worker ;
- la base des ressources chiffrées (`protected/`), envoyée au worker.

En plus, l'étiquette TEST du HUD était décidée à la compilation. Promouvoir
demandait donc de reconstruire le code pour `/3D/`, puis de le rechiffrer avec
le mot de passe.

La page d'accès et l'éditeur de liens du coffre étaient déjà relatifs : ils
résolvent tout depuis l'adresse de la page.

## Ce qui change

1. **Base relative.** Le code est construit avec une base relative. Le worker
   et les décodeurs sont référencés par rapport au module qui les charge
   (`import.meta.url`). L'éditeur de liens du coffre remplaçait déjà
   `import.meta.url` par l'adresse réelle du module dans le dossier servi : la
   même chaîne fonctionne donc dans les deux dossiers.
2. **Ressources résolues à l'exécution.** Le dossier des ressources est lu
   depuis l'adresse de la page, et non plus figé au build.
3. **Étiquette TEST décidée par l'adresse.** Elle s'affiche quand l'app est
   servie depuis un dossier `test/`, et seulement dans ce cas.

Vérifié sur le runtime déchiffré du nouveau build : **aucune occurrence de
`/3D/`**.

## Preuve : promotion à blanc, hors dépôt

Le nouveau `/3D/test/` a été copié tel quel dans un dossier `3D/` temporaire,
servi à côté de sa copie `3D/test/`, puis ouvert comme un visiteur. Instant
figé, mouvement réduit, PC 1024 × 640 et Pixel 7.

- **Copie** : le dossier `3D/` est identique octet pour octet à `3D/test/`
  (`diff -rq`).
- **Mot de passe** accepté sur `/3D/` comme sur `/3D/test/`, 3D active, aucune
  erreur dans la console.
- **Étiquette TEST** : absente sur `/3D/`, présente sur `/3D/test/`. Sur
  téléphone, l'en-tête la masque comme avant.
- **Rendu au pixel près**, avec un plancher de bruit de 0 (`/3D/` contre
  `/3D/`) :
  - scène, HUD fermé : 0 pixel différent entre `/3D/` et `/3D/test/`, sur PC
    comme sur téléphone ;
  - HUD ouvert : 0 pixel différent sur téléphone. Sur PC, 1 067 pixels
    diffèrent, tous dans un rectangle de 45 × 27 px : l'étiquette TEST et son
    ombre portée.
- **Non-régression** : le nouveau `/3D/test/` est identique au pixel à celui de
  la PR #19, scène et HUD, sur PC et téléphone. Tests unitaires 98/98.

## Procédure de promotion

Mise à jour dans `CLAUDE.md` : une copie, une comparaison `diff -rq`, les
contrôles au pixel près, puis la PR. La première promotion qui l'applique
emportera aussi ce build. L'actuel `/3D/`, construit avec l'ancienne base en
dur, reste tel quel jusque-là.
