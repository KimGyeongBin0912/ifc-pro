"use client"

import { useState, useRef, useEffect } from "react"
import { db } from "@/lib/firebase"
import {
  collection,
  query,
  where,
  getDocsFromServer,
  setDoc,
  getDoc,
  doc,
  Timestamp,
} from "firebase/firestore"
import { ArrowRight, Lock, Loader2, User, Eye, EyeOff, CheckCircle2, Shield } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface AuthGateProps {
  onAuthenticated: (username: string) => void
}

type Step = "select" | "form"
type UserType = "new" | "existing"

export function AuthGate({ onAuthenticated }: AuthGateProps) {
  const [step, setStep] = useState<Step>("select")
  const [userType, setUserType] = useState<UserType>("new")

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [code, setCode] = useState("")

  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)

  const [error, setError] = useState("")
  const [usernameChecked, setUsernameChecked] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState(false)
  const [checking, setChecking] = useState(false)
  const [loading, setLoading] = useState(false)
  const [codeChecking, setCodeChecking] = useState(false)
  const [codeVerified, setCodeVerified] = useState(false)
  const [eduInfo, setEduInfo] = useState<{ eduName?: string; eduDate?: string; eduTime?: string; track?: string } | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [eduExpanding, setEduExpanding] = useState(false)
  const [welcomeText, setWelcomeText] = useState("")
  const [showWelcome, setShowWelcome] = useState(false)
  const eduCardRef = useRef<HTMLDivElement>(null)
  const [eduCardRect, setEduCardRect] = useState<DOMRect | null>(null)
  const submitClickRef = useRef<React.MouseEvent | null>(null)

  // New user: check username duplicate
  const handleCheckUsername = async () => {
    const name = username.trim()
    if (!name) {
      setError("사용자명을 입력하세요.")
      return
    }
    if (name.length < 2) {
      setError("사용자명은 2글자 이상이어야 합니다.")
      return
    }

    setChecking(true)
    setError("")

    try {
      const userDocRef = doc(db, "users", name)
      const userDoc = await getDoc(userDocRef)

      setUsernameChecked(true)
      if (userDoc.exists()) {
        setUsernameAvailable(false)
        setError("이미 사용 중인 이름입니다. 다른 이름을 입력하세요.")
      } else {
        setUsernameAvailable(true)
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      if (message.includes("permission-denied")) {
        setError("Firestore 보안 규칙을 확인하세요.")
      } else {
        setError(`조회 오류: ${message}`)
      }
    } finally {
      setChecking(false)
    }
  }

  const handleSelectType = (type: UserType) => {
    setUserType(type)
    setStep("form")
    setUsername("")
    setPassword("")
    setPasswordConfirm("")
    setCode("")
    setError("")
    setUsernameChecked(false)
    setUsernameAvailable(false)
  }

  const handleBack = () => {
    setStep("select")
    setUsername("")
    setPassword("")
    setPasswordConfirm("")
    setCode("")
    setError("")
    setUsernameChecked(false)
    setUsernameAvailable(false)
    setCodeChecking(false)
    setCodeVerified(false)
    setEduInfo(null)
  }

  // Auto-verify when code is 8 chars
  useEffect(() => {
    if (code.trim().length === 8 && !codeVerified && !codeChecking) {
      handleCodeBlur()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code])

  // Verify code and fetch edu info
  const handleCodeBlur = async () => {
    const trimmedCode = code.trim()
    if (!trimmedCode || trimmedCode.length < 4) {
      setCodeVerified(false)
      setEduInfo(null)
      return
    }
    setCodeChecking(true)
    try {
      const codesRef = collection(db, "auth-codes")
      const q = query(codesRef, where("code", "==", trimmedCode))
      const snapshot = await getDocsFromServer(q)
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data()
        const now = Timestamp.now()
        if (data.expiresAt && data.expiresAt.toMillis() < now.toMillis()) {
          setCodeVerified(false)
          setEduInfo(null)
          setError("만료된 인증코드입니다.")
          return
        }
        setCodeVerified(true)
        setEduInfo({
          eduName: data.eduName || undefined,
          eduDate: data.eduDate || undefined,
          eduTime: data.eduTime || undefined,
          track: data.track || undefined,
        })
        setError("")
      } else {
        setCodeVerified(false)
        setEduInfo(null)
        setError("유효하지 않은 인증코드입니다.")
      }
    } catch {
      // silent fail
    } finally {
      setCodeChecking(false)
    }
  }

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const name = username.trim()

    if (!name || name.length < 2) {
      setError("사용자명을 입력하세요 (2글자 이상).")
      return
    }
    if (userType === "new" && !usernameAvailable) {
      setError("사용자명 중복확인을 먼저 해주세요.")
      return
    }
    if (!password) {
      setError("비밀번호를 입력하세요.")
      return
    }
    if (password.length < 4) {
      setError("비밀번호는 4자 이상이어야 합니다.")
      return
    }
    if (userType === "new" && password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.")
      return
    }
    if (!code.trim()) {
      setError("인증코드를 입력하세요.")
      return
    }

    setLoading(true)
    setError("")

    try {
      // 1. Verify auth code
      const codesRef = collection(db, "auth-codes")
      const q = query(codesRef, where("code", "==", code.trim()))
      const snapshot = await getDocsFromServer(q)

      if (snapshot.empty) {
        setError("유효하지 않은 인증코드입니다.")
        setLoading(false)
        return
      }

      const docData = snapshot.docs[0].data()
      const now = Timestamp.now()

      if (docData.expiresAt && docData.expiresAt.toMillis() < now.toMillis()) {
        setError("만료된 인증코드입니다.")
        setLoading(false)
        return
      }

      // 2. Check password
      if (userType === "existing") {
        const userDocRef = doc(db, "users", name)
        const userDoc = await getDoc(userDocRef)
        if (!userDoc.exists()) {
          setError("존재하지 않는 사용자입니다. '처음 사용자'로 가입해주세요.")
          setLoading(false)
          return
        }
        const userData = userDoc.data()
        if (userData.isSuspended) {
          setError("정지된 계정입니다. 관리자에게 문의하세요.")
          setLoading(false)
          return
        }
        if (userData.password !== password) {
          setError("비밀번호가 틀렸습니다.")
          setLoading(false)
          return
        }
        // Update last login + online status
        await setDoc(
          userDocRef,
          { lastLoginAt: now, isOnline: true },
          { merge: true }
        )
      } else {
        // New user - create document with password
        const userDocRef = doc(db, "users", name)
        await setDoc(userDocRef, {
          username: name,
          password: password,
          createdAt: now,
          lastLoginAt: now,
          isOnline: true,
          isSuspended: false,
        })
      }

      // 3. Save session (including track from auth code)
      sessionStorage.setItem("v0-guide-auth", "true")
      sessionStorage.setItem("v0-guide-username", name)
      const trackValue = docData.track || "local-problem"
      sessionStorage.setItem("v0-guide-track", trackValue)
      if (docData.eduName) sessionStorage.setItem("v0-guide-eduName", docData.eduName)
      if (docData.eduDate) sessionStorage.setItem("v0-guide-eduDate", docData.eduDate)
      if (docData.eduTime) sessionStorage.setItem("v0-guide-eduTime", docData.eduTime)

      // 4. Show success screen with edu info - FLIP center + typewriter welcome
      if (docData.eduName) {
        setEduInfo({
          eduName: docData.eduName,
          eduDate: docData.eduDate,
          eduTime: docData.eduTime,
          track: docData.track,
        })
        // After edu card renders, capture position then fly to center
        setTimeout(() => {
          if (eduCardRef.current) {
            setEduCardRect(eduCardRef.current.getBoundingClientRect())
          }
          requestAnimationFrame(() => {
            setEduExpanding(true)
            // After card reaches center, show typewriter welcome
            setTimeout(() => {
              setShowWelcome(true)
              const fullText = `${name}님 환영합니다.`
              let i = 0
              const typeInterval = setInterval(() => {
                i++
                setWelcomeText(fullText.slice(0, i))
                if (i >= fullText.length) clearInterval(typeInterval)
              }, 60)
              // After typewriter + pause, proceed to home
              setTimeout(() => {
                onAuthenticated(name)
              }, fullText.length * 60 + 1500)
            }, 700)
          })
        }, 100)
      } else {
        onAuthenticated(name)
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      if (message.includes("permission-denied")) {
        setError("Firestore 보안 규칙을 확인하세요.")
      } else {
        setError(`인증 오류: ${message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  // No separate success screen - edu card expands in-place

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm px-6">
        <div className="flex flex-col items-center gap-8">
          {/* Header */}
          <div className={`flex flex-col items-center gap-3 transition-all duration-500 ${eduExpanding ? "opacity-0 scale-95 pointer-events-none" : "opacity-100"}`}>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground">
              <Lock className="h-5 w-5 text-background" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Vibe Coding Guide
            </h1>
            <p className="text-center text-sm text-muted-foreground leading-relaxed">
              {step === "select"
                ? "시작하려면 사용자 유형을 선택하세요."
                : userType === "new"
                  ? "사용자명과 비밀번호를 설정하세요."
                  : "사용자명과 비밀번호를 입력하세요."}
            </p>
          </div>

          {/* Step 1: Select user type */}
          {step === "select" && (
            <div className="flex w-full flex-col gap-3">
              <button
                type="button"
                onClick={() => handleSelectType("new")}
                className="flex h-14 items-center justify-between rounded-xl border border-border bg-background px-5 text-sm font-medium text-foreground hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground/10">
                    <User className="h-4 w-4 text-foreground" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">처음 사용자</p>
                    <p className="text-[11px] text-muted-foreground">새로 가입합니다</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </button>
              <button
                type="button"
                onClick={() => handleSelectType("existing")}
                className="flex h-14 items-center justify-between rounded-xl border border-border bg-background px-5 text-sm font-medium text-foreground hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground/10">
                    <ArrowRight className="h-4 w-4 text-foreground" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">기존 사용자</p>
                    <p className="text-[11px] text-muted-foreground">이미 가입했습니다</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          )}

          {/* Step 2: Form */}
          {step === "form" && (
              <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
              {/* Form fields - fade out when edu card expands */}
              <div className={`flex flex-col gap-4 transition-all duration-500 ${eduExpanding ? "opacity-0 scale-95 pointer-events-none" : "opacity-100"}`}>
              {/* Username */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  사용자명
                </label>
                {userType === "new" ? (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => {
                            setUsername(e.target.value)
                            setError("")
                            setUsernameChecked(false)
                            setUsernameAvailable(false)
                          }}
                          placeholder="사용자명 입력 (2글자 이상)"
                          className="h-12 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/10 transition-all"
                          disabled={loading}
                          autoFocus
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleCheckUsername}
                        disabled={checking || !username.trim() || username.trim().length < 2 || usernameChecked}
                        className="h-12 shrink-0 rounded-xl bg-foreground px-4 text-xs font-medium text-background hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        {checking ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "중복확인"
                        )}
                      </button>
                    </div>
                    {usernameChecked && usernameAvailable && (
                      <p className="mt-1 text-xs text-green-600">
                        사용 가능한 이름입니다.
                      </p>
                    )}
                  </>
                ) : (
                  <div className="relative">
                    <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value)
                        setError("")
                      }}
                      placeholder="사용자명 입력"
                      className="h-12 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/10 transition-all"
                      disabled={loading}
                      autoFocus
                    />
                  </div>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  비밀번호
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setError("")
                    }}
                    placeholder={
                      userType === "new"
                        ? "비밀번호 설정 (4자 이상)"
                        : "비밀번호 입력"
                    }
                    className="h-12 w-full rounded-xl border border-border bg-background px-4 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/10 transition-all"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Password Confirm (new user only) */}
              {userType === "new" && (
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    비밀번호 확인
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswordConfirm ? "text" : "password"}
                      value={passwordConfirm}
                      onChange={(e) => {
                        setPasswordConfirm(e.target.value)
                        setError("")
                      }}
                      placeholder="비밀번호 다시 입력"
                      className="h-12 w-full rounded-xl border border-border bg-background px-4 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/10 transition-all"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPasswordConfirm ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {passwordConfirm && password !== passwordConfirm && (
                    <p className="mt-1 text-xs text-destructive">
                      비밀번호가 일치하지 않습니다.
                    </p>
                  )}
                </div>
              )}

              {/* Auth Code */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  인증코드
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => {
                        const v = e.target.value.slice(0, 8)
                        setCode(v)
                        setError("")
                        setCodeVerified(false)
                        setEduInfo(null)
                      }}
                      maxLength={8}
                      placeholder="8자리 인증코드 입력"
                      className={`h-12 w-full rounded-xl border bg-background px-4 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/10 transition-all ${codeVerified ? "border-emerald-500" : codeChecking ? "border-amber-400" : "border-border"
                        }`}
                      disabled={loading || codeChecking}
                    />
                    {codeChecking && (
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    )}
                    {!codeChecking && codeVerified && (
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                        <Shield className="h-4 w-4 text-emerald-500" />
                      </div>
                    )}
                  </div>
                </div>

              </div>
              </div>{/* end form fields fadeout wrapper */}

              {/* Background overlay during expand */}
              {eduExpanding && (
                <div className="fixed inset-0 z-40 bg-background animate-in fade-in duration-500" />
              )}

              {/* Education info card - FLIP to center on login */}
              {codeVerified && eduInfo && (eduInfo.eduName || eduInfo.eduDate) && (
                <div
                  ref={eduCardRef}
                  className={`overflow-hidden rounded-xl border bg-gradient-to-br from-background to-accent/30 ${!eduExpanding ? "border-border animate-in slide-in-from-bottom-2 fade-in duration-500" : ""}`}
                  style={eduExpanding && eduCardRect ? {
                    position: "fixed",
                    zIndex: 50,
                    top: eduCardRect.top,
                    left: eduCardRect.left,
                    width: eduCardRect.width,
                    height: "auto",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.75rem",
                    background: "linear-gradient(135deg, hsl(var(--background)), hsl(var(--accent) / 0.3))",
                    transition: "all 600ms cubic-bezier(0.4, 0, 0.2, 1)",
                    animation: "edu-fly-center 600ms cubic-bezier(0.4, 0, 0.2, 1) forwards",
                  } : undefined}
                >
                  <div className={`flex flex-col transition-all duration-600 ${eduExpanding ? "items-center text-center px-8 py-6" : "px-4 py-3"}`}>
                    <div className={`flex items-center gap-2 transition-all duration-600 ${eduExpanding ? "justify-center mb-4" : "mb-2.5"}`}>
                      <CheckCircle2 className={`text-emerald-500 transition-all duration-600 ${eduExpanding ? "h-5 w-5" : "h-3.5 w-3.5"}`} />
                      <span className={`font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 transition-all duration-600 ${eduExpanding ? "text-xs tracking-[0.15em]" : "text-[10px]"}`}>
                        {eduExpanding ? "AUTHENTICATED" : "VERIFIED"}
                      </span>
                    </div>
                    {eduInfo.eduName && (
                      <h3 className={`font-bold text-foreground tracking-tight leading-snug transition-all duration-600 ${eduExpanding ? "text-xl mb-2" : "text-base"}`}>
                        {eduInfo.eduName}
                      </h3>
                    )}
                    <div className={`flex items-center gap-3 transition-all duration-600 ${eduExpanding ? "justify-center mt-1 mb-3" : "mt-2"}`}>
                      {eduInfo.eduDate && (
                        <span className={`text-muted-foreground transition-all duration-600 ${eduExpanding ? "text-sm" : "text-xs"}`}>{eduInfo.eduDate}</span>
                      )}
                      {eduInfo.eduDate && eduInfo.eduTime && (
                        <span className="text-muted-foreground/30">{"/"}</span>
                      )}
                      {eduInfo.eduTime && (
                        <span className={`text-muted-foreground transition-all duration-600 ${eduExpanding ? "text-sm" : "text-xs"}`}>{eduInfo.eduTime}</span>
                      )}
                    </div>
                    {eduInfo.track && (
                      <div className={`transition-all duration-600 ${eduExpanding ? "mt-1" : "mt-2.5"}`}>
                        <span className={`font-medium rounded-full transition-all duration-600 ${eduExpanding ? "text-xs px-3 py-1" : "text-[10px] px-2 py-0.5"} ${eduInfo.track === "local-problem" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                            : eduInfo.track === "startup" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
                          }`}>
                          {eduInfo.track === "local-problem" ? "지역문제해결형" : eduInfo.track === "startup" ? "창업 아이디어 현실화" : "쇼핑몰 제작"}
                        </span>
                      </div>
                    )}
                    {/* Typewriter welcome message */}
                    {showWelcome && (
                      <p className="mt-5 text-sm text-muted-foreground animate-in fade-in duration-300">
                        {welcomeText}<span className="animate-pulse">{"_"}</span>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Form controls - fade out when expanding */}
              <div className={`flex flex-col gap-4 transition-all duration-500 ${eduExpanding ? "opacity-0 scale-95 pointer-events-none" : "opacity-100"}`}>
              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}

              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="submit"
                      onMouseDown={(e) => {
                        submitClickRef.current = e
                      }}
                      disabled={
                        loading ||
                        !username.trim() ||
                        !password ||
                        !code.trim() ||
                        !codeVerified ||
                        (userType === "new" && (!usernameChecked || !usernameAvailable)) ||
                        (userType === "new" && password !== passwordConfirm)
                      }
                      className="flex h-12 items-center justify-center gap-2 rounded-xl bg-foreground text-sm font-medium text-background transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <span>{userType === "new" ? "가입하고 시작하기" : "로그인"}</span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </TooltipTrigger>
                  {(() => {
                    const msg = !username.trim()
                      ? "사용자명을 입력하세요"
                      : userType === "new" && !usernameChecked
                        ? "사용자명 중복확인이 필요합니다"
                        : userType === "new" && !usernameAvailable
                          ? "사용할 수 없는 사용자명입니다"
                          : !password
                            ? "비밀번호를 입력하세요"
                            : userType === "new" && password !== passwordConfirm
                              ? "비밀번호가 일치하지 않습니다"
                              : !code.trim()
                                ? "인증코드를 입력하세요"
                                : !codeVerified
                                  ? "인증코드 조회를 먼저 해주세요"
                                  : null
                    return msg ? (
                      <TooltipContent>
                        <p className="text-xs">{msg}</p>
                      </TooltipContent>
                    ) : null
                  })()}
                </Tooltip>
              </TooltipProvider>

              <button
                type="button"
                onClick={handleBack}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors text-center"
              >
                돌아가기
              </button>
              </div>{/* end form controls fadeout wrapper */}
            </form>
          )}
        </div>
      </div>

    </div>
  )
}
