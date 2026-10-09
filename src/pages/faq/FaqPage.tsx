import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import { Button } from '@/components/ui'
import { cn } from '@/lib/cn'
import { FAQ_ITEMS, type FaqPart } from './items'

function langOf(language: string): 'uz' | 'kiril' | 'ru' {
  if (language === 'ru') return 'ru'
  if (language === 'kiril') return 'kiril'
  return 'uz'
}

function RichText({ parts }: { parts: FaqPart[] }) {
  return (
    <>
      {parts.map((part, index) =>
        part.kind === 'link' ? (
          <a
            key={index}
            href={part.href}
            target={part.href.startsWith('tel:') ? undefined : '_blank'}
            rel="noreferrer"
            className="font-medium text-signal hover:underline"
            onClick={(event) => event.stopPropagation()}
          >
            {part.text}
          </a>
        ) : (
          <span key={index}>{part.text}</span>
        ),
      )}
    </>
  )
}

export function FaqPage() {
  const { t, i18n } = useTranslation()
  const lang = langOf(i18n.language)
  const [open, setOpen] = useState<number[]>([1])

  function toggle(id: number) {
    setOpen((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    )
  }

  return (
    <>
      <Header title={t('nav.faq')} />
      <PageMain>
        <div className="overflow-hidden rounded-xl border border-mist/70 bg-white">
          {FAQ_ITEMS.map((item, index) => {
            const expanded = open.includes(item.id)
            return (
              <div key={item.id} className={cn(index > 0 && 'border-t border-mist/70')}>
                <div
                  className="flex items-start gap-1 px-2 py-1.5 hover:bg-fog/70"
                  onClick={(event) => {
                    if ((event.target as HTMLElement).closest('a')) return
                    toggle(item.id)
                  }}
                >
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-expanded={expanded}
                    aria-label={t('nav.faq')}
                  >
                    <ChevronDown
                      className={cn(
                        'size-4 text-slate transition',
                        expanded && 'rotate-180 text-signal',
                      )}
                      aria-hidden
                    />
                  </Button>
                  <p className="min-w-0 flex-1 cursor-pointer py-1.5 text-sm font-medium text-deep">
                    {item.id}. <RichText parts={item.q[lang]} />
                  </p>
                </div>
                {expanded ? (
                  <div className="border-t border-mist/50 bg-fog/40 px-4 py-3 pl-10 text-sm leading-relaxed text-ink">
                    <RichText parts={item.a[lang]} />
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      </PageMain>
    </>
  )
}
