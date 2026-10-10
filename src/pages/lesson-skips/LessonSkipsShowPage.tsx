import { useEffect } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header, PageMain } from '@/components/layout'
import {
  Badge,
  EmptyTR,
  ErrorMessage,
  ExportButton,
  FilterTH,
  FilterTR,
  HeaderTR,
  ListPageSkeleton,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '@/components/ui'
import { routes } from '@/config'
import { useLessonSkipShowQuery } from '@/features/lesson-skips'
import { useSmartBack } from '@/hooks'
import { asLangName } from '@/lib/apiPage'
import { downloadXls } from '@/lib/downloadXls'
import { formatDate } from '@/lib/format'
import type { LessonSkipDetail } from '@/types/lesson-skips'

type LocationState = { fullName?: string }

const NAME_STORAGE = 'eavt.lesson-skip-name:'

function topicNames(row: LessonSkipDetail, lang: string) {
  const names = (row.class_date?.handouts ?? [])
    .map((item) => asLangName(item.topic, lang))
    .filter((name) => name && name !== '—')
  return names
}

function isExcused(row: LessonSkipDetail) {
  return row.value === '+'
}

export function LessonSkipsShowPage() {
  const { t, i18n } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const state = (useLocation().state ?? {}) as LocationState
  const goBack = useSmartBack(routes.lessonSkips)
  const { data, isLoading, isError } = useLessonSkipShowQuery(id)
  const rows = data ?? []

  const storedName =
    id && typeof sessionStorage !== 'undefined'
      ? sessionStorage.getItem(NAME_STORAGE + id)
      : null
  const studentTitle = state.fullName?.trim() || storedName?.trim() || ''

  useEffect(() => {
    if (!id || !state.fullName?.trim()) return
    try {
      sessionStorage.setItem(NAME_STORAGE + id, state.fullName.trim())
    } catch {
      /* ignore quota */
    }
  }, [id, state.fullName])

  const exportXls = () => {
    downloadXls(
      'dars-qoldirgan',
      ['№', t('lessonSkips.subjects'), t('directorList.date'), t('directorList.reason')],
      rows.map((row, index) => [
        index + 1,
        topicNames(row, i18n.language).join(', '),
        formatDate(row.class_date?.start_time, i18n.language) ?? '',
        isExcused(row) ? t('lessonSkips.excused') : t('lessonSkips.unexcused'),
      ]),
    )
  }

  return (
    <>
      <Header
        title={studentTitle || t('lessonSkips.student')}
        onBack={goBack}
        actions={<ExportButton onClick={exportXls} disabled={isLoading || rows.length === 0} />}
      />
      <PageMain fill>
        {isError ? (
          <ErrorMessage />
        ) : isLoading ? (
          <ListPageSkeleton rows={8} />
        ) : (
          <Table storageKey="lesson-skips-show">
            <THead>
              <HeaderTR>
                <TH column="index" className="w-12">
                  №
                </TH>
                <TH column="subjects">{t('lessonSkips.subjects')}</TH>
                <TH column="date" className="w-36 text-center">
                  {t('directorList.date')}
                </TH>
                <TH column="reason" className="w-36 text-center">
                  {t('directorList.reason')}
                </TH>
              </HeaderTR>
              <FilterTR>
                <FilterTH column="index" />
                <FilterTH column="subjects" />
                <FilterTH column="date" />
                <FilterTH column="reason" />
              </FilterTR>
            </THead>
            <TBody>
              {rows.length === 0 ? (
                <EmptyTR colSpan={4} description={t('common.empty')} />
              ) : (
                rows.map((row, index) => {
                  const names = topicNames(row, i18n.language)
                  const excused = isExcused(row)
                  return (
                    <TR key={`${row.class_date?.start_time ?? 'row'}-${index}`}>
                      <TD column="index" className="text-center text-muted">
                        {index + 1}
                      </TD>
                      <TD column="subjects">
                        {names.length === 0 ? (
                          '—'
                        ) : (
                          <ul className="m-0 list-disc space-y-0.5 pl-4">
                            {names.map((name, topicIndex) => (
                              <li key={`${name}-${topicIndex}`}>{name}</li>
                            ))}
                          </ul>
                        )}
                      </TD>
                      <TD column="date" className="text-center">
                        {formatDate(row.class_date?.start_time, i18n.language) ?? '—'}
                      </TD>
                      <TD column="reason" className="text-center">
                        <Badge tone={excused ? 'teal' : 'rose'}>
                          {excused ? t('lessonSkips.excused') : t('lessonSkips.unexcused')}
                        </Badge>
                      </TD>
                    </TR>
                  )
                })
              )}
            </TBody>
          </Table>
        )}
      </PageMain>
    </>
  )
}
