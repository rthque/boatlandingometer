# Matières — note technique

Cycle limité à `/3D/test/`. Production, redirections et workflow inchangés.

## Méthode

Habillage PBR étendu aux surfaces extérieures : peinture satinée, acier, garde-corps, échelles et plateformes. Projection triplanaire sans UV, variations sobres, occlusion de proximité. Les masques de marnage utilisent la hauteur mondiale LAT ; ils ne suivent pas la marée instantanée. Les repères rouges sont composés après les matières. Les calculs de marée, houle et mesures sont conservés.

Trois textures KTX2/Basis UASTC, 512–1024 px, mipmaps complets, filtrage trilinéaire et anisotropie plafonnée à 4. Détails fins estompés à distance. Budget textures : **1 445 717 octets**. Le mode allégé ne charge pas ces textures. Objectif 60 fps sur téléphone, à mesurer sur appareil.

## Géométrie et intérieur

Un document neuf conserve les surfaces extérieures après soustraction des volumes intérieurs, y compris ceux des bras supérieurs. Les enveloppes extérieures des jambes sont reconstruites. Les triangles effondrés après quantification sont supprimés ; les sommets inutilisés, métadonnées et noms du document importé ne sont pas conservés.

L'aménagement intérieur est entièrement fictif : surfaces neutres, galerie, échelle, garde-corps, armoires et éclairage génériques. Il est créé par des paramètres indépendants du contenu intérieur importé. Une vue dédiée permet de l'inspecter. Il ne représente aucun équipement réel.

## Accès et confidentialité

AES-256-GCM, PBKDF2-SHA256 à 600 000 itérations. Clé et mot de passe inchangés. Application, styles, manifeste détaillé, géométrie et matières restent chiffrés ; seul l'écran de connexion neutre est public.

Les visuels et la vidéo historiques déjà validés sont restaurés à l'identique sous forme chiffrée, avec leur repli 2D et leurs fonctions. Les nouvelles photographies de référence et la planche contenant leurs extraits sont exclues du build, même sous forme chiffrée. Les quatre planches du comparateur contiennent uniquement des rendus et sont déchiffrées à la demande. Les audits détaillés et comparaisons privées ne sont pas publiés dans la documentation.

## Vérification

Contrôle TypeScript, build statique, validateur glTF, tests géométriques, mesures, masques, chiffrement et replis. Vérification indépendante des volumes purgés et des métadonnées. Rendus comparatifs du moteur Three.js sous EGL, y compris redimensionnement vers un format téléphone et mode allégé.

Le navigateur de prévisualisation est indisponible dans cet environnement. Chrome réel, scintillement en mouvement et performances sur téléphone restent à vérifier sur appareil. Les couleurs, rugosités et dépôts sont des interprétations visuelles ; le raccordement LAT reste provisoire.

## Déploiement

`pnpm build:test` produit `out-test/` avec la base `/3D/test/` et demande le secret dans le terminal. Remplacer ce seul sous-site. Après fusion et déploiement, `?review=materials` ouvre le comparateur.

La suppression des fichiers et la réécriture de cette branche ne purgent pas les anciennes copies, objets ou caches de l'hébergeur. L'historique de la branche principale n'est pas réécrit par cette PR.
