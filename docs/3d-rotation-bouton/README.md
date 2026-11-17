# Changer le mot de passe 3D depuis GitHub

Un workflow manuel, `.github/workflows/rotate-3d-password.yml` (« Changer le
mot de passe 3D »), permet à Quentin de faire lui-même la rotation complète
du mot de passe de `/3D/` et `/3D/test/`, sans Claude Code. La procédure pas
à pas est dans CLAUDE.md, section « Depuis GitHub, sans Claude Code ».
`deploy.yml` n'est pas modifié.

## Ce que fait le workflow

- Lancement à la main uniquement (`workflow_dispatch`), sans aucun champ de
  saisie, et seulement dans sa version de `main`.
- Permissions : `contents: write`, rien d'autre ; durée maximale 15 minutes ;
  un seul lancement à la fois.
- Seules deux actions officielles, `actions/checkout` (v7.0.1) et
  `actions/setup-node` (v7.1.0), épinglées par SHA de commit. Aucune action
  tierce, pas de cache, pas d'installation de paquets.
- Il refait la rotation de la PR #29 à partir des fichiers chiffrés du
  dépôt :
  - un seul nouveau coffre (identifiant, sel, contrôle) pour les deux
    dossiers, mêmes itérations ;
  - runtime et ressources rechiffrés, avec des IV et des noms de fichiers
    neufs ;
  - même dérivation de clé que la page d'accès : octets UTF-8 de la forme NFC,
    rien de retiré ;
  - au moins 14 caractères pour le nouveau mot de passe.
- Avant de pousser, il relit tout depuis le disque et contrôle que :
  - le nouveau mot de passe ouvre les deux dossiers et l'ancien est refusé ;
  - le contenu déchiffré est identique à celui d'avant ;
  - les fichiers chiffrés sont aléatoires, et aucun des deux mots de passe
    n'apparaît dans ce qui est écrit ;
  - seuls les dossiers `protected/` changent.
- Il pousse une branche neuve `rotation-3d-<n°>`, jamais `main`, et le résumé
  du run donne le lien pour ouvrir la PR en un clic. Il ne crée ni n'approuve
  de PR lui-même.

## Pourquoi les mots de passe ne peuvent pas sortir

Le dépôt et ses logs sont publics.

- Les mots de passe ne viennent que des secrets `BLM3D_PASSWORD_OLD` et
  `BLM3D_PASSWORD_NEW`, et seule l'étape « Rotation » les reçoit. Le script
  les retire aussitôt de son environnement, ne les écrit jamais sur disque et
  ne les affiche jamais.
- Tout message est un texte fixe choisi d'avance. Pour une erreur imprévue,
  il affiche « Échec inattendu ; détail masqué », jamais l'erreur d'origine
  ni sa pile. GitHub masque en plus la valeur brute des secrets.
- Le jeton de poussée passe à git par l'environnement, sans ligne de commande
  et sans affichage. L'extraction se fait sans identifiants conservés.

## Essai à blanc (local)

Les trois étapes `run:` ont été extraites telles quelles du YAML et
exécutées avec `bash -e`, comme sur un runner GitHub. Le cadre : une copie du
dépôt rescellée avec deux mots de passe jetables contenant `£` et `é`, le
nouveau avec un espace final, et un dépôt distant local.

- **Cas normal** : rotation vérifiée, branche `rotation-3d-7-1` poussée,
  lien affiché. Elle ne touche que les deux dossiers `protected/` (50
  fichiers) ; `main` est intacte.
- **Vérification indépendante** de la branche, par un autre script :
  - nouveau coffre partagé, identifiant, sel et contrôle neufs, itérations
    inchangées ;
  - aucun IV ni nom de fichier repris ;
  - contenu déchiffré identique octet pour octet ;
  - ancien mot de passe refusé.
- **Navigateur** (PC, Android et iPhone émulés), sur `/3D/` et `/3D/test/` :
  le nouveau mot de passe jetable est accepté, l'ancien refusé avec le
  message.
- **Six cas d'échec** : secret manquant, secrets identiques, nouveau trop
  court, mauvais ancien, secrets inversés, fichier chiffré abîmé. Chacun
  s'arrête avec son message fixe, sans rien pousser.
- **Fuites** : aucune forme des mots de passe jetables (brute, NFC, NFD,
  base64, hexadécimal, URL) ni du jeton dans les 14 sorties et résumés, ni
  dans les 65 objets git de la branche poussée.
- `actionlint` n'a pas pu être lancé dans cette session. La syntaxe a été
  contrôlée en lisant le YAML et en exécutant ses étapes ; les entrées
  utilisées existent dans l'`action.yml` des deux actions épinglées.

## Essai réel par Quentin

Suivre CLAUDE.md, étapes 1 à 7.

- Le premier lancement est aussi l'essai : s'il échoue, rien n'est poussé et
  le site ne change pas.
- S'il réussit, ouvrir la PR depuis le lien du résumé et vérifier que seuls
  les dossiers `protected/` changent.
- Après la fusion et le déploiement, tester le nouveau mot de passe sur PC et
  téléphone.
- Mettre à jour `BLM3D_PASSWORD` dans les environnements Claude Code
  « boatlandingometer » et « Default », puis supprimer les deux secrets
  GitHub.
- En cas de souci après fusion, « Revert » sur la PR rétablit l'ancien mot de
  passe.
