# Sauvegarde chiffrée de la source 3D

Avant ce lot, la source privée de l'app 3D n'existait que dans un conteneur
de travail jetable. Elle est maintenant dans le dépôt, chiffrée, dans
`source-3d/`. Ce dossier n'est pas publié sur le site : seul `dist/` l'est.

## Contenu de `source-3d/`

- `archive.bin` : la source privée chiffrée en AES-256-GCM (0,77 Mo).
- `archive.json` : le coffre de l'archive. Il a ses propres identifiant, sel
  et IV, et un texte de contrôle propre. Le mot de passe est celui du site et
  le nombre d'itérations PBKDF2-SHA-256 est le même.
- `restore.mjs` : la restauration, en clair. Il ne demande que Node 22 et
  aucune dépendance.

L'archive contient de quoi reconstruire le build à l'identique : code, scripts
de build, de scellement et de rotation, tests, banc local, configuration et
lockfile. Elle ne contient ni `node_modules`, ni les ressources déjà chiffrées
dans le dépôt, ni aucune référence privée (photos, plans, captures).
`restore.mjs` reprend les ressources chiffrées depuis `public/3D/test/`, avec
le même mot de passe. Un mauvais mot de passe est refusé avec un message fixe,
sans rien écrire.

Le mot de passe est dérivé comme sur la page d'accès : octets UTF-8 de sa
forme NFC, sans rien retirer.

## Rotation

- Le workflow « Changer le mot de passe 3D » rechiffre aussi l'archive :
  - nouveaux identifiant, sel, contrôle et IV ;
  - les mêmes garde-fous que pour le site : rien en clair, aucun des deux mots
    de passe dans les fichiers écrits, nouveau mot de passe accepté et ancien
    refusé à la relecture, contenu identique ;
  - le contrôle du diff accepte les deux dossiers `protected/` et
    `source-3d/archive.*`, rien d'autre.
- L'outil de rotation de la source privée fait de même avec
  `--archive source-3d`.

## Règles ajoutées à CLAUDE.md

- `source-3d/` fait partie des chemins autorisés d'une PR.
- Chaque PR qui modifie la source rafraîchit l'archive. Le coffre de l'archive
  reste le même ; seul l'IV est neuf.
- Une procédure courte « Restaurer la source 3D ».

## Preuves

Restauration, à partir d'un clone neuf de la branche depuis GitHub et du seul
mot de passe :

- l'archive se déchiffre : 274 fichiers et 11 ressources chiffrées reprises de
  `/3D/test/` ;
- l'installation se fait avec le lockfile figé
  (`corepack pnpm install --frozen-lockfile`) : le projet utilise pnpm, il n'a
  pas de `package-lock.json` pour `npm ci` ;
- reconstruction et scellement réussis ;
- contenu déchiffré comparé à celui de `main` :
  - le code du worker, les styles et les 11 ressources sont identiques octet
    pour octet ;
  - le code principal ne diffère que de la ligne connue : la normalisation
    NFC du chemin d'accès propre à l'app, qui n'est jamais exécuté dans le
    build scellé ;
- suite de tests privée : 154 sur 154, dont 4 nouveaux tests de l'archive ;
- un mauvais mot de passe est refusé avec « Mot de passe refusé par l'archive :
  rien n'a été écrit. », sans aucun fichier créé.

Contrôles de l'archive :

- entropie de 7,9998 bits/octet ;
- aucun des mots de passe dans les fichiers de `source-3d/` ;
- sel et identifiant différents de ceux du site ; 600 000 itérations, comme le
  site.

Rotation à blanc, sur une copie du dépôt, avec des mots de passe jetables
(`£`, `é`, espace final) :

- l'outil local a fait passer la copie sur le premier mot de passe jetable,
  archive comprise ;
- les trois étapes du workflow ont été extraites du YAML et exécutées avec
  `bash -e` ;
- cas normal :
  - rotation vérifiée et branche poussée ;
  - la branche ne change que les deux dossiers `protected/` et
    `source-3d/archive.*` ;
  - une vérification indépendante des deux dossiers trouve un nouveau coffre,
    un contenu identique et l'ancien mot de passe refusé ;
  - `restore.mjs` restaure la source à l'identique (274 fichiers) avec le
    nouveau mot de passe et refuse l'ancien ;
- huit cas d'échec, dont deux nouveaux sur l'archive (archive abîmée, archive
  sous un autre mot de passe). Chacun s'arrête avec son message fixe, sans
  rien pousser ;
- fuites : aucune forme des mots de passe jetables ni du jeton dans les 18
  sorties et résumés, ni dans les objets git du dépôt distant.

Site principal : `npm run lint` donne 0 erreur ; `npm run build` réussit,
`dist/3D` est identique à `public/3D`, et rien de `source-3d/` n'arrive dans
`dist/`. `deploy.yml` n'est pas modifié.

## Non vérifié

- Le workflow modifié n'a pas tourné sur GitHub : seules ses étapes ont été
  exécutées localement. `actionlint` n'est pas disponible ici.
- Le lint de la source privée a encore des erreurs. Elles existaient avant ce
  lot et ne font pas partie de la definition of done : il y en avait 56, il
  en reste 32 depuis que le banc est exclu.
