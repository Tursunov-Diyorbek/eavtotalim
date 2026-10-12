import { useLocation, useParams, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, ImageOff, XCircle } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import { EmptyState, ErrorMessage, ListPageSkeleton, Panel, SafeImage } from '@/components/ui'
import { PATH_PREFIX_FILE, routes } from '@/config'
import { useExamTestStudentResultsQuery } from '@/features/director-stats'
import { resolveFileUrl } from '@/features/lessons'
import { useSmartBack } from '@/hooks'
import { cn } from '@/lib/cn'
import type { ExamReviewBlock, ExamReviewQuestion } from '@/types/director-stats'

type LocationState = {
  fullName?: string
}

function blockText(blocks: ExamReviewBlock[] | null | undefined) {
  const text = blocks?.find((block) => Number(block.type) === 1) ?? blocks?.[0]
  return text?.value?.trim() || ''
}

function blockImage(blocks: ExamReviewBlock[] | null | undefined) {
  const image = blocks?.find((block) => Number(block.type) === 2)
  const path = image?.webp || image?.value
  return path ? resolveFileUrl(String(path), PATH_PREFIX_FILE) : ''
}

function isChecked(value: boolean | number | null | undefined) {
  return value === true || value === 1
}

function QuestionCard({ item, num }: { item: ExamReviewQuestion; num: number }) {
  const { t } = useTranslation()
  const question = blockText(item.question_body)
  const image = blockImage(item.question_body)
  const selected = item.answers?.find((answer) => answer.id === item.selected_answer_id)
  const correct = selected ? isChecked(selected.check) : null

  return (
    <Panel
      padding="md"
      className={cn(
        correct === true && 'bg-teal-soft/40',
        correct === false && 'bg-rose-soft/50',
      )}
    >
      <p className="m-0 text-[15px] leading-snug font-semibold text-deep">
        {num}. {question || '—'}
      </p>
      <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {(item.answers ?? []).map((answer, index) => {
            const picked = answer.id === item.selected_answer_id
            const ok = isChecked(answer.check)
            return (
              <li
                key={answer.id ?? index}
                className="flex items-start gap-2 rounded-lg border border-mist/80 bg-white px-3 py-2 text-[13px] text-ink"
              >
                <span className="mt-0.5 flex w-5 shrink-0 justify-center">
                  {picked ? (
                    ok ? (
                      <CheckCircle2 className="size-4 text-teal" aria-hidden />
                    ) : (
                      <XCircle className="size-4 text-rose" aria-hidden />
                    )
                  ) : null}
                </span>
                <span>
                  {index + 1}) {blockText(answer.body) || '—'}
                </span>
              </li>
            )
          })}
        </ul>
        <div className="relative h-44 overflow-hidden rounded-lg bg-fog">
          <SafeImage
            src={image}
            fit="contain"
            icon={ImageOff}
            label={t('statsPage.noImage')}
            className="size-full"
          />
        </div>
      </div>
    </Panel>
  )
}

export function ExamViewStudentShowPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const [params] = useSearchParams()
  const state = (useLocation().state ?? {}) as LocationState
  const attempt = params.get('attempt') ?? undefined
  const goBack = useSmartBack(routes.examViewStatistic)
  const { data, isLoading, isError } = useExamTestStudentResultsQuery(id, attempt)
  const rows = data ?? []
  const title = state.fullName?.trim()
    ? state.fullName.trim().toUpperCase()
    : t('statsPage.finalTestReport')

  return (
    <>
      <Header title={title} onBack={goBack} />
      <PageMain fill>
        {isError ? (
          <ErrorMessage />
        ) : isLoading ? (
          <ListPageSkeleton rows={6} />
        ) : rows.length === 0 ? (
          <EmptyState description={t('statsPage.emptyList')} />
        ) : (
          <div className="flex flex-col gap-3">
            {rows.map((row, index) => (
              <QuestionCard key={index} item={row} num={index + 1} />
            ))}
          </div>
        )}
      </PageMain>
    </>
  )
}
