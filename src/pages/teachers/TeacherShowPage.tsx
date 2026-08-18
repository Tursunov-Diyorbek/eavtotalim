import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header } from '@/components/layout'
import {
  Badge,
  Button,
  DetailList,
  ErrorMessage,
  Panel,
  SkeletonLines,
} from '@/components/ui'
import { teacherEditPath, routes } from '@/config'
import { useTeacherQuery } from '@/features/teachers'
import { asFio, asText } from '@/lib/apiPage'
import { formatDate } from '@/lib/format'

const LANG_MAP: Record<string, string> = {
  '1': 'O‘zbek (lotin)',
  '2': 'Rus',
  '3': 'Qoraqalpoq',
  '5': 'O‘zbek (kirill)',
}

export function TeacherShowPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams()
  const { data, isLoading, isError } = useTeacherQuery(id)

  const langs = Array.isArray(data?.edu_langs)
    ? data.edu_langs.map((item) => LANG_MAP[String(item)] ?? String(item)).join(', ')
    : '—'

  return (
    <>
      <Header
        title={t('teachersPage.show')}
        description={data ? asFio(data) : undefined}
        actions={
          <div className="flex gap-2">
            {id ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(teacherEditPath(id))}
              >
                {t('common.edit')}
              </Button>
            ) : null}
            <Button variant="outline" size="sm" onClick={() => navigate(routes.teachers)}>
              {t('common.back')}
            </Button>
          </div>
        }
      />
      <main className="flex-1 p-3 sm:p-4">
        {isLoading ? (
          <Panel padding="md">
            <SkeletonLines lines={10} />
          </Panel>
        ) : isError || !data ? (
          <ErrorMessage />
        ) : (
          <Panel padding="md">
            <DetailList
              items={[
                { label: t('teachersPage.lastName'), value: data.last_name },
                { label: t('teachersPage.firstName'), value: data.first_name },
                { label: t('teachersPage.middleName'), value: data.middle_name },
                {
                  label: t('directorProfile.birthday'),
                  value: formatDate(data.birthday, i18n.language),
                },
                {
                  label: t('directorProfile.gender'),
                  value:
                    Number(data.gender) === 1
                      ? t('directorProfile.male')
                      : Number(data.gender) === 0
                        ? t('directorProfile.female')
                        : '—',
                },
                { label: t('directorProfile.phone'), value: data.phone1 ?? data.phone },
                {
                  label: t('teachersPage.passport'),
                  value: [data.passport_seria, data.passport_number].filter(Boolean).join(' '),
                },
                { label: t('teachersPage.jshir'), value: data.passport_jshir },
                { label: t('directorProfile.address'), value: data.address },
                {
                  label: t('teachersPage.mspd'),
                  value: (
                    <Badge
                      tone={
                        Number(data.mspd_status) === 1
                          ? 'teal'
                          : Number(data.mspd_status) === 2
                            ? 'rose'
                            : 'neutral'
                      }
                    >
                      {Number(data.mspd_status) === 1
                        ? t('teachersPage.mspdOk')
                        : Number(data.mspd_status) === 2
                          ? t('teachersPage.mspdBad')
                          : t('teachersPage.mspdPending')}
                    </Badge>
                  ),
                },
                {
                  label: t('directorList.status'),
                  value: (
                    <Badge tone={Number(data.status) === 1 ? 'teal' : 'rose'}>
                      {Number(data.status) === 1
                        ? t('dashboard.active')
                        : t('dashboard.inactive')}
                    </Badge>
                  ),
                },
                { label: t('teachersPage.eduLangs'), value: langs },
                { label: t('teachersPage.institution'), value: data.institution_name },
                { label: t('teachersPage.specialization'), value: data.specialization },
                {
                  label: t('teachersPage.citizenship'),
                  value: asText(data.citizenship?.name),
                },
              ]}
            />
          </Panel>
        )}
      </main>
    </>
  )
}
