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
}

export function CaptchaField({
  value,
  onChange,
  captchaKey,
  onCaptchaKeyChange,
  error,
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

  return (
    <div className="flex flex-col gap-1.5 sm:gap-2">
      <div className="flex items-center gap-2 text-[12px] font-medium text-ink/80 sm:text-[13px]">
        <ShieldCheck className="size-3.5 text-signal sm:size-4" aria-hidden />
        {t('login.captcha')}
      </div>

      <div className="flex items-stretch gap-2">
        <div
          className={cn(
            'login-captcha relative flex min-h-[44px] flex-1 items-center justify-center overflow-hidden rounded-2xl border border-mist/60 bg-white shadow-inner sm:min-h-[56px]',
          )}
        >
          {imageBase64 ? (
            <img
              src={`data:image/png;base64,${imageBase64}`}
              alt="Captcha"
              className="h-11 w-full object-contain object-center sm:h-14"
            />
          ) : (
            <span className="text-xs text-muted">
              {loading ? t('common.loading') : '—'}
            </span>
          )}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.12),transparent)] bg-size-[200%_100%] animate-shimmer" />
        </div>

        <Button
          type="button"
          variant="secondary"
          size="icon"
          aria-label={t('login.captchaRefresh')}
          onClick={() => void loadCaptcha(true)}
          disabled={loading}
          className="shrink-0 self-center"
        >
          <RefreshCw
            className={cn('size-4 text-deep', spinning && 'animate-spin')}
          />
        </Button>
      </div>

      <Input
        id={fieldId}
        name="captcha"
        label={t('login.captchaCode')}
        placeholder={t('login.captchaPlaceholder')}
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        error={error}
        maxLength={32}
      />

      <input type="hidden" name="captcha_key" value={captchaKey} readOnly />
    </div>
  )
}
