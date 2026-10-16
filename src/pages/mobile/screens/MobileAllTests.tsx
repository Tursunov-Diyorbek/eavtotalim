import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAllTestsQuery } from '@/features/all-tests'
import { pickExamBlockText } from '@/features/exam-templates'
import { SearchInput } from '@/components/ui'
import { PageEmpty, PageHead, PageLoading } from '../components/PageChrome'

type Props = { onBack: () => void }

export function MobileAllTests({ onBack }: Props) {
  const { t, i18n } = useTranslation()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const showCount = 20

  const { data, isLoading } = useAllTestsQuery({
    lang: i18n.language || 'uz',
    page,
    showCount,
    search,
  })

  const items = data?.data ?? []
  const total = data?.total_items ?? 0
  const totalPages = Math.max(1, Math.ceil(total / showCount) || 1)

  return (
    <div className="sm-page">
      <PageHead title={t('nav.allTests')} onBack={onBack} />
      <div className="sm-page__body">
        <div className="sm-all__search">
          <SearchInput
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder={t('common.search')}
          />
        </div>
        {isLoading ? (
          <PageLoading />
        ) : items.length === 0 ? (
          <PageEmpty text={t('allTests.empty')} />
        ) : (
          <ul className="sm-all__list">
            {items.map((q) => (
              <li key={q.id} className="sm-all__card">
                <div className="sm-all__qhead">
                  <span className="sm-all__num">{q.id}</span>
                  <span className="sm-all__qtext">
                    {pickExamBlockText(q.body) || '—'}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
        {totalPages > 1 ? (
          <div className="sm-all__pager">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ‹
            </button>
            <span>
              {page}/{totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              ›
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
