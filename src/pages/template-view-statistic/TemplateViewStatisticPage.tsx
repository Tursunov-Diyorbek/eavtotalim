import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Header } from '@/components/layout'
import {
  Badge,
  EmptyState,
  ErrorMessage,
  ListPageSkeleton,
  SearchInput,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '@/components/ui'
import { useTemplateTestStatsQuery } from '@/features/director-stats'
import { asFio } from '@/lib/apiPage'
import { formatDate, formatNumber } from '@/lib/format'

export function TemplateViewStatisticPage() {
  const { t, i18n } = useTranslation()
  const [nameSearch, setNameSearch] = useState('')
  const [groupSearch, setGroupSearch] = useState('')
  const { data, isLoading, isError } = useTemplateTestStatsQuery({
    studentSearch: nameSearch,
    groupSearch: groupSearch,
  })
  const rows = data?.data ?? []

  return (
    <>
      <Header title={t('nav.templateViewStatistic')} />
      <main className="flex-1 space-y-3 p-3 sm:p-4">
        {isError ? (
          <ErrorMessage />
        ) : isLoading ? (
          <ListPageSkeleton rows={8} />
        ) : rows.length === 0 ? (
          <EmptyState description={t('common.empty')} />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH className="w-10">№</TH>
                <TH>
                  <div className="space-y-1">
                    <span>{t('directorList.fio')}</span>
                    <SearchInput
                      size="sm"
                      label={t('directorList.fio')}
                      value={nameSearch}
                      onChange={(e) => setNameSearch(e.target.value)}
                    />
                  </div>
                </TH>
                <TH>
                  <div className="space-y-1">
                    <span>{t('directorList.group')}</span>
                    <SearchInput
                      size="sm"
                      label={t('directorList.group')}
                      value={groupSearch}
                      onChange={(e) => setGroupSearch(e.target.value)}
                    />
                  </div>
                </TH>
                <TH>{t('teachersPage.passport')}</TH>
                <TH>{t('statsPage.activeTime')}</TH>
                <TH>{t('statsPage.templates')}</TH>
                <TH>{t('statsPage.average')}</TH>
                <TH>{t('statsPage.corrects')}</TH>
              </TR>
            </THead>
            <TBody>
              {rows.map((row, index) => {
                const report = row.template_test_student_report
                return (
                  <TR key={row.id}>
                    <TD className="text-muted">{index + 1}</TD>
                    <TD className="font-medium text-ink">{asFio(row)}</TD>
                    <TD>{row.group?.name || '—'}</TD>
                    <TD className="whitespace-nowrap">
                      {[row.passport?.seria, row.passport?.number]
                        .filter(Boolean)
                        .join(' ') || '—'}
                    </TD>
                    <TD>
                      {formatDate(report?.updated_at, i18n.language) ?? '—'}
                    </TD>
                    <TD>
                      <Badge tone="signal">
                        {formatNumber(report?.templates_count_done)}
                      </Badge>
                    </TD>
                    <TD>
                      <Badge tone="teal">
                        {formatNumber(report?.average_corrects)}
                      </Badge>
                    </TD>
                    <TD>
                      <Badge tone="violet">
                        {formatNumber(report?.corrects_count)}
                      </Badge>
                    </TD>
                  </TR>
                )
              })}
            </TBody>
          </Table>
        )}
      </main>
    </>
  )
}
