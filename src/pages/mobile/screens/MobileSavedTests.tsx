import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Play } from 'lucide-react'
import { useAuth } from '@/features/auth'
import { useSavedExamTemplatesQuery } from '@/features/saved-tests'
import { StartExamTemplateModal } from '@/pages/exam-templates/StartExamTemplateModal'
import { fullNameOf } from '@/lib/format'
import { PageEmpty, PageHead, PageLoading } from '../components/PageChrome'

type Props = { onBack: () => void }

export function MobileSavedTests({ onBack }: Props) {
  const { t } = useTranslation()
  const { me, user } = useAuth()
  const { data = [], isLoading } = useSavedExamTemplatesQuery()
  const [openId, setOpenId] = useState<number | null>(null)

  const userName =
    fullNameOf(me?.profession ?? {}) || user?.username || undefined

  return (
    <div className="sm-page">
      <PageHead title={t('nav.savedTests')} onBack={onBack} />
      <div className="sm-page__body">
        {isLoading ? (
          <PageLoading />
        ) : data.length === 0 ? (
          <PageEmpty text={t('savedTests.empty')} />
        ) : (
          <div className="sm-tpl-grid">
            {data.map((item) => {
              const tpl = item.exam_center_test_template
              const id =
                Number(item.test_id) || Number(tpl?.id) || Number(item.id)
              const name = tpl?.name || '—'
              return (
                <button
                  key={item.id}
                  type="button"
                  className="sm-tpl-card"
                  onClick={() => setOpenId(id)}
                >
                  <p className="sm-tpl-card__num">{name}</p>
                  <span className="sm-tpl-card__play" aria-hidden>
                    <Play size={14} />
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <StartExamTemplateModal
        open={openId != null}
        templateId={openId}
        userName={userName}
        onClose={() => setOpenId(null)}
      />
    </div>
  )
}
