import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

const faqs = [
  {
    q: 'Quels modpacks sont compatibles ?',
    a: 'Tous ceux en .zip : Forge, Fabric, Quilt, NeoForge, des versions 1.7.10 à 1.21+. Petit pack ou très gros (type All The Mods), le principe reste le même.',
  },
  {
    q: 'Combien de temps prend une traduction ?',
    a: 'Un modpack classique prend souvent quelques minutes. Les très gros packs (200+ mods) peuvent monter à environ 15 minutes. Les relances suivantes peuvent être plus rapides grâce au cache.',
  },
  {
    q: 'La traduction est-elle de bonne qualité ?',
    a: 'Oui. Nous utilisons un glossaire orienté Minecraft : « Crafting Table » devient « Établi », pas « Table de fabrication ». Les quêtes et textes longs sont traités avec soin.',
  },
  {
    q: 'Est-ce que cela modifie mes mods ?',
    a: 'Non. Vous obtenez une copie traduite : votre archive d’origine reste intacte. Vous pouvez toujours revenir à la version non traduite.',
  },
  {
    q: 'Puis-je traduire dans d’autres langues ?',
    a: 'Pour l’instant, ModVF est centré sur le français. D’autres langues pourront suivre plus tard.',
  },
  {
    q: 'Comment installer le modpack traduit ?',
    a: 'Comme n’importe quel modpack : importez le fichier .zip dans votre lanceur (CurseForge, Prism, ATLauncher, MultiMC, etc.), puis lancez le jeu.',
  },
]

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="border-t border-white/5 py-20 sm:py-24">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.45 }}
        className="text-center font-display text-3xl font-bold sm:text-4xl"
      >
        Questions fréquentes
      </motion.h2>

      <div className="mx-auto mt-10 max-w-4xl space-y-3">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index
          return (
            <motion.div
              key={faq.q}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.35, delay: index * 0.04 }}
              className="rounded-xl border border-white/10 bg-surface"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                aria-expanded={isOpen}
              >
                {faq.q}
                <ChevronDown className={`h-4 w-4 shrink-0 transition ${isOpen ? 'rotate-180' : ''}`} />
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
                    <p className="px-5 pb-5 text-sm leading-relaxed text-text-muted">{faq.a}</p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
