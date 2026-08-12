import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Calendar,
  Camera,
  CheckCircle2,
  Clock,
  HelpCircle,
  RefreshCw,
  XCircle,
} from 'lucide-react'
import { Header } from '@/components/layout'
import {
  Button,
  ErrorMessage,
  Notification,
  Panel,
  Skeleton,
  SkeletonCard,
  notify,
} from '@/components/ui'
import { startFinalExam, parseFinalExamHistory } from '@/api'
import { useAuth } from '@/features/auth'
import { useFinalExamIndexQuery } from '@/features/final-exam'
import { fullNameOf } from '@/lib/format'
import { cn } from '@/lib/cn'
import {
  StartFinalExamLangModal,
  useFinalExamNavigate,
} from './StartFinalExamLangModal'

function PageSkeleton() {
  return (
    <div className="grid gap-3 lg:grid-cols-5">
      <SkeletonCard className="space-y-3 p-4 lg:col-span-2">
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-20 w-full" />
      </SkeletonCard>
      <SkeletonCard className="space-y-3 p-4 lg:col-span-3">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-10 w-full" />
      </SkeletonCard>
    </div>
  )
}

export function FinalExamPage() {
  const { t } = useTranslation()
  const { me, user } = useAuth()
  const goTake = useFinalExamNavigate()

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [cameraReady, setCameraReady] = useState(false)

  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [langOpen, setLangOpen] = useState(false)
  const [startLoading, setStartLoading] = useState(false)
  const [startError, setStartError] = useState<string | null>(null)
  const [refreshCam, setRefreshCam] = useState(0)

  const { data: indexRes, isLoading, isError } = useFinalExamIndexQuery()
  const data = indexRes?.data
  const attempt = data?.organization_final_exam_student_result?.attempt
  const hasAttempt = Boolean(attempt)
  const historyItems = parseFinalExamHistory(attempt?.history)

  const qCount = Number(attempt?.questions_count) || 0
  const correct = Number(attempt?.correct_answers_count) || 0
  const incorrect = Number(attempt?.incorrect_answers_count) || 0
  const score = qCount > 0 ? (correct / qCount) * 100 : 0
  const passed = data?.organization_final_exam_student_result?.result === 1

  const userName =
    fullNameOf(me?.profession ?? {}) || user?.username || undefined

  const showCameraPanel = !isLoading && !isError && !capturedImage

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((tr) => tr.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setCameraReady(false)
  }, [])

  const bindVideo = useCallback((el: HTMLVideoElement | null) => {
    videoRef.current = el
    if (!el) return
    if (streamRef.current && el.srcObject !== streamRef.current) {
      el.srcObject = streamRef.current
      void el.play().catch(() => {})
      setCameraReady(true)
    }
  }, [])

  useEffect(() => {
    if (!showCameraPanel) return
    let cancelled = false
    ;(async () => {
      try {
        setCameraError(null)
        setCameraReady(false)
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((tr) => tr.stop())
          return
        }
        streamRef.current = stream
        const video = videoRef.current
        if (video) {
          video.srcObject = stream
          await video.play().catch(() => {})
          if (!cancelled) setCameraReady(true)
        }
      } catch {
        if (!cancelled) {
          const msg = t('finalExam.cameraError')
          setCameraError(msg)
          notify.error(msg)
        }
      }
    })()
    return () => {
      cancelled = true
      stopCamera()
    }
  }, [showCameraPanel, refreshCam, stopCamera, t])

  const handleCapture = useCallback(() => {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video || !streamRef.current) {
      notify.warning(t('finalExam.cameraWait'))
      return
    }
    if (!video.videoWidth || !video.videoHeight) {
      notify.warning(t('finalExam.cameraWait'))
      return
    }
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL('image/jpeg')
    const base64 = dataUrl.replace(/^data:image\/jpeg;base64,/, '')
    setCapturedImage(base64)
    stopCamera()
    notify.success(t('finalExam.captureOk'))
  }, [stopCamera, t])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !capturedImage && !langOpen && cameraReady) {
        e.preventDefault()
        handleCapture()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [capturedImage, langOpen, cameraReady, handleCapture])

  const onPickLang = useCallback(
    async (langId: number) => {
      if (!capturedImage) return
      setStartLoading(true)
      setStartError(null)
      try {
        const res = await startFinalExam({
          face: capturedImage,
          lang_id: langId,
        })
        const face = res.face_result
        if (face?.status_checking === 1) {
          if (face.answer_checking === 1) {
            const tests = Array.isArray(res.history) ? res.history : []
            if (tests.length === 0) {
              const msg = t('finalExam.noQuestions')
              setStartError(msg)
              notify.error(msg)
              return
            }
            setLangOpen(false)
            goTake({ lang_id: langId, face: capturedImage, tests })
            return
          }
          const pct = face.result_checking?.best_match?.probability_percent
          const msg = `${face.answer_message || t('finalExam.faceMismatch')}${
            pct != null ? ` (${parseInt(String(pct), 10)}%)` : ''
          }`
          setStartError(msg)
          notify.error(msg)
          return
        }
        if (face?.status_checking === 0) {
          const msg = face.message || t('finalExam.faceFailed')
          setStartError(msg)
          notify.error(msg)
          return
        }
        // Ba’zi backendlar face_result siz history qaytaradi
        const tests = Array.isArray(res.history) ? res.history : []
        if (tests.length > 0) {
          setLangOpen(false)
          goTake({ lang_id: langId, face: capturedImage, tests })
          return
        }
        const failMsg = t('finalExam.startFailed')
        setStartError(failMsg)
        notify.error(failMsg)
      } catch (e) {
        const msg =
          e instanceof Error ? e.message : t('finalExam.startFailed')
        setStartError(msg)
        notify.error(msg)
      } finally {
        setStartLoading(false)
      }
    },
    [capturedImage, goTake, t],
  )

  return (
    <>
      <Header title={t('finalExam.title')} />

      <main className="flex-1 space-y-3 p-3 sm:p-4">
        <Notification tone="warning">{t('finalExam.hint')}</Notification>

        {isLoading ? (
          <PageSkeleton />
        ) : isError ? (
          <ErrorMessage />
        ) : (
          <div className="grid gap-3 lg:grid-cols-5">
            {hasAttempt ? (
              <Panel padding="none" className="overflow-hidden lg:col-span-2">
                <div className="bg-linear-to-r from-signal to-signal-hot px-4 py-6 text-center text-white">
                  <p className="m-0 text-sm font-medium opacity-90">
                    {data?.exam?.name || t('finalExam.title')}
                  </p>
                  <p className="m-0 mt-1 text-3xl font-bold">
                    {score.toFixed(1)}%
                  </p>
                  <p className="m-0 mt-1 text-[12px] opacity-90">
                    {correct} / {qCount} {t('finalExam.correctAnswers')}
                  </p>
                </div>

                <div className="space-y-2 p-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-lg border border-teal/30 bg-teal-soft/40 px-2 py-2">
                      <p className="m-0 flex items-center justify-between text-[11px] text-teal">
                        {t('finalExam.correct')}
                        <CheckCircle2 className="size-3.5" />
                      </p>
                      <p className="m-0 text-lg font-bold text-deep">{correct}</p>
                    </div>
                    <div className="rounded-lg border border-rose/30 bg-rose-soft/40 px-2 py-2">
                      <p className="m-0 flex items-center justify-between text-[11px] text-rose">
                        {t('finalExam.incorrect')}
                        <XCircle className="size-3.5" />
                      </p>
                      <p className="m-0 text-lg font-bold text-deep">
                        {incorrect}
                      </p>
                    </div>
                    <div className="rounded-lg border border-indigo/30 bg-indigo-soft/40 px-2 py-2">
                      <p className="m-0 flex items-center justify-between text-[11px] text-indigo">
                        {t('finalExam.totalQ')}
                        <HelpCircle className="size-3.5" />
                      </p>
                      <p className="m-0 text-lg font-bold text-deep">{qCount}</p>
                    </div>
                  </div>

                  <div className="rounded-lg bg-fog/70 px-3 py-2 text-[12px]">
                    <p className="m-0 mb-1 flex items-center gap-1.5 font-semibold text-deep">
                      <Clock className="size-3.5 text-signal" />
                      {t('finalExam.timeInfo')}
                    </p>
                    <div className="grid gap-1 sm:grid-cols-2">
                      <p className="m-0 text-muted">
                        {t('finalExam.examStart')}:{' '}
                        <span className="text-deep">
                          {data?.exam?.start_time || '—'}
                        </span>
                      </p>
                      <p className="m-0 text-muted">
                        {t('finalExam.examEnd')}:{' '}
                        <span className="text-deep">
                          {data?.exam?.end_time || '—'}
                        </span>
                      </p>
                      <p className="m-0 text-muted">
                        {t('finalExam.yourStart')}:{' '}
                        <span className="text-deep">
                          {attempt?.start_time || '—'}
                        </span>
                      </p>
                      <p className="m-0 text-muted">
                        {t('finalExam.yourEnd')}:{' '}
                        <span className="text-deep">
                          {attempt?.end_time || '—'}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg bg-fog/70 px-3 py-2 text-[12px]">
                    <p className="m-0 text-muted">
                      {t('finalExam.status')}:{' '}
                      <span
                        className={cn(
                          'font-semibold',
                          data?.exam?.status === 1 ? 'text-rose' : 'text-teal',
                        )}
                      >
                        {data?.exam?.status === 1
                          ? t('finalExam.inactive')
                          : t('finalExam.active')}
                      </span>
                    </p>
                    <p className="m-0 text-muted">
                      {t('finalExam.passStatus')}:{' '}
                      <span
                        className={cn(
                          'font-semibold',
                          passed ? 'text-teal' : 'text-rose',
                        )}
                      >
                        {passed ? t('finalExam.passed') : t('finalExam.failed')}
                      </span>
                    </p>
                  </div>

                  {historyItems.length > 0 ? (
                    <div className="rounded-lg bg-fog/70 px-3 py-2">
                      <p className="m-0 mb-1.5 text-[12px] font-semibold text-deep">
                        {t('finalExam.byQuestion')}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {historyItems.map((item, i) => (
                          <span
                            key={i}
                            className={cn(
                              'rounded px-2 py-0.5 text-[11px] font-semibold',
                              item.result === 1
                                ? 'bg-teal-soft text-teal'
                                : 'bg-rose-soft text-rose',
                            )}
                          >
                            {i + 1}. {item.result === 1 ? '✓' : '✗'}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </Panel>
            ) : null}

            <Panel
              padding="md"
              className={cn(hasAttempt ? 'lg:col-span-3' : 'lg:col-span-5')}
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="inline-flex size-8 items-center justify-center rounded-lg bg-signal-soft text-signal">
                  <Camera className="size-4" aria-hidden />
                </span>
                <div>
                  <h3 className="m-0 font-display text-sm font-semibold text-deep">
                    {t('finalExam.facePanel')}
                  </h3>
                  <p className="m-0 text-[12px] text-muted">
                    {t('finalExam.attention')}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-start">
                <div className="mx-auto flex w-full max-w-75 shrink-0 flex-col items-center gap-3">
                  <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-mist bg-deep">
                    {capturedImage ? (
                      <img
                        src={`data:image/jpeg;base64,${capturedImage}`}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <>
                        <video
                          ref={bindVideo}
                          autoPlay
                          playsInline
                          muted
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                        <img
                          src="/images/face-id.png"
                          alt=""
                          className="pointer-events-none absolute top-1/2 left-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 object-contain"
                          aria-hidden
                        />
                        {!cameraReady && !cameraError ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-deep/40">
                            <span className="size-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          </div>
                        ) : null}
                      </>
                    )}
                    {capturedImage ? (
                      <div className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-lg bg-teal-soft px-2 py-0.5 text-[10px] font-semibold text-teal">
                        <CheckCircle2 className="size-3" aria-hidden />
                        OK
                      </div>
                    ) : null}
                  </div>

                  <canvas ref={canvasRef} className="hidden" />

                  {cameraError ? (
                    <p className="m-0 text-center text-[12px] text-rose">
                      {cameraError}
                    </p>
                  ) : null}

                  {capturedImage ? (
                    <div className="flex w-full gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setCapturedImage(null)
                          setRefreshCam((n) => n + 1)
                        }}
                      >
                        <RefreshCw className="size-3.5" aria-hidden />
                        {t('finalExam.retake')}
                      </Button>
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setStartError(null)
                          setLangOpen(true)
                        }}
                      >
                        {t('finalExam.startExam')}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      className="w-full"
                      disabled={Boolean(cameraError) || !cameraReady}
                      onClick={handleCapture}
                    >
                      <Camera className="size-3.5" aria-hidden />
                      {t('finalExam.capture')}
                      <kbd className="ml-1 rounded bg-deep/20 px-1.5 py-0.5 text-[10px] font-bold tracking-wide">
                        Enter
                      </kbd>
                    </Button>
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-2">
                  <ol className="m-0 list-none space-y-2 p-0">
                    {(
                      [
                        'finalExam.rule1',
                        'finalExam.rule2',
                        'finalExam.rule3',
                        'finalExam.rule4',
                        'finalExam.rule5',
                      ] as const
                    ).map((key, i) => (
                      <li
                        key={key}
                        className="flex gap-2.5 rounded-lg border border-mist bg-fog/50 px-3 py-2"
                      >
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-signal-soft text-[11px] font-bold text-signal">
                          {i + 1}
                        </span>
                        <p className="m-0 text-[13px] leading-snug text-deep">
                          {t(key)}
                        </p>
                      </li>
                    ))}
                  </ol>

                  {data?.exam?.start_time ? (
                    <p className="m-0 inline-flex items-center gap-1.5 pt-1 text-[12px] text-muted">
                      <Calendar className="size-3.5" aria-hidden />
                      {data.exam.start_time} — {data.exam.end_time || '—'}
                    </p>
                  ) : null}
                </div>
              </div>
            </Panel>
          </div>
        )}
      </main>

      <StartFinalExamLangModal
        open={langOpen}
        userName={userName}
        loading={startLoading}
        error={startError}
        onClose={() => {
          if (!startLoading) setLangOpen(false)
        }}
        onPickLang={(id) => void onPickLang(id)}
      />
    </>
  )
}
