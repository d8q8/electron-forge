import { spawn } from 'child_process';
import path from 'path';
import pify from 'pify';
import zipFolder from 'zip-folder';

import { ensureFile } from '../../util/ensure-output';

const zipPromise = (from, to) =>
  new Promise((resolve, reject) => {
    const child = spawn('zip', ['-r', '-y', to, path.basename(from)], {
      cwd: path.dirname(from),
    });

    child.stdout.on('data', () => {});
    child.stderr.on('data', () => {});

    child.on('close', (code) => {
      if (code === 0) return resolve();
      reject(new Error(`Failed to zip, exitted with code: ${code}`));
    });
  });

export default async (dir, appName, targetArch, forgeConfig, packageJSON) => { // eslint-disable-line
  const zipPath = path.resolve(dir, '../make', `${path.basename(dir)}.zip`);
  await ensureFile(zipPath);
  switch (process.platform) {
    case 'win32':
      await pify(zipFolder)(dir, zipPath);
      break;
    case 'darwin':
      await zipPromise(path.resolve(dir, `${appName}.app`), zipPath);
      break;
    case 'linux':
      await zipPromise(dir, zipPath);
      break;
    default:
      throw new Error('Unrecognized platform');
  }
};