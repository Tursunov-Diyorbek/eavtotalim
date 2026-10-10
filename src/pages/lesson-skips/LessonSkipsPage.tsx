import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  Pagination,
  ShowButton,
  Table,
  TableSearch,
  TBody,
  TD,
  TR,
  TH,
  THead,
} from '@/components/ui'
import { lessonSkipsShowPath } from '@/config'
import { useLessonSkipsQuery } from '@/features/lesson-skips'
import { usePageState } from '@/hooks'
import { asFio, asLangName } from '@/lib/apiPage'
import { downloadXls } from '@/lib/downloadXls'
import { formatNumber } from '@/lib/format'
import type { LessonSkipRow } from '@/types/lesson-skips'

export function LessonSkipsPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [word, setWord] = usePageState('word', '')

  useEffect(() => {
    setPage(1)
  }, [word, pageSize])

  const { data, isLoading, isError } = useLessonSkipsQuery({
    page,
    showCount: pageSize,
    word,
  })
  const rows = data?.data ?? []
  const total = data?.total_items ?? 0
  const totalPages = data?.last_page ?? Math.max(1, Math.ceil(total / pageSize) || 1)

  const exportXls = () => {
    downloadXls(
      'oquvchilar-boyicha-hisobot',
      ['№', t('directorList.fio'), t('directorList.group'), t('lessonSkips.missedCount')],
      rows.map((row, index) => [
        (page - 1) * pageSize + index + 1,
        asFio(row),
        asLangName(row.group, i18n.language),
        row.monitoring_relation_count ?? '',
      ]),
    )
  }

  return (
    <>
      <Header
        title={t('lessonSkips.title')}
        actions={<ExportButton onClick={exportXls} disabled={isLoading || rows.length === 0} />}
      />
      <PageMain fill>
        {isError ? (
          <ErrorMessage />
        ) : isLoading ? (
          <ListPageSkeleton rows={8} />
        ) : (
          <Table storageKey="lesson-skips">
            <THead>
              <HeaderTR>
                <TH column="index" className="w-12">
                  №
                </TH>
                <TH column="fio">{t('directorList.fio')}</TH>
                <TH column="group">{t('directorList.group')}</TH>
                <TH column="missed" className="w-48 text-center">
                  {t('lessonSkips.missedCount')}
                </TH>
                <TH column="view" className="w-16 text-center">
                  {t('common.view')}
                </TH>
              </HeaderTR>
              <FilterTR>
                <FilterTH column="index" />
                <FilterTH column="fio">
                  <TableSearch
                    id="lesson-skips-word"
                    name="lesson-skips-word"
                    label={t('common.search')}
                    placeholder={t('common.search')}
                    value={word}
                    onChange={(e) => setWord(e.target.value)}
                  />
                </FilterTH>
                <FilterTH column="group" />
                <FilterTH column="missed" />
                <FilterTH column="view" />
              </FilterTR>
            </THead>
            <TBody>
              {rows.length === 0 ? (
                <EmptyTR colSpan={5} description={t('common.empty')} />
              ) : (
                rows.map((row, index) => (
                  <SkipRow
                    key={String(row.id ?? `${page}-${index}`)}
                    row={row}
                    index={(page - 1) * pageSize + index + 1}
                    lang={i18n.language}
                    onShow={() => {
                      if (row.id == null) return
                      navigate(lessonSkipsShowPath(row.id), {
                        state: { fullName: asFio(row) },
                      })
                    }}
                  />
                ))
              )}
            </TBody>
          </Table>
        )}
        <Pagination
          className="shrink-0"
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          total={total}
          pageSize={pageSize}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setPage(1)
          }}
        />
      </PageMain>
    </>
  )
}

function SkipRow({
  row,
  index,
  lang,
  onShow,
}: {
  row: LessonSkipRow
  index: number
  lang: string
  onShow: () => void
}) {
  const count = Number(row.monitoring_relation_count ?? 0)
  return (
    <TR>
      <TD column="index" className="text-center text-muted">
        {index}
      </TD>
      <TD column="fio" className="font-medium text-deep">
        {asFio(row)}
      </TD>
      <TD column="group">{asLangName(row.group, lang)}</TD>
      <TD column="missed" className="text-center">
        <Badge tone={count > 0 ? 'amber' : 'neutral'}>{formatNumber(count)}</Badge>
      </TD>
      <TD column="view" className="text-center">
        <ShowButton onClick={onShow} disabled={row.id == null} />
      </TD>
    </TR>
  )
}
