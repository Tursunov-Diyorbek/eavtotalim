import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ChevronDown,
  FileText,
  Save,
  Trash2,
  Upload,
} from 'lucide-react'
import { Header } from '@/components/layout'
import {
  Button,
  ErrorMessage,
  Field,
  Input,
  Notification,
  Panel,
  Select,
  SkeletonLines,
  Textarea,
  notify,
} from '@/components/ui'
import { EDU_TYPES } from '@/config/eduTypes'
import { routes } from '@/config'
import { useSmartBack } from '@/hooks'
import type { ProblemSituationItem } from '@/api/problem-situations'
import {
  problemSituationErrorMessage,
  situationFileHref,
  useCreateProblemSituationMutation,
  useProblemSituationQuery,
  useUpdateProblemSituationMutation,
} from '@/features/problem-situations'

const LANGS = ['uz', 'ru', 'en'] as const
type LangCode = (typeof LANGS)[number]

type LangField = { lang: LangCode; body: string }
type MediaField = {
  fileType: 'image' | 'video'
  file: File | null
  url: string | null
  id: number | null
}

const emptyLangs = (): LangField[] =>
  LANGS.map((lang) => ({ lang, body: '' }))

const emptyMedia = (): MediaField[] => [
  { fileType: 'image', file: null, url: null, id: null },
]

function fromLangMap(
  data: ProblemSituationItem['name'] | undefined,
): LangField[] {
  return LANGS.map((lang) => ({
    lang,
    body: data?.[lang]?.body ?? '',
  }))
}

function fromFiles(files: ProblemSituationItem['files'] | undefined): MediaField[] {
  if (!files?.length) return emptyMedia()
  return files.map((file) => ({
    fileType: file.type === 'video' ? 'video' : 'image',
    file: null,
    url: file.url ?? null,
    id: file.id ?? null,
  }))
}

export function ProblemSituationFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const goBack = useSmartBack(routes.problemSituations)
  const { id = '' } = useParams()
  const { data, isLoading, isError } = useProblemSituationQuery(
    mode === 'edit' ? id : undefined,
  )
  const createMutation = useCreateProblemSituationMutation()
  const updateMutation = useUpdateProblemSituationMutation(id)

  const [eduTypeId, setEduTypeId] = useState('')
  const [nameFields, setNameFields] = useState<LangField[]>(emptyLangs)
  const [textFields, setTextFields] = useState<LangField[]>(emptyLangs)
  const [mediaFields, setMediaFields] = useState<MediaField[]>(emptyMedia)
  const [openIndexes, setOpenIndexes] = useState<number[]>([0])
  const fileRefs = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    if (!data) return
    setEduTypeId(data.edu_type_id != null ? String(data.edu_type_id) : '')
    setNameFields(fromLangMap(data.name))
    setTextFields(fromLangMap(data.text))
    setMediaFields(fromFiles(data.files))
  }, [data])

  const toggleLang = (index: number) => {
    setOpenIndexes((prev) =>
      prev.includes(index) ? prev.filter((item) => item !== index) : [...prev, index],
    )
  }

  const updateName = (index: number, patch: Partial<LangField>) => {
    setNameFields((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    )
  }

  const updateText = (index: number, body: string) => {
    setTextFields((prev) =>
      prev.map((item, i) => (i === index ? { ...item, body } : item)),
    )
  }

  const updateMedia = (index: number, patch: Partial<MediaField>) => {
    setMediaFields((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    )
  }

  const addMedia = () => {
    setMediaFields((prev) => [
      ...prev,
      { fileType: 'image', file: null, url: null, id: null },
    ])
  }

  const removeMedia = (index: number) => {
    setMediaFields((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev))
  }

  const submit = () => {
    const uzName = nameFields.find((item) => item.lang === 'uz')?.body.trim() ?? ''
    const uzText = textFields.find((item) => item.lang === 'uz')?.body.trim() ?? ''
    const hasFile = mediaFields.some((item) => item.file || item.id)
    if (!eduTypeId || !uzName || !uzText || !hasFile) {
      notify.error(t('problemSituationsPage.fillRequired'))
      return
    }

    const fd = new FormData()
    fd.append('edu_type_id', eduTypeId)
    nameFields.forEach((field, index) => {
      if (!field.lang || !field.body.trim()) return
      fd.append(`name[${index}][lang]`, field.lang)
      fd.append(`name[${index}][body]`, field.body.trim())
    })
    textFields.forEach((field, index) => {
      const lang = nameFields[index]?.lang
      if (!lang || !field.body.trim()) return
      fd.append(`text[${index}][lang]`, lang)
      fd.append(`text[${index}][body]`, field.body.trim())
    })
    mediaFields.forEach((field, index) => {
      fd.append(`images[${index}][type]`, field.fileType)
      if (field.file) fd.append(`images[${index}][file]`, field.file)
      if (field.id) fd.append(`images[${index}][id]`, String(field.id))
    })

    const onOk = () => {
      notify.success(mode === 'create' ? t('common.created') : t('common.saved'))
      navigate(routes.problemSituations)
    }
    const onErr = (err: Error) =>
      notify.error(problemSituationErrorMessage(err, t('common.loadError')))

    if (mode === 'create') createMutation.mutate(fd, { onSuccess: onOk, onError: onErr })
    else updateMutation.mutate(fd, { onSuccess: onOk, onError: onErr })
  }

  const title =
    mode === 'create'
      ? t('problemSituationsPage.createTitle')
      : t('problemSituationsPage.editTitle')
  const waiting = mode === 'edit' && isLoading
  const saving = createMutation.isPending || updateMutation.isPending
  const langOptions = [
    { value: 'uz', label: t('problemSituationsPage.langUz') },
    { value: 'ru', label: t('problemSituationsPage.langRu') },
    { value: 'en', label: t('problemSituationsPage.langEn') },
  ]

  return (
    <>
      <Header
        title={title}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={goBack}
          >
            {t('common.back')}
          </Button>
        }
      />
      <main className="flex-1 p-3 sm:p-4">
        {waiting ? (
          <Panel padding="md">
            <SkeletonLines lines={8} />
          </Panel>
        ) : mode === 'edit' && (isError || !data) ? (
          <ErrorMessage />
        ) : (
          <Panel padding="md" className="mx-auto max-w-4xl space-y-4">
            <h1 className="font-display text-center text-base font-semibold tracking-tight text-deep sm:text-lg">
              {title}
            </h1>

            <Select
              required
              className="w-full"
              label={t('problemSituationsPage.eduType')}
              value={eduTypeId}
              onChange={(e) => setEduTypeId(e.target.value)}
              options={EDU_TYPES.map((item) => ({
                value: String(item.id),
                label: item.shortName,
              }))}
            />

            <div className="overflow-hidden rounded-xl border border-mist/70">
              {nameFields.map((field, index) => {
                const open = openIndexes.includes(index)
                return (
                  <div
                    key={`lang-${index}`}
                    className={index > 0 ? 'border-t border-mist/70' : undefined}
                  >
                    <Button
                      variant="ghost"
                      className="h-auto w-full justify-between rounded-none bg-fog/40 px-3.5 py-2.5 text-left text-[13px] font-semibold tracking-wide text-deep hover:bg-fog"
                      onClick={() => toggleLang(index)}
                      aria-expanded={open}
                    >
                      {t('problemSituationsPage.langPanel', {
                        lang: field.lang.toUpperCase(),
                      })}
                      <ChevronDown
                        className={`size-4 text-muted transition ${open ? 'rotate-180' : ''}`}
                        aria-hidden
                      />
                    </Button>
                    {open ? (
                      <div className="space-y-3 p-3.5">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Select
                            required
                            className="w-full"
                            label={t('problemSituationsPage.describeLang')}
                            value={field.lang}
                            options={langOptions}
                            onChange={(e) =>
                              updateName(index, { lang: e.target.value as LangCode })
                            }
                          />
                          <Input
                            required
                            label={t('problemSituationsPage.situationName')}
                            value={field.body}
                            onChange={(e) => updateName(index, { body: e.target.value })}
                          />
                        </div>
                        <Textarea
                          required
                          label={t('problemSituationsPage.situationText')}
                          value={textFields[index]?.body ?? ''}
                          onChange={(e) => updateText(index, e.target.value)}
                          rows={4}
                        />
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>

            <div className="space-y-3">
              {mediaFields.map((field, index) => {
                const fileInputId = `problem-situation-file-${index}`
                return (
                  <div key={`media-${index}`} className="grid gap-3 sm:grid-cols-2">
                    <Select
                      required
                      className="w-full"
                      label={t('problemSituationsPage.fileType')}
                      value={field.fileType}
                      options={[
                        { value: 'image', label: t('problemSituationsPage.image') },
                        { value: 'video', label: t('problemSituationsPage.video') },
                      ]}
                      onChange={(e) =>
                        updateMedia(index, {
                          fileType: e.target.value === 'video' ? 'video' : 'image',
                          file: null,
                          url: null,
                        })
                      }
                    />
                    <div className="flex w-full items-end gap-2">
                      <Field
                        required
                        className="min-w-0 flex-1"
                        htmlFor={fileInputId}
                        label={t('problemSituationsPage.fileUpload')}
                      >
                        <input
                          id={fileInputId}
                          ref={(el) => {
                            fileRefs.current[index] = el
                          }}
                          type="file"
                          className="sr-only"
                          accept={field.fileType === 'video' ? 'video/*' : 'image/*'}
                          onChange={(e) => {
                            const file = e.target.files?.[0] ?? null
                            updateMedia(index, { file, url: null })
                          }}
                        />
                        <button
                          type="button"
                          className="flex h-9 w-full min-w-0 items-center gap-2 px-3 text-left text-[13px] font-medium text-deep outline-none"
                          onClick={() => fileRefs.current[index]?.click()}
                        >
                          <Upload
                            className="size-3.5 shrink-0 text-muted"
                            aria-hidden
                          />
                          <span
                            className={
                              field.file?.name
                                ? 'truncate'
                                : 'truncate font-normal text-muted'
                            }
                          >
                            {field.file?.name ||
                              t('problemSituationsPage.uploadClick')}
                          </span>
                        </button>
                      </Field>
                      {mediaFields.length > 1 ? (
                        <Button
                          variant="danger"
                          size="icon-sm"
                          className="shrink-0"
                          aria-label={t('common.delete')}
                          onClick={() => removeMedia(index)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      ) : null}
                    </div>
                    {field.url ? (
                      <div className="sm:col-span-2">
                        <Button
                          variant="soft"
                          size="sm"
                          onClick={() =>
                            window.open(
                              situationFileHref(field.url!),
                              '_blank',
                              'noopener',
                            )
                          }
                        >
                          <FileText className="size-3.5" aria-hidden />
                          {t('problemSituationsPage.currentFile')}
                        </Button>
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>

            <div className="space-y-2 border-t border-mist/70 pt-3">
              <p className="font-display text-sm font-semibold text-deep">
                {t('problemSituationsPage.optionalTitle')}
              </p>
              <Notification tone="warning">
                {t('problemSituationsPage.optionalHint')}
              </Notification>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <Button variant="outline" onClick={addMedia}>
                {t('problemSituationsPage.addFileField')}
              </Button>
              <Button variant="primary" loading={saving} onClick={submit}>
                <Save className="size-4" aria-hidden />
                {t('problemSituationsPage.save')}
              </Button>
            </div>
          </Panel>
        )}
      </main>
    </>
  )
}

export function ProblemSituationCreatePage() {
  return <ProblemSituationFormPage mode="create" />
}

export function ProblemSituationEditPage() {
  return <ProblemSituationFormPage mode="edit" />
}
