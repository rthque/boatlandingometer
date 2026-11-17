// Restaure la source privée de la 3D à partir de l'archive chiffrée de ce dossier.
// Rien d'autre que Node 22 n'est nécessaire. Le mot de passe (celui du site) passe par un
// descripteur ou un fichier privé, jamais en argument, et n'est jamais affiché :
//
//   BLO_SECRET_FILE=/proc/self/fd/3 node source-3d/restore.mjs <dossier neuf> \
//     3< <(printf %s "$BLM3D_PASSWORD")
//
// 1. déchiffre archive.bin en mémoire et écrit la source dans <dossier neuf> ;
// 2. reconstitue <dossier neuf>/public/protected/ (ressources déjà chiffrées) à partir de
//    public/3D/test/ de ce dépôt, avec le même mot de passe.
// Ensuite : voir CLAUDE.md, « Restaurer la source 3D ».
import { readFile, writeFile, mkdir, readdir, copyFile, chmod } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash, webcrypto as crypto } from "node:crypto";
import { gunzipSync } from "node:zlib";

class Say extends Error {} // seuls messages jamais imprimés : textes fixes, sans donnée
const fail = (m) => {
  throw new Say(m);
};
const quiet = (e) => {
  console.error(e instanceof Say ? e.message : "Échec inattendu ; détail masqué.");
  process.exit(1);
};
process.on("uncaughtException", quiet);
process.on("unhandledRejection", quiet);

const here = path.dirname(fileURLToPath(import.meta.url));
const site = path.resolve(here, "../public/3D/test");
const enc = new TextEncoder();
const bytes = (s) => Buffer.from(s, "base64");
const sha = (b) => createHash("sha256").update(b).digest("hex");
const FILE = /^assets\/[a-f0-9]{32}\.bin$/;

async function readPassword() {
  const file = process.env.BLO_SECRET_FILE ?? "";
  if (!/^\/proc\/self\/fd\/\d+$/.test(file) && !path.isAbsolute(file))
    fail("BLO_SECRET_FILE doit être un descripteur (/proc/self/fd/N) ou un fichier privé absolu.");
  const pw = (await readFile(file, "utf8").catch(() => fail("Mot de passe illisible."))).replace(
    /\r?\n$/,
    "",
  );
  if (!pw) fail("Mot de passe vide.");
  return pw;
}
// Même dérivation que la page d'accès : octets UTF-8 de la forme NFC, rien de retiré.
async function keyFor(pw, salt, iterations) {
  if (!(iterations >= 200000 && iterations <= 2000000)) fail("Archive illisible.");
  const material = await crypto.subtle.importKey(
    "raw",
    enc.encode(pw.normalize("NFC")),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"],
  );
}
const open = (key, iv, aad, data) =>
  crypto.subtle
    .decrypt(
      { name: "AES-GCM", iv: bytes(iv), additionalData: enc.encode(aad), tagLength: 128 },
      key,
      data,
    )
    .then(Buffer.from);

async function main() {
  const dest = process.argv[2];
  if (!dest)
    fail(
      "Usage : BLO_SECRET_FILE=/proc/self/fd/3 node source-3d/restore.mjs <dossier neuf> 3<mot-de-passe",
    );
  const out = path.resolve(dest);
  const existing = await readdir(out).catch(() => null);
  if (existing && existing.length) fail("Le dossier de destination doit être neuf ou vide.");
  const pw = await readPassword();

  // 1. L'archive.
  const meta = JSON.parse(await readFile(path.join(here, "archive.json"), "utf8"));
  if (meta.version !== 1 || meta.archive?.file !== "archive.bin") fail("Archive illisible.");
  const key = await keyFor(pw, bytes(meta.salt), meta.iterations);
  const tag = (n) => `boatlandingometer-source-v1:${meta.id}:${n}`;
  const check = await open(key, meta.check.iv, tag("check"), bytes(meta.check.data)).catch(
    () => null,
  );
  if (check?.toString() !== "Boatlandingometer source archive v1")
    fail("Mot de passe refusé par l'archive : rien n'a été écrit.");
  const packed = await open(
    key,
    meta.archive.iv,
    tag("archive"),
    await readFile(path.join(here, "archive.bin")),
  ).catch(() => fail("Archive abîmée : rien n'a été écrit."));
  if (packed.length !== meta.archive.size) fail("Archive abîmée : rien n'a été écrit.");
  const all = gunzipSync(packed);
  const n = all.readUInt32BE(0);
  const manifest = JSON.parse(all.subarray(4, 4 + n).toString());
  let at = 4 + n;
  const files = [];
  for (const f of manifest.files) {
    const parts = String(f.path).split("/");
    if (
      path.isAbsolute(f.path) ||
      f.path.includes("\\") ||
      parts.some((p) => !p || p === "." || p === "..")
    )
      fail("Archive abîmée : rien n'a été écrit.");
    const b = all.subarray(at, at + f.size);
    at += f.size;
    if (b.length !== f.size || sha(b) !== f.sha256) fail("Archive abîmée : rien n'a été écrit.");
    files.push({ path: f.path, mode: f.mode === 0o755 ? 0o755 : 0o644, bytes: b });
  }
  if (at !== all.length) fail("Archive abîmée : rien n'a été écrit.");

  // 2. Les ressources chiffrées de /3D/test/ (même coffre que la source), lues avant toute écriture.
  const v = JSON.parse(await readFile(path.join(site, "protected/vault.json"), "utf8"));
  if (v.version !== 1 || !FILE.test(v.runtime?.file ?? "")) fail("Coffre de /3D/test/ illisible.");
  const skey = await keyFor(pw, bytes(v.salt), v.iterations);
  const aad = (name) => `boatlandingometer-v1:${v.id}:${name}`;
  const sc = await open(skey, v.check.iv, aad("check"), bytes(v.check.data)).catch(() => null);
  if (sc?.toString() !== "Boatlandingometer team access v1")
    fail("Le mot de passe ouvre l'archive mais pas /3D/test/ : rien n'a été écrit.");
  const runtime = await open(
    skey,
    v.runtime.iv,
    aad("/runtime/application"),
    await readFile(path.join(site, "protected", v.runtime.file)),
  );
  const vault = JSON.parse(gunzipSync(runtime)).vault;
  if (vault?.id !== v.id || !vault.assets.every((a) => FILE.test(a.file)))
    fail("Coffre de /3D/test/ incohérent.");

  for (const f of files) {
    const p = path.join(out, f.path);
    await mkdir(path.dirname(p), { recursive: true });
    await writeFile(p, f.bytes);
    await chmod(p, f.mode);
  }
  const prot = path.join(out, "public/protected");
  await mkdir(path.join(prot, "assets"), { recursive: true });
  await writeFile(path.join(prot, "vault.json"), JSON.stringify(vault, null, 2));
  const assets = [...new Set(vault.assets.map((a) => a.file))];
  for (const a of assets) await copyFile(path.join(site, "protected", a), path.join(prot, a));
  console.log(
    `Source restaurée : ${files.length} fichiers, ${assets.length} ressources chiffrées reprises de /3D/test/.`,
  );
}
await main().catch(quiet);
