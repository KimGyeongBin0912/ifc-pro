"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import type { UIMessage } from "ai"
import type { GuideItem } from "@/lib/guide-data"
import { getAllItems } from "@/lib/guide-data"
import { GuideSidebar } from "@/components/guide/guide-sidebar"
import { HomeContent } from "@/components/guide/home-content"
import { DetailView } from "@/components/guide/detail-view"
import { db } from "@/lib/firebase"
import {
  collection,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import {
  Menu,
  X,
  MessageCircle,
  Plus,
  ArrowRight,
  Trash2,
  Clock,
  Maximize2,

  Send,
  BookOpen,
  Rocket,
  Copy,
  CheckCircle,
  Star,
} from "lucide-react"

// ─── Chat Summary type ───
interface ChatSummary {
  id: string
  firstMessage: string
  messageCount: number
  updatedAt: number
}

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

interface MainLayoutProps {
  username: string
  onLogout?: (clickX?: number, clickY?: number) => void
  homeReady?: boolean
}
export function MainLayout({ username, onLogout, homeReady = true }: MainLayoutProps) {
  const [selectedItem, setSelectedItem] = useState<GuideItem | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Floating chat state
  const [floatingOpen, setFloatingOpen] = useState(false)
  const [floatingChatList, setFloatingChatList] = useState<ChatSummary[]>([])
  const [floatingActiveChatId, setFloatingActiveChatId] = useState<string | null>(null)
  const [floatingMessages, setFloatingMessages] = useState<UIMessage[]>([])
  const [floatingLoading, setFloatingLoading] = useState(false)
  const [floatingModel, setFloatingModel] = useState<string>("gpt-4o-mini")
  const [floatingTrack, setFloatingTrack] = useState<string>("local-problem")

  // Track-based chat collection path
  const floatingChatCol = `chats-${floatingTrack}`

  // Read track from sessionStorage on mount
  useEffect(() => {
    const t = sessionStorage.getItem("v0-guide-track")
    if (t) setFloatingTrack(t)
  }, [])

  // For "go to home and continue chat"
  const [pendingChatId, setPendingChatId] = useState<string | null>(null)
  const [pendingMessages, setPendingMessages] = useState<UIMessage[] | null>(null)

  // Floating expand animation state
  const [floatingExpanding, setFloatingExpanding] = useState(false)

  // Genie animation state
  const [genieAnimating, setGenieAnimating] = useState(false)
  const [wiggleBtn, setWiggleBtn] = useState(false)
  const [pendingItem, setPendingItem] = useState<GuideItem | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const floatingBtnRef = useRef<HTMLButtonElement>(null)

  // Scroll to top when a guide item is selected
  useEffect(() => {
    if (selectedItem && contentRef.current) {
      contentRef.current.scrollTop = 0
    }
  }, [selectedItem])

  const handleSelectItem = (item: GuideItem) => {
    // If we're on home (chat view), trigger morph-to-button animation
    if (!selectedItem && contentRef.current) {
      setPendingItem(item)
      setGenieAnimating(true)

      // Calculate translate target: center of content -> floating button position (bottom-right)
      const contentRect = contentRef.current.getBoundingClientRect()
      const centerX = contentRect.left + contentRect.width / 2
      const centerY = contentRect.top + contentRect.height / 2
      const btnX = window.innerWidth - 48 // right-6 (24px) + half button (24px)
      const btnY = window.innerHeight - 48
      const tx = btnX - centerX
      const ty = btnY - centerY
      contentRef.current.style.setProperty("--morph-tx", `${tx}px`)
      contentRef.current.style.setProperty("--morph-ty", `${ty}px`)

      setTimeout(() => {
        setGenieAnimating(false)
        setSelectedItem(item)
        setSidebarOpen(false)
        setPendingItem(null)
        // Trigger wiggle on the floating button after it appears
        setTimeout(() => {
          setWiggleBtn(true)
          setTimeout(() => setWiggleBtn(false), 1200)
        }, 80)
      }, 190)
    } else {
      setSelectedItem(item)
      setSidebarOpen(false)
    }
  }

  const handleGoHome = () => {
    setSelectedItem(null)
    setSidebarOpen(false)
  }

  // Load floating chat list
  const loadFloatingChatList = useCallback(async () => {
    if (!username) return
    setFloatingLoading(true)
    try {
      const chatsRef = collection(db, "users", username, floatingChatCol)
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
            firstMessage: typeof ft === "string" ? ft.slice(0, 50) : "대화",
            messageCount: data.messages.length,
            updatedAt: data.updatedAt?.toMillis?.() || Date.now(),
          })
        }
      })
      chats.sort((a, b) => b.updatedAt - a.updatedAt)
      setFloatingChatList(chats)
    } catch {
      // silent
    } finally {
      setFloatingLoading(false)
    }
  }, [username, floatingChatCol])

  useEffect(() => {
    if (floatingOpen) {
      loadFloatingChatList()
    }
  }, [floatingOpen, loadFloatingChatList])

  // Open a chat in floating panel
  const openFloatingChat = async (chatId: string) => {
    try {
      const chatDocRef = doc(db, "users", username, floatingChatCol, chatId)
      const chatDoc = await getDoc(chatDocRef)
      if (chatDoc.exists()) {
        const data = chatDoc.data()
        const msgs = (data.messages || []) as UIMessage[]
        setFloatingMessages(msgs)
        setFloatingActiveChatId(chatId)
      }
    } catch {
      // silent
    }
  }

  // Delete chat from floating
  const deleteFloatingChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await deleteDoc(doc(db, "users", username, floatingChatCol, chatId))
      setFloatingChatList((prev) => prev.filter((c) => c.id !== chatId))
      if (floatingActiveChatId === chatId) {
        setFloatingActiveChatId(null)
        setFloatingMessages([])
      }
    } catch {
      // silent
    }
  }

  // Expand floating panel → becomes home chat page
  // 1. Pre-render home behind the panel (pending carries the chat)
  // 2. Panel expand animation covers transition
  // 3. Panel removed → home already visible
  const expandToHome = () => {
    if (floatingActiveChatId) {
      setPendingChatId(floatingActiveChatId)
      setPendingMessages(floatingMessages)
    }
    // Step 1: Start expand animation (chat content stays visible)
    setFloatingExpanding(true)
    // Step 2: Navigate to home behind the expanding panel
    requestAnimationFrame(() => {
      setSelectedItem(null) // home renders behind panel
    })
    // Step 3: After animation, remove overlay + clean up chat state
    setTimeout(() => {
      setFloatingExpanding(false)
      setFloatingOpen(false)
      setFloatingActiveChatId(null)
      setFloatingMessages([])
    }, 550)
  }

  // Ref for click outside
  const floatingRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        floatingRef.current &&
        !floatingRef.current.contains(e.target as Node)
      ) {
        // Don't close, user might want to keep it open
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const messagesEndRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [floatingMessages])

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - desktop */}
      <div className={`hidden md:block transition-all duration-700 ease-out ${homeReady ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"}`}>
        <GuideSidebar
          selectedId={selectedItem?.id ?? null}
          onSelectItem={handleSelectItem}
          onGoHome={handleGoHome}
          onLogout={onLogout}
          username={username}
        />
      </div>

      {/* Sidebar - mobile */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <GuideSidebar
          selectedId={selectedItem?.id ?? null}
          onSelectItem={handleSelectItem}
          onGoHome={handleGoHome}
          onLogout={onLogout}
          username={username}
        />
      </div>

      {/* Main content */}
      <div className={`flex flex-1 flex-col min-w-0 transition-all duration-700 ease-out delay-100 ${homeReady ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}`}>
        {/* Mobile header */}
        <div className="flex h-14 items-center gap-3 border-b border-border px-4 md:hidden">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            {sidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
          <span className="text-sm font-semibold text-foreground">
            {selectedItem ? selectedItem.title : "Vibe Coding Guide"}
          </span>
        </div>

        {/* Content area */}
        <div
          ref={contentRef}
          className={`flex-1 overflow-y-auto overflow-x-hidden ${genieAnimating ? "animate-morph-to-button" : ""}`}
        >
          {selectedItem ? (
            <DetailView item={selectedItem} onBack={handleGoHome} />
          ) : (
            <HomeContent
              onSelectItem={handleSelectItem}
              username={username}
              pendingChatId={pendingChatId}
              pendingMessages={pendingMessages}
              onPendingConsumed={() => {
                setPendingChatId(null)
                setPendingMessages(null)
              }}
              onTitleGenerated={(cid, title) => {
                setFloatingChatList((prev) =>
                  prev.map((c) => (c.id === cid ? { ...c, title } : c))
                )
              }}
            />
          )}
        </div>
      </div>

      {/* Floating chat button + panel - visible on guide pages or during expand animation */}
      {(selectedItem || floatingExpanding) && (
        <div ref={floatingRef} className="fixed bottom-6 right-6 z-50">
          {/* Floating panel - CSS hidden to keep alive during streaming */}
          <div className={`rounded-2xl border border-border bg-background shadow-2xl overflow-hidden ease-out will-change-[transform,opacity,width,height,inset] ${floatingExpanding ? "fixed top-0 left-0 md:left-64 right-0 bottom-0 z-[60] rounded-none border-0 shadow-none transition-all duration-500 opacity-100" : floatingOpen ? "absolute bottom-14 right-0 w-80 sm:w-96 transition-all duration-200 opacity-100 translate-y-0 pointer-events-auto" : "absolute bottom-14 right-0 w-80 sm:w-96 transition-all duration-200 opacity-0 translate-y-2 pointer-events-none invisible"}`}>
              {/* White overlay to hide content during expand */}
              {floatingExpanding && (
                <div className="absolute inset-0 z-10 bg-background" />
              )}
              {/* Panel header */}
              <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-muted/30">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-foreground" />
                  <span className="text-sm font-semibold text-foreground">
                    {floatingActiveChatId ? "대화" : "대화 기록"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {floatingActiveChatId && (
                    <>
                      <button
                        onClick={expandToHome}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        title="큰 화면에서 이어하기"
                      >
                        <Maximize2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setFloatingActiveChatId(null)
                          setFloatingMessages([])
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        title="목록으로"
                      >
                        <ArrowRight className="h-3.5 w-3.5 rotate-180" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setFloatingOpen(false)}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Panel body */}
              {floatingActiveChatId ? (
                <FloatingChatPanel
                  key={floatingActiveChatId}
                  chatId={floatingActiveChatId}
                  username={username}
  initialMessages={floatingMessages}
  model={floatingModel}
  track={floatingTrack}
  onSelectItem={handleSelectItem}
  onExpandToHome={expandToHome}
  onTitleGenerated={(cid, title) => {
    setFloatingChatList((prev) =>
      prev.map((c) => (c.id === cid ? { ...c, title } : c))
    )
  }}
  />
              ) : (
                <div className="h-[570px] overflow-y-auto">
                  <div className="p-3 space-y-2">
                    <button
                      onClick={() => {
                        const newId = `chat-${Date.now()}`
                        setFloatingActiveChatId(newId)
                        setFloatingMessages([])
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl border border-dashed border-border px-3 py-2.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      새 대화 시작하기
                    </button>

                    {/* Model selector */}
                    <div className="flex items-center gap-1">
                      {[
                        { id: "gpt-4o-mini", label: "GPT-4o Mini" },
                        { id: "gpt-4o", label: "GPT-4o" },
                        { id: "claude-sonnet", label: "Claude" },
                      ].map((m) => (
                        <button
                          key={m.id}
                          onClick={() => setFloatingModel(m.id)}
                          className={`rounded-full px-2 py-0.5 text-[9px] font-medium transition-all ${
                            floatingModel === m.id
                              ? "bg-foreground text-background"
                              : "bg-muted text-muted-foreground hover:bg-accent"
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>

                    {floatingLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
                      </div>
                    ) : floatingChatList.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 gap-1">
                        <Clock className="h-5 w-5 text-muted-foreground/30" />
                        <p className="text-xs text-muted-foreground">대화 기록이 없습니다</p>
                      </div>
                    ) : (
                      floatingChatList.map((chat) => (
                        <button
                          key={chat.id}
                          onClick={() => openFloatingChat(chat.id)}
                          className="group flex w-full items-center gap-2.5 rounded-xl border border-border px-3 py-2.5 text-left hover:bg-accent transition-colors"
                        >
                          <MessageCircle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-foreground truncate">
                              {chat.title || chat.firstMessage}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {chat.messageCount}개 · {formatTimeAgo(chat.updatedAt)}
                            </p>
                          </div>
                          <button
                            onClick={(e) => deleteFloatingChat(chat.id, e)}
                            className="opacity-0 group-hover:opacity-100 flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
          </div>

          {/* Floating button - hidden when expanded to full */}
          <button
            ref={floatingBtnRef}
            onClick={() => setFloatingOpen(!floatingOpen)}
            className={`flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all hover:scale-105 ${
              floatingOpen
                ? "bg-muted text-foreground"
                : "bg-foreground text-background"
            } ${wiggleBtn ? "animate-wiggle-lamp" : ""} ${floatingExpanding ? "opacity-0 pointer-events-none scale-0" : ""}`}
          >
            {floatingOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <MessageCircle className="h-5 w-5" />
            )}
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Floating Chat Panel with actual chat functionality ───
function FloatingGuideLinks({
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
    <div className="mt-1.5 space-y-1">
      {items.map((item) => (
        <div key={item.id} className="rounded-lg border border-border bg-background overflow-hidden">
          <button
            onClick={() => onSelectItem(item)}
            className="flex w-full items-center gap-1.5 px-2.5 py-1.5 text-left hover:bg-accent/50 transition-colors"
          >
            <BookOpen className="h-2.5 w-2.5 shrink-0 text-muted-foreground" />
            <span className="text-[10px] font-medium text-foreground truncate">{item.title}</span>
          </button>
          {item.promptExample && (
            <div className="flex items-start gap-1 border-t border-border px-2.5 py-1.5 bg-muted/30">
              <p className="flex-1 text-[9px] text-muted-foreground leading-relaxed whitespace-pre-wrap break-words">
                {item.promptExample}
              </p>
              <button
                onClick={() => handleCopy(item)}
                className="shrink-0 flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[8px] text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                title="프롬프트 복사"
              >
                {copiedId === item.id ? (
                  <>
                    <CheckCircle className="h-2.5 w-2.5" />
                    <span>{"복사됨"}</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-2.5 w-2.5" />
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

function stripGuideMarkersFloating(text: string): string {
  return text
    .replace(/\[\[guide:[a-z0-9-]+\]\]/g, "")
    .replace(/\[\[learning-path:\s*[\s\S]*?\]\]/g, "")
    .replace(/\[\[learning-path:[\s\S]*$/g, "")
    .trim()
}

// Parse [[learning-path:...]] from text (floating chat version)
interface FloatingLearningStep {
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
interface FloatingLearningPathData {
  title: string
  description?: string
  totalDuration?: string
  steps: FloatingLearningStep[]
}

function parseFloatingLearningPaths(text: string): FloatingLearningPathData[] {
  const regex = /\[\[learning-path:\s*([\s\S]*?)\]\]/g
  const paths: FloatingLearningPathData[] = []
  let match
  while ((match = regex.exec(text)) !== null) {
    try {
      const data = JSON.parse(match[1].trim())
      if (data.title && Array.isArray(data.steps)) {
        paths.push(data as FloatingLearningPathData)
      }
    } catch {
      // skip
    }
  }
  return paths
}

const floatingDiffConfig = {
  beginner: { label: "입문", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" },
  intermediate: { label: "중급", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400" },
  advanced: { label: "고급", color: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400" },
}

function FloatingLearningPathCard({
  data,
  onSelectItem,
}: {
  data: FloatingLearningPathData
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
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  return (
    <div className="my-2 rounded-lg border border-border bg-background overflow-hidden shadow-sm">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-3 py-2 hover:bg-accent/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-md bg-foreground text-background">
            <Rocket className="h-2.5 w-2.5" />
          </div>
          <div className="text-left">
            <div className="text-[11px] font-semibold text-foreground">{data.title}</div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] text-muted-foreground">{data.steps.length}{"단계"}</span>
              {data.totalDuration && (
                <span className="text-[9px] text-muted-foreground">{"/ "}{data.totalDuration}</span>
              )}
              {completedSteps.size > 0 && (
                <span className="text-[9px] font-medium text-foreground">{completedSteps.size}/{data.steps.length}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {!expanded && (
            <span className="text-[8px] text-muted-foreground/60">{"펼치기"}</span>
          )}
          <ArrowRight
            className={`h-3 w-3 text-muted-foreground transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}
          />
        </div>
      </button>
      {/* Progress bar */}
      {completedSteps.size > 0 && (
        <div className="px-3 pb-1">
          <div className="h-0.5 w-full rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-foreground transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
      {expanded && data.description && (
        <div className="px-3 pt-1 pb-0.5">
          <p className="text-[9px] text-muted-foreground leading-relaxed">{data.description}</p>
        </div>
      )}
      {expanded && (
        <div className="border-t border-border px-3 py-2">
          <div className="flex items-center gap-1 mb-1.5">
            <span className="text-[8px] text-muted-foreground/60">{"숫자를 클릭하면 완료 표시됩니다"}</span>
          </div>
          {data.steps.map((step, idx) => {
            const guideItem = allItems.find((i) => i.id === step.guideId)
            const isActive = activeStep === idx
            const isLast = idx === data.steps.length - 1
            const isCompleted = completedSteps.has(idx)
            const diff = step.difficulty ? floatingDiffConfig[step.difficulty] : null
            return (
              <div key={step.step} className="relative flex gap-2">
                {!isLast && (
                  <div className={`absolute left-[9px] top-[22px] bottom-0 w-px ${isCompleted ? "bg-foreground" : "bg-border"}`} />
                )}
                <div className="relative z-10 flex-shrink-0">
                  <button
                    onClick={(e) => toggleComplete(idx, e)}
                    className={`flex h-[20px] w-[20px] items-center justify-center rounded-full text-[9px] font-bold transition-all ${
                      isCompleted
                        ? "bg-foreground text-background"
                        : isActive
                          ? "bg-foreground text-background ring-2 ring-foreground/20"
                          : "bg-muted text-muted-foreground hover:bg-accent"
                    }`}
                    title={isCompleted ? "완료 취소" : "완료 표시"}
                  >
                    {isCompleted ? <CheckCircle className="h-2.5 w-2.5" /> : step.step}
                  </button>
                </div>
                <div className={`flex-1 ${isLast ? "pb-0" : "pb-3"}`}>
                  <button onClick={() => setActiveStep(isActive ? null : idx)} className="w-full text-left">
                    <div className="flex items-center flex-wrap gap-1">
                      <span className={`text-[11px] font-semibold ${isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}>{step.title}</span>
                      {diff && (
                        <span className={`text-[7px] font-medium rounded-full px-1 py-px ${diff.color}`}>{diff.label}</span>
                      )}
                      <span className="text-[8px] text-muted-foreground">{step.duration}</span>
                    </div>
                  </button>
                  {isActive && (
                    <div className="mt-1.5 space-y-1.5 animate-in slide-in-from-top-1 duration-200">
                      {step.why && (
                        <div className="flex gap-1.5 rounded-md bg-accent/50 px-2 py-1">
                          <Star className="h-2.5 w-2.5 shrink-0 mt-0.5 text-amber-500" />
                          <p className="text-[9px] text-foreground leading-relaxed">{step.why}</p>
                        </div>
                      )}
                      <p className="text-[10px] text-muted-foreground leading-relaxed">{step.description}</p>
                      {step.keyTopics && step.keyTopics.length > 0 && (
                        <div className="flex flex-wrap gap-0.5">
                          {step.keyTopics.map((topic, tIdx) => (
                            <span key={tIdx} className="text-[7px] rounded border border-border bg-muted/50 px-1 py-px text-muted-foreground">{topic}</span>
                          ))}
                        </div>
                      )}
                      {guideItem && (
                        <button
                          onClick={() => onSelectItem(guideItem)}
                          className="flex items-center gap-1 rounded-md border border-border bg-accent/50 px-2 py-1 text-[9px] font-medium text-foreground hover:bg-accent transition-colors"
                        >
                          <BookOpen className="h-2.5 w-2.5" />
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
      )}
    </div>
  )
}

function extractFloatingCodeText(children: React.ReactNode): string {
  if (typeof children === "string") return children
  if (typeof children === "number") return String(children)
  if (!children) return ""
  if (Array.isArray(children)) return children.map(extractFloatingCodeText).join("")
  if (typeof children === "object" && "props" in children) {
    return extractFloatingCodeText((children as React.ReactElement<{ children?: React.ReactNode }>).props.children)
  }
  return ""
}

function FloatingChatPanel({
  chatId,
  username,
  initialMessages,
  model,
  track,
  onSelectItem,
  onExpandToHome,
}: {
  chatId: string
  username: string
  initialMessages: UIMessage[]
  model?: string
  track?: string
  onSelectItem: (item: GuideItem) => void
  onExpandToHome: () => void
  onTitleGenerated?: (chatId: string, title: string) => void
}) {
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const titleGeneratedRef = useRef(false)

  // Normalize Firebase messages on mount (stable)
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
        id: m.id || `msg-f-${idx}`,
        role: m.role as "user" | "assistant",
        content: text,
        parts: [{ type: "text" as const, text }],
        createdAt: m.createdAt ? new Date(m.createdAt) : new Date(),
      } as UIMessage
    })
  })

  const [mountId] = useState(() => Date.now())
  const { messages, setMessages, sendMessage, status } = useChat({
    id: `floating-${chatId}-${mountId}`,
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

  const floatingChatColName = `chats-${track || "local-problem"}`

  // Force inject if useChat didn't pick up initialMessages
  const injectedRef = useRef(false)
  useEffect(() => {
    if (!injectedRef.current && normalizedInit.length > 0 && messages.length === 0) {
      setMessages(normalizedInit)
      injectedRef.current = true
    }
  }, [normalizedInit, messages.length, setMessages])

  const isLoading = status === "streaming" || status === "submitted"

  // Save messages to Firebase
  const saveMessages = useCallback(
    async (msgs: UIMessage[]) => {
      if (!username || msgs.length === 0) return
      try {
        const chatDocRef = doc(db, "users", username, floatingChatColName, chatId)
        await setDoc(chatDocRef, {
          messages: JSON.parse(JSON.stringify(msgs)),
          updatedAt: Timestamp.now(),
        }, { merge: true })
      } catch {
        // silent
      }
    },
    [username, chatId]
  )

  // Auto-generate title after first assistant response
  const generateTitle = useCallback(
    async (msgs: UIMessage[]) => {
      if (titleGeneratedRef.current || !username || msgs.length < 2) return
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
            const chatDocRef = doc(db, "users", username, floatingChatColName, chatId)
            await setDoc(chatDocRef, { title }, { merge: true })
            onTitleGenerated?.(chatId, title)
          }
        }
      } catch {
        // silent
      }
    },
    [username, chatId, floatingChatColName, onTitleGenerated]
  )

  useEffect(() => {
    if (status === "ready" && messages.length > 0) {
      saveMessages(messages)
      generateTitle(messages)
    }
  }, [messages, status, saveMessages, generateTitle])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    sendMessage({ text: input })
    setInput("")
  }

  return (
    <div className="flex flex-col h-[570px]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {messages.length === 0 && normalizedInit.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-xs text-muted-foreground">메시지를 입력하세요</p>
          </div>
        ) : (
          <>
            {(messages.length > 0 ? messages : normalizedInit).map((msg, idx) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const msgAny = msg as any
              const textContent = msgAny.content ||
                (msgAny.parts || [])
                  .map((p: Record<string, unknown>) => (typeof p.text === "string" ? p.text : ""))
                  .join("") || ""
              return (
                <div
                  key={msg.id || idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 ${
                      msg.role === "user"
                        ? "bg-foreground text-background"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <span className="text-xs leading-relaxed">{textContent}</span>
                    ) : (
                      <div className="text-xs leading-relaxed">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
                            strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                            ul: ({ children }) => <ul className="mb-1 pl-3">{children}</ul>,
                            ol: ({ children }) => <ol className="mb-1 pl-3 list-decimal">{children}</ol>,
                            li: ({ children }) => <li className="list-disc mb-0.5">{children}</li>,
                            code: ({ children }) => (
                              <code className="rounded bg-background/50 px-1 py-0.5 text-[10px] font-mono">{children}</code>
                            ),
                            pre: ({ children }) => {
                              const codeText = extractFloatingCodeText(children)
                              return (
                                <div className="relative mb-1.5 rounded-md bg-background/50 border border-border/30 overflow-hidden">
                                  <div className="flex items-center justify-between px-2 py-1 border-b border-border/20 bg-background/30">
                                    <span className="text-[9px] text-muted-foreground font-medium">{"v0 프롬프트"}</span>
                                    <button
                                      onClick={() => { navigator.clipboard.writeText(codeText) }}
                                      className="text-[9px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-0.5"
                                    >
                                      <Copy className="h-2.5 w-2.5" />{"복사"}
                                    </button>
                                  </div>
                                  <pre className="p-2 overflow-x-auto text-[10px]">{children}</pre>
                                </div>
                              )
                            },
                          }}
                        >
                          {stripGuideMarkersFloating(textContent)}
                        </ReactMarkdown>
                        {parseFloatingLearningPaths(textContent).map((path, pathIdx) => (
                          <FloatingLearningPathCard key={pathIdx} data={path} onSelectItem={onSelectItem} />
                        ))}
                        {/* Streaming: learning-path 생성 중 로딩 표시 */}
                        {isLoading &&
                          textContent.includes("[[learning-path:") &&
                          !textContent.match(/\[\[learning-path:\s*[\s\S]*?\]\]/) && (
                            <div className="my-2 flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                              <div className="flex h-5 w-5 items-center justify-center rounded-md bg-foreground text-background">
                                <Rocket className="h-2.5 w-2.5 animate-pulse" />
                              </div>
                              <span className="text-[10px] font-medium text-foreground">{"학습경로 생성중"}</span>
                              <div className="flex gap-0.5">
                                <div className="h-1 w-1 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
                                <div className="h-1 w-1 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
                                <div className="h-1 w-1 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
                              </div>
                            </div>
                          )}
                        <FloatingGuideLinks text={textContent} onSelectItem={onSelectItem} />
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
            {isLoading && (messages.length > 0 ? messages : normalizedInit)[(messages.length > 0 ? messages : normalizedInit).length - 1]?.role === "user" && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-xl bg-muted px-3 py-2">
                  <div className="h-1 w-1 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
                  <div className="h-1 w-1 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
                  <div className="h-1 w-1 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Expand button */}
      <button
        onClick={onExpandToHome}
        className="mx-3 mb-2 flex items-center justify-center gap-1.5 rounded-lg border border-border py-1.5 text-[10px] text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
      >
        <Maximize2 className="h-2.5 w-2.5" />
        큰 화면에서 이어서 대화하기
      </button>

      {/* Input */}
      <div className="border-t border-border p-2.5">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="메시지 입력..."
            className="flex-1 h-9 rounded-lg border border-border bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/10"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-foreground text-background transition-all hover:opacity-90 disabled:opacity-30"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  )
}
