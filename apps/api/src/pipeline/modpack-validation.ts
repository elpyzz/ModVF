import fs from 'node:fs/promises'
import path from 'node:path'
import AdmZip from 'adm-zip'

const MIN_SUPPORTED_MINOR = 18

type VersionDetectionSource = 'metadata' | 'mods.toml'

export type ModpackValidationResult =
  | {
      ok: true
      minecraftVersion: string | null
      source: VersionDetectionSource | null
    }
  | {
      ok: false
      code:
        | 'MODPACK_MISSING_MODS_DIR'
        | 'MODPACK_MISSING_CONFIG_DIR'
        | 'MODPACK_MINECRAFT_VERSION_NOT_FOUND'
        | 'MODPACK_MINECRAFT_VERSION_UNSUPPORTED'
      message: string
      action: string
      minecraftVersion?: string | null
      source?: VersionDetectionSource | null
    }

function extractVersionPrefix(rawVersion: string): string | null {
  const match = rawVersion.match(/(\d+)\.(\d+)(?:\.(\d+))?/)
  if (!match) return null
  const major = Number(match[1])
  const minor = Number(match[2])
  const patch = Number(match[3] ?? 0)
  if (!Number.isFinite(major) || !Number.isFinite(minor) || !Number.isFinite(patch)) return null
  return `${major}.${minor}.${patch}`
}

function isVersionSupported(rawVersion: string): boolean {
  const normalized = extractVersionPrefix(rawVersion)
  if (!normalized) return false
  const [major, minor] = normalized.split('.').map((part) => Number(part))
  if (major > 1) return true
  return major === 1 && minor >= MIN_SUPPORTED_MINOR
}

async function detectMinecraftVersion(modpackRoot: string): Promise<{ version: string; source: VersionDetectionSource } | null> {
  const candidates = ['minecraftinstance.json', 'instance.json', 'manifest.json', 'modrinth.index.json', 'pack.toml']
  for (const file of candidates) {
    const filePath = path.join(modpackRoot, file)
    try {
      const raw = await fs.readFile(filePath, 'utf8')
      if (file.endsWith('.json')) {
        const data = JSON.parse(raw) as Record<string, unknown>
        const maybeMinecraft = data.minecraft as { version?: unknown } | undefined
        if (typeof maybeMinecraft?.version === 'string') return { version: maybeMinecraft.version, source: 'metadata' }

        const maybeDependencies = data.dependencies as { minecraft?: unknown } | undefined
        if (typeof maybeDependencies?.minecraft === 'string') return { version: maybeDependencies.minecraft, source: 'metadata' }

        if (typeof data.gameVersion === 'string') return { version: data.gameVersion, source: 'metadata' }
        if (typeof data.mc_version === 'string') return { version: data.mc_version, source: 'metadata' }
      }

      if (file === 'pack.toml') {
        const match = raw.match(/minecraft\s*=\s*"([^"]+)"/)
        if (match?.[1]) return { version: match[1], source: 'metadata' }
      }
    } catch {
      // Ignore missing/unreadable metadata files and continue.
    }
  }

  const modsDir = path.join(modpackRoot, 'mods')
  try {
    const modsEntries = await fs.readdir(modsDir, { withFileTypes: true })
    const modJars = modsEntries.filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.jar'))

    for (const jar of modJars.slice(0, 10)) {
      try {
        const zip = new AdmZip(path.join(modsDir, jar.name))
        const modsToml = zip.getEntry('META-INF/mods.toml')
        if (!modsToml) continue
        const content = modsToml.getData().toString('utf8')
        const match = content.match(/modId\s*=\s*"minecraft"[\s\S]*?versionRange\s*=\s*"\[(\d+\.\d+(?:\.\d+)?)/)
        if (match?.[1]) return { version: match[1], source: 'mods.toml' }
      } catch {
        // Ignore unreadable jars while trying other candidates.
      }
    }
  } catch {
    // mods folder readability is validated elsewhere.
  }

  return null
}

export async function validateModpack(modpackRoot: string): Promise<ModpackValidationResult> {
  const modsDir = path.join(modpackRoot, 'mods')
  const configDir = path.join(modpackRoot, 'config')

  try {
    const modsStat = await fs.stat(modsDir)
    if (!modsStat.isDirectory()) {
      return {
        ok: false,
        code: 'MODPACK_MISSING_MODS_DIR',
        message: "Structure invalide: dossier 'mods' introuvable.",
        action: "Fournir un ZIP modpack contenant un dossier 'mods' à la racine du pack.",
      }
    }
  } catch {
    return {
      ok: false,
      code: 'MODPACK_MISSING_MODS_DIR',
      message: "Structure invalide: dossier 'mods' introuvable.",
      action: "Fournir un ZIP modpack contenant un dossier 'mods' à la racine du pack.",
    }
  }

  try {
    const configStat = await fs.stat(configDir)
    if (!configStat.isDirectory()) {
      return {
        ok: false,
        code: 'MODPACK_MISSING_CONFIG_DIR',
        message: "Structure invalide: dossier 'config' introuvable.",
        action: "Fournir un ZIP modpack contenant un dossier 'config' à la racine du pack.",
      }
    }
  } catch {
    return {
      ok: false,
      code: 'MODPACK_MISSING_CONFIG_DIR',
      message: "Structure invalide: dossier 'config' introuvable.",
      action: "Fournir un ZIP modpack contenant un dossier 'config' à la racine du pack.",
    }
  }

  const detectedVersion = await detectMinecraftVersion(modpackRoot)
  if (!detectedVersion) {
    return {
      ok: false,
      code: 'MODPACK_MINECRAFT_VERSION_NOT_FOUND',
      message: 'Version Minecraft introuvable dans les métadonnées du modpack.',
      action:
        "Ajouter une métadonnée de version Minecraft (manifest/instance/modrinth/pack.toml) ou un mods.toml lisible, puis réessayer.",
      minecraftVersion: null,
      source: null,
    }
  }

  if (!isVersionSupported(detectedVersion.version)) {
    return {
      ok: false,
      code: 'MODPACK_MINECRAFT_VERSION_UNSUPPORTED',
      message: `Version Minecraft non supportée: ${detectedVersion.version}. Version minimale acceptée: 1.18.`,
      action: 'Fournir un modpack en version Minecraft 1.18 ou supérieure.',
      minecraftVersion: detectedVersion.version,
      source: detectedVersion.source,
    }
  }

  return { ok: true, minecraftVersion: detectedVersion.version, source: detectedVersion.source }
}
