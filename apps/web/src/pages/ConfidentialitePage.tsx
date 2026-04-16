export default function ConfidentialitePage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">Politique de confidentialité</h1>
      <p className="mt-3 text-sm leading-relaxed text-gray-300">Dernière mise à jour : 7 avril 2026</p>

      <section>
        <h2 className="mb-4 mt-10 text-xl font-semibold text-white">Responsable de traitement</h2>
        <p className="text-sm leading-relaxed text-gray-300">
          Louis Pereira —{' '}
          <a href="mailto:modvf.contact@gmail.com" className="text-emerald-400 hover:underline">
            modvf.contact@gmail.com
          </a>
        </p>
      </section>

      <section>
        <h2 className="mb-4 mt-10 text-xl font-semibold text-white">Données collectées et finalités</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm text-gray-300">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-3 py-3 text-left font-medium text-white">Donnée</th>
                <th className="px-3 py-3 text-left font-medium text-white">Finalité</th>
                <th className="px-3 py-3 text-left font-medium text-white">Base légale</th>
                <th className="px-3 py-3 text-left font-medium text-white">Conservation</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <td className="px-3 py-3">Email, mot de passe (ou Google OAuth)</td>
                <td className="px-3 py-3">Création et gestion du compte</td>
                <td className="px-3 py-3">Exécution du contrat</td>
                <td className="px-3 py-3">Durée du compte + 1 an après suppression</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="px-3 py-3">Adresse IP, user-agent</td>
                <td className="px-3 py-3">Sécurité, logs techniques, debug</td>
                <td className="px-3 py-3">Intérêt légitime</td>
                <td className="px-3 py-3">12 mois</td>
              </tr>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <td className="px-3 py-3">Fichiers uploadés (.zip, .jar)</td>
                <td className="px-3 py-3">Traduction du modpack/mod</td>
                <td className="px-3 py-3">Exécution du contrat</td>
                <td className="px-3 py-3">Supprimés automatiquement après 24h à 7 jours selon le plan</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="px-3 py-3">Historique de traductions (métadonnées)</td>
                <td className="px-3 py-3">Suivi du compte, support</td>
                <td className="px-3 py-3">Exécution du contrat</td>
                <td className="px-3 py-3">Durée du compte</td>
              </tr>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <td className="px-3 py-3">Données de paiement</td>
                <td className="px-3 py-3">Facturation via Stripe</td>
                <td className="px-3 py-3">Exécution du contrat</td>
                <td className="px-3 py-3">Gérées par Stripe — ModVF ne stocke aucun numéro de carte</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="px-3 py-3">Cookies de session</td>
                <td className="px-3 py-3">Authentification</td>
                <td className="px-3 py-3">Exécution du contrat</td>
                <td className="px-3 py-3">Durée de la session</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-4 mt-10 text-xl font-semibold text-white">Sous-traitants et destinataires</h2>
        <ul className="space-y-2 text-sm leading-relaxed text-gray-300">
          <li>• Supabase Inc. (USA) — authentification et base de données</li>
          <li>• Stripe Technology Europe Ltd (Irlande) — paiement</li>
          <li>• Vercel Inc. (USA) — hébergement frontend</li>
          <li>• Railway Corp. (USA) — hébergement backend</li>
          <li>• Google LLC (USA) — API Google Translate pour la traduction</li>
          <li>• Redis (via Railway) — cache de traductions</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-4 mt-10 text-xl font-semibold text-white">Transferts hors UE</h2>
        <p className="text-sm leading-relaxed text-gray-300">
          Certains sous-traitants sont basés aux États-Unis (Supabase, Vercel, Railway, Google). Ces transferts sont
          encadrés par les Clauses Contractuelles Types (SCC) de la Commission européenne et/ou le Data Privacy Framework
          UE-US.
        </p>
      </section>

      <section>
        <h2 className="mb-4 mt-10 text-xl font-semibold text-white">Droits des utilisateurs</h2>
        <p className="text-sm leading-relaxed text-gray-300">
          Conformément au RGPD, vous disposez des droits suivants : accès, rectification, suppression, opposition,
          limitation, portabilité. Pour exercer vos droits :{' '}
          <a href="mailto:modvf.contact@gmail.com" className="text-emerald-400 hover:underline">
            modvf.contact@gmail.com
          </a>
          . Réponse sous 30 jours. En cas de litige, vous pouvez saisir la CNIL (
          <a href="https://www.cnil.fr" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">
            www.cnil.fr
          </a>
          ).
        </p>
      </section>

      <section>
        <h2 className="mb-4 mt-10 text-xl font-semibold text-white">Cookies</h2>
        <p className="text-sm leading-relaxed text-gray-300">
          ModVF utilise uniquement des cookies strictement nécessaires au fonctionnement du service (session
          d&apos;authentification Supabase). Aucun cookie publicitaire, marketing ou de tracking tiers n&apos;est utilisé.
          Si Vercel Analytics est activé, il fonctionne sans cookies.
        </p>
      </section>

      <section>
        <h2 className="mb-4 mt-10 text-xl font-semibold text-white">Mineurs</h2>
        <p className="text-sm leading-relaxed text-gray-300">
          ModVF est accessible aux utilisateurs âgés de 13 ans et plus. Les utilisateurs de moins de 13 ans ne sont pas
          autorisés à créer un compte.
        </p>
      </section>

      <section>
        <h2 className="mb-4 mt-10 text-xl font-semibold text-white">Sécurité</h2>
        <p className="text-sm leading-relaxed text-gray-300">
          Les communications sont chiffrées via HTTPS/TLS. Les mots de passe sont hashés par Supabase (bcrypt). L&apos;accès
          aux serveurs est restreint. Les fichiers uploadés sont supprimés automatiquement après traitement.
        </p>
      </section>
    </article>
  )
}
