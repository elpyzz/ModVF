export default function ConfidentialitePage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Politique de confidentialité</h1>
      <p className="mt-4 text-sm italic text-text-muted sm:text-base">Dernière mise à jour : avril 2026</p>

      <div className="mt-10 space-y-10 text-sm leading-relaxed text-text-muted sm:text-base">
        <section className="space-y-3">
          <h2 className="font-display text-xl font-semibold text-text">Données collectées</h2>
          <ul className="list-inside list-disc space-y-2">
            <li>Courriel et pseudo lors de l&apos;inscription</li>
            <li>Fichiers téléversés (modpacks) : supprimés automatiquement après 24&nbsp;h</li>
            <li>Données de paiement : traitées par Stripe, jamais stockées sur nos serveurs</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-semibold text-text">Utilisation des données</h2>
          <p>Vos données sont utilisées uniquement pour :</p>
          <ul className="list-inside list-disc space-y-2">
            <li>Gérer votre compte et vos crédits</li>
            <li>Fournir le service de traduction</li>
            <li>Vous contacter en cas de besoin</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-semibold text-text">Cookies</h2>
          <p>
            ModVF utilise uniquement des cookies techniques nécessaires au fonctionnement du site (authentification).
            Aucun cookie publicitaire ou de suivi d&apos;audience.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-semibold text-text">Vos droits</h2>
          <p>
            Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression de vos
            données. Contactez{' '}
            <a href="mailto:contact@modvf.fr" className="text-primary underline-offset-2 hover:underline">
              contact@modvf.fr
            </a>{' '}
            pour exercer ces droits.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-semibold text-text">Hébergement des données</h2>
          <ul className="list-inside list-disc space-y-2">
            <li>Comptes utilisateurs : Supabase (serveurs UE)</li>
            <li>Fichiers : Railway (supprimés après 24&nbsp;h)</li>
            <li>Paiements : Stripe (certifié PCI DSS)</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-semibold text-text">Contact</h2>
          <p>
            Pour toute question relative à vos données :{' '}
            <a href="mailto:contact@modvf.fr" className="text-primary underline-offset-2 hover:underline">
              contact@modvf.fr
            </a>
          </p>
        </section>
      </div>
    </article>
  )
}
