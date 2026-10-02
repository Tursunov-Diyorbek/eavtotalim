import { useEffect, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RefreshCw, ShieldCheck } from 'lucide-react'
import { fetchCaptcha } from '@/api'
import { Button, Input } from '@/components/ui'
import { cn } from '@/lib/cn'

type CaptchaFieldProps = {
  value: string
  onChange: (value: string) => void
  captchaKey: string
  onCaptchaKeyChange: (key: string) => void
  error?: string
  /** 0 dan katta qiymat o‘zgarsa captcha qayta yuklanadi */
  refreshNonce?: number
}

export function CaptchaField({
  value,
  onChange,
  captchaKey,
  onCaptchaKeyChange,
  error,
  refreshNonce = 0,
}: CaptchaFieldProps) {
  const { t } = useTranslation()
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [spinning, setSpinning] = useState(false)
  const fieldId = useId()

  const onChangeRef = useRef(onChange)
  const onCaptchaKeyChangeRef = useRef(onCaptchaKeyChange)
  onChangeRef.current = onChange
  onCaptchaKeyChangeRef.current = onCaptchaKeyChange

  const loadingRef = useRef(false)

  async function loadCaptcha(force = false) {
    if (loadingRef.current && !force) return
    loadingRef.current = true
    setLoading(true)
    setSpinning(true)
    try {
      const data = await fetchCaptcha({ force })
      onCaptchaKeyChangeRef.current(data.key)
      setImageBase64(data.image)
      onChangeRef.current('')
    } catch (err) {
      console.error('Captcha fetch error:', err)
      onCaptchaKeyChangeRef.current('')
      setImageBase64(null)
    } finally {
      loadingRef.current = false
      setLoading(false)
      window.setTimeout(() => setSpinning(false), 400)
    }
  }

  // Faqat bir marta mount — callback o‘zgarishi qayta so‘rov bermaydi
  useEffect(() => {
    void loadCaptcha(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!refreshNonce) return
    void loadCaptcha(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshNonce])

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={fieldId}
        className="flex items-center gap-1.5 text-[13px] font-semibold text-ink/80 sm:text-sm"
      >
        <ShieldCheck className="size-4 text-signal" aria-hidden />
        {t('login.captcha')}
      </label>

      <div className="flex items-stretch gap-2">
        <div className="login-captcha relative flex h-12 w-[44%] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-mist/90 bg-white sm:w-[46%]">
          {imageBase64 ? (
            <img
              src={`data:image/png;base64,${imageBase64}`}
              alt="Captcha"
              className="h-full w-full object-contain object-center"
            />
          ) : (
            <span className="text-xs text-muted">
              {loading ? t('common.loading') : '—'}
            </span>
          )}
        </div>

        <Button
          type="button"
          variant="secondary"
          size="icon-xl"
          aria-label={t('login.captchaRefresh')}
          onClick={() => void loadCaptcha(true)}
          disabled={loading}
        >
          <RefreshCw
            className={cn('size-[18px] text-deep', spinning && 'animate-spin')}
          />
        </Button>

        <div className="min-w-0 flex-1">
          <Input
            size="lg"
            id={fieldId}
            name="captcha"
            label=""
            aria-label={t('login.captchaCode')}
            placeholder={t('login.captchaCode')}
            autoComplete="off"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            maxLength={32}
          />
        </div>
      </div>
      {error ? <span className="text-xs text-red-500/90">{error}</span> : null}

      <input type="hidden" name="captcha_key" value={captchaKey} readOnly />
    </div>
  )
}
