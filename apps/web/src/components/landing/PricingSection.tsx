import { motion } from 'framer-motion'

const plans = [
  {
    name: 'DECOUVERTE',
    price: '0EUR',
    oldPrice: null,
    highlight: false,
    cta: 'Essayer gratuitement',
    outlined: true,
    features: ['1 traduction offerte', "Modpack jusqu'a 50 mods", 'Telechargement 24h'],
  },
  {
    name: 'STARTER',
    price: '9EUR',
    oldPrice: '12EUR',
    highlight: true,
    cta: 'Choisir Starter',
    outlined: false,
    features: ['3 traductions', 'Modpacks illimites en taille', 'Telechargement 72h', 'Support prioritaire'],
  },
  {
    name: 'PRO',
    price: '29EUR',
    oldPrice: '40EUR',
    highlight: false,
    cta: 'Choisir Pro',
    outlined: true,
    features: [
      '10 traductions',
      'Modpacks illimites en taille',
      'Telechargement 7 jours',
      'Support prioritaire',
      'Traduction incrementale (mises a jour)',
    ],
  },
]

export default function PricingSection() {
  return (
    <section className="border-t border-white/5 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.45 }}
        className="text-center"
      >
        <h2 className="font-display text-3xl font-bold sm:text-4xl">Choisis ton pack</h2>
        <p className="mt-3 text-text-muted">Premiere traduction offerte. Sans carte bancaire.</p>
      </motion.div>

      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {plans.map((plan, index) => (
          <motion.article
            key={plan.name}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            className={`relative rounded-2xl border p-7 ${
              plan.highlight
                ? 'scale-[1.02] border-transparent bg-surface [background:linear-gradient(#12121A,#12121A)_padding-box,linear-gradient(135deg,#6C3CE1,#00D4AA)_border-box] shadow-[0_0_30px_rgba(108,60,225,0.28)]'
                : 'border-white/10 bg-surface'
            }`}
          >
            {plan.highlight ? (
              <span className="absolute right-4 top-4 rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-primary">Populaire</span>
            ) : null}

            <h3 className="text-sm font-semibold tracking-wide text-text-muted">{plan.name}</h3>
            <div className="mt-4 flex items-end gap-2">
              <p className="text-4xl font-extrabold">{plan.price}</p>
              {plan.oldPrice ? <p className="pb-1 text-sm text-text-muted line-through">{plan.oldPrice}</p> : null}
            </div>

            <ul className="mt-6 space-y-2 text-sm text-text-muted">
              {plan.features.map((feature) => (
                <li key={feature}>• {feature}</li>
              ))}
            </ul>

            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`mt-7 w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${
                plan.outlined
                  ? 'border border-white/20 text-text hover:border-primary/60'
                  : 'bg-primary text-white shadow-[0_0_25px_rgba(108,60,225,0.45)] hover:bg-primary/90 [animation:ctaGlow_4s_ease-in-out_infinite]'
              }`}
            >
              {plan.cta}
            </motion.button>
          </motion.article>
        ))}
      </div>
    </section>
  )
}
