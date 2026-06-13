import { spawnSync } from 'node:child_process';

export interface SafariToolchain {
  platformOk: boolean;
  developerDir: string | null;
  needsFullXcode: boolean;
  converter: string | null;
  xcodebuild: string | null;
  ok: boolean;
}

export type SpawnSyncLike = (
  command: string,
  args: string[],
  options: { encoding: 'utf8'; timeout: number },
) => { status: number | null; stdout: string };

export type ToolchainDeps = {
  spawnSync?: SpawnSyncLike;
  platform?: NodeJS.Platform;
};

export function isMacOS(platform?: NodeJS.Platform): boolean {
  return (platform ?? process.platform) === 'darwin';
}

function activeDeveloperDir(spawn: SpawnSyncLike): string | null {
  try {
    const result = spawn('xcode-select', ['-p'], {
      encoding: 'utf8',
      timeout: 15000,
    });

    if (result.status !== 0) return null;

    const resolved = String(result.stdout || '').trim();
    return resolved.length > 0 ? resolved : null;
  } catch {
    return null;
  }
}

function findWithXcrun(spawn: SpawnSyncLike, tool: string): string | null {
  try {
    const result = spawn('xcrun', ['--find', tool], {
      encoding: 'utf8',
      timeout: 15000,
    });
    if (result.status !== 0) return null;

    const resolved = String(result.stdout || '').trim();
    return resolved.length > 0 ? resolved : null;
  } catch {
    return null;
  }
}

/**
 * Detect the macOS toolchain required to build Safari web extensions:
 * the active developer directory, `safari-web-extension-converter`, and
 * `xcodebuild`. The Command Line Tools alone are not enough — the converter
 * ships only with full Xcode, which `needsFullXcode` reports.
 */
export function detectSafariToolchain(deps?: ToolchainDeps): SafariToolchain {
  const spawn: SpawnSyncLike = deps?.spawnSync ?? spawnSync;

  const platformOk = isMacOS(deps?.platform);
  if (!platformOk) {
    return {
      platformOk: false,
      developerDir: null,
      needsFullXcode: false,
      converter: null,
      xcodebuild: null,
      ok: false,
    };
  }

  const developerDir = activeDeveloperDir(spawn);
  // The CLT path (or no active dir) cannot provide safari-web-extension-converter
  const needsFullXcode =
    !developerDir || /CommandLineTools/i.test(developerDir);

  const converter = findWithXcrun(spawn, 'safari-web-extension-converter');
  const xcodebuild = findWithXcrun(spawn, 'xcodebuild');

  return {
    platformOk,
    developerDir,
    needsFullXcode,
    converter,
    xcodebuild,
    ok: Boolean(converter && xcodebuild),
  };
}
