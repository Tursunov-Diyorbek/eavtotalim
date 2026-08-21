import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  CheckCircle2,
  Circle,
  CircleDot,
  Clock,
  Download,
  LogOut,
  XCircle,
} from 'lucide-react'
import { PATH_PREFIX_FILE, routes } from '@/config'
import { checkRandomTest, startRandomTest } from '@/api'
import { useAuth } from '@/features/auth'
import { fullNameOf } from '@/lib/format'
import { cn } from '@/lib/cn'
import type {
  ExamAnswer,
  ExamContentBlock,
  ExamQuestion,
  ExamResultAttempt,
  ExamTemplateCheckResult,
  RandomTestStartParams,
} from '@/types'
import { onBrokenImg } from '@/components/ui'
import { randomLimitToCount } from '@/types/random-tests'
import logoImg from '@/assets/images/exam-logo.png'
import noImage from '@/assets/images/no-image.webp'
import styles from '../exam-templates/take.module.css'

const TEXT_MIN = 7
const TEXT_MAX = 35
const DURATION = { minutes: 25, seconds: 0 }

type StoredAnswer = { question_id: number; answer_id: number }

function getQuestionBody(q: ExamQuestion | null | undefined) {
  return asBodyList(q?.body ?? q?.question?.body ?? null)
}

function getQuestionImageBody(q: ExamQuestion | null | undefined) {
  const body = getQuestionBody(q)
  const img = body?.[1]
  if (img && Number(img.type) === 2) return img
  return body.find((b) => Number(b.type) === 2) ?? null
}

function getDisplayImagePath(
  imageBody: ExamContentBlock | null | undefined,
  preferOriginal = false,
) {
  if (!imageBody) return null
  if (preferOriginal) return imageBody.value || null
  return imageBody.webp || imageBody.value || null
}

function fileUrl(path: string | null | undefined) {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path
  const base = PATH_PREFIX_FILE.endsWith('/')
    ? PATH_PREFIX_FILE
    : `${PATH_PREFIX_FILE}/`
  return `${base}${path.replace(/^\//, '')}`
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function isCorrectAnswer(a: ExamAnswer) {
  return a.check === 1 || a.is_correct === 1 || a.is_correct === true
}

function asBodyList(
  body: ExamContentBlock[] | Record<string, ExamContentBlock> | null | undefined,
): ExamContentBlock[] {
  if (!body) return []
  if (Array.isArray(body)) return body
  return Object.values(body)
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
          style={{ maxHeight: 80, maxWidth: '100%', objectFit: 'contain' }}
          onError={(e) => onBrokenImg(e, noImage)}
        />
      )
    }
    return null
  })
}

function requestFs() {
  const el = document.documentElement
  const req =
    el.requestFullscreen ||
    (el as HTMLElement & { webkitRequestFullscreen?: () => void })
      .webkitRequestFullscreen
  try {
    void req?.call(el)
  } catch {
    /* ignore */
  }
}

export function TakeRandomTestPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { me, user } = useAuth()

  const state = useMemo(() => {
    const fromNav = (location.state || {}) as Partial<RandomTestStartParams>
    if (fromNav.lang_id && fromNav.limit) return fromNav
    try {
      const raw = sessionStorage.getItem('random_test_take')
      if (raw) return JSON.parse(raw) as Partial<RandomTestStartParams>
    } catch {
      /* ignore */
    }
    return fromNav
  }, [location.state])

  const langId = Number(state.lang_id)
  const limitCode = (state.limit === 2 || state.limit === 3 ? state.limit : 1) as
    | 1
    | 2
    | 3
  const questionCount = randomLimitToCount(limitCode)
  const random = Boolean(state.random)
  const liveReveal = true

  const [questions, setQuestions] = useState<ExamQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [temporaryStore, setTemporaryStore] = useState<StoredAnswer[]>([])
  const [loading, setLoading] = useState(true)
  const [bootError, setBootError] = useState<string | null>(null)
  const [testName, setTestName] = useState('')
  const [textSize, setTextSize] = useState(16)
  const [answer, setAnswer] = useState<number | null>(null)
  const [pendingAnswerId, setPendingAnswerId] = useState<number | null>(null)
  const [correctAnswer, setCorrectAnswer] = useState(false)
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState<number | null>(
    null,
  )
  const [keyboardArmed, setKeyboardArmed] = useState(false)
  const [classification, setClassification] = useState(false)
  const [imgFullScreen, setImgFullScreen] = useState(false)
  const [imageLink, setImageLink] = useState('')
  const [showOriginalImage, setShowOriginalImage] = useState(false)
  const [imageLoading, setImageLoading] = useState(false)
  const [exitModal, setExitModal] = useState(false)
  const [finished, setFinished] = useState(false)
  const [results, setResults] = useState<ExamTemplateCheckResult | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(
    DURATION.minutes * 60 + DURATION.seconds,
  )
  const [resultIndex, setResultIndex] = useState(0)
  const timerDoneRef = useRef(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const imageLoadGen = useRef(0)
  const storeRef = useRef(temporaryStore)
  storeRef.current = temporaryStore

  const current = questions[currentIndex] ?? null
  const studentName =
    fullNameOf(me?.profession ?? {}) || user?.username || '—'

  const goBack = useCallback(() => {
    navigate(routes.randomTests, { replace: true })
  }, [navigate])

  const submitCheck = useCallback(async () => {
    if (submitting) return
    setSubmitting(true)
    try {
      const selected = storeRef.current.reduce<Record<number, number[]>>(
        (acc, cur) => {
          acc[cur.question_id] = [cur.answer_id]
          return acc
        },
        {},
      )
      const res = await checkRandomTest({
        selected_answers: selected,
      })
      setResults(res)
      setFinished(true)
      setExitModal(false)
    } catch (e) {
      setBootError(e instanceof Error ? e.message : 'Xatolik')
    } finally {
      setSubmitting(false)
    }
  }, [submitting])

  // Boot
  useEffect(() => {
    if (!langId) {
      navigate(routes.randomTests, { replace: true })
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        setBootError(null)
        const data = await startRandomTest(langId, questionCount)
        if (cancelled) return
        const qs = data.questions ?? []
        if (qs.length === 0) {
          setBootError('Savollar topilmadi')
          return
        }
        setQuestions(qs)
        setTestName(data.exam_center_test_template?.name || 'Aralash test')
        setCurrentIndex(0)
        requestFs()
        const img = getQuestionImageBody(qs[0])
        const path = getDisplayImagePath(img, false)
        if (path) setImageLink(path)
      } catch (e) {
        if (!cancelled) {
          setBootError(e instanceof Error ? e.message : 'Yuklash xatosi')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [langId, questionCount, navigate])

  // Timer
  useEffect(() => {
    if (loading || finished || bootError) return
    const id = window.setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0))
    }, 1000)
    return () => window.clearInterval(id)
  }, [loading, finished, bootError])

  useEffect(() => {
    if (
      secondsLeft === 0 &&
      !finished &&
      !loading &&
      !bootError &&
      !timerDoneRef.current
    ) {
      timerDoneRef.current = true
      void submitCheck()
    }
  }, [secondsLeft, finished, loading, bootError, submitCheck])

  const mins = Math.floor(secondsLeft / 60)
  const secs = secondsLeft % 60

  // Image preload
  useEffect(() => {
    if (loading || finished) return
    const imageBody = getQuestionImageBody(current)
    const path = getDisplayImagePath(imageBody, showOriginalImage)
    if (!path) {
      imageLoadGen.current += 1
      setImageLoading(false)
      setImageLink('')
      return
    }
    const gen = ++imageLoadGen.current
    setImageLoading(true)
    const img = new Image()
    const done = () => {
      if (imageLoadGen.current !== gen) return
      setImageLoading(false)
      setImageLink(path)
    }
    img.onload = done
    img.onerror = done
    img.src = fileUrl(path)
    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [current?.id, showOriginalImage, loading, finished])

  const answersToRender = useMemo(() => {
    const list = Array.isArray(current?.answers) ? current.answers : []
    if (random && current?.static_order_answers !== 1) {
      return shuffle(list)
    }
    return list
  }, [current?.id, random]) // eslint-disable-line react-hooks/exhaustive-deps

  const confirmedIdForCurrent = temporaryStore.find(
    (e) => e.question_id === current?.id,
  )?.answer_id

  /** Ko‘rsatish: tasdiqlangan yoki hozirgi (hali tasdiqlanmagan) tanlov */
  const selectedIdForCurrent = confirmedIdForCurrent ?? pendingAnswerId ?? undefined

  const selectVariant = (element: ExamAnswer, index: number) => {
    if (!current || correctAnswer) return
    // Faqat vaqtinchalik tanlov — temporaryStore ga yozilmaydi
    setAnswer(index + 1)
    setPendingAnswerId(element.id)
    setCorrectAnswerIndex(isCorrectAnswer(element) ? 1 : 0)
  }

  const confirmAnswer = () => {
    if (answer == null || pendingAnswerId == null || !current || correctAnswer) {
      return
    }
    const answerId = pendingAnswerId
    const ok = correctAnswerIndex === 1

    setTemporaryStore((prev) => {
      const exists = prev.some((e) => e.question_id === current.id)
      if (exists) {
        return prev.map((e) =>
          e.question_id === current.id ? { ...e, answer_id: answerId } : e,
        )
      }
      return [...prev, { question_id: current.id, answer_id: answerId }]
    })
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === currentIndex ? { ...q, status: ok ? 2 : 3 } : q,
      ),
    )
    setCorrectAnswer(true)
    setAnswer(null)
    setPendingAnswerId(null)
    setKeyboardArmed(false)
  }

  const handleAnswerClick = (element: ExamAnswer, index: number) => {
    if (correctAnswer) return
    selectVariant(element, index)
  }

  const selectAnswerByKey = (index: number) => {
    if (loading || correctAnswer) return
    const answers = answersToRender
    if (!answers?.[index]) return
    if (keyboardArmed) {
      confirmAnswer()
      setKeyboardArmed(false)
      return
    }
    handleAnswerClick(answers[index], index)
    setKeyboardArmed(true)
  }

  const goToQuestion = (index: number) => {
    if (index < 0 || index >= questions.length) return
    // Tasdiqlanmagan tanlov bekor — avtomatik tasdiqlanmaydi
    setAnswer(null)
    setPendingAnswerId(null)
    setKeyboardArmed(false)
    setCorrectAnswerIndex(null)

    const next = questions[index]
    const alreadyAnswered =
      next != null &&
      temporaryStore.some((e) => e.question_id === next.id)

    setCurrentIndex(index)
    setCorrectAnswer(alreadyAnswered)
    setShowOriginalImage(false)
    setClassification(false)
    const el = scrollRef.current?.children[index] as HTMLElement | undefined
    el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }

  const prevBtn = () => goToQuestion(currentIndex - 1)
  const nextBtn = () => goToQuestion(currentIndex + 1)

  const textPlus = () => setTextSize((s) => Math.min(TEXT_MAX, s + 1))
  const textMinus = () => setTextSize((s) => Math.max(TEXT_MIN, s - 1))

  const onEsc = () => setExitModal(true)

  const onEnterConfirmExit = () => {
    if (!exitModal) return
    if (temporaryStore.length > 0) {
      void submitCheck()
    } else {
      goBack()
    }
  }

  // Keyboard
  useEffect(() => {
    if (bootError) return

    const onKey = (e: KeyboardEvent) => {
      if (finished) {
        if (e.key === 'ArrowLeft') {
          setResultIndex((i) => Math.max(0, i - 1))
        }
        if (e.key === 'ArrowRight') {
          const len = results?.last_attempt?.length ?? 0
          setResultIndex((i) => Math.min(Math.max(0, len - 1), i + 1))
        }
        if (e.key === 'r' || e.key === 'R') goBack()
        if (e.key === '+' || e.code === 'NumpadAdd') textPlus()
        if (e.key === '-' || e.code === 'NumpadSubtract') textMinus()
        return
      }

      if (e.key === 'ArrowLeft') prevBtn()
      if (e.key === 'ArrowRight') nextBtn()
      if (e.key === 'F1') {
        e.preventDefault()
        selectAnswerByKey(0)
      }
      if (e.key === 'F2') {
        e.preventDefault()
        selectAnswerByKey(1)
      }
      if (e.key === 'F3') {
        e.preventDefault()
        selectAnswerByKey(2)
      }
      if (e.key === 'F4') {
        e.preventDefault()
        selectAnswerByKey(3)
      }
      if (e.key === 'F5') {
        e.preventDefault()
        selectAnswerByKey(4)
      }
      if (e.key === 'f' || e.key === 'F') {
        const imageBody = getQuestionImageBody(current)
        const path = getDisplayImagePath(imageBody, showOriginalImage)
        if (path) {
          setImageLink(path)
          setImgFullScreen((v) => !v)
        }
      }
      if (e.key === 't' || e.key === 'T') {
        if (correctAnswer && current?.answer_description) {
          setClassification((v) => !v)
        }
      }
      if (e.key === 'Enter') {
        if (exitModal) onEnterConfirmExit()
        else if (answer != null && !correctAnswer) confirmAnswer()
      }
      if (e.key === 'Escape') onEsc()
      if (e.key === 'r' || e.key === 'R') {
        if (exitModal) window.location.reload()
      }
      if (e.key === 'j' || e.key === 'J') {
        if (exitModal) setExitModal(false)
      }
      if (e.key === '+' || e.code === 'NumpadAdd') textPlus()
      if (e.key === '-' || e.code === 'NumpadSubtract') textMinus()
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // intentional: bind latest handlers each render cycle of deps
  })

  useEffect(() => {
    const block = (e: MouseEvent) => e.preventDefault()
    document.addEventListener('contextmenu', block)
    return () => document.removeEventListener('contextmenu', block)
  }, [])

  if (!langId) return null

  // Mobile gate (eski .test-media)
  const mobileGate = (
    <div className={styles.mobileOnly}>
      <div>
        <p>
          Ushbu testni mobile formatda bajarish uchun mobile versiyasini yuklab
          olishingiz mumkun!
        </p>
        <a
          href="https://play.google.com/store/apps/details?id=uz.intalim"
          target="_blank"
          rel="noreferrer"
          className={styles.primaryBtn}
          style={{ display: 'inline-flex', marginTop: 12 }}
        >
          Yuklab olish <Download className="size-4" />
        </a>
      </div>
    </div>
  )

  if (bootError && !finished) {
    return (
      <div className={styles.page}>
        <p style={{ color: '#fff' }}>{bootError}</p>
        <button type="button" className={styles.primaryBtn} onClick={goBack}>
          Orqaga
        </button>
      </div>
    )
  }

  const attempts = results?.last_attempt ?? []
  const attempt: ExamResultAttempt | undefined = attempts[resultIndex]

  if (finished && results) {
    const totalQ = attempts.filter(Boolean).length || questions.length
    const correctN =
      attempts.filter((q) => q?.result === 1).length ||
      results.correct_answers_count ||
      0
    const percent =
      totalQ > 0 ? ((Number(correctN) / totalQ) * 100).toFixed(2) : '0'

    return (
      <div className={styles.page}>
        {mobileGate}
        <div className={cn(styles.desktopOnly, styles.header)}>
          <div className={styles.logo}>
            <img src={logoImg} alt="logo" />
          </div>
          <div className={styles.titleBlock}>
            {testName} - SHABLON
          </div>
          <div className={styles.headerRight}>
            <p style={{ margin: 0, fontSize: textSize }}>
              TOPSHIRUVCHI:{' '}
              <span style={{ color: 'yellow' }}>{studentName}</span>
            </p>
            <button type="button" className={styles.primaryBtn} onClick={goBack}>
              <span className={styles.kbd}>R</span>
              Testlarga qaytish
            </button>
          </div>
        </div>

        <div className={styles.desktopOnly}>
          <div className={styles.resultStats} style={{ fontSize: textSize }}>
            <div>
              <span style={{ color: 'yellow', fontWeight: 700 }}>
                {studentName}
              </span>
            </div>
            <div className={styles.resultStat}>
              <p>Savollar soni</p>
              <span>{totalQ}</span>
            </div>
            <div className={styles.resultStat}>
              <p>To&apos;g&apos;ri javoblar soni</p>
              <span>{correctN}</span>
            </div>
            <div className={styles.resultStat}>
              <p>Natija</p>
              <span>{percent}%</span>
            </div>
          </div>

          {attempt ? (
            <div className={styles.mainRow} style={{ marginTop: 16 }}>
              <div>
                <div className={styles.questionBanner} style={{ fontSize: textSize }}>
                  {resultIndex + 1}- savol.{' '}
                  {asBodyList(attempt.newTestQuestion?.body)
                    .filter((b) => Number(b.type) === 1)
                    .map((b) => b.value)
                    .join(' ')}
                </div>
                <div style={{ marginTop: 16 }}>
                  {(attempt.answers ?? []).map((ans, idx) => {
                    const ok = ans.check === 1
                    const picked = Boolean(ans.student_answer)
                    const bg = ok
                      ? '#52c41a'
                      : picked
                        ? '#f44e3f'
                        : '#fff'
                    const color = ok || picked ? '#fff' : '#0f0f0f'
                    return (
                      <div key={ans.id ?? idx} className={styles.answerRow}>
                        <div className={styles.fKey} style={{ fontSize: textSize }}>
                          F{idx + 1}
                        </div>
                        <div
                          className={styles.answerCard}
                          style={{ background: bg, color, cursor: 'default' }}
                        >
                          <div className={styles.answerBody}>
                            {ok ? (
                              <CheckCircle2 size={22} color="#fff" />
                            ) : picked ? (
                              <XCircle size={22} color="#fff" />
                            ) : (
                              <Circle size={22} />
                            )}
                            {renderBlocks(asBodyList(ans.body), color, textSize)}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
              <div>
                {(() => {
                  const img = asBodyList(attempt.newTestQuestion?.body).find(
                    (b) => Number(b.type) === 2,
                  )
                  return (
                    <div className={styles.imageBox} style={{ cursor: 'default' }}>
                      <img
                        src={img ? fileUrl(String(img.webp || img.value)) : noImage}
                        alt=""
                        onError={(e) => onBrokenImg(e, noImage)}
                      />
                    </div>
                  )
                })()}
              </div>
            </div>
          ) : null}

          <div className={styles.footer}>
            <div className={styles.qNav}>
              {attempts.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={cn(
                    styles.qBtn,
                    i === resultIndex && styles.qBtnActive,
                    attempts[i]?.result === 1 &&
                      i !== resultIndex &&
                      styles.qBtnOk,
                    attempts[i]?.result !== 1 &&
                      attempts[i] &&
                      i !== resultIndex &&
                      styles.qBtnErr,
                  )}
                  onClick={() => setResultIndex(i)}
                  style={{ fontSize: textSize }}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <div className={styles.navLinks}>
              <span
                className={cn(
                  styles.navLink,
                  resultIndex <= 0 && styles.navLinkDisabled,
                )}
                style={{ fontSize: textSize }}
                onClick={() => setResultIndex((i) => Math.max(0, i - 1))}
              >
                ← oldingi
              </span>
              <span
                className={cn(
                  styles.navLink,
                  resultIndex >= attempts.length - 1 && styles.navLinkDisabled,
                )}
                style={{ fontSize: textSize }}
                onClick={() =>
                  setResultIndex((i) =>
                    Math.min(attempts.length - 1, i + 1),
                  )
                }
              >
                keyingi →
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const questionText =
    getQuestionBody(current).find((b) => Number(b.type) === 1)?.value ??
    getQuestionBody(current)[0]?.value ??
    ''
  const imageBody = getQuestionImageBody(current)
  const questionImagePath = getDisplayImagePath(imageBody, showOriginalImage)
  const hasWebp = Boolean(imageBody?.webp)
  const originalPath = imageBody?.value

  return (
    <div className={styles.page}>
      {mobileGate}

      {(loading || submitting) && (
        <div className={styles.overlay}>
          <div className={styles.spinner} />
        </div>
      )}

      <div className={cn(styles.desktopOnly, styles.header)}>
        <div className={styles.logo}>
          <img src={logoImg} alt="logo" />
        </div>

        <div className={styles.titleBlock}>
          <span>
            {testName} - SHABLON
          </span>
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

          <button type="button" className={styles.iconBtn} onClick={onEsc}>
            <span className={styles.kbd}>ESC</span>
            <LogOut size={28} color="red" />
          </button>
        </div>
      </div>

      <div className={styles.desktopOnly}>
        <div className={styles.scrollArea}>
          <div className={styles.questionBanner} style={{ fontSize: textSize }}>
            {currentIndex + 1}. {questionText}
          </div>

          <div className={styles.mainRow}>
            <div>
              <div className={styles.confirmRow}>
                <span
                  className={styles.textSizeBtn}
                  style={{ fontSize: textSize }}
                  onClick={textPlus}
                >
                  A+
                </span>
                <span
                  className={styles.textSizeBtn}
                  style={{ fontSize: textSize }}
                  onClick={textMinus}
                >
                  A-
                </span>
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
                {answersToRender.map((element, index) => {
                  const selected = selectedIdForCurrent === element.id
                  const revealed = correctAnswer && liveReveal
                  let bg = '#fff'
                  let color = '#0f0f0f'
                  if (revealed) {
                    if (isCorrectAnswer(element)) {
                      bg = '#52c41a'
                      color = '#fff'
                    } else if (selected) {
                      bg = '#f44e3f'
                      color = '#fff'
                    }
                  } else if (selected) {
                    bg = 'yellow'
                    color = '#0f0f0f'
                  }

                  return (
                    <div key={element.id} className={styles.answerRow}>
                      <div className={styles.fKey} style={{ fontSize: textSize }}>
                        F{index + 1}
                      </div>
                      <button
                        type="button"
                        className={styles.answerCard}
                        style={{ background: bg, color }}
                        onClick={() => handleAnswerClick(element, index)}
                      >
                        <div className={styles.answerBody}>
                          {revealed ? (
                            isCorrectAnswer(element) ? (
                              <CheckCircle2 size={22} color="#fff" />
                            ) : selected ? (
                              <XCircle size={22} color="#fff" />
                            ) : (
                              <Circle size={22} />
                            )
                          ) : selected ? (
                            <CircleDot size={22} />
                          ) : (
                            <Circle size={22} />
                          )}
                          {renderBlocks(element.body, color, textSize)}
                        </div>
                      </button>
                    </div>
                  )
                })}
              </div>

              {correctAnswer && liveReveal ? (
                <div className={styles.legend}>
                  <p className={styles.legendItem} style={{ fontSize: textSize }}>
                    <CheckCircle2 size={22} color="green" /> To&apos;g&apos;ri
                    javob
                  </p>
                  <p className={styles.legendItem} style={{ fontSize: textSize }}>
                    <XCircle size={22} color="red" /> Nato&apos;g&apos;ri javob
                  </p>
                  <p className={styles.legendItem} style={{ fontSize: textSize }}>
                    <span
                      style={{
                        width: 17,
                        height: 17,
                        borderRadius: '50%',
                        border: '2px solid #666',
                        display: 'inline-block',
                      }}
                    />{' '}
                    Belgilanmagan javob
                  </p>
                  {current?.answer_description ? (
                    <button
                      type="button"
                      className={styles.primaryBtn}
                      style={{ fontSize: textSize }}
                      onClick={() => setClassification(true)}
                    >
                      <span className={styles.kbd}>T</span>
                      To&apos;g&apos;ri javob tasnifi
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div>
              <div
                className={styles.imageBox}
                onClick={() => {
                  if (imageLoading || !questionImagePath) return
                  setImageLink(questionImagePath)
                  setImgFullScreen(true)
                }}
              >
                {imageLoading ? (
                  <div className={styles.imageLoading}>
                    <div className={styles.spinner} />
                    <span>Rasim yuklanmoqda...</span>
                  </div>
                ) : null}
                <img
                  src={
                    questionImagePath ? fileUrl(questionImagePath) : noImage
                  }
                  alt=""
                  style={{ opacity: imageLoading ? 0 : 1 }}
                  onError={(e) => onBrokenImg(e, noImage)}
                />
                {hasWebp && originalPath && !imageLoading ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowOriginalImage((v) => !v)
                    }}
                    style={{
                      position: 'absolute',
                      left: 8,
                      bottom: 8,
                      zIndex: 2,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '5px 10px',
                      border: 'none',
                      borderRadius: 6,
                      background: showOriginalImage
                        ? 'rgba(24, 144, 255, 0.92)'
                        : 'rgba(17, 23, 36, 0.88)',
                      color: '#fff',
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    <Download size={14} />
                    {showOriginalImage ? 'Siqilgan rasim' : 'Asil rasimni olish'}
                  </button>
                ) : null}
                {imageBody && !imageLoading ? (
                  <button
                    type="button"
                    className={styles.fBtn}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (questionImagePath) setImageLink(questionImagePath)
                      setImgFullScreen((v) => !v)
                    }}
                  >
                    F
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <div ref={scrollRef} className={styles.qNav}>
            {questions.map((q, index) => {
              const active = currentIndex === index
              const status = q.status
              const answered =
                temporaryStore.some(
                  (e) => Number(e.question_id) === Number(q.id),
                ) ||
                (active && pendingAnswerId != null) ||
                (status != null && status !== 1)

              // Mode 4: joriy sariq; tasdiqlangan — yashil/qizil
              // Mode 5: faqat javob tanlanganda sariq (joriy uchun faqat kontur)
              return (
                <button
                  key={q.id}
                  type="button"
                  className={cn(
                    styles.qBtn,
                    liveReveal && active && styles.qBtnActive,
                    liveReveal &&
                      !active &&
                      status != null &&
                      status !== 1 &&
                      (status === 2 ? styles.qBtnOk : styles.qBtnErr),
                    !liveReveal && answered && styles.qBtnAnswered,
                    !liveReveal && active && styles.qBtnCurrent,
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
              style={{ fontSize: textSize }}
              onClick={prevBtn}
            >
              ← oldingi
            </span>
            <span
              className={cn(
                styles.navLink,
                currentIndex >= questions.length - 1 && styles.navLinkDisabled,
              )}
              style={{ fontSize: textSize }}
              onClick={nextBtn}
            >
              keyingi →
            </span>
          </div>

          {user?.role !== 4 && temporaryStore.length > 0 ? (
            <button
              type="button"
              className={styles.dangerBtn}
              style={{ fontSize: textSize }}
              onClick={() => void submitCheck()}
            >
              Yakunlash
            </button>
          ) : null}
        </div>
      </div>

      {imgFullScreen ? (
        <div
          className={styles.modalBackdrop}
          onClick={() => setImgFullScreen(false)}
        >
          <div className={cn(styles.modalCard, styles.modalWide)}>
            <img
              src={imageLink ? fileUrl(imageLink) : noImage}
              alt=""
              style={{ width: '100%', objectFit: 'contain' }}
              onError={(e) => onBrokenImg(e, noImage)}
            />
          </div>
        </div>
      ) : null}

      {classification ? (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalCard}>
            <h3 style={{ marginTop: 0 }}>To&apos;g&apos;ri javob tasnifi</h3>
            <p style={{ whiteSpace: 'pre-line', fontSize: textSize }}>
              {current?.answer_description}
            </p>
            {current?.answer_video ? (
              <video
                src={fileUrl(current.answer_video)}
                controls
                autoPlay
                style={{ width: '100%' }}
              />
            ) : null}
            <button
              type="button"
              className={styles.primaryBtn}
              style={{ marginTop: 12 }}
              onClick={() => setClassification(false)}
            >
              Yopish
            </button>
          </div>
        </div>
      ) : null}

      {exitModal ? (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalCard}>
            <p
              style={{
                textAlign: 'center',
                fontSize: 18,
                fontWeight: 700,
                margin: '8px 0 16px',
              }}
            >
              Testni yakunlaysizmi?
            </p>
            <div className={styles.enterRow}>
              <div className={styles.enterKey}>Enter</div>
              <button
                type="button"
                className={styles.dangerBtn}
                style={{ width: '100%', borderRadius: '0 6px 6px 0' }}
                onClick={onEnterConfirmExit}
              >
                Ha
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
