# Sous-site 3D — note technique

Build statique autonome. Accès par déchiffrement local AES-256-GCM et dérivation PBKDF2-SHA256 à 600 000 itérations. Le mot de passe n’est pas stocké dans le dépôt ni dans le build.

Les ressources visuelles sensibles ne sont pas publiées dans la documentation. Le sous-site TEST et la production sont livrés séparément. Les redirections et le workflow restent inchangés.

Le retrait des fichiers ne supprime pas leurs anciennes copies ou les caches de l’hébergeur. Cette PR ne réécrit pas l’historique de la branche principale.
