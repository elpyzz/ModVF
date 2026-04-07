import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useScrollReveal } from '../../hooks/useScrollReveal'

const linkFaq = 'font-semibold text-primary underline-offset-2 hover:underline'
const linkGuide = 'font-semibold text-primary underline-offset-2 hover:underline'

const faqs: { q: string; a: ReactNode }[] = [
  {
    q: 'Quels modpacks sont compatibles ?',
    a: (
      <>
        Tout modpack en ZIP avec <strong className="text-text">mods/</strong> et <strong className="text-text">config/</strong>
        , Minecraft <strong className="text-text">1.18+</strong>, Forge, Fabric, Quilt ou NeoForge — jusqu&apos;à{' '}
        <strong className="text-text">2 Go</strong>. Limites, launchers et cas particuliers :{' '}
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
        En général <strong className="text-text">2 à 30 minutes</strong> selon la taille du pack (première fois). Les
        retraductions du même pack sont bien plus rapides grâce au <strong className="text-text">cache</strong>.
      </>
    ),
  },
  {
    q: "Qu'est-ce qui est traduit ?",
    a: (
      <>
        Environ <strong className="text-text">95 %</strong> du texte visible : items, blocs, tooltips, quêtes FTB
        Quests, Patchouli, avancements, etc. Environ <strong className="text-text">5 %</strong> reste en anglais car
        figé dans le code Java des mods — aucun resource pack ne peut le traduire.
      </>
    ),
  },
  {
    q: 'Comment installer la traduction ?',
    a: (
      <>
        Vous recevez un resource pack (<strong className="text-text">ModVF_Traduction_FR.zip</strong>) à mettre dans{' '}
        <strong className="text-text">resourcepacks/</strong> et un dossier <strong className="text-text">config/</strong>{' '}
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
        <strong className="text-text">FTB Quests</strong> : oui, entièrement. Les packs avec un système de quêtes
        propriétaire (ex. <strong className="text-text">Vault Hunters</strong>) : les quêtes non, mais items, blocs et
        descriptions oui. Plus de détails :{' '}
        <Link to="/faq" className={linkFaq}>
          FAQ complète
        </Link>
        .
      </>
    ),
  },
]

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const sectionRef = useScrollReveal()

  return (
    <section ref={sectionRef} className="reveal border-t border-white/5 py-24 sm:py-32">
      <h2 className="text-center font-display text-3xl font-semibold sm:text-4xl md:font-bold">Questions fréquentes</h2>

      <div className="mx-auto mt-10 max-w-4xl space-y-2">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index
          return (
            <div key={faq.q} className="rounded-xl border border-white/5 bg-surface">
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/50"
                aria-expanded={isOpen}
              >
                {faq.q}
                <ChevronDown
                  className={`h-4 w-4 shrink-0 transition-transform duration-300 ease-out ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>
              <AnimatePresence initial={false}>
                {isOpen ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-white/5 px-5 pb-5 pt-3 text-sm font-normal leading-relaxed text-text-muted">
                      {faq.a}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      <p className="mt-10 text-center">
        <Link
          to="/faq"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary transition hover:text-primary/90"
        >
          Voir toutes les questions →
        </Link>
      </p>
    </section>
  )
}
