export default function MentionsLegalesPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">Mentions légales</h1>

      <section>
        <h2 className="mb-4 mt-10 text-xl font-semibold text-white">Éditeur du site</h2>
        <p className="text-sm leading-relaxed text-gray-300">
          ModVF — Service édité par Louis Pereira
          <br />
          Statut : Auto-entrepreneur
          <br />
          SIRET : 980 622 690 00041
          <br />
          Adresse : 1 impasse du chemin de fer, 33230 Guîtres, France
          <br />
          Email :{' '}
          <a href="mailto:contact@modvf.fr" className="text-emerald-400 hover:underline">
            contact@modvf.fr
          </a>
          <br />
          Téléphone : 07 69 43 03 43
        </p>
      </section>

      <section>
        <h2 className="mb-4 mt-10 text-xl font-semibold text-white">Directeur de la publication</h2>
        <p className="text-sm leading-relaxed text-gray-300">Louis Pereira</p>
      </section>

      <section>
        <h2 className="mb-4 mt-10 text-xl font-semibold text-white">Hébergement</h2>
        <p className="text-sm leading-relaxed text-gray-300">
          Frontend : Vercel Inc. — 440 N Barranca Ave #4133, Covina, CA 91723, USA —{' '}
          <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">
            vercel.com
          </a>
          <br />
          Backend : Railway Corp. — San Francisco, CA, USA —{' '}
          <a href="https://railway.app" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">
            railway.app
          </a>
          <br />
          Base de données et authentification : Supabase Inc. — San Francisco, CA, USA —{' '}
          <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">
            supabase.com
          </a>
        </p>
      </section>

      <section>
        <h2 className="mb-4 mt-10 text-xl font-semibold text-white">Paiement en ligne</h2>
        <p className="text-sm leading-relaxed text-gray-300">
          Stripe Technology Europe Ltd — 1 Grand Canal Street Lower, Dublin 2, Irlande.
        </p>
      </section>

      <section>
        <h2 className="mb-4 mt-10 text-xl font-semibold text-white">Contact</h2>
        <p className="text-sm leading-relaxed text-gray-300">
          Pour toute question :{' '}
          <a href="mailto:contact@modvf.fr" className="text-emerald-400 hover:underline">
            contact@modvf.fr
          </a>
        </p>
      </section>
    </article>
  )
}
