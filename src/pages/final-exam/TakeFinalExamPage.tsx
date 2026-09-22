import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  CheckCircle2,
  Circle,
  CircleDot,
  Clock,
  LogOut,
} from 'lucide-react'
import { PATH_PREFIX_FILE, routes } from '@/config'
import { submitFinalExamAnswers } from '@/api'
import { useAuth } from '@/features/auth'
import { resolveFileUrl } from '@/features/lessons'
import { notify, onBrokenImg } from '@/components/ui'
import noImage from '@/assets/images/no-image.webp'
import { fullNameOf } from '@/lib/format'
import { cn } from '@/lib/cn'
import type { ExamAnswer, ExamContentBlock, FinalExamQuestionItem } from '@/types'
import logoImg from '@/assets/images/exam-logo.png'
import styles from '../exam-templates/take.module.css'
import {
  clearFinalExamTake,
  readFinalExamTake,
} from './StartFinalExamLangModal'

const TEXT_MIN = 7
const TEXT_MAX = 35
const DURATION = { minutes: 25, seconds: 0 }
const REQUIRED = 20

type StoredAnswer = { question_id: number; answer_id: number }

function asBodyList(body: unknown): ExamContentBlock[] {
  if (!body) return []
  if (Array.isArray(body)) return body as ExamContentBlock[]
  if (typeof body === 'object') return Object.values(body as object) as ExamContentBlock[]
  return []
}

function asAnswers(raw: unknown): ExamAnswer[] {
  if (Array.isArray(raw)) return raw as ExamAnswer[]
  if (raw && typeof raw === 'object') return Object.values(raw) as ExamAnswer[]
  return []
}

function fileUrl(path: string | null | undefined) {
  if (!path) return ''
  return resolveFileUrl(String(path), PATH_PREFIX_FILE)
}

function renderBlocks(
  blocks: ExamContentBlock[] | null | undefined,
  textColor: string,
  fontSize: number,
): ReactNode {
  if (!blocks?.length) return null
  return blocks.map((b, i) => {
    const type = Number(b.type)
    if (type === 1) {
      return (
        <span key={i} style={{ fontSize, color: textColor }}>
          {b.value}
        </span>
      )
    }
    if (type === 2 && b.value) {
      return (
        <img
          key={i}
          src={fileUrl(b.webp || b.value)}
          alt=""
          style={{ maxHeight: 80, marginLeft: 8 }}
          onError={(e) => onBrokenImg(e, noImage)}
        />
      )
    }
    return null
  })
}

function requestFs() {
  const el = document.documentElement
  if (el.requestFullscreen) void el.requestFullscreen().catch(() => {})
}

export function TakeFinalExamPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { me, user } = useAuth()

  const boot = useMemo(() => {
    const fromNav = location.state as {
      tests?: FinalExamQuestionItem[]
      lang_id?: number
      face?: string
    } | null
    if (fromNav?.tests?.length) return fromNav
    return readFinalExamTake()
  }, [location.state])

  const [items] = useState<FinalExamQuestionItem[]>(() => boot?.tests ?? [])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [temporaryStore, setTemporaryStore] = useState<StoredAnswer[]>([])
  const [answer, setAnswer] = useState<number | null>(null)
  const [pendingAnswerId, setPendingAnswerId] = useState<number | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [keyboardArmed, setKeyboardArmed] = useState(false)
  const [textSize, setTextSize] = useState(16)
  const [exitModal, setExitModal] = useState(false)
  const [finished, setFinished] = useState(false)
  const [resultMsg, setResultMsg] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(
    DURATION.minutes * 60 + DURATION.seconds,
  )
  const timerDoneRef = useRef(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const storeRef = useRef(temporaryStore)
  storeRef.current = temporaryStore

  const studentName =
    fullNameOf(me?.profession ?? {}) || user?.username || '—'

  const current = items[currentIndex] ?? null
  const question = current?.question
  const questionId = Number(question?.id)
  const body = asBodyList(question?.body)
  const answers = asAnswers(question?.answers)
  const questionText = body
    .filter((b) => Number(b.type) === 1)
    .map((b) => b.value)
    .join(' ')
  const imagePath =
    body.find((b) => Number(b.type) === 2)?.webp ||
    body.find((b) => Number(b.type) === 2)?.value ||
    null

  const confirmedId = temporaryStore.find(
    (e) => Number(e.question_id) === questionId,
  )?.answer_id
  const selectedId = confirmedId ?? pendingAnswerId ?? undefined

  const goBack = useCallback(() => {
    clearFinalExamTake()
    navigate(routes.finalExam, { replace: true })
  }, [navigate])

  useEffect(() => {
    if (!items.length) {
      navigate(routes.finalExam, { replace: true })
      return
    }
    requestFs()
  }, [items.length, navigate])

  useEffect(() => {
    if (finished || error) return
    const id = window.setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0))
    }, 1000)
    return () => window.clearInterval(id)
  }, [finished, error])

  const submitAll = useCallback(async () => {
    if (submitting) return
    const store = storeRef.current
    if (store.length < Math.min(REQUIRED, items.length)) {
      const msg = t('finalExam.mustAnswerAll')
      setError(msg)
      notify.warning(msg)
      setExitModal(false)
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await submitFinalExamAnswers(store)
      setFinished(true)
      setExitModal(false)
      setResultMsg(t('finalExam.submitOk'))
      notify.success(t('finalExam.submitOk'))
      clearFinalExamTake()
    } catch (e) {
      const msg = e instanceof Error ? e.message : t('finalExam.submitFail')
      setError(msg)
      notify.error(msg)
    } finally {
      setSubmitting(false)
    }
  }, [items.length, submitting, t])

  useEffect(() => {
    if (secondsLeft === 0 && !finished && !timerDoneRef.current) {
      timerDoneRef.current = true
      void submitAll()
    }
  }, [secondsLeft, finished, submitAll])

  const selectVariant = (ans: ExamAnswer, index: number) => {
    if (confirmed || !Number.isFinite(questionId)) return
    setAnswer(index + 1)
    setPendingAnswerId(Number(ans.id))
  }

  const confirmAnswer = () => {
    if (answer == null || pendingAnswerId == null || confirmed) return
    if (!Number.isFinite(questionId)) return
    const answerId = Number(pendingAnswerId)
    setTemporaryStore((prev) => {
      const exists = prev.some((e) => Number(e.question_id) === questionId)
      if (exists) {
        return prev.map((e) =>
          Number(e.question_id) === questionId
            ? { ...e, answer_id: answerId }
            : e,
        )
      }
      return [...prev, { question_id: questionId, answer_id: answerId }]
    })
    setConfirmed(true)
    setKeyboardArmed(false)
  }

  const goToQuestion = (index: number) => {
    if (index < 0 || index >= items.length) return
    setAnswer(null)
    setPendingAnswerId(null)
    setKeyboardArmed(false)
    setCurrentIndex(index)
    const next = items[index]
    const qid = Number(next?.question?.id)
    const stored = temporaryStore.some((e) => Number(e.question_id) === qid)
    setConfirmed(stored)
    if (stored) {
      const id = temporaryStore.find((e) => Number(e.question_id) === qid)
        ?.answer_id
      if (id != null) setPendingAnswerId(Number(id))
    }
    const el = scrollRef.current?.children[index] as HTMLElement | undefined
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (finished) {
        if (e.key === 'r' || e.key === 'R') goBack()
        return
      }
      if (e.key === 'ArrowLeft') goToQuestion(currentIndex - 1)
      if (e.key === 'ArrowRight') goToQuestion(currentIndex + 1)
      if (e.key === 'Escape') setExitModal(true)
      if (e.key === 'Enter') {
        if (exitModal) void submitAll()
        else if (answer != null && !confirmed) confirmAnswer()
      }
      const fKeys = ['F1', 'F2', 'F3', 'F4', 'F5'] as const
      const fi = fKeys.indexOf(e.key as (typeof fKeys)[number])
      if (fi >= 0) {
        e.preventDefault()
        if (confirmed) return
        if (keyboardArmed) {
          confirmAnswer()
          setKeyboardArmed(false)
          goToQuestion(currentIndex + 1)
          return
        }
        if (answers[fi]) {
          selectVariant(answers[fi], fi)
          setKeyboardArmed(true)
        }
      }
      if (e.key === '+' || e.code === 'NumpadAdd') {
        setTextSize((s) => Math.min(TEXT_MAX, s + 1))
      }
      if (e.key === '-' || e.code === 'NumpadSubtract') {
        setTextSize((s) => Math.max(TEXT_MIN, s - 1))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const mins = Math.floor(secondsLeft / 60)
  const secs = secondsLeft % 60

  if (!items.length) return null

  if (finished) {
    return (
      <div className={styles.page}>
        <div
          style={{
            minHeight: '80svh',
            display: 'grid',
            placeItems: 'center',
            textAlign: 'center',
            gap: 12,
          }}
        >
          <CheckCircle2 size={48} color="#52c41a" />
          <h2 style={{ color: '#fff', margin: 0 }}>{t('finalExam.resultDone')}</h2>
          <p style={{ color: '#ccc' }}>{resultMsg}</p>
          <button type="button" className={styles.primaryBtn} onClick={goBack}>
            {t('finalExam.back')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={cn(styles.desktopOnly, styles.header)}>
        <div className={styles.logo}>
          <img src={logoImg} alt="logo" />
        </div>
        <div className={styles.titleBlock}>
          <span>{t('finalExam.title')}</span>
          <span className={styles.timer}>
            <Clock size={22} />
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </span>
        </div>
        <div className={styles.headerRight}>
          <p style={{ margin: 0, fontSize: textSize }}>
            TOPSHIRUVCHI:{' '}
            <span style={{ color: 'yellow' }}>{studentName}</span>
          </p>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => setExitModal(true)}
          >
            <span className={styles.kbd}>ESC</span>
            <LogOut size={28} color="red" />
          </button>
        </div>
      </div>

      {error ? (
        <p style={{ color: '#f44e3f', textAlign: 'center', margin: '8px 0' }}>
          {error}
        </p>
      ) : null}

      <div className={cn(styles.desktopOnly, styles.body)}>
        <div className={styles.scrollArea}>
          <div className={styles.questionBanner} style={{ fontSize: textSize }}>
            {currentIndex + 1}. {questionText}
          </div>

          <div className={styles.mainRow}>
            <div>
              <div className={styles.confirmRow}>
                <button
                  type="button"
                  className={cn(
                    styles.confirmBtn,
                    answer != null && styles.confirmBtnActive,
                  )}
                  style={{ fontSize: textSize }}
                  onClick={confirmAnswer}
                >
                  Javobni tasdiqlash
                  {answer != null ? (
                    <span className={styles.confirmBadge}>F{answer}</span>
                  ) : null}
                </button>
              </div>

              <div style={{ marginTop: 16 }}>
                {answers.map((element, index) => {
                  const selected = Number(selectedId) === Number(element.id)
                  return (
                    <div key={element.id ?? index} className={styles.answerRow}>
                      <div className={styles.fKey} style={{ fontSize: textSize }}>
                        F{index + 1}
                      </div>
                      <button
                        type="button"
                        className={styles.answerCard}
                        style={
                          selected
                            ? { background: 'yellow', color: '#0f0f0f' }
                            : undefined
                        }
                        onClick={() => {
                          if (confirmed) return
                          selectVariant(element, index)
                        }}
                      >
                        <div className={styles.answerBody}>
                          {selected ? (
                            <CircleDot size={22} />
                          ) : (
                            <Circle size={22} />
                          )}
                          {renderBlocks(element.body, '#0f0f0f', textSize)}
                        </div>
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>

            <div>
              <div className={styles.imageBox}>
                {imagePath ? (
                  <img
                    src={fileUrl(imagePath)}
                    alt=""
                    onError={(e) => onBrokenImg(e, noImage)}
                  />
                ) : (
                  <div className={styles.imageLoading}>—</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <div ref={scrollRef} className={styles.qNav}>
            {items.map((it, index) => {
              const active = currentIndex === index
              const qid = Number(it.question?.id)
              const answered = temporaryStore.some(
                (e) => Number(e.question_id) === qid,
              )
              return (
                <button
                  key={qid || index}
                  type="button"
                  className={cn(
                    styles.qBtn,
                    answered && styles.qBtnAnswered,
                    active && styles.qBtnCurrent,
                  )}
                  style={{ fontSize: textSize }}
                  onClick={() => goToQuestion(index)}
                >
                  {index + 1}
                </button>
              )
            })}
          </div>
          <div className={styles.navLinks}>
            <span
              className={cn(
                styles.navLink,
                currentIndex <= 0 && styles.navLinkDisabled,
              )}
              onClick={() => goToQuestion(currentIndex - 1)}
            >
              ← oldingi
            </span>
            <span
              className={cn(
                styles.navLink,
                currentIndex >= items.length - 1 && styles.navLinkDisabled,
              )}
              onClick={() => goToQuestion(currentIndex + 1)}
            >
              keyingi →
            </span>
            <button
              type="button"
              className={styles.primaryBtn}
              disabled={submitting}
              onClick={() => setExitModal(true)}
            >
              {t('finalExam.finish')}
            </button>
          </div>
        </div>
      </div>

      {exitModal ? (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalCard}>
            <p style={{ marginTop: 0 }}>{t('finalExam.finishConfirm')}</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={() => setExitModal(false)}
              >
                J
              </button>
              <button
                type="button"
                className={styles.dangerBtn}
                disabled={submitting}
                onClick={() => void submitAll()}
              >
                {submitting ? '…' : 'Enter'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
