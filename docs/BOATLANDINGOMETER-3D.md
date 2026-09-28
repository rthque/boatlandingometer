# Révision 10 — 28 septembre 2026

Cette révision finalise la livraison GitHub Pages de la v9 et renouvelle le chiffrement avec le mot de passe choisi par le propriétaire. Le mot de passe n’est pas enregistré dans le code, le dépôt, le site ou le ZIP.

- Sept ressources rechiffrées : deux modèles, quatre photographies et une vidéo.
- AES-256-GCM / PBKDF2-SHA-256, 600 000 itérations ; sel, IV et identifiant du coffre renouvelés.
- Déchiffrement vérifié octet par octet : géométrie et médias inchangés.
- Ancien mot de passe rejeté pour ce nouveau coffre ; les appareils mémorisés doivent se reconnecter.
- 41 tests automatisés réussis, contrôle TypeScript et builds statiques `/` et `/3D/` réussis. Rapport `tests-v10.txt`.
- Aucun changement des réglages de visibilité Sites.
- PR vers `main` : build précompilé `public/3D/`, redirection `/3d/`, documentation et outil local. Exclusion ESLint uniquement pour les bundles précompilés. Workflow, CNAME, Vite racine et `/test/` inchangés.

Les limites de calage LAT, de validation GPU et de confidentialité des anciennes versions restent celles documentées dans `REVISION-9.md`. La rotation ne supprime pas les ressources présentes dans les anciens déploiements ni leurs téléchargements.

---

# Révision 9 — 27 septembre 2026

## Usage

- Téléphone : barre supérieure date/vues, rail secondaire, volet inférieur à trois positions. Tirer sa poignée vers le haut/bas, la toucher, ou utiliser ses flèches clavier. Replié : niveau, heure, cible, mini-courbe. Milieu : curseurs et time-lapse. Déplié : intervention, marées, météo et sources.
- Paysage mobile : instruments dans une colonne latérale de 224 px lorsqu'ils sont ouverts.
- PC : scène pleine fenêtre, timeline de 72 px qui s'ouvre au survol/focus ou par sa poignée, panneau latéral indépendant. Son bas remonte quand la timeline est ouverte. Touche H : immersion ; H ou bouton HUD : retour.
- Les instruments passent à 15 % pendant la manipulation et reviennent deux secondes après. Les commandes déjà survolées/contenant le focus restent lisibles. Aucune aide automatique au démarrage ; bouton « ? ».
- FR/EN d'après la langue du navigateur, choix mémorisé. Les données et les explications changent de langue ; le nom du preset métier historique est conservé.
- WC59 affiché par défaut, atténué à 14 % en BL/Tether. Caméras placées à bâbord, transitions autour de leur cible ; collisions sur l'acier et enveloppes conservatrices coque/timonerie. La touche Recentrer reste disponible.

## Géométrie et réserves

Le GLB du jacket et du CTV reste celui validé dans les révisions précédentes. Les outils d'installation retirés en v8 restent absents. Le clic calcule une cote mondiale après transformation. Le modèle procédural reste le secours lorsque le chargement/parse du GLB échoue après connexion.

Référentiel unique : **mètres LAT**. Transformation provisoire du jacket : `Y LAT = Y natif STEP / 1000 + 0,4445 m`. Le point rouge natif à 22,5555 m a été associé au repère photographique 23 m. Ce raccordement n'est pas un levé certifié ; il reste à valider sur plan/mesure terrain, explicitement dans l'interface.

| Élément | Calage retenu | Statut |
|---|---|---|
| Tubes du boat landing | Contact recherché sur les deux surfaces réelles par rayons, au niveau du fender | Géométrie du GLB ; test à quatre niveaux d'eau |
| Fender WC59 | +2,30 m au-dessus de l'eau, orientation perpendiculaire à la tangente entre tubes | Estimation v7 ±0,25 m, à mesurer sur le bateau |
| Tirant WC59 | 1,80 m | Référence de modélisation, charge réelle à vérifier |
| Bandes rouges | 7,70 à 7,90 m LAT, uniquement les deux tubes avant | Cotes demandées ; dépend du raccordement LAT |
| Clamp : axe de l'œil/manille | **3,50 m LAT** | Cote demandée |
| Bride du clamp | Serrage du barreau existant vers **3,58 m LAT** | Géométrie du modèle ; décalage œil/bride 8,5 cm |
| Bride inox | Environ 10 × 7 cm, deux mâchoires, boulons/écrous et patin | Déduit des photos sans étalon ; environ ±30 % |
| Cordage | Rouge, œil avec cosse, manchon, ligatures ; diamètre représenté ≈10 mm | Aspect des photos, diamètre supposé |
| Preset d'intervention | 2,20 m LAT | Conservé ; distinct de la fixation du clamp |

Les sept photos jointes ont servi à construire le clamp. La distinction **œil à 3,50 / barreau à 3,58** est volontaire pour éviter de déplacer artificiellement le barreau réel. À confirmer sur site avant utilisation opérationnelle. Le nom public est « Représentation 3D indicative » ; les détails de provenance restent dans cette documentation technique.

## Protection statique

Les deux GLB, les quatre photos et la vidéo sont dans `public/protected/`, sous forme de sept fichiers binaires chiffrés. AES-256-GCM, IV aléatoire 96 bits par objet, sel aléatoire 256 bits, PBKDF2-SHA-256 **600 000 itérations**, tag 128 bits. L'AAD lie chaque objet à l'identifiant du coffre et à son chemin logique. Toute modification du contenu chiffré ou substitution de chemin invalide l'authentification.

Le manifeste public contient les chemins logiques et les tailles ; il ne contient aucune clé. Les extensions `.glb` dans ce manifeste sont des identifiants, pas des fichiers publics. JS/CSS, moteur et géométrie de secours procédurale restent publics : **les ressources réelles sont chiffrées, pas l'ensemble du code**.

Après saisie du mot de passe, Web Crypto déchiffre en mémoire et fournit des URL Blob au moteur. « Se souvenir » enregistre uniquement une clé CryptoKey non extractible dans IndexedDB. Un accès à la session de ce navigateur permet cependant d'utiliser cette clé. Déconnexion efface la clé mémorisée et révoque les URL Blob. Après rotation, les anciens appareils doivent se reconnecter.

La confidentialité suppose un mot de passe fort et un code servi par un hébergeur de confiance. Une personne autorisée peut récupérer le modèle déchiffré dans son navigateur ; ce système n'est pas un DRM. La rotation ne révoque pas les anciens téléchargements.

**Historique antérieur : les versions Sites v6–v8 contenaient déjà des GLB en clair. Cette révision retire ces fichiers du déploiement courant, mais ne garantit pas l'effacement des versions historiques ni des copies déjà téléchargées.** Le nouveau sous-site ajouté sur GitHub et le ZIP v9 ne contiennent aucun modèle clair, ni historique Git. Ne pas importer l'ancien historique Sites dans le dépôt public.

## Choisir votre mot de passe localement

1. Utiliser le mot de passe actuel choisi par le propriétaire. Aucun fichier contenant ce mot de passe n’est livré.
2. Ouvrir `tools/changer-mot-de-passe.html` par double-clic dans un navigateur récent. Aucune requête réseau n'est autorisée par sa CSP.
3. Sélectionner le dossier `protected` du build, saisir le mot de passe actuel et le nouveau (14 caractères minimum, phrase longue recommandée).
4. Télécharger le nouveau ZIP. Il contient uniquement des ressources chiffrées et leur manifeste.
5. Remplacer **tout** le dossier `public/3D/protected` sur GitHub. Pour garder le code source à jour, remplacer aussi `public/protected` dans le projet 3D et reconstruire ses deux builds.

Alternative Node.js, mots de passe demandés sans écho ni argument de commande :

```sh
node scripts/secure-vault.mjs rekey public/protected /chemin/prive/nouveau-protected
```

## GitHub Pages /3D/

La PR ajoute le build dans `public/3D/`, la redirection `public/3d/index.html` et ses outils/documentation. La branche principale, le domaine, `public/CNAME`, Vite du site principal, le sous-site `/test/` et `.github/workflows/deploy.yml` ne sont pas modifiés. Seule la liste d’exclusions ESLint reçoit `public/3D/**`, pour ne pas analyser/reformater les bundles précompilés ; les règles et les sources existantes restent inchangées.

Le workflow existant copie `public/3D/` pendant le build racine **avant** son fingerprint. L'étape d'assemblage `/test/` ne touche pas ce dossier ; les assertions existantes restent applicables. Aucun workflow contourné ni assertion désactivée.

Pour refaire le build depuis ce code source :

```sh
pnpm install --frozen-lockfile
pnpm typecheck
pnpm build:pages
```

Copier le **contenu** de `out-pages/` dans `public/3D/` du dépôt `rthque/boatlandingometer`. Garder `public/3d/index.html`. Committer sur une branche, ouvrir/mettre à jour la PR, puis merger pour déclencher le workflow habituel. Le build `dist/` (base `/`) sert à l'aperçu Sites ; ne pas le copier dans `/3D/`.

## Vérifications et limites

- **41 tests automatisés réussis**, TypeScript et builds statiques vérifiés. Rapport : `docs/tests-v9.txt`.
- Tests métier conservés : marées TICON-4, Europe/Paris et changements d'heure, croisements, navigation, transformations, extraction de la structure, marquages.
- Tests ajoutés : chiffrement/rechiffrement, mauvais mot de passe, altération, AAD, interopérabilité du packer avec le module client, clé non extractible ; contact du fender contre les deux vrais tubes ; collisions ; caméras BL/Tether à quatre aspects et quatre niveaux d'eau ; géométrie du clamp.
- Le build refuse GLB/GLTF/STEP/BLEND en clair, signatures GLB et routes de QA temporaires. Audit du ZIP avant livraison.
- Contrôles navigateur du HUD et du repli 2D sur 375×667, 390×844, 844×390, 1024×768, 1200×800 et 1920×1080. FR/EN, volet, aide, réglages, timeline, mode immersif et interactions contrôlés. Captures prises dans un banc local de composants séparé de la connexion, retiré du livrable.
- Le navigateur distant ne permet pas de valider le rendu GPU réel. Les cadrages et collisions sont contrôlés numériquement sur les modèles. Fluidité, reflets, absence de traversée dans tous les cas extrêmes et lisibilité finale du clamp restent à confirmer dans Chrome avec WebGL.
- La cryptographie client est testée avec Web Crypto. La saisie du mot de passe et la mémorisation réelle dans un navigateur utilisateur restent à confirmer ; aucun secret n'a été saisi par l'automatisation navigateur.
