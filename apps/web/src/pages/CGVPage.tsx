import { Link } from 'react-router-dom'

export default function CGVPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Conditions générales de vente</h1>
      <p className="mt-4 text-sm italic text-text-muted sm:text-base">Dernière mise à jour : avril 2026</p>

      <div className="mt-10 space-y-10 text-sm leading-relaxed text-text-muted sm:text-base">
        <section className="space-y-3">
          <h2 className="font-display text-xl font-semibold text-text">1. Objet</h2>
          <p>
            Les présentes CGV régissent la vente de crédits de traduction sur le site modvf.fr.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-semibold text-text">2. Prix</h2>
          <ul className="list-inside list-disc space-y-2">
            <li>Pack Starter : 7&nbsp;€ TTC pour 3 traductions</li>
            <li>Pack : 12&nbsp;€ TTC pour 10 traductions</li>
          </ul>
          <p>
            Les prix sont en euros, toutes taxes comprises. L&apos;éditeur se réserve le droit de modifier ses prix à
            tout moment.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-semibold text-text">3. Paiement</h2>
          <p>
            Le paiement s&apos;effectue en ligne par carte bancaire via la plateforme sécurisée Stripe. Les crédits sont
            ajoutés immédiatement après validation du paiement.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-semibold text-text">4. Crédits</h2>
          <p>
            Les crédits de traduction sont valables 6 mois à compter de la date d&apos;achat. Les crédits non utilisés ne
            sont ni remboursables ni transférables après cette période.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-semibold text-text">5. Droit de rétractation</h2>
          <p>
            Conformément à l&apos;article L.&nbsp;221-28 du Code de la consommation, le droit de rétractation ne peut
            être exercé pour les contenus numériques fournis sur un support immatériel dont l&apos;exécution a commencé
            avec l&apos;accord du consommateur. Toutefois, nous offrons un remboursement dans les 14 jours si aucun
            crédit n&apos;a été utilisé.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-semibold text-text">6. Service</h2>
          <p>
            ModVF fournit un service de traduction automatique de modpacks Minecraft. La traduction couvre environ 95&nbsp;% du
            contenu textuel visible en jeu. Certains textes codés directement dans les mods ne peuvent pas être traduits.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-semibold text-text">7. Responsabilité</h2>
          <p>
            ModVF ne peut être tenu responsable des dysfonctionnements liés aux modpacks traduits. L&apos;utilisateur est
            responsable de la sauvegarde de ses fichiers originaux.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-semibold text-text">8. Données personnelles</h2>
          <p>
            Voir notre{' '}
            <Link to="/confidentialite" className="text-primary underline-offset-2 hover:underline">
              politique de confidentialité
            </Link>
            .
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-semibold text-text">9. Droit applicable</h2>
          <p>
            Les présentes CGV sont soumises au droit français. En cas de litige, les tribunaux de Bordeaux seront seuls
            compétents.
          </p>
        </section>
      </div>
    </article>
  )
}
