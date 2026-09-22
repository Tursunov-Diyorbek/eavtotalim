import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  CheckCircle2,
  ClipboardList,
  FileText,
  Play,
  XCircle,
} from 'lucide-react'
import { useAuth } from '@/features/auth'
import { useRandomTestLatestQuery } from '@/features/random-tests'
import { StartRandomTestModal } from '@/pages/random-tests/StartRandomTestModal'
import { fullNameOf } from '@/lib/format'
import { formatDateTime } from '@/lib'
import { Notification } from '@/components/ui'
import { PageHead, PageLoading } from '../components/PageChrome'

type Props = { onBack: () => void }

export function MobileMixedTests({ onBack }: Props) {
  const { t, i18n } = useTranslation()
  const { me, user } = useAuth()
  const comfort = Boolean(me?.organization_has_comfort_plan)
  const { data, isLoading } = useRandomTestLatestQuery(comfort)
  const [limit, setLimit] = useState<1 | 2 | 3>(1)
  const [modalOpen, setModalOpen] = useState(false)

  const correct = data?.correct_answers_count || 0
  const incorrect = data?.incorrect_answers_count || 0
  const questionCount = data?.question_count || 0
  const percent = questionCount
    ? Math.min(100, Math.round((correct / questionCount) * 100))
    : 0

  const limits = useMemo(
    () =>
      [
        { key: 1 as const, label: `20 ${t('randomTests.pieces', { defaultValue: 'ta' })}`, count: 20 },
        { key: 2 as const, label: `50 ${t('randomTests.pieces', { defaultValue: 'ta' })}`, count: 50 },
        { key: 3 as const, label: `100 ${t('randomTests.pieces', { defaultValue: 'ta' })}`, count: 100 },
      ] as const,
    [t],
  )

  const stats = [
    {
      key: 'ok',
      label: t('finalExam.correct'),
      value: correct,
      tone: 'ok',
      Icon: CheckCircle2,
    },
    {
      key: 'bad',
      label: t('finalExam.incorrect'),
      value: incorrect,
      tone: 'bad',
      Icon: XCircle,
    },
    {
      key: 'done',
      label: t('randomTests.totalTaken', { defaultValue: 'Jami topshirilgan' }),
      value: correct + incorrect,
      tone: 'amber',
      Icon: ClipboardList,
    },
    {
      key: 'all',
      label: t('finalExam.totalQ'),
      value: questionCount,
      tone: 'blue',
      Icon: FileText,
    },
  ] as const

  const userName =
    fullNameOf(me?.profession ?? {}) || user?.username || undefined

  return (
    <div className="sm-page">
      <PageHead title={t('nav.randomTests')} onBack={onBack} />
      <div className="sm-page__body">
        {!comfort ? (
          <Notification tone="warning">
            {t('examTemplates.contractRequired', {
              defaultValue:
                "Tashkilotingiz shartnoma imzolamaganligi sababli bu amalni bajarib bo'lmaydi!",
            })}
          </Notification>
        ) : isLoading ? (
          <PageLoading rows={4} />
        ) : (
          <>
            <div className="sm-mixed__note">
              {t('randomTests.retakeNote', {
                defaultValue:
                  'Aralash testlarni istalgancha qayta topshirishingiz mumkin. Oxirgi natija saqlanadi.',
              })}
            </div>

            <p className="sm-dash__label">
              {t('randomTests.questionCount', { defaultValue: 'Savollar soni' })}
            </p>
            <div className="sm-mixed__limits">
              {limits.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className={
                    limit === item.key
                      ? 'sm-mixed__limit sm-mixed__limit--on'
                      : 'sm-mixed__limit'
                  }
                  onClick={() => setLimit(item.key)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="sm-mixed__progress">
              <div className="sm-mixed__progress-top">
                <span>
                  {t('randomTests.lastResult', { defaultValue: 'Oxirgi natija' })}
                </span>
                <strong>{percent}%</strong>
              </div>
              <div className="sm-mixed__progress-bar">
                <span style={{ width: `${percent}%` }} />
              </div>
            </div>

            <button
              type="button"
              className="sm-dash__cta"
              style={{ marginBottom: 18 }}
              onClick={() => setModalOpen(true)}
            >
              <span className="sm-dash__cta-icon">
                <Play size={14} />
              </span>
              <span className="sm-dash__cta-text">
                <span className="sm-dash__cta-title">{t('randomTests.start')}</span>
                <span className="sm-dash__cta-sub">
                  {limits.find((l) => l.key === limit)?.count || 20}{' '}
                  {t('randomTests.questions', { defaultValue: 'savol' })}
                </span>
              </span>
            </button>

            <div className="sm-mixed__stats">
              {stats.map((item) => {
                const Icon = item.Icon
                return (
                  <div
                    key={item.key}
                    className={`sm-mixed__stat sm-mixed__stat--${item.tone}`}
                  >
                    <span className="sm-mixed__stat-icon">
                      <Icon size={16} />
                    </span>
                    <span className="sm-mixed__stat-label">{item.label}</span>
                    <span className="sm-mixed__stat-value">{item.value}</span>
                  </div>
                )
              })}
            </div>

            <div className="sm-mixed__times">
              <div className="sm-mixed__time">
                <span>{t('common.created', { defaultValue: 'Yaratilgan' })}</span>
                <strong>
                  {data?.created_at
                    ? formatDateTime(data.created_at, i18n.language) ||
                      t('common.noData')
                    : t('common.noData')}
                </strong>
              </div>
              <div className="sm-mixed__time">
                <span>{t('common.updated', { defaultValue: 'Yangilangan' })}</span>
                <strong>
                  {data?.updated_at
                    ? formatDateTime(data.updated_at, i18n.language) ||
                      t('common.noData')
                    : t('common.noData')}
                </strong>
              </div>
            </div>
          </>
        )}
      </div>

      <StartRandomTestModal
        open={modalOpen}
        limit={limit}
        userName={userName}
        onClose={() => setModalOpen(false)}
      />
    </div>
  )
}
