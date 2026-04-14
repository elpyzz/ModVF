import { BookOpen, Folder, Info, Package, Sparkles, Upload } from 'lucide-react'
import { useEffect } from 'react'

export default function GuidePage() {
  useEffect(() => {
    document.title = 'Guide ModVF — Comment traduire son modpack Minecraft'
  }, [])

  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <header className="text-center">
        <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">Comment traduire ton modpack</h1>
        <p className="mt-3 text-base text-gray-400 sm:text-lg">3 étapes simples, 5 minutes maximum.</p>
        <p className="mt-2 text-sm text-text-muted">
          Selon le modpack, certaines instructions peuvent varier. Consultez toujours la page dédiée de votre modpack
          dans la section Modpacks avant l&apos;installation finale.
        </p>
      </header>

      <div className="mt-8 rounded-lg border border-red-500 bg-red-900/30 p-4">
        <p className="text-base font-semibold text-red-200">⚠️ IMPORTANT — Ne supprimez JAMAIS vos dossiers existants !</p>
        <p className="mt-2 text-sm leading-relaxed text-red-100/90">
          Ne supprimez pas vos dossiers config/, mods/, ou autres avant d&apos;installer la traduction. Copiez
          simplement les fichiers traduits PAR-DESSUS votre installation existante en choisissant &quot;Remplacer les
          fichiers existants&quot;. Supprimer vos dossiers peut casser vos quêtes, configurations et sauvegardes.
        </p>
      </div>

      <div className="mt-12">
        <article className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-8">
          <div className="mb-5 flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/10 text-sm font-bold text-emerald-400">
              1
            </span>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
              <Package className="h-5 w-5 text-emerald-400" />
              Préparer le ZIP
            </h2>
          </div>

          <p className="text-sm leading-relaxed text-gray-300">
            Ouvrez le dossier de votre modpack dans votre launcher (CurseForge, Prism, ATLauncher, MultiMC...). Vous
            devez sélectionner les dossiers <code className="rounded bg-white/10 px-2 py-0.5 font-mono text-xs">mods/</code>{' '}
            et <code className="rounded bg-white/10 px-2 py-0.5 font-mono text-xs">config/</code>, puis les compresser en{' '}
            <code className="rounded bg-white/10 px-2 py-0.5 font-mono text-xs">.zip</code>.
          </p>
          <p className="mt-3 text-sm text-gray-300">
            <span className="mr-2 inline-flex items-center gap-1 text-emerald-400">
              <Sparkles className="h-4 w-4" />
              Astuce CurseForge :
            </span>
            clic droit sur le modpack puis &quot;Ouvrir le dossier&quot;.
          </p>
          <p className="mt-1 text-sm text-gray-300">
            <span className="mr-2 inline-flex items-center gap-1 text-emerald-400">
              <Sparkles className="h-4 w-4" />
              Astuce Prism :
            </span>
            clic droit puis &quot;Dossier Minecraft&quot;.
          </p>

          <div className="mt-6 rounded-xl border border-white/5 bg-black/30 p-4 font-mono text-sm">
            <div className="mb-2 flex items-center gap-2 text-gray-400">
              <Folder className="h-4 w-4" />
              mon-modpack.zip
            </div>
            <div className="ml-4 text-white">
              mods/ <span className="ml-2 text-emerald-400">← obligatoire</span>
            </div>
            <div className="ml-4 text-white">
              config/ <span className="ml-2 text-emerald-400">← obligatoire (pour les quêtes)</span>
            </div>
            <div className="ml-4 text-gray-600">
              kubejs/ <span className="ml-2 text-gray-600">← optionnel</span>
            </div>
          </div>

          <div className="mt-4 rounded-xl border-l-4 border-amber-400 bg-amber-400/5 p-4">
            <p className="text-sm text-gray-300">
              <span className="font-semibold text-amber-400">Important :</span> N&apos;incluez pas les dossiers{' '}
              <code className="rounded bg-white/10 px-2 py-0.5 font-mono text-xs">saves/</code>,{' '}
              <code className="rounded bg-white/10 px-2 py-0.5 font-mono text-xs">logs/</code>,{' '}
              <code className="rounded bg-white/10 px-2 py-0.5 font-mono text-xs">resourcepacks/</code> ou d&apos;autres
              dossiers. Seuls <code className="rounded bg-white/10 px-2 py-0.5 font-mono text-xs">mods/</code> et{' '}
              <code className="rounded bg-white/10 px-2 py-0.5 font-mono text-xs">config/</code> sont nécessaires.
            </p>
          </div>
        </article>

        <article className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-8">
          <div className="mb-5 flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/10 text-sm font-bold text-emerald-400">
              2
            </span>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
              <Upload className="h-5 w-5 text-emerald-400" />
              Lancer la traduction
            </h2>
          </div>

          <div className="space-y-2 text-sm text-gray-300">
            <p>1. Connectez-vous sur modvf.fr</p>
            <p>2. Glissez votre .zip dans la zone d&apos;upload</p>
            <p>3. Cliquez &quot;Traduire mon modpack&quot;</p>
            <p>4. Attendez la fin de la traduction</p>
          </div>

          <div className="mt-4 rounded-xl border-l-4 border-emerald-400 bg-emerald-400/5 p-4">
            <p className="text-sm text-gray-300">
              <span className="font-semibold text-emerald-400">Durée estimée :</span> Petits modpacks : 2-5 min · Moyens
              : 5-10 min · Gros (200+ mods) : 10-20 min. La première traduction est la plus longue — les suivantes sont
              quasi instantanées grâce au cache.
            </p>
          </div>
        </article>

        <article className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-8">
          <div className="mb-5 flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/10 text-sm font-bold text-emerald-400">
              3
            </span>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
              <BookOpen className="h-5 w-5 text-emerald-400" />
              Installer et jouer
            </h2>
          </div>

          <div className="mb-4 rounded-xl border border-white/5 bg-white/[0.03] p-5">
            <h4 className="mb-3 text-base font-semibold text-emerald-400">Resource pack</h4>
            <ol className="space-y-2 text-sm text-gray-300">
              <li>
                1. Copiez{' '}
                <code className="rounded bg-white/10 px-2 py-0.5 font-mono text-xs text-emerald-400">
                  ModVF_Traduction_FR.zip
                </code>{' '}
                dans votre dossier <code className="rounded bg-white/10 px-2 py-0.5 font-mono text-xs">resourcepacks/</code>
              </li>
              <li>2. Lancez Minecraft</li>
              <li>3. Options → Resource Packs → activez ModVF (déplacez-le à droite)</li>
              <li>
                4. <span className="font-semibold text-amber-400">Important :</span> réglez la langue sur{' '}
                <span className="font-semibold">Français</span>
              </li>
            </ol>
          </div>

          <div className="rounded-xl border border-white/5 bg-white/[0.03] p-5">
            <h4 className="mb-3 text-base font-semibold text-purple-400">Quêtes traduites</h4>
            <ol className="space-y-2 text-sm text-gray-300">
              <li>1. Ouvrez le dossier de votre modpack</li>
              <li>2. Faites glisser les fichiers traduits dans votre dossier du modpack</li>
              <li>3. Quand Windows demande, choisissez &quot;Remplacer les fichiers dans la destination&quot;</li>
              <li>4. Ne supprimez rien manuellement</li>
            </ol>
            <div className="mt-3 rounded-lg border border-red-400/10 bg-red-400/5 p-3">
              <p className="text-xs text-gray-400">
                <span className="font-semibold text-red-400">Rappel :</span> Faites glisser les fichiers traduits dans
                votre dossier du modpack → quand Windows demande, choisissez &quot;Remplacer les fichiers dans la
                destination&quot;. Ne supprimez rien manuellement.
              </p>
            </div>
          </div>
        </article>

        <div className="mb-6 rounded-lg border border-blue-500/30 bg-blue-900/20 p-4">
          <h3 className="text-base font-semibold text-white">Note sur les quêtes</h3>
          <p className="mt-2 text-sm leading-relaxed text-text-muted">
            La traduction des quêtes fonctionne sur la majorité des modpacks. Si après installation vos quêtes
            apparaissent sans texte (&quot;Unnamed&quot;), cela signifie que ce modpack utilise un format incompatible.
            Dans ce cas, réinstallez votre modpack proprement et recopiez les fichiers traduits SANS le dossier
            ftbquests. Les items et descriptions resteront en français.
          </p>
        </div>

        <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center sm:p-8">
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">Tutoriel vidéo</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-400 sm:text-base">
            Suivez ce guide en 2 minutes pour traduire votre premier modpack.
          </p>
          <div className="mx-auto mt-6 w-full max-w-[720px] overflow-hidden rounded-xl shadow-lg">
            <iframe
              width="100%"
              style={{ aspectRatio: '16 / 9', maxWidth: '720px' }}
              src="https://www.youtube.com/embed/W2hp4I---po"
              title="Tutoriel ModVF"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>

        <div className="mt-12 rounded-2xl border-l-4 border-blue-400 bg-blue-400/5 p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <Info className="h-5 w-5 text-blue-400" />
            Bon à savoir
          </h3>
          <ul className="space-y-3 text-sm text-gray-300">
            <li>
              • ModVF traduit environ <span className="font-medium text-white">80% à 100%</span> du contenu selon les
              modpacks
            </li>
            <li>
              • Le jeu doit être en <span className="font-medium text-white">français</span> pour que la traduction
              s&apos;affiche
            </li>
            <li>• Si le resource pack affiche &quot;Incompatible&quot;, cliquez &quot;Oui&quot; — ça fonctionne quand même</li>
            <li>• Vos fichiers originaux ne sont jamais modifiés</li>
            <li>• La première traduction est la plus longue — les suivantes utilisent le cache</li>
          </ul>
        </div>
      </div>
    </section>
  )
}
