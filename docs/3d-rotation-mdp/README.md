# Rotation du mot de passe de la 3D

Changement complet du mot de passe de `/3D/` et `/3D/test/`. L'ancien
mot de passe a circulé et les anciens coffres restent lisibles dans
l'historique public du dépôt : rien de l'ancien coffre ne resservait.

## Ce qui change

- Nouveau coffre : nouvel identifiant, nouveau sel de 32 octets, nouveau
  contrôle. La clé est dérivée du nouveau mot de passe ; aucune clé de
  l'ancien coffre n'est réutilisée. Même nombre d'itérations PBKDF2-SHA-256
  qu'avant.
- Le runtime et toutes les ressources sont rechiffrés en AES-256-GCM, avec
  des IV neufs et des noms de fichiers neufs. Aucun IV ni aucun nom de
  fichier de l'ancien coffre n'est repris.
- `/3D/` et `/3D/test/` partagent le même nouveau coffre. Chacun garde son
  contenu : la prod reste la version « ciel », le test la version « mer et
  fond ». Une rotation n'est pas une promotion, et seul le runtime diffère
  entre les deux dossiers.
- Page d'accès (`unlock.js`, identique dans les deux dossiers) :
  - la clé est dérivée des octets UTF-8 de la forme NFC du mot de passe,
    sans rien retirer. L'outil de scellement fait exactement la même chose.
    Avant, aucun des deux ne normalisait et l'outil retirait les espaces de
    début et de fin : un « é » envoyé en deux caractères par un clavier, ou
    un espace final, donnait une autre clé ;
  - les jetons « Se souvenir sur cet appareil » rangés sous un autre coffre
    sont purgés au chargement. Ils ne pouvaient de toute façon plus rien
    ouvrir.
- CLAUDE.md : procédure « Changer le mot de passe », sans aucun secret.

La rotation est faite par un outil de la source privée, hors dépôt. Il
déchiffre en mémoire seulement, rechiffre les deux dossiers en une seule
fois, puis rouvre tout avec le nouveau mot de passe et vérifie que l'ancien
est refusé.

## Preuves

Coffre, contrôlé par un script indépendant de l'outil :

- identifiant, sel et contrôle neufs, identiques entre `/3D/` et
  `/3D/test/` ; itérations inchangées ;
- dans les deux dossiers, aucun IV ni nom de fichier de l'ancien coffre ;
  aucun IV employé pour deux contenus différents ;
- contenu déchiffré identique octet pour octet à celui d'avant : code et
  styles du runtime, et les 11 ressources de chaque dossier ;
- l'ancien mot de passe n'ouvre plus le nouveau coffre, et le nouveau
  n'ouvre pas l'ancien.

Navigateur, sur le build tel qu'il est commité (Chromium : PC, Android et
iPhone émulés) :

| Cas | PC | Android | iPhone |
| --- | --- | --- | --- |
| Nouveau mot de passe sur `/3D/` | accepté | accepté | accepté |
| Nouveau mot de passe sur `/3D/test/` | accepté | accepté | accepté |
| Ancien mot de passe sur `/3D/` | refusé | refusé | refusé |
| Ancien mot de passe sur `/3D/test/` | refusé | refusé | refusé |
| Saisie par clavier virtuel (composition puis validation) | sans objet | nouveau accepté, ancien refusé | nouveau accepté, ancien refusé |
| Jeton mémorisé avec l'ancien coffre | écran d'accès, purgé | écran d'accès, purgé | écran d'accès, purgé |
| « Se souvenir » avec le nouveau, puis rechargement | ouverture directe | ouverture directe | ouverture directe |

- Frappe touche par touche sur PC, caractère par caractère sur écran
  tactile pour les téléphones.
- Chaque refus affiche le message « Mot de passe incorrect ». Aucune erreur
  console ni erreur de page, en dehors des appels de prévision, coupés
  exprès dans ce banc.
- Jeton : l'ancien jeton avait d'abord été mémorisé sur l'ancien build
  (ouverture directe vérifiée). Sur le nouveau build, l'écran d'accès
  revient, sans message d'erreur, bouton « Entrer » actif, et le jeton est
  effacé de l'appareil.

Caractères non ASCII, avec un mot de passe jetable contenant `£` et `é`,
scellé sur une copie hors dépôt :

- Android, iPhone et PC ; frappe, clavier virtuel, et « é » envoyé en deux
  caractères (e plus accent combinant) : ouverture dans tous les cas ;
- l'empreinte des octets que la page passe à PBKDF2 est égale à celle des
  octets de l'outil de scellement dans tous les cas ;
- l'ancienne page d'accès refuse la forme en deux caractères : c'est le
  défaut que l'alignement corrige.

Rendu, à instant figé et mouvement réduit, avant (ancien coffre) contre
après (nouveau), plancher de bruit avant contre avant :

| Vue | Pixels différents avant/après | Plancher |
| --- | --- | --- |
| `/3D/`, PC 1024x640 | 0 | 0 |
| `/3D/test/`, PC 1024x640 | 0 | 0 |
| `/3D/`, téléphone 412x839 | 0 | 0 |
| `/3D/test/`, téléphone 412x839 | 0 | 0 |

Rendu 3D complet dans chaque cas, prévision coupée dans les deux builds pour
que seule la clé change.

Rien en clair :

- les 24 fichiers chiffrés sont aléatoires (entropie ≥ 7,99 bits/octet,
  aucune signature de format connue) ;
- aucun des deux mots de passe n'apparaît dans un fichier suivi par git
  (compté sans les afficher) ;
- hors page d'accès publique, aucun fichier lisible n'a été ajouté.

Vérifications d'usage :

- `npm run lint` : 0 erreur ;
- `npm run build` OK et `dist/3D` identique à `public/3D` ;
- site principal, workflow et redirections `/3d/` inchangés ;
- suite privée : 150 sur 150, dont 3 nouveaux tests de rotation.

## Après fusion

Quentin remplace `BLM3D_PASSWORD` par la nouvelle valeur dans
l'environnement « boatlandingometer » et supprime `BLM3D_PASSWORD_NEW`. Les
fichiers privés qui portaient les mots de passe pendant la tâche sont
détruits.

Les appareils qui avaient coché « Se souvenir » redemandent le mot de passe
une fois, puis le jeton se mémorise à nouveau normalement.
