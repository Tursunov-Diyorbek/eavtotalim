import { useTranslation } from 'react-i18next'
import { AlertTriangle, FileText } from 'lucide-react'
import { Button, Panel } from '@/components/ui'

/** Eski `group_add_guid.pdf` — `public/docs/group-add-guide.pdf`. */
export const GROUP_ADD_GUIDE_PDF = '/docs/group-add-guide.pdf'

type GroupAddingGuideProps = {
  className?: string
}

/** Eski GroupAddingGuid — o‘quvchi/guruh kiritish my.gov.uz orqali. */
export function GroupAddingGuide({ className }: GroupAddingGuideProps) {
  const { t } = useTranslation()

  return (
    <Panel
      className={className}
      padding="md"
    >
      <div className="flex flex-col items-center gap-4 px-4 py-10 text-center sm:px-8">
        <span
          className="inline-flex size-14 items-center justify-center rounded-full bg-amber-soft text-amber"
          aria-hidden
        >
          <AlertTriangle className="size-7" />
        </span>
        <p className="m-0 max-w-xl font-display text-[15px] font-semibold uppercase tracking-wide text-deep">
          {t('students.addViaMyGov')}
        </p>
        <Button
          variant="primary"
          onClick={() => window.open(GROUP_ADD_GUIDE_PDF, '_blank', 'noopener,noreferrer')}
        >
          <FileText className="size-4" aria-hidden />
          {t('students.openAddGuide')}
        </Button>
      </div>
    </Panel>
  )
}
