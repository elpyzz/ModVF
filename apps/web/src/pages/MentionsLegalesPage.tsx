export default function MentionsLegalesPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Mentions légales</h1>

      <div className="mt-10 space-y-10 text-sm leading-relaxed text-text-muted sm:text-base">
        <section className="space-y-3">
          <h2 className="font-display text-xl font-semibold text-text">Éditeur du site</h2>
          <p>
            ModVF est édité par Louis [nom de famille à compléter], auto-entrepreneur.
          </p>
          <p>
            SIRET : [à compléter]
            <br />
            Adresse : Le Haillan, Gironde, France
            <br />
            Email :{' '}
            <a href="mailto:contact@modvf.fr" className="text-secondary underline-offset-2 hover:underline">
              contact@modvf.fr
            </a>
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-semibold text-text">Hébergement</h2>
          <ul className="list-inside list-disc space-y-2">
            <li>Frontend : Vercel Inc., San Francisco, CA, États-Unis</li>
            <li>Backend : Railway Corp., San Francisco, CA, États-Unis</li>
            <li>Base de données : Supabase Inc., San Francisco, CA, États-Unis</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-semibold text-text">Propriété intellectuelle</h2>
          <p>
            Le site ModVF et son contenu sont la propriété exclusive de l&apos;éditeur. Les modpacks Minecraft traduits
            restent la propriété de leurs créateurs respectifs. ModVF fournit uniquement un service de traduction.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-semibold text-text">Contact</h2>
          <p>
            Pour toute question :{' '}
            <a href="mailto:contact@modvf.fr" className="text-secondary underline-offset-2 hover:underline">
              contact@modvf.fr
            </a>
          </p>
        </section>
      </div>
    </article>
  )
}
