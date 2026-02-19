"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import type { UIMessage } from "ai"
import { guideCategories, type GuideItem, getAllItems } from "@/lib/guide-data"
import { db } from "@/lib/firebase"
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
  Timestamp,
} from "firebase/firestore"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import {
  Send,
  Sparkles,
  Rocket,
  Layout,
  Palette,
  FileText,
  Star,
  CheckCircle,
  ArrowRight,
  Copy,
  Check,
  BookOpen,
  MessageCircle,
  Plus,
  Trash2,
  Clock,
} from "lucide-react"

// ─── Code block with copy button ───
function CodeBlockWithCopy({
  text,
  children,
}: {
  text: string
  children: React.ReactNode
}) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <div className="relative mb-3 rounded-lg bg-background/60 border border-border/40 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/30 bg-background/40">
        <span className="text-[0.625rem] text-muted-foreground font-medium">
          v0에 입력할 프롬프트
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[0.625rem] text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          {copied ? (
            <><Check className="h-3 w-3" />복사됨</>
          ) : (
            <><Copy className="h-3 w-3" />복사</>
          )}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto">{children}</pre>
    </div>
  )
}

function extractTextFromChildren(children: React.ReactNode): string {
  if (typeof children === "string") return children
  if (typeof children === "number") return String(children)
  if (!children) return ""
  if (Array.isArray(children)) return children.map(extractTextFromChildren).join("")
  if (typeof children === "object" && "props" in children) {
    return extractTextFromChildren(children.props.children)
  }
  return ""
}

// ─── Learning Path types ───
interface LearningStep {
  step: number
  guideId: string
  title: string
  description: string
  duration: string
  difficulty?: "beginner" | "intermediate" | "advanced"
  category?: string
  keyTopics?: string[]
  why?: string
}
interface LearningPathData {
  title: string
  description?: string
  totalDuration?: string
  steps: LearningStep[]
}

// Parse [[learning-path:...]] from text
function parseLearningPaths(text: string): LearningPathData[] {
  const paths: LearningPathData[] = []
  // Find all [[learning-path: markers and extract JSON by brace matching
  const marker = "[[learning-path:"
  let searchFrom = 0
  while (true) {
    const startIdx = text.indexOf(marker, searchFrom)
    if (startIdx === -1) break
    const jsonStart = startIdx + marker.length
    // Find the JSON object start
    const braceStart = text.indexOf("{", jsonStart)
    if (braceStart === -1) break
    // Brace-match to find the end of the JSON object
    let depth = 0
    let jsonEnd = -1
    for (let i = braceStart; i < text.length; i++) {
      if (text[i] === "{") depth++
      else if (text[i] === "}") {
        depth--
        if (depth === 0) { jsonEnd = i + 1; break }
      }
    }
    if (jsonEnd === -1) break
    const jsonStr = text.slice(braceStart, jsonEnd)
    try {
      const data = JSON.parse(jsonStr)
      if (data.title && Array.isArray(data.steps)) {
        paths.push(data as LearningPathData)
      }
    } catch {
      // skip invalid JSON
    }
    searchFrom = jsonEnd
  }
  return paths
}

function stripLearningPathMarkers(text: string): string {
  return text.replace(/\[\[learning-path:\s*[\s\S]*?\]\]/g, "").trim()
}

const difficultyConfig = {
  beginner: { label: "입문", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" },
  intermediate: { label: "중급", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400" },
  advanced: { label: "고급", color: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400" },
}

// ─── Learning Path UI ───
function LearningPathCard({
  data,
  onSelectItem,
}: {
  data: LearningPathData
  onSelectItem: (item: GuideItem) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [activeStep, setActiveStep] = useState<number | null>(null)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const allItems = getAllItems()

  const progress = data.steps.length > 0 ? (completedSteps.size / data.steps.length) * 100 : 0

  const toggleComplete = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setCompletedSteps((prev) => {
      const next = new Set(prev)
      if (next.has(idx)) {
        next.delete(idx)
      } else {
        next.add(idx)
        // Close this step and open next uncompleted step
        const nextIdx = data.steps.findIndex((_, i) => i > idx && !next.has(i))
        setActiveStep(nextIdx !== -1 ? nextIdx : null)
      }
      return next
    })
  }

  const handleToggleExpand = () => {
    const next = !expanded
    setExpanded(next)
    if (next) setActiveStep(0) // open first step on expand
  }

  return (
    <div className="my-3 rounded-xl border border-border bg-background overflow-hidden shadow-sm">
      {/* Header */}
      <button
        onClick={handleToggleExpand}
        className="flex w-full items-center justify-between px-4 py-3 hover:bg-accent/30 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background">
            <Rocket className="h-4 w-4" />
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-foreground">{data.title}</div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[0.6875rem] text-muted-foreground">
                {data.steps.length}{"단계"}
              </span>
              {data.totalDuration && (
                <>
                  <span className="text-[0.5rem] text-muted-foreground">{"/"}</span>
                  <span className="text-[0.6875rem] text-muted-foreground">{data.totalDuration}</span>
                </>
              )}
              {completedSteps.size > 0 && (
                <>
                  <span className="text-[0.5rem] text-muted-foreground">{"/"}</span>
                  <span className="text-[0.6875rem] font-medium text-foreground">
                    {completedSteps.size}/{data.steps.length} {"완료"}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {!expanded && (
            <span className="text-[0.625rem] text-muted-foreground/60 hidden sm:inline">{"클릭하여 펼치기"}</span>
          )}
          <ArrowRight
            className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
              expanded ? "rotate-90" : ""
            }`}
          />
        </div>
      </button>

      {/* Progress bar */}
      {completedSteps.size > 0 && (
        <div className="px-4 pb-1">
          <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-foreground transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Description */}
      {expanded && data.description && (
        <div className="px-4 pt-2 pb-1">
          <p className="text-xs text-muted-foreground leading-relaxed">{data.description}</p>
        </div>
      )}

      {/* Steps */}
      {expanded && (
        <div className="border-t border-border px-4 py-3">
          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-[0.625rem] text-muted-foreground/60">{"제목 클릭: 세부내용 보기 | 숫자 클릭: 완료 처리"}</span>
          </div>
          <div className="relative">
            {data.steps.map((step, idx) => {
              const guideItem = allItems.find((i) => i.id === step.guideId)
              const isActive = activeStep === idx
              const isLast = idx === data.steps.length - 1
              const isCompleted = completedSteps.has(idx)
              const diff = step.difficulty ? difficultyConfig[step.difficulty] : null

              return (
                <div key={step.step} className="relative flex gap-3">
                  {/* Timeline line */}
                  {!isLast && (
                    <div className={`absolute left-[13px] top-[28px] bottom-0 w-px ${isCompleted ? "bg-foreground" : "bg-border"}`} />
                  )}

                  {/* Step circle / check */}
                  <div className="relative z-10 flex-shrink-0">
                    <button
                      onClick={(e) => toggleComplete(idx, e)}
                      className={`flex h-[1.625rem] w-[1.625rem] items-center justify-center rounded-full text-[0.6875rem] font-bold transition-all ${
                        isCompleted
                          ? "bg-foreground text-background"
                          : isActive
                            ? "bg-foreground text-background ring-2 ring-foreground/20"
                            : "bg-muted text-muted-foreground hover:bg-accent"
                      }`}
                      title={isCompleted ? "완료 취소" : "완료 표시"}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-3.5 w-3.5" />
                      ) : (
                        step.step
                      )}
                    </button>
                  </div>

                  {/* Content */}
                  <div className={`flex-1 pb-4 ${isLast ? "pb-0" : ""}`}>
                    <button
                      onClick={() => setActiveStep(isActive ? null : idx)}
                      className="w-full text-left"
                    >
                      <div className="flex items-center flex-wrap gap-1.5">
                        <span className={`text-[0.8125rem] font-semibold ${isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}>
                          {step.title}
                        </span>
                        {diff && (
                          <span className={`text-[0.5625rem] font-medium rounded-full px-1.5 py-0.5 ${diff.color}`}>
                            {diff.label}
                          </span>
                        )}
                        {step.category && (
                          <span className="text-[0.5625rem] text-muted-foreground bg-muted rounded-full px-1.5 py-0.5">
                            {step.category}
                          </span>
                        )}
                        <span className="text-[0.625rem] text-muted-foreground">
                          {step.duration}
                        </span>
                      </div>
                    </button>

                    {isActive && (
                      <div className="mt-2 space-y-2.5 animate-in slide-in-from-top-1 duration-200">
                        {/* Why this step */}
                        {step.why && (
                          <div className="flex gap-2 rounded-lg bg-accent/50 px-3 py-2">
                            <Star className="h-3 w-3 shrink-0 mt-0.5 text-amber-500" />
                            <p className="text-xs text-foreground leading-relaxed">{step.why}</p>
                          </div>
                        )}

                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {step.description}
                        </p>

                        {/* Key topics */}
                        {step.keyTopics && step.keyTopics.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {step.keyTopics.map((topic, tIdx) => (
                              <span
                                key={tIdx}
                                className="text-[0.5625rem] rounded-md border border-border bg-muted/50 px-1.5 py-0.5 text-muted-foreground"
                              >
                                {topic}
                              </span>
                            ))}
                          </div>
                        )}

                        {guideItem && (
                          <button
                            onClick={() => onSelectItem(guideItem)}
                            className="flex items-center gap-1.5 rounded-lg border border-border bg-accent/50 px-2.5 py-1.5 text-[0.6875rem] font-medium text-foreground hover:bg-accent transition-colors"
                          >
                            <BookOpen className="h-3 w-3" />
                            {"가이드 보기: "}{guideItem.title}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function GuideLinksFromText({
  text,
  onSelectItem,
}: {
  text: string
  onSelectItem: (item: GuideItem) => void
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const allItems = getAllItems()
  const regex = /\[\[guide:([a-z0-9-]+)\]\]/g
  const matches: string[] = []
  let match
  while ((match = regex.exec(text)) !== null) {
    if (!matches.includes(match[1])) matches.push(match[1])
  }
  if (matches.length === 0) return null
  const items = matches
    .map((id) => allItems.find((item) => item.id === id))
    .filter(Boolean) as GuideItem[]
  if (items.length === 0) return null

  const handleCopy = (item: GuideItem) => {
    if (item.promptExample) {
      navigator.clipboard.writeText(item.promptExample)
      setCopiedId(item.id)
      setTimeout(() => setCopiedId(null), 1500)
    }
  }

  return (
    <div className="mt-2 space-y-1.5">
      {items.map((item) => (
        <div key={item.id} className="rounded-lg border border-border bg-background overflow-hidden">
          <button
            onClick={() => onSelectItem(item)}
            className="flex w-full items-center gap-1.5 px-3 py-2 text-left hover:bg-accent/50 transition-colors"
          >
            <BookOpen className="h-3 w-3 shrink-0 text-muted-foreground" />
            <span className="text-[0.6875rem] font-medium text-foreground truncate">{item.title}</span>
          </button>
          {item.promptExample && (
            <div className="flex items-start gap-1.5 border-t border-border px-3 py-2 bg-muted/30">
              <p className="flex-1 text-[0.625rem] text-muted-foreground leading-relaxed whitespace-pre-wrap break-words">
                {item.promptExample}
              </p>
              <button
                onClick={() => handleCopy(item)}
                className="shrink-0 flex items-center gap-1 rounded px-2 py-1 text-[0.5625rem] text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                title="프롬프트 복사"
              >
                {copiedId === item.id ? (
                  <>
                    <CheckCircle className="h-3 w-3" />
                    <span>{"복사됨"}</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>{"복사"}</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function stripGuideMarkers(text: string): string {
  // Remove [[guide:...]]
  let result = text.replace(/\[\[guide:[a-z0-9-]+\]\]/g, "")
  // Remove [[learning-path: {...} ]] by brace matching
  const marker = "[[learning-path:"
  while (true) {
    const idx = result.indexOf(marker)
    if (idx === -1) break
    const braceStart = result.indexOf("{", idx)
    if (braceStart === -1) { result = result.slice(0, idx); break }
    let depth = 0
    let braceEnd = -1
    for (let i = braceStart; i < result.length; i++) {
      if (result[i] === "{") depth++
      else if (result[i] === "}") { depth--; if (depth === 0) { braceEnd = i + 1; break } }
    }
    if (braceEnd === -1) { result = result.slice(0, idx); break }
    // Find ]] after the JSON
    const closerIdx = result.indexOf("]]", braceEnd)
    const endIdx = closerIdx !== -1 ? closerIdx + 2 : braceEnd
    result = result.slice(0, idx) + result.slice(endIdx)
  }
  return result.trim()
}

// ─── Chat list item type ───
interface ChatSummary {
  id: string
  firstMessage: string
  title?: string
  messageCount: number
  updatedAt: number
}

const categoryIcons: Record<string, React.ReactNode> = {
  rocket: <Rocket className="h-5 w-5" />,
  book: <BookOpen className="h-5 w-5" />,
  layout: <Layout className="h-5 w-5" />,
  palette: <Palette className="h-5 w-5" />,
  file: <FileText className="h-5 w-5" />,
  star: <Star className="h-5 w-5" />,
  check: <CheckCircle className="h-5 w-5" />,
}

const suggestedQuestions = [
  "랜딩 페이지를 만들고 싶은데 어떻게 프롬프트를 써야 해?",
  "대시보드를 만들려면 어떤 요소가 필요할까?",
  "반응형 디자인을 위한 프롬프트 팁 알려줘",
  "로그인 페이지 프롬프트 예��를 보여줘",
]

// ─── Main export ───
interface HomeContentProps {
  onSelectItem: (item: GuideItem) => void
  username: string
  mode?: "full" | "floating"
}

export function HomeContent({
  onSelectItem,
  username,
  mode = "full",
}: HomeContentProps) {
  const isFloating = mode === "floating"
  const [chatList, setChatList] = useState<ChatSummary[]>([])
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [loadedMessages, setLoadedMessages] = useState<UIMessage[] | null>(null)
  const [loadedTitle, setLoadedTitle] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [openingChat, setOpeningChat] = useState(false)
  const [chatMountKey, setChatMountKey] = useState(0)
  const [homeInput, setHomeInput] = useState("")
  const [selectedModel, setSelectedModel] = useState<string>("gpt-4o-mini")
  const [userTrack, setUserTrack] = useState<string>("local-problem")
  const [eduName, setEduName] = useState<string>("")
  const [eduDate, setEduDate] = useState<string>("")
  const [eduTime, setEduTime] = useState<string>("")

  // Track-based chat collection path
  const chatCollectionName = `chats-${userTrack}`
  const [flyingQuestion, setFlyingQuestion] = useState<{ text: string; rect: DOMRect } | null>(null)

  // Read track + edu info from sessionStorage on mount
  useEffect(() => {
    const t = sessionStorage.getItem("v0-guide-track")
    if (t) setUserTrack(t)
    setEduName(sessionStorage.getItem("v0-guide-eduName") || "")
    setEduDate(sessionStorage.getItem("v0-guide-eduDate") || "")
    setEduTime(sessionStorage.getItem("v0-guide-eduTime") || "")
  }, [])
  const homeInputRef = useRef<HTMLInputElement>(null)

  // Load chat list from Firebase
  useEffect(() => {
    if (!username) {
      setLoading(false)
      return
    }
    const loadChatList = async () => {
      try {
        const chatsRef = collection(db, "users", username, chatCollectionName)
        const snapshot = await getDocs(chatsRef)
        const chats: ChatSummary[] = []
        snapshot.forEach((docSnap) => {
          const data = docSnap.data()
          if (data.messages && Array.isArray(data.messages) && data.messages.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const firstUserMsg = data.messages.find((m: any) => m.role === "user")
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const fa = firstUserMsg as any
            const ft = fa?.parts?.[0]?.text || fa?.content || "대화"
            chats.push({
              id: docSnap.id,
              firstMessage: typeof ft === "string" ? ft.slice(0, 60) : "대화",
              title: data.title || undefined,
              messageCount: data.messages.length,
              updatedAt: data.updatedAt?.toMillis?.() || Date.now(),
            })
          }
        })
        chats.sort((a, b) => b.updatedAt - a.updatedAt)
        setChatList(chats)
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    loadChatList()
  }, [username, activeChatId, chatCollectionName])

  // Open a specific chat
  const openChat = async (chatId: string) => {
    setOpeningChat(true)
    try {
      const chatDocRef = doc(db, "users", username, chatCollectionName, chatId)
      const chatDoc = await getDoc(chatDocRef)
      if (chatDoc.exists()) {
        const data = chatDoc.data()
        const msgs = (data.messages || []) as UIMessage[]
        setChatMountKey((k) => k + 1)
        setLoadedMessages(msgs)
        setLoadedTitle(data.title || null)
        setActiveChatId(chatId)
      } else {
        setChatMountKey((k) => k + 1)
        setLoadedMessages([])
        setLoadedTitle(null)
        setActiveChatId(chatId)
      }
    } catch {
      setChatMountKey((k) => k + 1)
      setLoadedMessages([])
      setLoadedTitle(null)
      setActiveChatId(chatId)
    } finally {
      setOpeningChat(false)
    }
  }

  // Start a new chat (optionally with initial text)
  const [newChatInitialText, setNewChatInitialText] = useState<string | null>(null)
  const startNewChat = (initialText?: string) => {
    const newId = `chat-${Date.now()}`
    setChatMountKey((k) => k + 1)
    setNewChatInitialText(initialText || null)
    setLoadedMessages([])
    setLoadedTitle(null)
    setActiveChatId(newId)
  }

  // Delete a chat
  const deleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await deleteDoc(doc(db, "users", username, chatCollectionName, chatId))
      setChatList((prev) => prev.filter((c) => c.id !== chatId))
      if (activeChatId === chatId) {
        setActiveChatId(null)
        setLoadedMessages(null)
      }
    } catch {
      // silent
    }
  }

  // Back to home from chat
  const handleBackToHome = () => {
    setActiveChatId(null)
    setLoadedMessages(null)
    // Reload chat list
    const reload = async () => {
      try {
        const chatsRef = collection(db, "users", username, chatCollectionName)
        const snapshot = await getDocs(chatsRef)
        const chats: ChatSummary[] = []
        snapshot.forEach((docSnap) => {
          const data = docSnap.data()
          if (data.messages && Array.isArray(data.messages) && data.messages.length > 0) {
            const firstUserMsg = data.messages.find(
              (m: UIMessage) => m.role === "user"
            )
            chats.push({
              id: docSnap.id,
              firstMessage: firstUserMsg
                ? (firstUserMsg.parts?.[0] as { text?: string })?.text?.slice(0, 60) || "대화"
                : "대화",
              title: data.title || undefined,
              messageCount: data.messages.length,
              updatedAt: data.updatedAt?.toMillis?.() || Date.now(),
            })
          }
        })
        chats.sort((a, b) => b.updatedAt - a.updatedAt)
        setChatList(chats)
      } catch {
        // silent
      }
    }
    reload()
  }

  if (loading || openingChat) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
          {openingChat && (
            <p className="text-xs text-muted-foreground">대화를 불러오는 중...</p>
          )}
        </div>
      </div>
    )
  }

  // Active chat view - key forces full remount so initialMessages applies
  if (activeChatId && loadedMessages !== null) {
    return (
      <ChatView
        key={activeChatId + "-" + chatMountKey}
        chatId={activeChatId}
        username={username}
        initialMessages={loadedMessages}
        initialText={newChatInitialText}
  chatTitle={loadedTitle}
  model={selectedModel}
  track={userTrack}
  onSelectItem={onSelectItem}
  onBack={handleBackToHome}
  mode={mode}
      />
    )
  }

  // Home view
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-xl px-6 py-12">
          {/* Header - Edu Info */}
          <div className="flex flex-col items-center gap-3 mb-10">
            {eduName ? (
              <>
                <span className={`text-[10px] font-semibold uppercase tracking-[0.15em] rounded-full px-2.5 py-0.5 ${
                  userTrack === "local-problem" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                    : userTrack === "startup" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                    : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
                }`}>
                  {userTrack === "local-problem" ? "지역문제해결형" : userTrack === "startup" ? "창업 아이디어 현실화" : "쇼핑몰 제작"}
                </span>
                <h1 className="text-xl font-bold tracking-tight text-foreground text-center text-balance">
                  {eduName}
                </h1>
                {(eduDate || eduTime) && (
                  <p className="text-xs text-muted-foreground">
                    {[eduDate, eduTime].filter(Boolean).join("  /  ")}
                  </p>
                )}
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Vibe Coding Guide
                </h1>
                <p className="text-xs text-muted-foreground">by growink</p>
              </>
            )}
          </div>

          {/* Inline chat input */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (homeInput.trim()) {
                startNewChat(homeInput.trim())
                setHomeInput("")
              }
            }}
            className="mb-10 relative"
          >
            <input
              ref={homeInputRef}
              type="text"
              value={homeInput}
              onChange={(e) => setHomeInput(e.target.value)}
              placeholder="만들고 싶은 서비스를 설명해주세요..."
              className="h-14 w-full rounded-2xl border border-border bg-background px-5 pr-12 text-sm text-foreground placeholder:text-muted-foreground hover:border-foreground/20 focus:outline-none focus:ring-2 focus:ring-foreground/10 transition-all"
            />
            <button
              type="submit"
              disabled={!homeInput.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-xl bg-foreground text-background disabled:opacity-30 hover:opacity-90 transition-all"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>

          {/* Model selector */}
          <div className="flex items-center gap-1.5 -mt-7 mb-8">
            {[
              { id: "gpt-4o-mini", label: "GPT-4o Mini", desc: "빠르고 가벼운" },
              { id: "gpt-4o", label: "GPT-4o", desc: "똑똑하고 정교한" },
              { id: "claude-sonnet", label: "Claude Sonnet", desc: "자연스러운 한국어" },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedModel(m.id)}
                className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.625rem] font-medium transition-all ${
                  selectedModel === m.id
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
                title={m.desc}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Chat history list */}
          {chatList.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-xs font-medium text-muted-foreground">
                  대화 기록
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                {chatList.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => openChat(chat.id)}
                    className="group flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 text-left hover:bg-accent transition-colors"
                  >
                    <MessageCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">
                        {chat.title || chat.firstMessage}
                      </p>
                      <p className="text-[0.625rem] text-muted-foreground mt-0.5">
                        {chat.messageCount}개 메시지 ·{" "}
                        {formatTimeAgo(chat.updatedAt)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => deleteChat(chat.id, e)}
                      className="opacity-0 group-hover:opacity-100 flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                      title="삭제"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Flying question animation overlay */}
          {flyingQuestion && (
            <div
              className="fixed z-50 pointer-events-none"
              style={{
                left: flyingQuestion.rect.left,
                top: flyingQuestion.rect.top,
                width: flyingQuestion.rect.width,
                height: flyingQuestion.rect.height,
              }}
            >
              <div
                className="flex items-center gap-2 rounded-xl border border-foreground/20 bg-accent px-4 py-3 text-xs text-foreground animate-fly-to-input"
                style={{
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  ["--target-x" as any]: `${(homeInputRef.current?.getBoundingClientRect().left ?? 0) - flyingQuestion.rect.left}px`,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  ["--target-y" as any]: `${(homeInputRef.current?.getBoundingClientRect().top ?? 0) - flyingQuestion.rect.top}px`,
                }}
              >
                <span className="flex-1 leading-relaxed">{flyingQuestion.text}</span>
              </div>
            </div>
          )}

          {/* Suggested questions */}
          <div className="mb-10">
            <p className="mb-3 text-xs font-medium text-muted-foreground">
              이런 걸 물어보세요
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  onClick={(e) => {
                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
                    setFlyingQuestion({ text: q, rect })
                    // After animation, put text in input and send
                    setTimeout(() => {
                      setFlyingQuestion(null)
                      setHomeInput(q)
                      // Auto-send after brief input display
                      setTimeout(() => {
                        startNewChat(q)
                        setHomeInput("")
                      }, 200)
                    }, 400)
                  }}
                  className="flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-left text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                  <span className="flex-1 leading-relaxed">{q}</span>
                  <ArrowRight className="h-3 w-3 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <p className="mb-3 text-xs font-medium text-muted-foreground">
              카테고리 둘러보기
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {guideCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onSelectItem(cat.items[0])}
                  className="flex flex-col items-center gap-2 rounded-xl border border-border bg-background p-4 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                  <span>{categoryIcons[cat.icon]}</span>
                  <span className="text-xs font-medium">{cat.label}</span>
                  <span className="text-[0.625rem] text-muted-foreground">
                    {cat.items.length}개 항목
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Chat View ───
function ChatView({
  chatId,
  username,
  initialMessages,
  initialText,
  chatTitle,
  model,
  track,
  onSelectItem,
  onBack,
}: {
  chatId: string
  username: string
  initialMessages: UIMessage[]
  initialText?: string | null
  chatTitle?: string | null
  model?: string
  track?: string
  onSelectItem: (item: GuideItem) => void
  onBack: () => void
}) {
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const chatColName = `chats-${track || "local-problem"}`

  // Normalize Firebase messages into proper UIMessage format
  const [normalizedInit] = useState<UIMessage[]>(() => {
    return initialMessages.map((msg, idx) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const m = msg as any
      let text = ""
      if (m.parts && Array.isArray(m.parts) && m.parts.length > 0) {
        text = m.parts
          .map((p: Record<string, unknown>) => (typeof p.text === "string" ? p.text : ""))
          .join("")
      }
      if (!text && typeof m.content === "string") {
        text = m.content
      }
      return {
        id: m.id || `msg-${idx}`,
        role: m.role as "user" | "assistant",
        content: text,
        parts: [{ type: "text" as const, text }],
        createdAt: m.createdAt ? new Date(m.createdAt) : new Date(),
      } as UIMessage
    })
  })

  const [mountId] = useState(() => Date.now())

  const { messages, setMessages, sendMessage, status } = useChat({
    id: `${chatId}-${mountId}`,
    initialMessages: normalizedInit,
    transport: new DefaultChatTransport({
      api: "/api/chat",
  body: {
  model: model || "gpt-4o-mini",
  track: track || "local-problem",
  username: username || "",
  },
    }),
  })

  // Force inject if useChat didn't pick up initialMessages
  const injectedRef = useRef(false)
  useEffect(() => {
    if (!injectedRef.current && normalizedInit.length > 0 && messages.length === 0) {
      setMessages(normalizedInit)
      injectedRef.current = true
    }
  }, [normalizedInit, messages.length, setMessages])

  // Auto-send initialText on mount (for suggestion clicks from home)
  const autoSentRef = useRef(false)
  useEffect(() => {
    if (initialText && !autoSentRef.current && normalizedInit.length === 0) {
      autoSentRef.current = true
      sendMessage({ text: initialText })
    }
  }, [initialText, normalizedInit.length, sendMessage])

  // Auto-generate title after 5 messages (one-time)
  const titleGeneratedRef = useRef(false)
  const generateTitle = useCallback(
    async (msgs: UIMessage[]) => {
      if (titleGeneratedRef.current || msgs.length < 5) return
      titleGeneratedRef.current = true
      try {
        const res = await fetch("/api/chat/title", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: JSON.parse(JSON.stringify(msgs.slice(0, 6))) }),
        })
        if (res.ok) {
          const { title } = await res.json()
          if (title) {
            const chatDocRef = doc(db, "users", username, chatColName, chatId)
            await setDoc(chatDocRef, { title }, { merge: true })
          }
        }
      } catch {
        // silent
      }
    },
    [username, chatId]
  )

  const saveMessages = useCallback(
    async (msgs: UIMessage[]) => {
      if (!username || msgs.length === 0) return
      try {
        const chatDocRef = doc(db, "users", username, chatColName, chatId)
        await setDoc(chatDocRef, {
          messages: JSON.parse(JSON.stringify(msgs)),
          updatedAt: Timestamp.now(),
        }, { merge: true })
        // Generate title when 5 messages reached
        if (msgs.length >= 5) {
          generateTitle(msgs)
        }
      } catch {
        // silent
      }
    },
    [username, chatId, generateTitle]
  )

  useEffect(() => {
    if (status === "ready" && messages.length > 0) {
      saveMessages(messages)
    }
  }, [messages, status, saveMessages])

  const isLoading = status === "streaming" || status === "submitted"
  // Show messages if useChat has them, or if we're waiting for force inject
  const hasMessages = messages.length > 0 || normalizedInit.length > 0

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const autoResize = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    sendMessage({ text: input })
    setInput("")
    // Reset height
    if (textareaRef.current) textareaRef.current.style.height = "auto"
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Chat header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-2.5 shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowRight className="h-3 w-3 rotate-180" />
          <span>목록</span>
        </button>
        <div className="h-4 w-px bg-border" />
        <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-foreground truncate">
          {chatTitle
            ? chatTitle
            : hasMessages
              ? (() => {
                  const allMsgs = messages.length > 0 ? messages : normalizedInit
                  const first = allMsgs.find((m) => m.role === "user")
                  if (!first) return "대화"
                  const t = (first.parts?.[0] as { text?: string })?.text || ""
                  return t.length > 40 ? t.slice(0, 40) + "..." : t
                })()
              : "새 대화"}
        </span>
        <span className="ml-auto shrink-0 rounded-full bg-muted px-2 py-0.5 text-[0.5625rem] font-medium text-muted-foreground">
          {model === "claude-sonnet" ? "Claude" : model === "gpt-4o-mini" ? "GPT-4o Mini" : "GPT-4o"}
        </span>
      </div>

      {/* Messages or empty state */}
      {!hasMessages ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6">
          <div className="w-full max-w-xl flex flex-col items-center gap-8">
            <div className="flex flex-col items-center gap-2">
              <Sparkles className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">무엇이든 물어보세요</p>
            </div>

            <form onSubmit={handleSubmit} className="w-full">
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => { setInput(e.target.value); autoResize() }}
                  onKeyDown={handleKeyDown}
                  placeholder="v0에서 무엇을 만들고 싶으신가요?"
                  rows={1}
                  className="min-h-[56px] max-h-[160px] w-full resize-none rounded-2xl border border-border bg-background pl-5 pr-14 py-4 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/10 transition-all"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 bottom-3 flex h-10 w-10 items-center justify-center rounded-xl bg-foreground text-background transition-all hover:opacity-90 disabled:opacity-30"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 w-full">
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage({ text: q })}
                  className="flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-left text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                  <span className="flex-1 leading-relaxed">{q}</span>
                  <ArrowRight className="h-3 w-3 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="mx-auto max-w-4xl flex flex-col gap-6">
              {(messages.length > 0 ? messages : normalizedInit).map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-foreground text-background"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {message.parts.map((part, index) => {
                      if (part.type === "text") {
                        if (message.role === "user") {
                          return (
                            <span key={index} className="text-sm leading-relaxed">
                              {part.text}
                            </span>
                          )
                        }
                        const cleanedText = stripGuideMarkers(part.text)
                        return (
                          <div key={index} className="ai-response text-sm leading-relaxed">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                h2: ({ children }) => (
                                  <h2 className="mt-4 mb-2 text-base font-semibold first:mt-0">
                                    {children}
                                  </h2>
                                ),
                                h3: ({ children }) => (
                                  <h3 className="mt-3 mb-1.5 text-sm font-semibold">
                                    {children}
                                  </h3>
                                ),
                                p: ({ children }) => (
                                  <p className="mb-2 leading-relaxed last:mb-0">
                                    {children}
                                  </p>
                                ),
                                ul: ({ children }) => (
                                  <ul className="mb-2 flex flex-col gap-1 pl-4">
                                    {children}
                                  </ul>
                                ),
                                ol: ({ children }) => (
                                  <ol className="mb-2 flex flex-col gap-1 pl-4 list-decimal">
                                    {children}
                                  </ol>
                                ),
                                li: ({ children }) => (
                                  <li className="leading-relaxed list-disc">
                                    {children}
                                  </li>
                                ),
                                strong: ({ children }) => (
                                  <strong className="font-semibold">
                                    {children}
                                  </strong>
                                ),
                                code: ({ children, className }) => {
                                  const isBlock = className?.includes("language-")
                                  if (isBlock) {
                                    return (
                                      <code className="block whitespace-pre-wrap break-words text-xs leading-relaxed">
                                        {children}
                                      </code>
                                    )
                                  }
                                  return (
                                    <code className="rounded bg-background/50 px-1 py-0.5 text-xs font-mono">
                                      {children}
                                    </code>
                                  )
                                },
                                pre: ({ children }) => {
                                  const text = extractTextFromChildren(children)
                                  return (
                                    <CodeBlockWithCopy text={text}>
                                      {children}
                                    </CodeBlockWithCopy>
                                  )
                                },
                                table: ({ children }) => (
                                  <div className="mb-2 overflow-x-auto rounded-lg border border-border/50">
                                    <table className="w-full text-xs">{children}</table>
                                  </div>
                                ),
                                thead: ({ children }) => (
                                  <thead className="bg-background/30 border-b border-border/50">{children}</thead>
                                ),
                                tbody: ({ children }) => <tbody>{children}</tbody>,
                                tr: ({ children }) => (
                                  <tr className="border-b border-border/30 last:border-0">{children}</tr>
                                ),
                                th: ({ children }) => (
                <th className="px-2 py-1.5 text-left text-[0.6875rem] font-semibold">{children}</th>
              ),
              td: ({ children }) => (
                <td className="px-2 py-1.5 text-[0.6875rem]">{children}</td>
                                ),
                              }}
                            >
                              {cleanedText}
                            </ReactMarkdown>
                            {parseLearningPaths(part.text).map((path, pathIdx) => (
                              <LearningPathCard
                                key={pathIdx}
                                data={path}
                                onSelectItem={onSelectItem}
                              />
                            ))}
                            {/* Streaming: learning-path 생성 중 로딩 표시 */}
                            {isLoading &&
                              part.text.includes("[[learning-path:") &&
                              parseLearningPaths(part.text).length === 0 && (
                                <div className="my-3 flex items-center gap-2.5 rounded-xl border border-border bg-background px-4 py-3">
                                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground text-background">
                                    <Rocket className="h-3.5 w-3.5 animate-pulse" />
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-foreground">{"학습경로 생성중"}</span>
                                    <div className="flex gap-1">
                                      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
                                      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
                                      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
                                    </div>
                                  </div>
                                </div>
                              )}
                            <GuideLinksFromText
                              text={part.text}
                              onSelectItem={onSelectItem}
                            />
                          </div>
                        )
                      }
                      return null
                    })}
                  </div>
                </div>
              ))}

              {(() => {
                const renderMsgs = messages.length > 0 ? messages : normalizedInit
                return isLoading && renderMsgs[renderMsgs.length - 1]?.role === "user"
              })() && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1.5 rounded-2xl bg-muted px-4 py-3">
                    <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
                    <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
                    <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="border-t border-border px-6 py-4 shrink-0">
            <form onSubmit={handleSubmit} className="mx-auto max-w-4xl">
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => { setInput(e.target.value); autoResize() }}
                  onKeyDown={handleKeyDown}
                  placeholder="추가 질문을 입력하세요..."
                  rows={1}
                  className="min-h-[48px] max-h-[160px] w-full resize-none rounded-xl border border-border bg-background pl-4 pr-12 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/10 transition-all"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-1.5 bottom-2.5 flex h-9 w-9 items-center justify-center rounded-lg bg-foreground text-background transition-all hover:opacity-90 disabled:opacity-30"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Time format helper ───
function formatTimeAgo(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return "방금 전"
  if (minutes < 60) return `${minutes}분 전`
  if (hours < 24) return `${hours}시간 전`
  if (days < 7) return `${days}일 전`
  return new Date(timestamp).toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
  })
}
