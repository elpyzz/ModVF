import { MessageCircle, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

type QAItem = {
  question: string
  answer: string
}

type Category = {
  label: string
  items: QAItem[]
}

type Message = {
  id: string
  from: 'bot' | 'user'
  text: string
}

const categories: Category[] = [
  {
    label: 'Comment ça marche ?',
    items: [
      {
        question: "C'est quoi ModVF ?",
        answer:
          "ModVF est un outil qui traduit automatiquement vos modpacks Minecraft en français. Uploadez votre modpack, ModVF extrait tous les textes anglais et génère un resource pack français que vous installez dans Minecraft. Vos mods ne sont jamais modifiés.",
      },
      {
        question: 'Tous les modpacks sont compatibles ?',
        answer:
          'ModVF traduit les items, descriptions, enchantements et advancements de tous les modpacks 1.18+. Pour les quêtes, la grande majorité des modpacks sont entièrement supportés. Quelques modpacks utilisent un format de quêtes spécifique qui rend la traduction partielle ou impossible (comme Vault Hunters ou FTB StoneBlock 4). Consultez notre page Tarifs pour voir la liste détaillée de compatibilité.',
      },
      {
        question: 'Comment installer la traduction ?',
        answer:
          "Après le téléchargement, copiez les fichiers traduits PAR-DESSUS votre installation existante. Ne supprimez JAMAIS vos dossiers config/ ou mods/ avant ! Choisissez simplement 'Remplacer les fichiers existants' quand Windows vous le demande. Consultez notre guide complet pour plus de détails.",
      },
      {
        question: 'Est-ce que ça modifie mes mods ?',
        answer:
          "Non, ModVF ne modifie jamais vos fichiers de mods. Il génère un resource pack indépendant qui se place par-dessus. Vous pouvez le retirer à tout moment pour revenir à l'anglais.",
      },
      {
        question: "C'est de la bonne traduction ?",
        answer:
          "ModVF utilise Google Translate enrichi d'un glossaire gaming de 250+ termes Minecraft. Les termes comme Redstone, Nether, Ender Dragon restent inchangés. La traduction n'est pas parfaite à 100% mais rend le jeu entièrement jouable en français.",
      },
    ],
  },
  {
    label: 'Tarifs & Abonnements',
    items: [
      {
        question: "C'est gratuit ?",
        answer:
          "Oui, le plan Découverte est gratuit : 1 modpack, 3 mods par jour, 50 mods max. Pour traduire des modpacks complets, découvrez nos abonnements à partir de 4,99€/mois ou nos packs de crédits.",
      },
      {
        question: 'Quelle différence entre abonnement et crédits ?',
        answer:
          "L'abonnement vous donne un accès mensuel avec des mods illimités. Les crédits sont des achats ponctuels avec un nombre de traductions limité. L'abonnement est plus avantageux si vous jouez régulièrement.",
      },
      {
        question: 'Comment annuler mon abonnement ?',
        answer:
          "Allez dans Paramètres → Abonnement → Gérer mon abonnement. Vous serez redirigé vers le portail Stripe où vous pouvez annuler en un clic. Votre accès reste actif jusqu'à la fin de la période payée.",
      },
      {
        question: 'Je peux me faire rembourser ?',
        answer:
          "Oui, si vous n'avez pas utilisé vos crédits, vous pouvez demander un remboursement dans les 14 jours suivant l'achat en nous contactant à contact@modvf.fr.",
      },
    ],
  },
  {
    label: 'Problèmes techniques',
    items: [
      {
        question: 'Ma traduction est bloquée',
        answer:
          'Vérifiez que votre fichier est bien un .zip ou .jar et qu’il fait moins de 500 Mo. Si le problème persiste, rechargez la page et relancez la traduction. Le cache enregistre les traductions déjà faites, donc ça ira beaucoup plus vite la deuxième fois.',
      },
      {
        question: 'Les quêtes ont disparu après installation',
        answer:
          "Vous avez probablement supprimé un dossier au lieu de remplacer. Réinstallez votre modpack proprement depuis votre launcher, puis recopiez les fichiers traduits PAR-DESSUS sans rien supprimer. Choisissez toujours 'Remplacer les fichiers existants'.",
      },
      {
        question: 'Certains textes ne sont pas traduits',
        answer:
          "Certains mods codent leurs textes directement dans le code Java, ce qui les rend intraduisibles. ModVF traduit tout ce qui est dans les fichiers de langue (en_us.json) et les fichiers de configuration. Si un mod spécifique pose problème, contactez-nous.",
      },
      {
        question: 'Le resource pack ne fonctionne pas',
        answer:
          'Vérifiez que vous avez bien activé le resource pack dans les paramètres Minecraft (Options → Resource Packs). Le resource pack ModVF doit être au-dessus des autres dans la liste.',
      },
    ],
  },
  {
    label: 'Programme de parrainage',
    items: [
      {
        question: 'Comment ça marche le parrainage ?',
        answer:
          "Inscrivez-vous sur ModVF, allez dans Paramètres → Parrainage. Vous aurez un lien personnel. Partagez-le : chaque personne qui s'inscrit via votre lien et achète quelque chose vous rapporte 25% de commission automatiquement.",
      },
      {
        question: 'Comment récupérer mes gains ?',
        answer:
          'Dès que votre solde atteint 10€, contactez-nous à contact@modvf.fr pour demander un versement par virement bancaire ou PayPal. Les versements sont traités sous 7 jours ouvrés.',
      },
    ],
  },
]

const WELCOME_MESSAGE = 'Salut ! 👋 Comment puis-je vous aider ? Choisissez un sujet ci-dessous.'

export function ChatBubble() {
  const [isOpen, setIsOpen] = useState(false)
  const [hasSeen, setHasSeen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([{ id: 'welcome', from: 'bot', text: WELCOME_MESSAGE }])
  const [showOtherQuestion, setShowOtherQuestion] = useState(false)
  const messageEndRef = useRef<HTMLDivElement | null>(null)

  const currentCategory = useMemo(
    () => categories.find((category) => category.label === selectedCategory) ?? null,
    [selectedCategory],
  )

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, isOpen, selectedCategory, showOtherQuestion])

  function toggleOpen() {
    setIsOpen((prev) => !prev)
    setHasSeen(true)
  }

  function onSelectCategory(category: Category) {
    setSelectedCategory(category.label)
  }

  function onAskQuestion(item: QAItem) {
    const idBase = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    setMessages((prev) => [
      ...prev,
      { id: `${idBase}-user`, from: 'user', text: item.question },
      { id: `${idBase}-bot`, from: 'bot', text: item.answer },
    ])
    setShowOtherQuestion(false)
  }

  function onOtherQuestion() {
    const idBase = `${Date.now()}-other`
    setMessages((prev) => [
      ...prev,
      {
        id: `${idBase}-bot`,
        from: 'bot',
        text: 'Envoyez-nous votre question par email, on vous répond sous 24h !',
      },
    ])
    setShowOtherQuestion(true)
  }

  return (
    <>
      <button
        type="button"
        aria-label="Ouvrir l'aide ModVF"
        onClick={toggleOpen}
        className="fixed bottom-6 right-6 z-[120] flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-[0_14px_30px_rgba(108,60,225,0.45)] transition hover:scale-105 hover:bg-primary/90"
      >
        {!hasSeen && (
          <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-dark bg-secondary" />
        )}
        <MessageCircle className="h-6 w-6" />
      </button>

      <div
        className={`fixed bottom-0 right-0 z-[120] w-full transform transition-all duration-300 sm:bottom-6 sm:right-6 sm:w-[350px] ${
          isOpen ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'
        }`}
      >
        <section className="flex h-[78vh] max-h-[500px] w-full flex-col overflow-hidden rounded-none border border-white/10 bg-surface shadow-2xl sm:rounded-2xl">
          <header className="flex items-center justify-between border-b border-white/10 bg-surface-light px-4 py-3">
            <h2 className="font-semibold text-text">Aide ModVF</h2>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Fermer le panneau d'aide"
              className="rounded-md p-1 text-text-muted transition hover:bg-white/5 hover:text-text"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <p
                  className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    message.from === 'user'
                      ? 'bg-primary/90 text-white'
                      : 'border border-white/10 bg-surface-light text-text'
                  }`}
                >
                  {message.text}
                </p>
              </div>
            ))}

            {showOtherQuestion && (
              <div className="flex justify-start">
                <a
                  href="mailto:contact@modvf.fr?subject=%5BModVF%5D%20Question%20depuis%20le%20site"
                  className="inline-flex items-center rounded-xl border border-primary/40 bg-primary/10 px-3 py-2 text-sm font-medium text-primary transition hover:bg-primary/20"
                >
                  Envoyer un email
                </a>
              </div>
            )}

            <div ref={messageEndRef} />
          </div>

          <footer className="border-t border-white/10 bg-surface-light p-3">
            {!currentCategory ? (
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.label}
                    type="button"
                    onClick={() => onSelectCategory(category)}
                    className="w-full rounded-xl border border-white/10 bg-surface px-3 py-2 text-left text-sm text-text transition hover:border-primary/50 hover:bg-surface-light"
                  >
                    {category.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={onOtherQuestion}
                  className="w-full rounded-xl border border-secondary/40 bg-secondary/10 px-3 py-2 text-left text-sm font-medium text-secondary transition hover:bg-secondary/20"
                >
                  Autre question
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setSelectedCategory(null)}
                  className="w-full rounded-xl border border-white/15 px-3 py-2 text-left text-sm text-text-muted transition hover:text-text"
                >
                  ← Retour
                </button>
                {currentCategory.items.map((item) => (
                  <button
                    key={item.question}
                    type="button"
                    onClick={() => onAskQuestion(item)}
                    className="w-full rounded-xl border border-white/10 bg-surface px-3 py-2 text-left text-sm text-text transition hover:border-primary/50 hover:bg-surface-light"
                  >
                    {item.question}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={onOtherQuestion}
                  className="w-full rounded-xl border border-secondary/40 bg-secondary/10 px-3 py-2 text-left text-sm font-medium text-secondary transition hover:bg-secondary/20"
                >
                  Autre question
                </button>
              </div>
            )}
          </footer>
        </section>
      </div>
    </>
  )
}
