import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header, PageMain } from '@/components/layout'
import {
  Badge,
  Button,
  EmptyTR,
  ErrorMessage,
  ExportButton,
  HeaderTR,
  ListPageSkeleton,
  TBody,
  TD,
  TH,
  THead,
  TR,
  Table,
} from '@/components/ui'
import { PAGE_ACCESS, routes } from '@/config'
import { useAuth } from '@/features/auth'
import { useOrgReportQuery } from '@/features/region-report'
import { useSmartBack } from '@/hooks'
import { downloadTableXls, escapeHtml, yesterdayLabel } from './xls'

export function RegionReportOrgPage() {
  const { id = '', region_id: regionId = '' } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { hasPermission } = useAuth()
  const canOpenSchool = hasPermission(PAGE_ACCESS.allOrganizations)
  const goBack = useSmartBack(routes.regionReport)
  const query = useOrgReportQuery(id, regionId)
  const report = query.data
  const rows = report?.rows ?? []
  const eduTypes = report?.eduTypes ?? []

  function exportXls() {
    const heads = eduTypes.map((type) => `<th>${escapeHtml(type.shortName)}</th>`).join('')
    const body = rows
      .map((row, index) => {
        const cells = row.byEdu.map((value) => `<td>${value}</td>`).join('')
        return `<tr><td>${index + 1}</td><td>${escapeHtml(row.name)}</td>${cells}</tr>`
      })
      .join('')
    downloadTableXls(
      "Tuman bo'yicha hisobot.xls",
      `<table border="1"><tr><th rowspan="2">№</th><th rowspan="2">${escapeHtml(t('regionReportPage.orgName'))}</th><th colspan="${eduTypes.length}">${escapeHtml(t('regionReportPage.studentsCount'))}</th></tr><tr>${heads}</tr>${body}</table>`,
    )
  }

  return (
    <>
      <Header
        title={
          <span className="inline-flex min-w-0 flex-wrap items-baseline gap-x-2">
            <span>
              {t('regionReportPage.orgTitle')}
              {report?.areaName ? ` (${report.areaName})` : ''}
            </span>
            <span className="text-sm font-medium text-amber">{yesterdayLabel()}</span>
          </span>
        }
        onBack={goBack}
        actions={<ExportButton onClick={exportXls} disabled={!report || rows.length === 0} />}
      />
      <PageMain fill>
        {query.isError && !report ? (
          <ErrorMessage />
        ) : query.isLoading && !report ? (
          <ListPageSkeleton rows={8} />
        ) : (
          <Table storageKey="region-report-org" fill>
            <THead>
              <HeaderTR>
                <TH column="index" rowSpan={2} className="w-12 text-center">
                  №
                </TH>
                <TH column="name" rowSpan={2} className="min-w-56">
                  {t('regionReportPage.orgName')}
                </TH>
                <TH column="status" rowSpan={2} className="w-36 text-center whitespace-nowrap">
                  {t('regionReportPage.operatingMode')}
                </TH>
                {eduTypes.length > 0 ? (
                  <TH
                    colSpan={eduTypes.length}
                    registerColumn={false}
                    className="text-center"
                  >
                    <span className="text-[12px] font-semibold tracking-wide text-signal uppercase">
                      {t('regionReportPage.studentsCount')}
                    </span>
                  </TH>
                ) : null}
              </HeaderTR>
              {eduTypes.length > 0 ? (
                <HeaderTR>
                  {eduTypes.map((type, index) => (
                    <TH
                      key={`${type.id ?? index}`}
                      column={`edu-${index}`}
                      columnLabel={type.shortName}
                      className="min-w-14 text-center whitespace-nowrap"
                    >
                      {type.shortName}
                    </TH>
                  ))}
                </HeaderTR>
              ) : null}
            </THead>
            <TBody>
              {rows.length === 0 ? (
                <EmptyTR colSpan={3 + eduTypes.length} />
              ) : (
                rows.map((row, index) => (
                  <TR key={row.id ?? index}>
                    <TD column="index" className="text-center text-muted">
                      {index + 1}
                    </TD>
                    <TD column="name">
                      {row.id && canOpenSchool ? (
                        <Button
                          variant="link"
                          size="inline"
                          className="!h-auto max-w-full !justify-start !px-0 !font-medium"
                          onClick={() => navigate(`/all-organizations/${row.id}`)}
                        >
                          <span className="truncate">{row.name || '—'}</span>
                        </Button>
                      ) : (
                        row.name || '—'
                      )}
                    </TD>
                    <TD column="status" className="text-center">
                      <Badge tone={row.active ? 'teal' : 'rose'}>
                        {row.active
                          ? t('regionReportPage.statusActive')
                          : t('regionReportPage.statusInactive')}
                      </Badge>
                    </TD>
                    {row.byEdu.map((value, eduIndex) => (
                      <TD
                        key={eduIndex}
                        column={`edu-${eduIndex}`}
                        className="text-center tabular-nums"
                      >
                        {value}
                      </TD>
                    ))}
                  </TR>
                ))
              )}
            </TBody>
          </Table>
        )}
      </PageMain>
    </>
  )
}
