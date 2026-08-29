import Link from 'next/link'
import { FileText, Shield } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export type LegalBlock =
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'h3'; text: string }

export type LegalSection = {
  id: string
  title: string
  blocks: LegalBlock[]
}

export type LegalDocumentData = {
  title: string
  subtitle: string
  effectiveNote: string
  lastUpdated: string
  intro?: string
  sections: LegalSection[]
}

type LegalDocumentProps = {
  data: LegalDocumentData
  variant: 'terms' | 'privacy'
}

function LegalBlockRenderer({ block }: { block: LegalBlock }) {
  if (block.type === 'p') {
    return (
      <p className="text-sm sm:text-[15px] text-gray-600 leading-relaxed">
        {block.text}
      </p>
    )
  }

  if (block.type === 'h3') {
    return (
      <h3 className="text-base font-semibold text-gray-900 mt-6 mb-2">
        {block.text}
      </h3>
    )
  }

  const ListTag = block.type === 'ol' ? 'ol' : 'ul'
  const listClass =
    block.type === 'ol'
      ? 'list-decimal list-outside ml-5 space-y-2'
      : 'list-disc list-outside ml-5 space-y-2'

  return (
    <ListTag className={`${listClass} text-sm sm:text-[15px] text-gray-600 leading-relaxed`}>
      {block.items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ListTag>
  )
}

export default function LegalDocument({ data, variant }: LegalDocumentProps) {
  const Icon = variant === 'privacy' ? Shield : FileText

  return (
    <div className="min-h-screen bg-gr-background flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="border-b border-gr-border bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
            <Link
              href="/"
              className="text-sm text-gr-primary hover:underline mb-6 inline-block"
            >
              ← Back to Home
            </Link>

            <div className="flex items-start gap-4">
              <div className="hidden sm:flex w-12 h-12 rounded-2xl bg-gr-primary-light items-center justify-center shrink-0">
                <Icon className="w-6 h-6 text-gr-primary" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                  {data.title}
                </h1>
                <p className="text-sm text-gray-500 mb-4">{data.subtitle}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-full bg-gr-primary-light px-3 py-1 text-xs font-medium text-gr-primary">
                    Effective: {data.effectiveNote}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                    Last updated: {data.lastUpdated}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] gap-8 lg:gap-12">
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="bg-white border border-gr-border rounded-2xl p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
                  On this page
                </p>
                <nav className="flex flex-col gap-1 max-h-[60vh] overflow-y-auto">
                  {data.sections.map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className="text-sm text-gray-600 hover:text-gr-primary hover:bg-gr-primary-light rounded-lg px-2 py-1.5 transition-colors"
                    >
                      {section.title}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            <article className="bg-white border border-gr-border rounded-2xl p-6 sm:p-10 space-y-10">
              {data.intro && (
                <p className="text-sm sm:text-[15px] text-gray-600 leading-relaxed border-l-4 border-gr-primary pl-4 bg-gr-primary-light py-3 rounded-r-lg">
                  {data.intro}
                </p>
              )}

              {data.sections.map((section) => (
                <section key={section.id} id={section.id} className="scroll-mt-28">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gr-border">
                    {section.title}
                  </h2>
                  <div className="space-y-4">
                    {section.blocks.map((block, index) => (
                      <LegalBlockRenderer key={`${section.id}-${index}`} block={block} />
                    ))}
                  </div>
                </section>
              ))}
            </article>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
