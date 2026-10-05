import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Header, PageMain } from '@/components/layout'
import {
  Badge,
  EmptyTR,
  ErrorMessage,
  FilterTH,
  FilterTR,
  HeaderTR,
  ListPageSkeleton,
  Notification,
  Pagination,
  SearchInput,
  Select,
  Table,
  TableSearch,
  Tabs,
  TBody,
  TD,
  TH,
  THead,
  TR,
  LottiePlayer,
} from '@/components/ui'
import { documentPrintPath, groupShowPath } from '@/config'
import { useAuth } from '@/features/auth'
import { useGroupsQuery } from '@/features/groups'
import { usePageState, useUrlTab } from '@/hooks'
import { asLangName } from '@/lib'
import type { DocumentKind } from '@/types/documents'
import type { GroupEduStatusTab, GroupItem } from '@/types/groups'
/**
 * LottieFiles community, Lottie Simple License (bepul).
 * application — Document
 * contract — signature
 * registration — clipboard
 * statements — file
 * voucher — ticket
 * sheet — identity card
 * sheet2 — user
 * mygov — bank
 * jurnal — book
 * practical — car
 * approved — checkmark
 * warning — alert
 */
import applicationAnim from '@/assets/lottie/docs/application.json'
import contractAnim from '@/assets/lottie/docs/contract.json'
import registrationAnim from '@/assets/lottie/docs/registration.json'
import statementsAnim from '@/assets/lottie/docs/statements.json'
import voucherAnim from '@/assets/lottie/docs/voucher.json'
import sheetAnim from '@/assets/lottie/docs/sheet.json'
import sheet2Anim from '@/assets/lottie/docs/sheet2.json'
import mygovAnim from '@/assets/lottie/docs/mygov.json'
import jurnalAnim from '@/assets/lottie/docs/jurnal.json'
import practicalAnim from '@/assets/lottie/docs/practical.json'
import approvedAnim from '@/assets/lottie/docs/approved.json'
import warningAnim from '@/assets/lottie/docs/warning.json'

const SECTIONS = ['1', '2'] as const
type SectionTab = (typeof SECTIONS)[number]

const PRACTICAL_EDU_TYPES = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9])

const TAB1: { kind: DocumentKind; labelKey: string }[] = [
  { kind: 'application', labelKey: 'documentsPage.colApplication' },
  { kind: 'contract', labelKey: 'documentsPage.colContract' },
  { kind: 'registration', labelKey: 'documentsPage.colRegistration' },
  { kind: 'statements', labelKey: 'documentsPage.colGroupApp' },
  { kind: 'voucher', labelKey: 'documentsPage.colVoucher' },
  { kind: 'sheet', labelKey: 'documentsPage.colSheet' },
]

const DOC_LOTTIE: Record<DocumentKind, object> = {
  application: applicationAnim,
  contract: contractAnim,
  registration: registrationAnim,
  statements: statementsAnim,
  voucher: voucherAnim,
  sheet: sheetAnim,
  sheet2: sheet2Anim,
  mygov: mygovAnim,
  jurnal: jurnalAnim,
  practical: practicalAnim,
  approved: approvedAnim,
  warning: warningAnim,
}

/** 32px ramka ichida chizma bir xil ~20px bo‘lishi uchun. */
const DOC_SCALE: Record<DocumentKind, number> = {
  application: 1.17,
  contract: 1.27,
  registration: 1.44,
  statements: 1,
  voucher: 1.4,
  sheet: 1.22,
  sheet2: 0.93,
  mygov: 1.14,
  jurnal: 1.17,
  practical: 1.12,
  approved: 1.04,
  warning: 1.37,
}

const TAB2: { kind: DocumentKind; labelKey: string }[] = [
  { kind: 'sheet2', labelKey: 'documentsPage.colSheet2' },
  { kind: 'mygov', labelKey: 'documentsPage.colMygov' },
  { kind: 'jurnal', labelKey: 'documentsPage.colJurnal' },
  { kind: 'practical', labelKey: 'documentsPage.colPractical' },
  { kind: 'approved', labelKey: 'documentsPage.colApproved' },
  { kind: 'warning', labelKey: 'documentsPage.colWarning' },
]

function eduTypeLabel(row: GroupItem) {
  return (
    row.edu_type?.short_name ||
    row.edu_type?.character_name ||
    '—'
  )
}

function PrintIconLink({
  to,
  label,
  kind,
}: {
  to: string
  label: string
  kind: DocumentKind
}) {
  const { t } = useTranslation()
  return (
    <Link
      to={to}
      title={t('documentsPage.printDoc')}
      aria-label={label}
      className="inline-flex size-8 items-center justify-center overflow-hidden rounded-lg border border-mist bg-white transition hover:border-signal/40 hover:bg-fog"
    >
      <span
        className="inline-flex origin-center"
        style={{ transform: `scale(${DOC_SCALE[kind]})` }}
      >
        <LottiePlayer animationData={DOC_LOTTIE[kind]} size={22} />
      </span>
    </Link>
  )
}

export function DocumentsPage() {
  const { t, i18n } = useTranslation()
  const { me } = useAuth()
  const hasAgreement = me?.profession?.organization?.last_agreement?.status === 1
  const [section, setSection] = useUrlTab(SECTIONS, '1', 'section')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [name, setName] = usePageState('name', '')
  const [eduStatus, setEduStatus] = usePageState<Exclude<GroupEduStatusTab, 'all'>>('eduStatus', '1')

  useEffect(() => {
    setPage(1)
  }, [name, eduStatus, pageSize, section])

  const query = useGroupsQuery({
    page,
    showCount: pageSize,
    eduStatus,
    name: name.trim() || undefined,
    sortKey: 'id',
    sortOrder: 'DESC',
  })
  const rows = query.data?.data ?? []
  const total = query.data?.total_items ?? 0
  const totalPages =
    query.data?.last_page ?? Math.max(1, Math.ceil(total / pageSize) || 1)
  const cols = section === '1' ? TAB1 : TAB2
  const colSpan = 3 + cols.length

  return (
    <>
      <Header
        title={t('documentsPage.title')}
        actions={
          <div className="flex flex-nowrap items-end gap-2">
            <Select
              size="sm"
              className="w-48 shrink-0"
              value={eduStatus}
              options={[
                { value: '1', label: t('groupsPage.tabActive') },
                { value: '0', label: t('groupsPage.tabNew') },
                { value: '2', label: t('groupsPage.tabFinished') },
              ]}
              onChange={(e) =>
                setEduStatus(e.target.value as Exclude<GroupEduStatusTab, 'all'>)
              }
            />
            <SearchInput
              size="sm"
              className="w-48 shrink-0"
              placeholder={t('documentsPage.search')}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        }
      />
      <PageMain fill>
        <Tabs
          value={section}
          onChange={(value) => setSection(value as SectionTab)}
          items={[
            { value: '1', label: t('documentsPage.section1') },
            { value: '2', label: t('documentsPage.section2') },
          ]}
        />
        {!hasAgreement ? (
          <Notification tone="warning">{t('documentsPage.noAgreement')}</Notification>
        ) : query.isError ? (
          <ErrorMessage />
        ) : query.isLoading ? (
          <ListPageSkeleton rows={8} />
        ) : (
          <Table storageKey={`documents-list-${section}`} className="min-w-280">
            <THead>
              <HeaderTR>
                <TH className="w-12 text-center">№</TH>
                <TH>{t('documentsPage.colGroup')}</TH>
                {cols.map((col) => (
                  <TH key={col.kind} className="text-center">
                    {t(col.labelKey)}
                  </TH>
                ))}
                <TH>{t('documentsPage.colEduType')}</TH>
              </HeaderTR>
              <FilterTR>
                <FilterTH />
                <FilterTH>
                  <TableSearch
                    label={t('common.search')}
                    placeholder={t('documentsPage.search')}
                    onChange={(e) => setName(e.target.value)}
                  />
                </FilterTH>
                {cols.map((col) => (
                  <FilterTH key={col.kind} />
                ))}
                <FilterTH />
              </FilterTR>
            </THead>
            <TBody>
              {rows.length === 0 ? (
                <EmptyTR colSpan={colSpan} />
              ) : (
                rows.map((row, index) => {
                  const label = asLangName(row, i18n.language)
                  return (
                    <TR key={row.id}>
                      <TD className="text-center text-muted">
                        {(page - 1) * pageSize + index + 1}
                      </TD>
                      <TD>
                        <Link
                          to={groupShowPath(row.id)}
                          className="font-semibold text-signal hover:underline"
                        >
                          {label}
                        </Link>
                      </TD>
                      {cols.map((col) => (
                        <TD key={col.kind} className="text-center">
                          {col.kind === 'practical' &&
                          !PRACTICAL_EDU_TYPES.has(Number(row.edu_type?.id)) ? (
                            <Badge>{t('documentsPage.noContent')}</Badge>
                          ) : (
                            <PrintIconLink
                              to={documentPrintPath(col.kind, row.id)}
                              label={t(col.labelKey)}
                              kind={col.kind}
                            />
                          )}
                        </TD>
                      ))}
                      <TD>{eduTypeLabel(row)}</TD>
                    </TR>
                  )
                })
              )}
            </TBody>
          </Table>
        )}
        {hasAgreement ? (
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            total={total}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
          />
        ) : null}
      </PageMain>
    </>
  )
}
