import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Pencil, Plus, Power, RotateCw } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import {
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorMessage,
  ListPageSkeleton,
  Modal,
  Notification,
  Pagination,
  SearchInput,
  Select,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
  notify,
} from '@/components/ui'
import { groupExamResultsPath, groupShowPath } from '@/config'
import {
  useCreateOrganizationFinalExamMutation,
  useOrganizationFinalExamsQuery,
  useToggleOrganizationFinalExamMutation,
  useUpdateOrganizationFinalExamMutation,
} from '@/features/organization-final-exam'
import { asLangName, asText } from '@/lib/apiPage'
import { formatDate, formatDateTime } from '@/lib/format'
import type { OrganizationFinalExamRow } from '@/types/organization-final-exam'
import { OrganizationFinalExamFormModal } from './OrganizationFinalExamFormModal'

const RETAKE_GUIDE_PDF = `${import.meta.env.BASE_URL}docs/qayta-imtihonga-qoyish-yoriqnomasi.pdf`

function isInactive(row: OrganizationFinalExamRow) {
  return Number(row.status?.id) === 1
}

export function OrganizationFinalExamPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [editExam, setEditExam] = useState<OrganizationFinalExamRow | null>(null)
  const [guideOpen, setGuideOpen] = useState(false)
  const [toggleTarget, setToggleTarget] = useState<OrganizationFinalExamRow | null>(
    null,
  )

  const { data, isLoading, isError, error } = useOrganizationFinalExamsQuery()
  const createMutation = useCreateOrganizationFinalExamMutation()
  const updateMutation = useUpdateOrganizationFinalExamMutation()
  const toggleMutation = useToggleOrganizationFinalExamMutation()
  const exams = data ?? []

  const categories = useMemo(() => {
    const map = new Map<string, { id: string; label: string }>()
    exams.forEach((exam) => {
      const category = exam.group?.category
      if (category?.id == null) return
      const id = String(category.id)
      if (map.has(id)) return
      const shortName = asText(category.short_name)
      const name = asLangName(category.name, i18n.language)
      map.set(id, {
        id,
        label:
          shortName !== '—' && name !== '—'
            ? `${shortName} - ${name}`
            : name !== '—'
              ? name
              : shortName,
      })
    })
    return [...map.values()]
  }, [exams, i18n.language])

  const filtered = useMemo(() => {
    const text = search.trim().toLocaleLowerCase('uz')
    return exams.filter((exam) => {
      const matchesText =
        !text ||
        (exam.name ?? '').toLocaleLowerCase('uz').includes(text) ||
        (exam.group?.name ?? '').toLocaleLowerCase('uz').includes(text)
      const matchesCategory =
        !categoryId || String(exam.group?.category?.id) === categoryId
      return matchesText && matchesCategory
    })
  }, [exams, search, categoryId])

  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1)
  const safePage = Math.min(page, totalPages)
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)
  const usedGroupIds = exams
    .map((exam) => exam.group?.id)
    .filter((id): id is number => id != null)

  return (
    <>
      <Header
        title={t('organizationFinalExamPage.title')}
        actions={
          <div className="flex flex-nowrap items-center gap-2">
            <Button
              variant="soft"
              size="sm"
              className="shrink-0"
              onClick={() => setGuideOpen(true)}
            >
              <RotateCw className="size-3.5" aria-hidden />
              {t('organizationFinalExamPage.retakeGuide')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="shrink-0"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="size-3.5" aria-hidden />
              {t('organizationFinalExamPage.create')}
            </Button>
          </div>
        }
      />
      <PageMain fill>
        <Notification tone="warning">
          {t('organizationFinalExamPage.info')}
        </Notification>
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput
            size="sm"
            debounceMs={0}
            id="org-final-exam-search"
            name="org-final-exam-search"
            className="w-72"
            label={t('organizationFinalExamPage.search')}
            placeholder={t('organizationFinalExamPage.search')}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
          <Select
            size="sm"
            clearable
            className="w-64 shrink-0"
            placeholder={t('organizationFinalExamPage.filterCategory')}
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value)
              setPage(1)
            }}
            options={categories.map((item) => ({
              value: item.id,
              label: item.label,
            }))}
          />
        </div>
        {isError ? (
          <ErrorMessage>
            {error instanceof Error ? error.message : undefined}
          </ErrorMessage>
        ) : isLoading ? (
          <ListPageSkeleton rows={8} />
        ) : (
          <Table storageKey="organization-final-exam">
            <THead>
              <TR>
                <TH column="index" className="w-10">
                  №
                </TH>
                <TH column="name">{t('organizationFinalExamPage.examName')}</TH>
                <TH column="group">{t('organizationFinalExamPage.groupMeta')}</TH>
                <TH column="category" className="w-40 text-center">
                  {t('organizationFinalExamPage.category')}
                </TH>
                <TH column="times">{t('organizationFinalExamPage.times')}</TH>
                <TH column="status" className="w-28 text-center">
                  {t('organizationFinalExamPage.status')}
                </TH>
                <TH column="actions" className="w-24 text-center">
                  {t('common.actions')}
                </TH>
              </TR>
            </THead>
            <TBody>
              {pageRows.length === 0 ? (
                <TR>
                  <TD className="py-8 text-center" colSpan={7}>
                    <EmptyState
                      className="border-0 py-4"
                      description={t('organizationFinalExamPage.empty')}
                    />
                  </TD>
                </TR>
              ) : (
                pageRows.map((row, index) => {
                  const inactive = isInactive(row)
                  const start = row.time?.start
                  const end = row.time?.end
                  const category =
                    asText(row.group?.category?.short_name) !== '—'
                      ? asText(row.group?.category?.short_name)
                      : asLangName(row.group?.category?.name, i18n.language)
                  return (
                    <TR key={row.id}>
                      <TD column="index" className="text-center text-muted">
                        {(safePage - 1) * pageSize + index + 1}
                      </TD>
                      <TD column="name">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto px-0 py-0 font-medium text-signal hover:underline"
                          onClick={() => navigate(groupExamResultsPath(row.id))}
                        >
                          {row.name || '—'}
                        </Button>
                      </TD>
                      <TD column="group">
                        {row.group?.id ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto px-0 py-0 font-medium text-signal hover:underline"
                            onClick={() =>
                              navigate(groupShowPath(row.group!.id!))
                            }
                          >
                            {row.group.name || '—'} (
                            <Badge tone="teal">
                              {formatDate(start, i18n.language) ?? asText(start)}
                            </Badge>{' '}
                            -{' '}
                            <Badge tone="rose">
                              {formatDate(end, i18n.language) ?? asText(end)}
                            </Badge>
                            )
                          </Button>
                        ) : (
                          '—'
                        )}
                      </TD>
                      <TD column="category" className="text-center">
                        {category === '—' ? '—' : <Badge tone="signal">{category}</Badge>}
                      </TD>
                      <TD column="times">
                        <div className="flex flex-wrap items-center gap-1">
                          <Badge tone="teal">
                            {t('organizationFinalExamPage.startLabel')}:{' '}
                            {formatDateTime(start, i18n.language) ?? asText(start)}
                          </Badge>
                          <Badge tone="rose">
                            {t('organizationFinalExamPage.endLabel')}:{' '}
                            {formatDateTime(end, i18n.language) ?? asText(end)}
                          </Badge>
                        </div>
                      </TD>
                      <TD column="status" className="text-center">
                        <Badge tone={inactive ? 'rose' : 'teal'}>
                          {inactive
                            ? t('organizationFinalExamPage.inactive')
                            : t('organizationFinalExamPage.active')}
                        </Badge>
                      </TD>
                      <TD column="actions" className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="outline"
                            size="icon-sm"
                            aria-label={t('common.edit')}
                            onClick={() => setEditExam(row)}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon-sm"
                            className={inactive ? 'text-rose' : 'text-teal'}
                            aria-label={
                              inactive
                                ? t('organizationFinalExamPage.activate')
                                : t('organizationFinalExamPage.deactivate')
                            }
                            onClick={() => setToggleTarget(row)}
                          >
                            <Power className="size-3.5" />
                          </Button>
                        </div>
                      </TD>
                    </TR>
                  )
                })
              )}
            </TBody>
          </Table>
        )}
        <Pagination
          page={safePage}
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

      <OrganizationFinalExamFormModal
        open={createOpen}
        mode="create"
        usedGroupIds={usedGroupIds}
        loading={createMutation.isPending}
        onClose={() => setCreateOpen(false)}
        onSubmit={(payload) => {
          if (!payload.group_id) return
          createMutation.mutate(
            {
              name: payload.name,
              group_id: payload.group_id,
              time: payload.time,
            },
            {
              onSuccess: () => {
                notify.success(t('common.created'))
                setCreateOpen(false)
              },
              onError: (err) =>
                notify.error(err.message || t('common.loadError')),
            },
          )
        }}
      />
      <OrganizationFinalExamFormModal
        open={Boolean(editExam)}
        mode="edit"
        exam={editExam}
        usedGroupIds={usedGroupIds}
        loading={updateMutation.isPending}
        onClose={() => setEditExam(null)}
        onSubmit={(payload) => {
          if (!editExam) return
          updateMutation.mutate(
            { examId: editExam.id, payload: { time: payload.time } },
            {
              onSuccess: () => {
                notify.success(t('common.saved'))
                setEditExam(null)
              },
              onError: (err) =>
                notify.error(err.message || t('common.loadError')),
            },
          )
        }}
      />
      <Modal
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
        title={t('organizationFinalExamPage.retakeGuide')}
        sizeClassName="max-w-[80vw]"
        maxHeightClassName="h-[90svh] max-h-[90svh]"
        bodyClassName="relative overflow-hidden p-0"
        headerExtra={
          <a
            href={RETAKE_GUIDE_PDF}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 text-sm font-medium text-signal hover:underline"
          >
            {t('organizationFinalExamPage.viewFromAnotherPage')}
          </a>
        }
      >
        <iframe
          src={RETAKE_GUIDE_PDF}
          title={t('organizationFinalExamPage.retakeGuide')}
          className="absolute inset-0 h-full w-full border-0"
        />
      </Modal>
      <ConfirmDialog
        open={Boolean(toggleTarget)}
        onClose={() => setToggleTarget(null)}
        title={t('organizationFinalExamPage.changeStatus')}
        description={
          toggleTarget && isInactive(toggleTarget)
            ? t('organizationFinalExamPage.activate')
            : t('organizationFinalExamPage.deactivate')
        }
        confirmLabel={
          toggleTarget && isInactive(toggleTarget)
            ? t('organizationFinalExamPage.activate')
            : t('organizationFinalExamPage.deactivate')
        }
        loading={toggleMutation.isPending}
        onConfirm={() => {
          if (!toggleTarget) return
          const inactive = isInactive(toggleTarget)
          toggleMutation.mutate(
            { examId: toggleTarget.id, inactive },
            {
              onSuccess: () => {
                notify.success(
                  inactive
                    ? t('organizationFinalExamPage.activated')
                    : t('organizationFinalExamPage.deactivated'),
                )
                setToggleTarget(null)
              },
              onError: (err) =>
                notify.error(err.message || t('common.loadError')),
            },
          )
        }}
      />
    </>
  )
}
