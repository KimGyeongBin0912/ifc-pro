"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { db } from "@/lib/firebase"
import {
  collection,
  addDoc,
  getDocsFromServer,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
  Timestamp,
  orderBy,
  query,
  updateDoc,
  setDoc,
  onSnapshot,
} from "firebase/firestore"
import {
  ArrowLeft,
  Copy,
  Plus,
  Trash2,
  Check,
  Lock,
  Clock,
  Key,
  Users,
  MessageCircle,
  Eye,
  Ban,
  CheckCircle,
  ChevronLeft,
  Coins,
  Circle,
  Search,
  X,
  BarChart3,
  Calendar,
  DollarSign,
  Activity,
} from "lucide-react"
import Link from "next/link"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

const ADMIN_PASSWORD = "growink2026!"
const TRACK_COLLECTIONS = ["chats-local-problem", "chats-startup", "chats-shopping", "chats"]

// ─── Types ───
interface AuthCode {
  id: string
  code: string
  createdAt: Timestamp
  expiresAt: Timestamp
  isActive: boolean
  validHours: number
  track?: "local-problem" | "startup" | "shopping"
  eduName?: string
  eduDate?: string
  eduTime?: string
}

interface UserData {
  id: string
  username: string
  password: string
  createdAt: Timestamp
  lastLoginAt: Timestamp
  isOnline: boolean
  isSuspended: boolean
  chatCount?: number
  totalTokens?: number
}

interface ChatData {
  id: string
  messages: Array<{ role: string; content: string; parts?: Array<{ type: string; text?: string }> }>
  updatedAt: Timestamp
  track?: string
  title?: string
}

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let result = ""
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// ─── Admin Login ───
function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem("v0-admin-auth", "true")
      onLogin()
    } else {
      setError("비밀번호가 올바르지 않습니다.")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm px-6">
        <div className="flex flex-col items-center gap-8">
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground">
              <Lock className="h-5 w-5 text-background" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Admin
            </h1>
            <p className="text-sm text-muted-foreground">
              관리자 비밀번호를 입력하세요.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError("")
              }}
              placeholder="비밀번호"
              className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/10 transition-all"
              autoFocus
            />
            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}
            <button
              type="submit"
              className="flex h-12 items-center justify-center rounded-xl bg-foreground text-sm font-medium text-background transition-all hover:opacity-90"
            >
              로그인
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

// ─── Helper Functions ───
function formatDate(ts: Timestamp) {
  return ts.toDate().toLocaleString("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatDateFull(ts: Timestamp) {
  return ts.toDate().toLocaleString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getRemainingTime(expiresAt: Timestamp) {
  const diff = expiresAt.toMillis() - Timestamp.now().toMillis()
  if (diff <= 0) return "만료됨"
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  if (hours > 0) return `${hours}시간 ${minutes}분 남음`
  return `${minutes}분 남음`
}

function isExpired(expiresAt: Timestamp) {
  return expiresAt.toMillis() < Timestamp.now().toMillis()
}

function getMessageText(msg: ChatData["messages"][0]): string {
  if (msg.parts) {
    const textPart = msg.parts.find((p) => p.type === "text" && p.text)
    if (textPart?.text) return textPart.text
  }
  if (typeof msg.content === "string") return msg.content
  return ""
}

// ─── Auth Codes Tab ───
function AuthCodesTab() {
  const [codes, setCodes] = useState<AuthCode[]>([])
  const [validHours, setValidHours] = useState(24)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [fetchError, setFetchError] = useState("")
  const [generateError, setGenerateError] = useState("")
  const [selectedTrack, setSelectedTrack] = useState<"local-problem" | "startup" | "shopping">("local-problem")
  const [eduName, setEduName] = useState("")
  const [eduDate, setEduDate] = useState("")
  const [eduTime, setEduTime] = useState("")

  const fetchCodes = useCallback(async () => {
    try {
      const codesRef = collection(db, "auth-codes")
      const q = query(codesRef, orderBy("createdAt", "desc"))
      const snapshot = await getDocsFromServer(q)
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as AuthCode[]
      setCodes(data)
      setFetchError("")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      setFetchError(`Firestore 오류: ${message}`)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCodes()
  }, [fetchCodes])

  const handleGenerate = async () => {
    setGenerating(true)
    setGenerateError("")
    // 필수 입력 검증
    if (!eduName.trim()) {
      setGenerateError("교육명을 입력하세요.")
      setGenerating(false)
      return
    }
    if (!eduDate.trim()) {
      setGenerateError("교육 날짜를 입력하세요.")
      setGenerating(false)
      return
    }
    if (!eduTime.trim()) {
      setGenerateError("교육 시간을 입력하세요.")
      setGenerating(false)
      return
    }

    try {
      const code = generateCode()
      const now = Timestamp.now()
      const expiresAt = Timestamp.fromMillis(
        now.toMillis() + validHours * 60 * 60 * 1000
      )
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const docData: Record<string, any> = {
        code,
        createdAt: now,
        expiresAt,
        isActive: true,
        validHours,
        track: selectedTrack,
        eduName: eduName.trim(),
        eduDate: eduDate.trim(),
        eduTime: eduTime.trim(),
      }
      await addDoc(collection(db, "auth-codes"), docData)
      fetchCodes()
    } catch (err: unknown) {
      setGenerateError(`코드 생성 실패: ${(err as Error).message}`)
    } finally {
      setGenerating(false)
    }
  }

  const handleDelete = async (id: string) => {
    setCodes((prev) => prev.filter((c) => c.id !== id))
    try {
      await deleteDoc(doc(db, "auth-codes", id))
    } catch {
      fetchCodes()
    }
  }

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    setCodes((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !currentActive } : c))
    )
    try {
      await updateDoc(doc(db, "auth-codes", id), { isActive: !currentActive })
    } catch {
      setCodes((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isActive: currentActive } : c))
      )
    }
  }

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div>
      {/* Generate */}
      <div className="mb-8 rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">새 인증코드 생성</h3>
        <div className="mb-4">
          <label className="mb-1.5 block text-xs text-muted-foreground">트랙 선택</label>
          <div className="flex gap-2">
            {([
              { id: "local-problem" as const, label: "지역문제해결형", desc: "지역 사회 문제를 해결하는 서비스" },
              { id: "startup" as const, label: "창업 아이디어", desc: "창업 아이디어를 현실화" },
              { id: "shopping" as const, label: "쇼핑몰 제작", desc: "온라인 쇼핑몰 구축" },
            ]).map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTrack(t.id)}
                className={`flex-1 rounded-lg border px-3 py-2.5 text-left transition-all ${selectedTrack === t.id
                    ? "border-foreground bg-foreground/5"
                    : "border-border hover:bg-accent/50"
                  }`}
              >
                <p className={`text-xs font-semibold ${selectedTrack === t.id ? "text-foreground" : "text-muted-foreground"}`}>{t.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{t.desc}</p>
              </button>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <label className="mb-1.5 block text-xs text-muted-foreground">교육 정보 (코드 인증 시 표시됨)</label>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-muted-foreground">교육명</label>
              <input
                type="text"
                value={eduName}
                onChange={(e) => setEduName(e.target.value)}
                placeholder="예: v0 웹개발 워크숍"
                className="h-9 rounded-lg border border-border bg-background px-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/10"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-muted-foreground">교육 날짜</label>
              <input
                type="text"
                value={eduDate}
                onChange={(e) => setEduDate(e.target.value)}
                placeholder="예: 2026년 2월 20일"
                className="h-9 rounded-lg border border-border bg-background px-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/10"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-muted-foreground">교육 시간</label>
              <input
                type="text"
                value={eduTime}
                onChange={(e) => setEduTime(e.target.value)}
                placeholder="예: 14:00 ~ 17:00"
                className="h-9 rounded-lg border border-border bg-background px-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/10"
              />
            </div>
          </div>
        </div>
        <div className="flex items-end gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground">유효 시간</label>
            <select
              value={validHours}
              onChange={(e) => setValidHours(Number(e.target.value))}
              className="h-10 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/10"
            >
              <option value={1}>1시간</option>
              <option value={3}>3시간</option>
              <option value={6}>6시간</option>
              <option value={12}>12시간</option>
              <option value={24}>24시간</option>
              <option value={48}>48시간</option>
              <option value={72}>72시간</option>
              <option value={168}>1주일</option>
            </select>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex h-10 items-center gap-2 rounded-lg bg-foreground px-4 text-sm font-medium text-background hover:opacity-90 disabled:opacity-40 transition-all"
          >
            {generating ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
            ) : (
              <><Plus className="h-4 w-4" />생성</>
            )}
          </button>
        </div>
        {generateError && <p className="mt-3 text-sm text-destructive">{generateError}</p>}
      </div>

      {/* List */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">인증코드 목록</h3>
        <span className="text-xs text-muted-foreground">{codes.length}개</span>
      </div>

      {fetchError ? (
        <div className="flex flex-col items-center py-16 gap-3">
          <p className="text-sm text-destructive text-center">{fetchError}</p>
          <button onClick={() => { setLoading(true); setFetchError(""); fetchCodes() }} className="text-xs text-muted-foreground hover:text-foreground underline">다시 시도</button>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
        </div>
      ) : codes.length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-3">
          <Key className="h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">생성된 인증코드가 없습니다.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {codes.map((item) => {
            const expired = isExpired(item.expiresAt)
            return (
              <div key={item.id} className={`flex items-center justify-between rounded-xl border border-border p-4 ${!item.isActive || expired ? "opacity-50" : ""}`}>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-3">
                    <code className="text-sm font-mono font-semibold tracking-wider">{item.code}</code>
                    {item.track && (
                      <span className={`text-[10px] font-medium rounded-full px-2 py-0.5 ${item.track === "local-problem" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                          : item.track === "startup" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
                        }`}>
                        {item.track === "local-problem" ? "지역문제" : item.track === "startup" ? "창업" : "쇼핑몰"}
                      </span>
                    )}
                    {item.eduName && (
                      <span className="text-[10px] text-muted-foreground">{item.eduName}</span>
                    )}
                    <button onClick={() => handleCopy(item.code, item.id)} className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                      {copiedId === item.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDate(item.createdAt)}</span>
                    <span className={expired ? "text-destructive" : ""}>{getRemainingTime(item.expiresAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleToggleActive(item.id, item.isActive)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${item.isActive ? "bg-foreground/5 text-foreground hover:bg-foreground/10" : "bg-muted text-muted-foreground hover:bg-accent"}`}>
                    {item.isActive ? "활성" : "비활성"}
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── User Detail View ───
function UserDetailView({
  user,
  onBack,
}: {
  user: UserData
  onBack: () => void
}) {
  const [chats, setChats] = useState<ChatData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedChat, setSelectedChat] = useState<ChatData | null>(null)

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const allChats: ChatData[] = []
        for (const col of TRACK_COLLECTIONS) {
          const chatsRef = collection(db, "users", user.username, col)
          const snapshot = await getDocs(chatsRef)
          snapshot.docs.forEach((d) => {
            const raw = d.data()
            allChats.push({
              id: d.id,
              track: col === "chats" ? "legacy" : col.replace("chats-", ""),
              ...raw,
            } as ChatData)
          })
        }
        allChats.sort((a, b) => (b.updatedAt?.toMillis() || 0) - (a.updatedAt?.toMillis() || 0))
        setChats(allChats)
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchChats()
  }, [user.username])

  if (selectedChat) {
    return (
      <div>
        <button
          onClick={() => setSelectedChat(null)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          대화 목록으로
        </button>

        <div className="flex items-center gap-2 mb-4">
          <span className={`text-[9px] font-medium rounded-full px-1.5 py-0.5 ${selectedChat.track === "local-problem" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
              : selectedChat.track === "startup" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                : selectedChat.track === "shopping" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
                  : "bg-muted text-muted-foreground"
            }`}>
            {selectedChat.track === "local-problem" ? "지역문제" : selectedChat.track === "startup" ? "창업" : selectedChat.track === "shopping" ? "쇼핑몰" : "기존"}
          </span>
          <h3 className="text-sm font-semibold">
            대화 내용 ({selectedChat.messages?.length || 0}개 메시지)
          </h3>
        </div>

        <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto rounded-xl border border-border p-4">
          {selectedChat.messages?.map((msg, i) => (
            <div
              key={i}
              className={`flex flex-col gap-1 rounded-lg p-3 text-sm ${msg.role === "user"
                  ? "bg-foreground/5 ml-8"
                  : "bg-muted/50 mr-8"
                }`}
            >
              <span className="text-[10px] font-medium text-muted-foreground uppercase">
                {msg.role === "user" ? "사용자" : "AI"}
              </span>
              <div className="prose prose-xs max-w-none text-foreground [&_p]:text-xs [&_p]:leading-relaxed [&_p]:my-1 [&_h1]:text-sm [&_h2]:text-xs [&_h3]:text-xs [&_li]:text-xs [&_code]:text-[10px] [&_pre]:text-[10px] [&_pre]:bg-muted [&_pre]:p-2 [&_pre]:rounded [&_blockquote]:text-xs [&_blockquote]:border-l-2 [&_blockquote]:pl-2 [&_table]:text-[10px]">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {getMessageText(msg).slice(0, 2000)}
                </ReactMarkdown>
                {getMessageText(msg).length > 2000 && <p className="text-[10px] text-muted-foreground mt-1">...(생략됨)</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        사용자 목록으로
      </button>

      {/* User Info Card */}
      <div className="rounded-xl border border-border p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground/10 text-sm font-semibold">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold">{user.username}</h3>
                <span className={`flex items-center gap-1 text-[10px] ${user.isOnline ? "text-green-600" : "text-muted-foreground"}`}>
                  <Circle className={`h-2 w-2 ${user.isOnline ? "fill-green-600" : "fill-muted-foreground"}`} />
                  {user.isOnline ? "접속 중" : "오프라인"}
                </span>
                {user.isSuspended && (
                  <span className="text-[10px] text-destructive font-medium">정지됨</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                가입: {user.createdAt ? formatDateFull(user.createdAt) : "-"}
              </p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-[10px] text-muted-foreground mb-1">마지막 접속</p>
            <p className="text-xs font-medium">{user.lastLoginAt ? formatDateFull(user.lastLoginAt) : "-"}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-[10px] text-muted-foreground mb-1">총 대화 / 메시지</p>
            <p className="text-xs font-medium">{chats.length}개 / {chats.reduce((sum, c) => sum + (c.messages?.length || 0), 0)}개</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[
            { key: "local-problem", label: "지역문제", color: "text-emerald-600" },
            { key: "startup", label: "창업", color: "text-amber-600" },
            { key: "shopping", label: "쇼핑몰", color: "text-blue-600" },
            { key: "legacy", label: "기존", color: "text-muted-foreground" },
          ].map((t) => {
            const count = chats.filter((c) => c.track === t.key).length
            return (
              <div key={t.key} className="rounded-lg bg-muted/30 p-2 text-center">
                <p className={`text-[10px] ${t.color} mb-0.5`}>{t.label}</p>
                <p className="text-xs font-semibold">{count}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Chat History List */}
      <h3 className="text-sm font-semibold mb-3">대화 기록 ({chats.length}개)</h3>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
        </div>
      ) : chats.length === 0 ? (
        <div className="flex flex-col items-center py-12 gap-2">
          <MessageCircle className="h-6 w-6 text-muted-foreground/40" />
          <p className="text-xs text-muted-foreground">대화 기록이 없습니다.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {chats.map((chat) => {
            const firstUserMsg = chat.messages?.find((m) => m.role === "user")
            const preview = firstUserMsg ? getMessageText(firstUserMsg).slice(0, 80) : "대화"
            return (
              <button
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className="flex items-center justify-between rounded-xl border border-border p-4 text-left hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[9px] font-medium rounded-full px-1.5 py-0.5 shrink-0 ${chat.track === "local-problem" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                        : chat.track === "startup" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                          : chat.track === "shopping" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
                            : "bg-muted text-muted-foreground"
                      }`}>
                      {chat.track === "local-problem" ? "지역문제" : chat.track === "startup" ? "창업" : chat.track === "shopping" ? "쇼핑몰" : "기존"}
                    </span>
                    <p className="text-sm font-medium truncate">{chat.title || preview || "대화"}</p>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span>{chat.messages?.length || 0}개 메시지</span>
                    <span>{chat.updatedAt ? formatDate(chat.updatedAt) : "-"}</span>
                  </div>
                </div>
                <Eye className="h-4 w-4 text-muted-foreground shrink-0 ml-3" />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Users Tab ───
function UsersTab() {
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [actionLoading, setActionLoading] = useState(false)

  // Real-time user list via onSnapshot
  useEffect(() => {
    const usersRef = collection(db, "users")
    const unsub = onSnapshot(usersRef, async (snapshot) => {
      // Fetch api-usage in parallel with user chat counts
      const usagePromise = getDocs(collection(db, "api-usage"))
        .then((snap) => snap.docs.map((d) => d.data() as { username?: string; totalTokens?: number }))
        .catch(() => [] as Array<{ username?: string; totalTokens?: number }>)

      // Fetch all user chat counts in parallel
      const userPromises = snapshot.docs.map(async (d) => {
        const userData = d.data()
        let chatCount = 0
        try {
          const chatCounts = await Promise.all(
            TRACK_COLLECTIONS.map((col) =>
              getDocs(collection(db, "users", d.id, col)).then((s) => s.size)
            )
          )
          chatCount = chatCounts.reduce((sum, c) => sum + c, 0)
        } catch { /* ignore */ }
        return { docId: d.id, userData, chatCount }
      })

      const [usageLogs, userResults] = await Promise.all([usagePromise, Promise.all(userPromises)])

      const data: UserData[] = userResults.map(({ docId, userData, chatCount }) => {
        const uname = userData.username || docId
        const userTokens = usageLogs
          .filter((l) => l.username === uname)
          .reduce((sum, l) => sum + (l.totalTokens || 0), 0)
        return {
          id: docId,
          username: uname,
          password: userData.password || "",
          createdAt: userData.createdAt,
          lastLoginAt: userData.lastLoginAt,
          isOnline: userData.isOnline || false,
          isSuspended: userData.isSuspended || false,
          chatCount,
          totalTokens: userTokens,
        }
      })

      data.sort((a, b) => (b.lastLoginAt?.toMillis() || 0) - (a.lastLoginAt?.toMillis() || 0))
      setUsers(data)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  // onSnapshot handles real-time updates; fetchUsers is kept as noop for call sites
  const fetchUsers = useCallback(() => { }, [])

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredUsers.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredUsers.map((u) => u.id)))
    }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`${selectedIds.size}명의 사용자를 삭제하시겠습니까? 대화 기록도 함께 삭제됩니다.`)) return
    setActionLoading(true)
    try {
      for (const id of selectedIds) {
        // Delete user chats across all track collections
        for (const col of TRACK_COLLECTIONS) {
          const chatsRef = collection(db, "users", id, col)
          const chatsSnap = await getDocs(chatsRef)
          for (const chatDoc of chatsSnap.docs) {
            await deleteDoc(doc(db, "users", id, col, chatDoc.id))
          }
        }
        // Delete user
        await deleteDoc(doc(db, "users", id))
      }
      setSelectedIds(new Set())
      fetchUsers()
    } catch {
      // silently fail
    } finally {
      setActionLoading(false)
    }
  }

  const handleBulkSuspend = async (suspend: boolean) => {
    setActionLoading(true)
    try {
      for (const id of selectedIds) {
        await updateDoc(doc(db, "users", id), { isSuspended: suspend })
      }
      setSelectedIds(new Set())
      fetchUsers()
    } catch {
      // silently fail
    } finally {
      setActionLoading(false)
    }
  }

  const handleSingleSuspend = async (userId: string, suspend: boolean) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isSuspended: suspend } : u))
    )
    try {
      await updateDoc(doc(db, "users", userId), { isSuspended: suspend })
    } catch {
      fetchUsers()
    }
  }

  const handleSingleDelete = async (userId: string) => {
    if (!confirm("이 사용자를 삭제하시겠습니까?")) return
    setUsers((prev) => prev.filter((u) => u.id !== userId))
    try {
      for (const col of TRACK_COLLECTIONS) {
        const chatsRef = collection(db, "users", userId, col)
        const chatsSnap = await getDocs(chatsRef)
        for (const chatDoc of chatsSnap.docs) {
          await deleteDoc(doc(db, "users", userId, col, chatDoc.id))
        }
      }
      await deleteDoc(doc(db, "users", userId))
    } catch {
      fetchUsers()
    }
  }

  if (selectedUser) {
    return <UserDetailView user={selectedUser} onBack={() => { setSelectedUser(null); fetchUsers() }} />
  }

  return (
    <div>
      {/* Search + Bulk Actions */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="사용자 검색..."
            className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/10"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-4 py-2.5">
            <span className="text-xs font-medium text-foreground">{selectedIds.size}명 선택</span>
            <div className="flex-1" />
            <button
              onClick={() => handleBulkSuspend(true)}
              disabled={actionLoading}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-foreground bg-background border border-border hover:bg-accent transition-colors disabled:opacity-40"
            >
              <Ban className="h-3 w-3" />정지
            </button>
            <button
              onClick={() => handleBulkSuspend(false)}
              disabled={actionLoading}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-foreground bg-background border border-border hover:bg-accent transition-colors disabled:opacity-40"
            >
              <CheckCircle className="h-3 w-3" />정지 해제
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={actionLoading}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-destructive bg-background border border-destructive/30 hover:bg-destructive/10 transition-colors disabled:opacity-40"
            >
              <Trash2 className="h-3 w-3" />삭제
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl border border-border p-4">
          <p className="text-[10px] text-muted-foreground mb-1">전체 사용자</p>
          <p className="text-lg font-semibold">{users.length}</p>
        </div>
        <div className="rounded-xl border border-border p-4">
          <p className="text-[10px] text-muted-foreground mb-1">현재 접속 중</p>
          <p className="text-lg font-semibold text-green-600">{users.filter((u) => u.isOnline).length}</p>
        </div>
        <div className="rounded-xl border border-border p-4">
          <p className="text-[10px] text-muted-foreground mb-1">정지됨</p>
          <p className="text-lg font-semibold text-destructive">{users.filter((u) => u.isSuspended).length}</p>
        </div>
      </div>

      {/* User List */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold">사용자 목록</h3>
          <button
            onClick={toggleSelectAll}
            className="text-[10px] text-muted-foreground hover:text-foreground underline transition-colors"
          >
            {selectedIds.size === filteredUsers.length ? "선택 해제" : "전체 선택"}
          </button>
        </div>
        <button
          onClick={() => { setLoading(true); fetchUsers() }}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          새로고침
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-2">
          <Users className="h-6 w-6 text-muted-foreground/40" />
          <p className="text-xs text-muted-foreground">
            {searchQuery ? "검색 결과가 없습니다." : "등록된 사용자가 없습니다."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className={`flex items-center gap-3 rounded-xl border p-4 transition-colors ${selectedIds.has(user.id) ? "border-foreground/30 bg-foreground/5" : "border-border"
                } ${user.isSuspended ? "opacity-60" : ""}`}
            >
              {/* Checkbox */}
              <button
                onClick={() => toggleSelect(user.id)}
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${selectedIds.has(user.id)
                    ? "border-foreground bg-foreground text-background"
                    : "border-border hover:border-foreground/50"
                  }`}
              >
                {selectedIds.has(user.id) && <Check className="h-3 w-3" />}
              </button>

              {/* User info */}
              <button
                onClick={() => setSelectedUser(user)}
                className="flex flex-1 items-center gap-3 text-left min-w-0"
              >
                <div className="relative">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground/10 text-xs font-semibold">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${user.isOnline ? "bg-green-500" : "bg-muted-foreground/30"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{user.username}</p>
                    {user.isSuspended && (
                      <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-[9px] font-medium text-destructive">정지</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span>{user.lastLoginAt ? formatDate(user.lastLoginAt) : "-"}</span>
                    <span className="flex items-center gap-1"><MessageCircle className="h-2.5 w-2.5" />{user.chatCount || 0}</span>
                    <span className="flex items-center gap-1"><Coins className="h-2.5 w-2.5" />{(user.totalTokens || 0).toLocaleString()} tok</span>
                  </div>
                </div>
              </button>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setSelectedUser(user)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  title="상세 보기"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleSingleSuspend(user.id, !user.isSuspended)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${user.isSuspended
                      ? "text-green-600 hover:bg-green-50"
                      : "text-muted-foreground hover:bg-orange-50 hover:text-orange-600"
                    }`}
                  title={user.isSuspended ? "정지 해제" : "정지"}
                >
                  {user.isSuspended ? <CheckCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => handleSingleDelete(user.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                  title="삭제"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Usage Tab ───
interface UsageLog {
  id: string
  timestamp: Timestamp
  model: string
  promptTokens: number
  completionTokens: number
  totalTokens: number
  messageCount: number
  username?: string
}

// Slot machine number animation component
function SlotNumber({ value, prefix = "", suffix = "", className = "" }: { value: string; prefix?: string; suffix?: string; className?: string }) {
  const [displayChars, setDisplayChars] = useState<{ char: string; key: number }[]>([])
  const keyCounter = useRef(0)
  const prevValueRef = useRef("")

  useEffect(() => {
    if (value === prevValueRef.current) return
    prevValueRef.current = value
    const chars = value.split("").map((char) => ({
      char,
      key: ++keyCounter.current,
    }))
    setDisplayChars(chars)
  }, [value])

  return (
    <span className={`inline-flex items-baseline ${className}`}>
      {prefix && <span>{prefix}</span>}
      <span className="inline-flex overflow-hidden">
        {displayChars.map(({ char, key }, i) => (
          <span
            key={key}
            className="inline-block animate-slot-roll"
            style={{
              minWidth: char === "," ? "0.35em" : char === "." ? "0.3em" : "0.6em",
              textAlign: "center",
              animationDelay: `${i * 30}ms`,
              opacity: 0,
            }}
          >
            {char}
          </span>
        ))}
      </span>
      {suffix && <span>{suffix}</span>}
    </span>
  )
}

// gpt-4o-mini pricing: $0.15/1M input, $0.60/1M output
const COST_PER_1K_INPUT = 0.00015
const COST_PER_1K_OUTPUT = 0.0006

function UsageTab() {
  const [logs, setLogs] = useState<UsageLog[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<"today" | "7d" | "30d" | "all">("today")

  useEffect(() => {
    const logsRef = collection(db, "api-usage")
    const q = query(logsRef, orderBy("timestamp", "desc"))
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as UsageLog[]
      setLogs(data)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  // Filter by date range
  const now = Date.now()
  const filteredLogs = logs.filter((log) => {
    const ts = log.timestamp?.toMillis?.() || 0
    if (dateRange === "today") return now - ts < 24 * 60 * 60 * 1000
    if (dateRange === "7d") return now - ts < 7 * 24 * 60 * 60 * 1000
    if (dateRange === "30d") return now - ts < 30 * 24 * 60 * 60 * 1000
    return true
  })

  const totalCalls = filteredLogs.length
  const totalPromptTokens = filteredLogs.reduce((sum, l) => sum + (l.promptTokens || 0), 0)
  const totalCompletionTokens = filteredLogs.reduce((sum, l) => sum + (l.completionTokens || 0), 0)
  const totalTokens = totalPromptTokens + totalCompletionTokens
  const estimatedCost = (totalPromptTokens / 1000) * COST_PER_1K_INPUT + (totalCompletionTokens / 1000) * COST_PER_1K_OUTPUT

  // Group by hour for chart
  const hourlyData: Record<string, { calls: number; tokens: number; cost: number }> = {}
  filteredLogs.forEach((log) => {
    const date = log.timestamp?.toDate?.()
    if (!date) return
    const key = dateRange === "today"
      ? `${date.getHours()}시`
      : `${date.getMonth() + 1}/${date.getDate()}`
    if (!hourlyData[key]) hourlyData[key] = { calls: 0, tokens: 0, cost: 0 }
    hourlyData[key].calls += 1
    hourlyData[key].tokens += log.totalTokens || 0
    hourlyData[key].cost += ((log.promptTokens || 0) / 1000) * COST_PER_1K_INPUT + ((log.completionTokens || 0) / 1000) * COST_PER_1K_OUTPUT
  })

  const chartData = Object.entries(hourlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-24)

  const maxCalls = Math.max(...chartData.map(([, v]) => v.calls), 1)

  return (
    <div>
      {/* Date range selector */}
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        {(["today", "7d", "30d", "all"] as const).map((range) => (
          <button
            key={range}
            onClick={() => setDateRange(range)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${dateRange === range
                ? "bg-foreground text-background"
                : "bg-muted/50 text-muted-foreground hover:text-foreground"
              }`}
          >
            {range === "today" ? "오늘" : range === "7d" ? "7일" : range === "30d" ? "30일" : "전체"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-4">
            <div className="rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-[10px] text-muted-foreground">API 호출</p>
              </div>
              <SlotNumber value={totalCalls.toLocaleString()} className="text-xl font-bold" />
            </div>
            <div className="rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <Coins className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-[10px] text-muted-foreground">총 토큰</p>
              </div>
              <SlotNumber value={totalTokens.toLocaleString()} className="text-xl font-bold" />
              <p className="text-[9px] text-muted-foreground mt-1">
                {'입력 '}<SlotNumber value={totalPromptTokens.toLocaleString()} className="text-[9px]" />{' / 출력 '}<SlotNumber value={totalCompletionTokens.toLocaleString()} className="text-[9px]" />
              </p>
            </div>
            <div className="rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-[10px] text-muted-foreground">예상 비용</p>
              </div>
              <SlotNumber value={estimatedCost < 0.001 ? estimatedCost.toFixed(6) : estimatedCost.toFixed(4)} prefix="$" className="text-xl font-bold" />
              <p className="text-[9px] text-muted-foreground mt-1">
                {'~'}<SlotNumber value={estimatedCost * 1400 < 1 ? (estimatedCost * 1400).toFixed(2) : Math.round(estimatedCost * 1400).toLocaleString()} className="text-[9px]" suffix="원" />
              </p>
            </div>
            <div className="rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-[10px] text-muted-foreground">평균 토큰/호출</p>
              </div>
              <SlotNumber value={totalCalls > 0 ? Math.round(totalTokens / totalCalls).toLocaleString() : "0"} className="text-xl font-bold" />
            </div>
          </div>

          {/* Bar chart */}
          <div className="rounded-xl border border-border p-5 mb-6">
            <h3 className="text-sm font-semibold mb-4">
              {dateRange === "today" ? "시간대별" : "일별"} API 호출
            </h3>
            {chartData.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-xs text-muted-foreground">데이터가 없습니다.</p>
              </div>
            ) : (
              <div className="flex items-end gap-1 h-[160px]">
                {chartData.map(([label, data]) => (
                  <div key={label} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                    <span className="text-[8px] text-muted-foreground">{data.calls}</span>
                    <div
                      className="w-full rounded-t bg-foreground/80 transition-all min-h-[2px]"
                      style={{ height: `${(data.calls / maxCalls) * 130}px` }}
                    />
                    <span className="text-[7px] text-muted-foreground truncate w-full text-center">{label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent logs table */}
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <h3 className="text-sm font-semibold">최근 호출 로그</h3>
              <span className="text-[10px] text-muted-foreground">{filteredLogs.length}건</span>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {filteredLogs.slice(0, 50).map((log) => (
                <div key={log.id} className="flex items-center justify-between px-5 py-2.5 border-b border-border/50 last:border-b-0">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-muted-foreground w-[100px]">
                      {log.timestamp?.toDate?.().toLocaleString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) || "-"}
                    </span>
                    <span className="text-[10px] font-medium w-[60px] truncate">{log.username || "-"}</span>
                    <span className="text-[10px] font-mono text-muted-foreground">{log.model}</span>
                  </div>
                  <div className="flex items-center gap-4 text-[10px]">
                    <span className="text-muted-foreground"><SlotNumber value={(log.totalTokens || 0).toLocaleString()} suffix=" tok" className="text-inherit" /></span>
                    <span className="font-medium">${(((log.promptTokens || 0) / 1000) * COST_PER_1K_INPUT + ((log.completionTokens || 0) / 1000) * COST_PER_1K_OUTPUT).toFixed(4)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Admin Dashboard ───
function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"codes" | "users" | "usage">("users")

  const tabs = [
    { id: "users" as const, label: "사용자 관리", icon: Users },
    { id: "codes" as const, label: "인증코드", icon: Key },
    { id: "usage" as const, label: "API 사용량", icon: BarChart3 },
  ]

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>돌아가기</span>
          </Link>
          <h1 className="text-sm font-semibold text-foreground">Admin</h1>
          <div className="w-20" />
        </div>
      </header>

      {/* Tabs */}
      <div className="mx-auto max-w-4xl px-6">
        <div className="flex gap-1 border-b border-border pt-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === tab.id
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-6 py-8">
        {activeTab === "codes" && <AuthCodesTab />}
        {activeTab === "users" && <UsersTab />}
        {activeTab === "usage" && <UsageTab />}
      </main>
    </div>
  )
}

// ─── Main Export ───
export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    const auth = sessionStorage.getItem("v0-admin-auth")
    if (auth === "true") setAuthenticated(true)
  }, [])

  if (!authenticated) {
    return <AdminLogin onLogin={() => setAuthenticated(true)} />
  }

  return <AdminDashboard />
}
