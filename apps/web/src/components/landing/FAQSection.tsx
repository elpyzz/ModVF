import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

const faqs = [
  {
    q: 'Quels modpacks sont compatibles ?',
    a: 'Tous ! Forge, Fabric, Quilt, NeoForge, de Minecraft 1.7.10 a 1.21+. Que ce soit un petit modpack de 10 mods ou un mastodonte de 400+ mods comme All The Mods.',
  },
  {
    q: 'Combien de temps prend une traduction ?',
    a: 'En moyenne 1 a 3 minutes pour un modpack standard (50-200 mods). Les tres gros modpacks (300+) peuvent prendre jusqua 5 minutes.',
  },
  {
    q: 'La traduction est-elle de bonne qualite ?',
    a: "Oui. Notre moteur utilise un glossaire specialise Minecraft avec des milliers de termes valides. 'Crafting Table' sera toujours 'Etabli', jamais 'Table de fabrication'.",
  },
  {
    q: 'Est-ce que ca modifie mes mods ?',
    a: "Non. ModVF cree une copie traduite de votre modpack. L'original n'est jamais modifie. Vous pouvez toujours revenir a la version anglaise.",
  },
  {
    q: 'Je peux traduire dans d autres langues ?',
    a: 'Pour linstant, ModVF est specialise en traduction vers le francais. Dautres langues (espagnol, allemand, portugais) arrivent bientot.',
  },
  {
    q: 'Comment installer le modpack traduit ?',
    a: 'Exactement comme un modpack normal. Telechargez le .zip, importez-le dans votre launcher (CurseForge, Prism, ATLauncher, MultiMC...), et jouez.',
  },
]

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="border-t border-white/5 py-24">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.45 }}
        className="text-center font-display text-3xl font-bold sm:text-4xl"
      >
        Questions frequentes
      </motion.h2>

      <div className="mx-auto mt-10 max-w-4xl space-y-3">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index
          return (
            <div key={faq.q} className="rounded-xl border border-white/10 bg-surface">
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                aria-expanded={isOpen}
              >
                {faq.q}
                <ChevronDown className={`h-4 w-4 transition ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence initial={false}>
                {isOpen ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-sm text-text-muted">{faq.a}</p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </section>
  )
}
