import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FileImage, UserMinus } from 'lucide-react'
import {
  Badge,
  EmptyState,
  ErrorMessage,
  Panel,
  SafeImage,
  SkeletonLines,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '@/components/ui'
import { PATH_PREFIX_FILE, studentPath } from '@/config'
import { useGroupRemovedStudentsQuery } from '@/features/groups'
import { resolveFileUrl } from '@/features/lessons'
import { asText } from '@/lib/apiPage'
import { formatDateTime, fullNameOf } from '@/lib/format'

function parseDevice(device: string | null | undefined) {
  if (!device) return '—'
  if (/Windows/i.test(device)) return 'Windows'
  if (/Macintosh|Mac OS/i.test(device)) return 'macOS'
  if (/Android/i.test(device)) return 'Android'
  if (/iPhone|iPad|iOS/i.test(device)) return 'iOS'
  if (/Linux/i.test(device)) return 'Linux'
  return device
}

/** Eski `GroupTables/StudentsRemovedGroup` — guruhdan chiqarilgan o‘quvchilar. */
export function GroupRemovedStudentsTab({ groupId }: { groupId: string }) {
  const { t, i18n } = useTranslation()
  const query = useGroupRemovedStudentsQuery(groupId)

  if (query.isLoading) {
    return (
      <Panel padding="md">
        <SkeletonLines lines={6} />
      </Panel>
    )
  }
  if (query.isError) return <ErrorMessage />

  const rows = query.data ?? []

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="flex size-9 items-center justify-center rounded-lg bg-rose-soft text-rose">
          <UserMinus className="size-4" aria-hidden />
        </span>
        <div>
          <p className="font-display text-sm font-semibold text-deep">
            {t('groupsPage.showPage.tabRemoved')}
          </p>
          <p className="text-sm text-muted">
            {t('groupsPage.showPage.totalStudents')}:{' '}
            <span className="font-semibold text-rose">{rows.length}</span>{' '}
            {t('groupsPage.pcs')}
          </p>
        </div>
      </div>
      <Table storageKey="group-show:removed" className="min-w-250">
        <THead>
          <TR>
            <TH className="w-12 text-center">№</TH>
            <TH className="min-w-56">{t('directorList.fio')}</TH>
            <TH className="w-32">{t('nav.groups')}</TH>
            <TH className="w-44">{t('groupsPage.showPage.removedAt')}</TH>
            <TH className="w-44">{t('groupsPage.showPage.removedBy')}</TH>
            <TH className="w-48">{t('groupsPage.showPage.device')}</TH>
            <TH className="w-24 text-center">{t('groupsPage.showPage.document')}</TH>
          </TR>
        </THead>
        <TBody>
          {rows.length === 0 ? (
            <TR>
              <TD className="py-6 text-center" colSpan={7}>
                <EmptyState
                  className="border-0 py-4 shadow-none"
                  description={t('common.empty')}
                />
              </TD>
            </TR>
          ) : (
            rows.map((row, index) => {
              const student = row.student
              const image = resolveFileUrl(student?.image, PATH_PREFIX_FILE)
              const file = resolveFileUrl(row.file_path, PATH_PREFIX_FILE)
              const name = fullNameOf(student) ?? '—'
              return (
                <TR key={row.id ?? index}>
                  <TD className="text-center text-muted">{index + 1}</TD>
                  <TD>
                    <div className="flex items-center gap-2">
                      <SafeImage
                        src={image}
                        size="sm"
                        className="size-9 shrink-0 rounded-full ring-1 ring-mist/70"
                      />
                      {student?.id ? (
                        <Link
                          to={studentPath(student.id)}
                          className="font-semibold text-signal hover:underline"
                        >
                          {name}
                        </Link>
                      ) : (
                        name
                      )}
                    </div>
                  </TD>
                  <TD>
                    <Badge tone="signal">{asText(row.group?.name)}</Badge>
                  </TD>
                  <TD className="text-xs">
                    {formatDateTime(row.removed_at, i18n.language) ?? '—'}
                  </TD>
                  <TD className="text-xs">{asText(row.removed_by?.name)}</TD>
                  <TD className="text-xs" title={row.device ?? undefined}>
                    {parseDevice(row.device)} / {row.ip_address || '—'}
                  </TD>
                  <TD>
                    <div className="flex justify-center">
                      {file ? (
                        <a href={file} target="_blank" rel="noreferrer">
                          <SafeImage
                            src={file}
                            size="sm"
                            icon={FileImage}
                            className="size-10 rounded-lg ring-1 ring-mist/70"
                          />
                        </a>
                      ) : (
                        <span
                          className="flex size-10 items-center justify-center rounded-lg bg-fog text-muted"
                          title={t('groupsPage.showPage.noDocument')}
                        >
                          <FileImage className="size-4" aria-hidden />
                        </span>
                      )}
                    </div>
                  </TD>
                </TR>
              )
            })
          )}
        </TBody>
      </Table>
    </div>
  )
}
