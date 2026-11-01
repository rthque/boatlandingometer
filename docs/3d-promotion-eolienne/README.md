# Promotion test → prod : éolienne

Copie de la version TEST validée (PR #25 : éolienne affichée par défaut,
capot de TP en option par le bouton) vers la production `/3D/`, selon la
procédure « copie » de CLAUDE.md : ni mot de passe, ni rechiffrement.

## Retour arrière

Le tag `prod-3d-avant-eolienne` n'a pas pu être poussé : le proxy de la
session refuse l'envoi de tags. Commit de retour : `1798291` (fusion de la
PR #25, prod en ligne avant cette copie). Pour revenir en arrière, restaurer
`public/3D/` (hors `test/`) depuis ce commit.

## Vérifications

- `public/3D/` identique octet pour octet à `public/3D/test/`
  (`diff -rq --exclude=test`) ;
- coffre inchangé hors entrée `runtime` (identifiant, sel, contrôle,
  itérations identiques) ;
- `npm run build` OK, `dist/3D` identique à `public/3D` ;
- page d'accès prête sans erreur sur `/3D/` et `/3D/test/` ; `/3d/` redirige
  toujours vers `/3D/` ; redirections et workflow inchangés.

Les vérifications avec mot de passe (connexion sur `/3D/`, étiquette TEST,
captures PC et téléphone, bouton capot) sont rapportées dans la PR.
