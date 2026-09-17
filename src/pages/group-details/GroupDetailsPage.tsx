import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Car, Users } from 'lucide-react'
import {
  Badge,
  EmptyState,
  ErrorMessage,
  Modal,
  Panel,
  SafeImage,
  Skeleton,
  SkeletonLines,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '@/components/ui'
import { Header } from '@/components/layout'
import { PATH_PREFIX_FILE } from '@/config'
import { useAuth } from '@/features/auth'
import { useGroupDetailsQuery } from '@/features/group-details'
import { resolveFileUrl } from '@/features/lessons'

function SectionHeading({
  icon,
  title,
  description,
}: {
  icon: ReactNode
  title: string
  description: string
}) {
  return (
    <div className="mb-3 flex items-center gap-2.5">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-teal-soft text-teal">
        {icon}
      </div>
      <div>
        <p className="m-0 text-sm font-semibold text-deep">{title}</p>
        <p className="m-0 text-[12px] text-muted">{description}</p>
      </div>
    </div>
  )
}

function CarPhoto({
  photo,
  alt,
  onOpen,
}: {
  photo?: string | null
  alt: string
  onOpen?: (src: string, title: string) => void
}) {
  const src = resolveFileUrl(photo, PATH_PREFIX_FILE)
  const clickable = Boolean(src && onOpen)

  return (
    <button
      type="button"
      disabled={!clickable}
      onClick={() => {
        if (src && onOpen) onOpen(src, alt)
      }}
      className={
        clickable
          ? 'block rounded-lg outline-none transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-signal/40'
          : 'cursor-default'
      }
      aria-label={clickable ? alt : undefined}
    >
      <SafeImage
        src={src}
        alt={alt}
        size="md"
        icon={Car}
        className="size-12 rounded-lg"
      />
    </button>
  )
}

export function GroupDetailsPage() {
  const { t } = useTranslation()
  const { me } = useAuth()
  const professionId = me?.profession?.id
  const { data, isLoading, isError } = useGroupDetailsQuery(professionId)
  const [preview, setPreview] = useState<{ src: string; title: string } | null>(
    null,
  )

  const teachers = data?.teachers ?? []
  const cars = data?.cars ?? []
  const hasTeachers = teachers.length > 0
  const hasCars = cars.length > 0

  return (
    <>
      <Header
        title={t('groupDetails.title')}
        description={t('groupDetails.description')}
      />

      <main className="flex-1 space-y-3 p-3 sm:p-4">
        {!professionId ? (
          <EmptyState description={t('groupDetails.empty')} />
        ) : isLoading ? (
          <div className="space-y-3">
            <Panel className="space-y-3 p-3 sm:p-4">
              <Skeleton className="h-10 w-48" rounded="lg" />
              <SkeletonLines lines={4} />
            </Panel>
            <Panel className="space-y-3 p-3 sm:p-4">
              <Skeleton className="h-10 w-48" rounded="lg" />
              <SkeletonLines lines={3} />
            </Panel>
          </div>
        ) : isError ? (
          <ErrorMessage />
        ) : !hasTeachers && !hasCars ? (
          <EmptyState description={t('groupDetails.empty')} />
        ) : (
          <div className="space-y-3">
            {hasTeachers ? (
              <Panel className="p-3 sm:p-4">
                <SectionHeading
                  icon={<Users className="size-5" aria-hidden />}
                  title={t('groupDetails.teachersTitle')}
                  description={t('groupDetails.teachersCount', {
                    count: teachers.length,
                  })}
                />
                <Table>
                  <THead>
                    <TR>
                      <TH className="w-14 text-center">№</TH>
                      <TH>{t('groupDetails.fullName')}</TH>
                      <TH className="w-48">{t('groupDetails.specialization')}</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {teachers.map((teacher, index) => (
                      <TR key={teacher.id ?? index}>
                        <TD className="text-center">
                          <Badge tone="teal">{index + 1}</Badge>
                        </TD>
                        <TD className="font-medium text-deep">
                          {teacher.full_name || '—'}
                        </TD>
                        <TD>
                          {teacher.specialization ? (
                            <Badge tone="teal">{teacher.specialization}</Badge>
                          ) : (
                            '—'
                          )}
                        </TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              </Panel>
            ) : null}

            {hasCars ? (
              <Panel className="p-3 sm:p-4">
                <SectionHeading
                  icon={<Car className="size-5" aria-hidden />}
                  title={t('groupDetails.carsTitle')}
                  description={t('groupDetails.carsCount', {
                    count: cars.length,
                  })}
                />
                <Table>
                  <THead>
                    <TR>
                      <TH className="w-14 text-center">№</TH>
                      <TH className="w-20">{t('groupDetails.photo')}</TH>
                      <TH>{t('groupDetails.carName')}</TH>
                      <TH className="w-40">{t('groupDetails.carNumber')}</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {cars.map((car, index) => (
                      <TR key={car.id ?? index}>
                        <TD className="text-center">
                          <Badge tone="teal">{index + 1}</Badge>
                        </TD>
                        <TD>
                          <CarPhoto
                            photo={car.photo}
                            alt={car.name || t('groupDetails.carName')}
                            onOpen={(src, title) => setPreview({ src, title })}
                          />
                        </TD>
                        <TD className="font-medium text-deep">
                          {car.name || '—'}
                        </TD>
                        <TD>
                          {car.number ? (
                            <Badge tone="teal">{car.number}</Badge>
                          ) : (
                            '—'
                          )}
                        </TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              </Panel>
            ) : null}
          </div>
        )}
      </main>

      <Modal
        open={Boolean(preview)}
        onClose={() => setPreview(null)}
        title={preview?.title}
        sizeClassName="max-w-2xl"
        bodyClassName="p-3 sm:p-4"
      >
        {preview ? (
          <SafeImage
            src={preview.src}
            alt={preview.title}
            size="xl"
            icon={Car}
            fit="contain"
            className="mx-auto aspect-video max-h-[min(70svh,520px)] w-full rounded-xl bg-fog"
          />
        ) : null}
      </Modal>
    </>
  )
}
