import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import scanOsxPath from './scan-osx-path';
import scanWindowsPath from './scan-windows-path';
import scanUnknownPlatformPath from './scan-unknown-platform-path';

export type FsLike = Pick<typeof fs, 'existsSync' | 'readdirSync'>;
export type WhichLike = { sync: (cmd: string) => string };
export type Deps = {
  fs?: FsLike;
  which?: WhichLike;
  env?: NodeJS.ProcessEnv;
  platform?: NodeJS.Platform;
  // Pass-through for scanOsxPath (optional)
  userhome?: (p: string) => string;
};

export default function locateSafari(
  allowFallbackOrDeps?: boolean | Deps,
  depsMaybe?: Deps,
): string | null {
  const isBoolean = typeof allowFallbackOrDeps === 'boolean';
  const allowFallback = isBoolean ? (allowFallbackOrDeps as boolean) : false;
  const deps: Deps | undefined = isBoolean
    ? depsMaybe
    : (allowFallbackOrDeps as Deps | undefined);

  const f: FsLike = deps?.fs ?? fs;
  const e = deps?.env ?? process.env;
  const platform = deps?.platform ?? process.platform;

  // 0) Environment override (allow developers/CI to force a path)
  const envPath = e?.SAFARI_BINARY;
  if (envPath && f.existsSync(envPath)) return envPath;

  let found: string | null = null;
  switch (platform) {
    case 'darwin':
      found = scanOsxPath(allowFallback, { fs: f, userhome: deps?.userhome });
      break;
    case 'win32':
      found = scanWindowsPath(allowFallback, { fs: f, env: e });
      break;
    default:
      found = scanUnknownPlatformPath(allowFallback, { which: deps?.which });
      break;
  }

  return found;
}

export function getInstallGuidance(): string {
  return [
    "We couldn't find a Safari browser on this machine.",
    '',
    'Safari is only available on macOS.',
    '',
    'If you are on macOS and this still fails, try:',
    '- checking that Safari is installed in /Applications',
    '- setting SAFARI_BINARY=/path/to/Safari and re-running',
  ].join('\n');
}

export function locateSafariOrExplain(
  options?: boolean | { allowFallback?: boolean },
): string {
  const allowFallback =
    typeof options === 'boolean' ? options : Boolean(options?.allowFallback);
  const found = locateSafari(allowFallback) || locateSafari(true);
  if (typeof found === 'string' && found) return found;
  throw new Error(getInstallGuidance());
}

/**
 * Cross-platform Safari version resolver.
 * - Never executes the browser by default.
 * - On Windows: reads PE metadata via PowerShell (Safari is typically unavailable).
 * - On macOS: reads Info.plist next to the binary.
 * - On Linux/others: returns null unless opts.allowExec is true, then tries --version.
 */
export function getSafariVersion(
  bin: string,
  opts?: { allowExec?: boolean },
): string | null {
  if (process.platform === 'win32') {
    try {
      const psPath = bin.replace(/'/g, "''");
      const pv = execFileSync(
        'powershell.exe',
        [
          '-NoProfile',
          '-Command',
          `(Get-Item -LiteralPath '${psPath}').VersionInfo.ProductVersion`,
        ],
        { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
      ).trim();
      return normalizeVersion(pv);
    } catch {}
    if (opts?.allowExec) {
      const v = tryExec(bin, ['--version']);
      return normalizeVersion(v);
    }
    return null;
  }

  if (process.platform === 'darwin') {
    try {
      const contentsDir = path.dirname(path.dirname(bin));
      const infoPlist = path.join(contentsDir, 'Info.plist');
      if (fs.existsSync(infoPlist)) {
        const xml = fs.readFileSync(infoPlist, 'utf8');
        const v =
          parsePlistString(xml, 'CFBundleShortVersionString') ||
          parsePlistString(xml, 'CFBundleVersion') ||
          '';
        return normalizeVersion(v);
      }
    } catch {}
    if (opts?.allowExec) {
      const v = tryExec(bin, ['--version']);
      return normalizeVersion(v);
    }
    return null;
  }

  if (opts?.allowExec) {
    const v = tryExec(bin, ['--version']);
    return normalizeVersion(v);
  }
  return null;
}

function normalizeVersion(s: string | null | undefined): string | null {
  if (!s) return null;
  const m = String(s).match(/(\d+(?:\.\d+){1,3})/);
  return m ? m[1] : null;
}

function parsePlistString(xml: string, key: string): string | null {
  const re = new RegExp(`<key>${key}<\\/key>\\s*<string>([^<]+)<\\/string>`);
  const m = xml.match(re);
  return m ? m[1].trim() : null;
}

function tryExec(bin: string, args: string[]): string | null {
  try {
    return execFileSync(bin, args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return null;
  }
}
