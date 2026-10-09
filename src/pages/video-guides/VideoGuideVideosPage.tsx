import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Play } from 'lucide-react'
import { Header, PageMain } from '@/components/layout'
import { Modal } from '@/components/ui'
import { routes } from '@/config/routes'
import { useSmartBack } from '@/hooks'
import { EDUCATION_VIDEOS, PAYMENT_VIDEOS, type GuideVideo } from './catalog'

type VideoGuideVideosPageProps = {
  titleKey: string
  videos: GuideVideo[]
}

export function VideoGuideVideosPage({ titleKey, videos }: VideoGuideVideosPageProps) {
  const { t } = useTranslation()
  const onBack = useSmartBack(routes.videoGuides)
  const [active, setActive] = useState<GuideVideo | null>(null)

  return (
    <>
      <Header title={t(titleKey)} onBack={onBack} />
      <PageMain>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          {videos.map((video) => (
            <button
              key={video.id}
              type="button"
              onClick={() => setActive(video)}
              className="overflow-hidden rounded-xl border border-mist/80 bg-white text-left shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-teal/40"
            >
              <span className="relative block aspect-video bg-deep">
                <img
                  src={`https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`}
                  alt=""
                  className="size-full object-cover"
                />
                <span className="absolute inset-0 grid place-items-center bg-deep/15">
                  <span className="grid size-11 place-items-center rounded-full bg-rose text-white shadow-md">
                    <Play className="size-5 fill-current" aria-hidden />
                  </span>
                </span>
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-2 text-[13px] font-semibold text-deep">
                <Play className="size-3.5 shrink-0 text-teal" aria-hidden />
                <span className="truncate" title={t(video.titleKey)}>
                  {t(video.titleKey)}
                </span>
              </span>
            </button>
          ))}
        </div>
      </PageMain>

      <Modal
        open={Boolean(active)}
        title={active ? t(active.titleKey) : ''}
        onClose={() => setActive(null)}
        sizeClassName="max-w-4xl"
        bodyClassName="overflow-hidden p-0"
      >
        {active ? (
          <div className="aspect-video bg-deep">
            <iframe
              key={active.youtubeId}
              className="size-full"
              src={`https://www.youtube-nocookie.com/embed/${active.youtubeId}?autoplay=1`}
              title={t(active.titleKey)}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : null}
      </Modal>
    </>
  )
}

export function EducationGuidesPage() {
  return (
    <VideoGuideVideosPage
      titleKey="videoGuidesPage.educationTitle"
      videos={EDUCATION_VIDEOS}
    />
  )
}

export function PaymentGuidesPage() {
  return (
    <VideoGuideVideosPage
      titleKey="videoGuidesPage.paymentsTitle"
      videos={PAYMENT_VIDEOS}
    />
  )
}
