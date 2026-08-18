import { useState, type ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { FileText, ImagePlus } from 'lucide-react'
import {
  Button,
  ErrorMessage,
  Input,
  Panel,
  PhoneInput,
  SkeletonLines,
} from '@/components/ui'
import { PATH_PREFIX_FILE } from '@/config'
import {
  useBankNameByMfoQuery,
  useOrganizationInfoQuery,
  useUpdateOrganizationInfoMutation,
} from '@/features/director-profile'
import { resolveFileUrl } from '@/features/lessons'
import { isFilled, isPhoneComplete, toPhoneValue } from '@/lib'
import type { OrganizationInfo } from '@/types'

type OrgForm = {
  name: string
  inn: string
  hr: string
  mfo: string
  phone: string
}

const EMPTY: OrgForm = {
  name: '',
  inn: '',
  hr: '',
  mfo: '',
  phone: '',
}

function blank(value: unknown): string {
  if (!isFilled(value)) return ''
  return String(value)
}

function toForm(data: OrganizationInfo): OrgForm {
  return {
    name: blank(data.name ?? data.name_uz),
    inn: blank(data.inn),
    hr: blank(data.hr),
    mfo: blank(data.mfo),
    phone: toPhoneValue(blank(data.phone)),
  }
}

function fileHref(path: string | null | undefined): string | null {
  if (!isFilled(path) || typeof path !== 'string') return null
  if (path.startsWith('blob:')) return path
  return resolveFileUrl(path, PATH_PREFIX_FILE) || null
}

export function OrganizationRekvizitPanel() {
  const { t } = useTranslation()
  const { data, isLoading, isError, error, refetch } = useOrganizationInfoQuery()
  const saveMutation = useUpdateOrganizationInfoMutation()
  const [form, setForm] = useState<OrgForm>(EMPTY)
  const [loaded, setLoaded] = useState<OrganizationInfo | undefined>()
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [licenseFile, setLicenseFile] = useState<File | null>(null)

  if (data && data !== loaded) {
    setLoaded(data)
    setForm(toForm(data))
    setLogoFile(null)
    setLogoPreview(null)
    setLicenseFile(null)
  }

  const { data: bankName } = useBankNameByMfoQuery(form.mfo)
  const remoteLogo = fileHref(data?.logo_image)
  const remoteLicense = fileHref(
    typeof data?.license_file === 'string' ? data.license_file : null,
  )
  const logoSrc = logoPreview || remoteLogo
  const licenseUrl = licenseFile ? null : remoteLicense

  function setField<K extends keyof OrgForm>(key: K, value: OrgForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function onLogo(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setLogoFile(file)
    setLogoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
  }

  function onLicense(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setLicenseFile(file)
  }

  function onSave() {
    const formData = new FormData()
    formData.append('name_uz', form.name.trim())
    formData.append('inn', form.inn.trim())
    formData.append('hr', form.hr.trim())
    formData.append('mfo', form.mfo.trim())
    formData.append('phone', form.phone.trim())
    if (logoFile) formData.append('logo_image', logoFile)
    if (licenseFile) formData.append('license_file', licenseFile)
    saveMutation.mutate(formData)
  }

  return (
    <Panel>
      <div className="flex flex-col gap-3 p-3 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-display text-sm font-semibold text-deep">
            {t('directorProfile.orgTitle')}
          </p>
          <Button size="sm" loading={saveMutation.isPending} onClick={onSave}>
            {t('common.save')}
          </Button>
        </div>

        {isError ? (
          <div className="flex flex-wrap items-center gap-2">
            <ErrorMessage>
              {error instanceof Error ? error.message : t('common.loadError')}
            </ErrorMessage>
            <Button variant="ghost" size="sm" onClick={() => void refetch()}>
              {t('common.refresh')}
            </Button>
          </div>
        ) : null}

        {isLoading && !data ? (
          <SkeletonLines lines={6} />
        ) : (
          <div className="grid gap-3 lg:grid-cols-[160px_minmax(0,1fr)]">
            <div className="flex flex-col gap-1.5">
              <span className="text-[12px] font-semibold tracking-wide text-ink/65 sm:text-[13px]">
                {t('directorProfile.orgLogo')}
              </span>
              <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-mist/90 bg-fog/40 px-2 py-3 text-center transition hover:border-signal/40 hover:bg-signal-soft/30">
                {logoSrc ? (
                  <img
                    src={logoSrc}
                    alt=""
                    className="max-h-16 w-full object-contain"
                  />
                ) : (
                  <ImagePlus className="size-7 text-muted" aria-hidden />
                )}
                <span className="text-[11px] font-semibold text-signal">
                  {t('directorProfile.changeLogo')}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={onLogo}
                />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Input
                label={t('directorProfile.orgName')}
                name="org_name"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
              />
              <Input
                label={t('directorProfile.orgInn')}
                name="org_inn"
                value={form.inn}
                onChange={(e) => setField('inn', e.target.value)}
              />
              <Input
                label={t('directorProfile.orgHr')}
                name="org_hr"
                value={form.hr}
                onChange={(e) => setField('hr', e.target.value)}
              />
              <Input
                label={t('directorProfile.orgMfo')}
                name="org_mfo"
                value={form.mfo}
                hint={bankName || undefined}
                onChange={(e) => setField('mfo', e.target.value)}
              />
              <PhoneInput
                label={t('directorProfile.phone')}
                name="org_phone"
                value={form.phone}
                error={
                  form.phone && !isPhoneComplete(form.phone)
                    ? t('directorProfile.phoneInvalid')
                    : undefined
                }
                onChange={(e) => setField('phone', e.target.value)}
              />
              <div className="flex flex-col gap-1.5">
                <span className="text-[12px] font-semibold tracking-wide text-ink/65 sm:text-[13px]">
                  {t('directorProfile.licenseFile')}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" size="sm" className="relative">
                    {t('directorProfile.chooseFile')}
                    <input
                      type="file"
                      accept="application/pdf"
                      className="absolute inset-0 cursor-pointer opacity-0"
                      onChange={onLicense}
                    />
                  </Button>
                  {licenseFile ? (
                    <span className="text-[12px] text-deep">
                      {licenseFile.name}
                    </span>
                  ) : licenseUrl ? (
                    <a
                      href={licenseUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[12px] font-semibold text-signal"
                    >
                      <FileText className="size-3.5" aria-hidden />
                      {t('directorProfile.viewFile')}
                    </a>
                  ) : (
                    <span className="text-[12px] font-semibold text-rose">
                      {t('directorProfile.fileMissing')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Panel>
  )
}
