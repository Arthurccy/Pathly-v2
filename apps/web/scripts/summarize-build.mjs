import { readdir, stat } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const nextDir = path.join(webRoot, '.next');

const context = {
  measuredAt: new Date().toISOString(),
  command: 'pnpm --filter @pathly/web build',
  node: process.version,
  platform: `${os.platform()} ${os.release()}`,
  arch: os.arch(),
  cpu: os.cpus()[0]?.model ?? 'inconnu',
  memoryGiB: Math.round((os.totalmem() / 1024 / 1024 / 1024) * 10) / 10,
  dataset:
    'Page / actuelle, données fictives embarquées dans le client (MOCK_ACCOUNTS, MOCK_TRANSACTIONS). Aucun appel API pendant le build.',
  network:
    'Aucun profil réseau : taille du build de production sur cette machine. Ce n’est pas un chargement navigateur ni un score Lighthouse.',
};

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
    } else if (entry.isFile()) {
      const info = await stat(fullPath);
      files.push({ file: path.relative(webRoot, fullPath), bytes: info.size });
    }
  }
  return files;
}

try {
  await stat(nextDir);
} catch {
  console.error('Build absent. Lancer pnpm --filter @pathly/web build avant cette mesure.');
  process.exit(1);
}

const staticFiles = await walk(path.join(nextDir, 'static'));
const staticBytes = staticFiles.reduce((sum, file) => sum + file.bytes, 0);
const largest = [...staticFiles].sort((a, b) => b.bytes - a.bytes).slice(0, 8);

console.log(
  JSON.stringify(
    {
      ...context,
      staticFileCount: staticFiles.length,
      staticBytes,
      largestStaticFiles: largest,
    },
    null,
    2,
  ),
);
