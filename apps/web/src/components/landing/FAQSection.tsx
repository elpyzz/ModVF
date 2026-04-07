import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

const linkFaq = 'font-semibold text-brand-400 underline-offset-2 hover:underline'
const linkGuide = 'font-semibold text-brand-400 underline-offset-2 hover:underline'

const faqs: { q: string; a: ReactNode }[] = [
  {
    q: 'Quels modpacks sont compatibles ?',
    a: (
      <>
        Tout modpack en ZIP avec <strong className="text-white">mods/</strong> et <strong className="text-white">config/</strong>
        , Minecraft <strong className="text-white">1.18+</strong>, Forge, Fabric, Quilt ou NeoForge — jusqu&apos;à{' '}
        <strong className="text-white">2 Go</strong>. Limites, launchers et cas particuliers :{' '}
        <Link to="/faq" className={linkFaq}>
          voir la FAQ complète
        </Link>
        .
      </>
    ),
  },
  {
    q: 'Combien de temps prend une traduction ?',
    a: (
      <>
        En général <strong className="text-white">2 à 30 minutes</strong> selon la taille du pack (première fois). Les
        retraductions du même pack sont bien plus rapides grâce au <strong className="text-white">cache</strong>.
      </>
    ),
  },
  {
    q: "Qu'est-ce qui est traduit ?",
    a: (
      <>
        Environ <strong className="text-white">95 %</strong> du texte visible : items, blocs, tooltips, quêtes FTB
        Quests, Patchouli, avancements, etc. Environ <strong className="text-white">5 %</strong> reste en anglais car
        figé dans le code Java des mods — aucun resource pack ne peut le traduire.
      </>
    ),
  },
  {
    q: 'Comment installer la traduction ?',
    a: (
      <>
        Vous recevez un resource pack (<strong className="text-white">ModVF_Traduction_FR.zip</strong>) à mettre dans{' '}
        <strong className="text-white">resourcepacks/</strong> et un dossier <strong className="text-white">config/</strong>{' '}
        à fusionner en remplaçant l&apos;ancien. Pas à pas :{' '}
        <Link to="/guide" className={linkGuide}>
          consulter le guide
        </Link>
        .
      </>
    ),
  },
  {
    q: 'Toutes les quêtes sont traduites ?',
    a: (
      <>
        <strong className="text-white">FTB Quests</strong> : oui, entièrement. Les packs avec un système de quêtes
        propriétaire (ex. <strong className="text-white">Vault Hunters</strong>) : les quêtes non, mais items, blocs et
        descriptions oui.
      </>
    ),
  },
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="section-padding border-t border-white/5">
      <div className="mx-auto max-w-4xl px-6">
        <h2 className="text-center text-3xl font-bold md:text-5xl">Questions fréquentes</h2>

        <div className="mt-10 space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index
            return (
              <div key={faq.q} className="overflow-hidden rounded-xl border border-white/5">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full cursor-pointer items-center justify-between p-5 text-left transition-colors hover:bg-surface-2"
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold text-white">{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 text-muted transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="bg-surface-2 p-5 pt-0 text-sm text-muted">{faq.a}</div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            )
          })}
        </div>

        <p className="mt-10 text-center">
          <Link to="/faq" className="text-sm font-medium text-brand-400 transition hover:text-brand-300">
            Voir toutes les questions ?
          </Link>
        </p>
      </div>
    </section>
  )
}

export default FAQSection