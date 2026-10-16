import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import { useStudentLessonsQuery, pickLocalized } from '@/features/lessons'
import { notify, SearchInput } from '@/components/ui'
import {
  ListRow,
  PageEmpty,
  PageHead,
  PageLoading,
} from '../components/PageChrome'
import { Icons } from '../icons'

const ICON_TONES = [
  'blue',
  'purple',
  'cyan',
  'teal',
  'amber',
  'orange',
  'pink',
  'green',
  'red',
  'navy',
]

type Props = { onBack: () => void }

export function MobileLessons({ onBack }: Props) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { me } = useAuth()
  const { data = [], isLoading, isError } = useStudentLessonsQuery()
  const [query, setQuery] = useState('')

  const isBasePlan =
    me?.profession?.organization?.agreement_type?.id === 1

  const filtered = useMemo(() => {
    if (isBasePlan) return []
    const q = query.trim().toLowerCase()
    const list = data
    if (!q) return list
    return list.filter((item) => {
      const title = pickLocalized(item.lesson?.name, i18n.language).toLowerCase()
      const short = (item.lesson?.short_name || '').toLowerCase()
      return title.includes(q) || short.includes(q)
    })
  }, [data, query, i18n.language, isBasePlan])

  if (isError) {
    notify.error(t('common.loadError'))
  }

  return (
    <div className="sm-page">
      <PageHead title={t('nav.lessons')} onBack={onBack} />
      <div className="sm-page__body" style={{ paddingBottom: 0 }}>
        <SearchInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('common.search')}
          debounceMs={0}
          className="sm-search"
        />
      </div>
      {isLoading ? (
        <PageLoading />
      ) : filtered.length === 0 ? (
        <PageEmpty />
      ) : (
        <div className="sm-page__body">
          {filtered.map((item, idx) => {
            const short = item.lesson?.short_name || ''
            const title =
              pickLocalized(item.lesson?.name, i18n.language) ||
              short ||
              t('nav.lessons')
            const tone = ICON_TONES[idx % ICON_TONES.length]
            const LessonIcon = Icons.lessons
            return (
              <ListRow
                key={item.id}
                icon={<LessonIcon size={18} />}
                iconTone={tone}
                title={short || title}
                desc={short && title !== short ? title : t('lessons.topicLabel')}
                showArrow
                onClick={() =>
                  navigate(`/lessons/${item.id}`, {
                    state: { lessonName: title, lessonId: item.id },
                  })
                }
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
