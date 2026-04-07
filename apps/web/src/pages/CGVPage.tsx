import { Link } from 'react-router-dom'

export default function CGVPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">Conditions générales de vente</h1>
      <p className="mt-3 text-sm leading-relaxed text-gray-300">Dernière mise à jour : 7 avril 2026</p>

      <section>
        <h2 className="mb-4 mt-10 text-xl font-semibold text-white">Article 1 — Objet</h2>
        <p className="text-sm leading-relaxed text-gray-300">
          Les présentes CGV régissent l&apos;utilisation du service ModVF (modvf.fr), service de traduction automatique de
          modpacks et mods Minecraft, édité par Louis Pereira (auto-entrepreneur, SIRET 980 622 690 00041).
        </p>
      </section>

      <section>
        <h2 className="mb-4 mt-10 text-xl font-semibold text-white">Article 2 — Description du service</h2>
        <p className="text-sm leading-relaxed text-gray-300">
          ModVF permet aux utilisateurs de : uploader un modpack (.zip) ou un mod (.jar) Minecraft ; obtenir un resource
          pack traduit en français et des fichiers de configuration traduits. Le service utilise un moteur de traduction
          automatique (Google Translate) enrichi d&apos;un glossaire gaming. ModVF ne garantit pas une traduction à 100% —
          certains mods codent leurs textes en Java, les rendant intraduisibles par tout resource pack. Le taux de
          traduction varie entre 80% et 100% selon les modpacks.
        </p>
      </section>

      <section>
        <h2 className="mb-4 mt-10 text-xl font-semibold text-white">Article 3 — Compte utilisateur</h2>
        <p className="text-sm leading-relaxed text-gray-300">
          L&apos;inscription est gratuite. L&apos;utilisateur peut s&apos;inscrire par email/mot de passe ou via Google OAuth.
          Tout compte peut être suspendu ou supprimé en cas d&apos;utilisation abusive (uploads massifs automatisés, tentative
          de contournement des limites, revente du service). L&apos;utilisateur peut demander la suppression de son compte à
          tout moment via{' '}
          <a href="mailto:contact@modvf.fr" className="text-emerald-400 hover:underline">
            contact@modvf.fr
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className="mb-4 mt-10 text-xl font-semibold text-white">Article 4 — Tarification et crédits</h2>
        <p className="text-sm leading-relaxed text-gray-300">
          Plan Découverte (gratuit) : 1 traduction de modpack offerte, 3 traductions de mods/jour, modpacks jusqu&apos;à 50
          mods.
          <br />
          Plan Starter (7€) : 3 traductions de modpacks, mods illimités, toutes tailles.
          <br />
          Plan Pack (12€) : 10 traductions de modpacks, mods illimités, toutes tailles.
          <br />
          Les crédits sont valables sans limite de durée. Les prix sont en euros TTC. ModVF se réserve le droit de modifier
          les prix — les crédits déjà achetés restent valables.
        </p>
      </section>

      <section>
        <h2 className="mb-4 mt-10 text-xl font-semibold text-white">Article 5 — Paiement</h2>
        <p className="text-sm leading-relaxed text-gray-300">
          Le paiement est géré par Stripe Technology Europe Ltd. Le débit est immédiat. Les crédits sont ajoutés
          instantanément après confirmation du paiement. ModVF ne stocke aucune donnée bancaire.
        </p>
      </section>

      <section>
        <h2 className="mb-4 mt-10 text-xl font-semibold text-white">Article 6 — Droit de rétractation et remboursement</h2>
        <p className="text-sm leading-relaxed text-gray-300">
          Conformément à l&apos;article L221-28 du Code de la consommation, le droit de rétractation ne peut être exercé pour
          les contenus numériques fournis immédiatement. Toutefois, ModVF accorde un remboursement sous 14 jours si les
          crédits achetés n&apos;ont pas été utilisés. Pour toute demande :{' '}
          <a href="mailto:contact@modvf.fr" className="text-emerald-400 hover:underline">
            contact@modvf.fr
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className="mb-4 mt-10 text-xl font-semibold text-white">Article 7 — Durée de téléchargement</h2>
        <p className="text-sm leading-relaxed text-gray-300">
          Les fichiers traduits sont disponibles au téléchargement pendant : 24h (plan Découverte), 72h (plan Starter), 7
          jours (plan Pack). Chaque traduction permet 3 téléchargements maximum. Au-delà, l&apos;utilisateur peut relancer la
          traduction (quasi instantanée grâce au cache).
        </p>
      </section>

      <section>
        <h2 className="mb-4 mt-10 text-xl font-semibold text-white">Article 8 — Propriété intellectuelle</h2>
        <p className="text-sm leading-relaxed text-gray-300">
          ModVF ne revendique aucun droit sur les modpacks et mods uploadés par les utilisateurs. Les traductions générées
          sont un dérivé du contenu original — l&apos;utilisateur en dispose librement pour son usage personnel. Le code
          source, le design et la marque ModVF appartiennent à Louis Pereira. Minecraft est une marque déposée de Mojang
          Studios / Microsoft.
        </p>
      </section>

      <section>
        <h2 className="mb-4 mt-10 text-xl font-semibold text-white">Article 9 — Responsabilité</h2>
        <p className="text-sm leading-relaxed text-gray-300">
          ModVF est fourni &quot;en l&apos;état&quot;. ModVF ne garantit pas : la disponibilité permanente du service ; l&apos;exactitude de
          toutes les traductions ; la compatibilité avec tous les modpacks. ModVF ne pourra être tenu responsable de
          dommages indirects liés à l&apos;utilisation du service. En cas de dysfonctionnement, la responsabilité de ModVF est
          limitée au montant payé par l&apos;utilisateur.
        </p>
      </section>

      <section>
        <h2 className="mb-4 mt-10 text-xl font-semibold text-white">Article 10 — Données personnelles</h2>
        <p className="text-sm leading-relaxed text-gray-300">
          Le traitement des données personnelles est détaillé dans la{' '}
          <Link to="/confidentialite" className="text-emerald-400 hover:underline">
            Politique de confidentialité
          </Link>
          .
        </p>
      </section>

      <section>
        <h2 className="mb-4 mt-10 text-xl font-semibold text-white">Article 11 — Droit applicable</h2>
        <p className="text-sm leading-relaxed text-gray-300">
          Les présentes CGV sont soumises au droit français. En cas de litige, une solution amiable sera recherchée avant
          toute action judiciaire. À défaut, les tribunaux compétents sont ceux du ressort du domicile du défendeur.
        </p>
      </section>

      <section>
        <h2 className="mb-4 mt-10 text-xl font-semibold text-white">Article 12 — Contact</h2>
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
