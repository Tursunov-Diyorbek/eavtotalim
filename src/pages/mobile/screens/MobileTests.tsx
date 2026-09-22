import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import { PAGE_ACCESS } from '@/config/access'
import { routes } from '@/config'
import { PageHead } from '../components/PageChrome'
import { Icons } from '../icons'
import type { MobileScreen } from '../screens'

type Props = {
  onBack: () => void
  onOpenScreen: (screen: MobileScreen) => void
}

export function MobileTests({ onBack, onOpenScreen }: Props) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { hasPermission } = useAuth()

  const categories = [
    {
      key: 'template',
      screen: 'templateTests' as const,
      label: t('nav.examTemplates'),
      desc: t('examTemplates.description', {
        defaultValue: "Imtihon shablonlari",
      }),
      Icon: Icons.templateTests,
      tone: 'blue',
    },
    {
      key: 'mixed',
      screen: 'mixedTests' as const,
      label: t('nav.randomTests'),
      desc: t('randomTests.description', {
        defaultValue: 'Tasodifiy savollar',
      }),
      Icon: Icons.mixedTests,
      tone: 'teal',
    },
    ...(hasPermission(PAGE_ACCESS.allTests)
      ? [
          {
            key: 'all',
            screen: 'allTests' as const,
            label: t('nav.allTests'),
            desc: t('allTests.description', {
              defaultValue: "Barcha savollar",
            }),
            Icon: Icons.allTests,
            tone: 'navy',
          },
        ]
      : []),
    {
      key: 'saved',
      screen: 'savedTests' as const,
      label: t('nav.savedTests'),
      desc: t('savedTests.description', {
        defaultValue: 'Saqlangan testlar',
      }),
      Icon: Icons.savedTests,
      tone: 'amber',
    },
  ]

  return (
    <div className="sm-page sm-tests">
      <PageHead
        title={t('nav.tests', { defaultValue: 'Testlar' })}
        onBack={onBack}
      />
      <div className="sm-page__body">
        <p className="sm-tests__lead">
          {t('mobile.whichTest', {
            defaultValue: 'Qaysi turdagi testni topshirmoqchisiz?',
          })}
        </p>
        <div className="sm-tests__grid">
          {categories.map((item) => {
            const Icon = item.Icon
            return (
              <button
                key={item.key}
                type="button"
                className={`sm-tests__card sm-tests__card--${item.tone}`}
                onClick={() => onOpenScreen(item.screen)}
              >
                <span className="sm-tests__card-icon">
                  <Icon size={26} />
                </span>
                <span className="sm-tests__card-text">
                  <span className="sm-tests__card-title">{item.label}</span>
                  <span className="sm-tests__card-desc">{item.desc}</span>
                </span>
                <Icons.right className="sm-tests__card-arrow" size={16} />
              </button>
            )
          })}

          {hasPermission(PAGE_ACCESS.finalExam) ? (
            <button
              type="button"
              className="sm-tests__card sm-tests__card--navy"
              onClick={() => navigate(routes.finalExam)}
            >
              <span className="sm-tests__card-icon">
                <Icons.finalExam size={26} />
              </span>
              <span className="sm-tests__card-text">
                <span className="sm-tests__card-title">{t('nav.finalExam')}</span>
                <span className="sm-tests__card-desc">
                  {t('finalExam.description', {
                    defaultValue: 'Yakuniy imtihon',
                  })}
                </span>
              </span>
              <Icons.right className="sm-tests__card-arrow" size={16} />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
