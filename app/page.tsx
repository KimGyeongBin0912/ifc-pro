"use client"

import { useState, useEffect, useCallback } from "react"
import { AuthGate } from "@/components/guide/auth-gate"
import { MainLayout } from "@/components/guide/main-layout"
import { db } from "@/lib/firebase"
import { doc, setDoc, Timestamp } from "firebase/firestore"

export default function Page() {
  const [authenticated, setAuthenticated] = useState(false)
  const [username, setUsername] = useState("")
  const [checking, setChecking] = useState(true)
  const [ripple, setRipple] = useState<{ x: number; y: number } | null>(null)
  const [homeReady, setHomeReady] = useState(false) // triggers sidebar+content slide-in

  useEffect(() => {
    const auth = sessionStorage.getItem("v0-guide-auth")
    const savedUser = sessionStorage.getItem("v0-guide-username")
    if (auth === "true" && savedUser) {
      setAuthenticated(true)
      setUsername(savedUser)
      setHomeReady(true) // already authenticated, show immediately
    }
    setChecking(false)
  }, [])

  // Track online/offline status
  useEffect(() => {
    if (!authenticated || !username) return

    // Mark online
    const userDocRef = doc(db, "users", username)
    setDoc(userDocRef, { isOnline: true, lastLoginAt: Timestamp.now() }, { merge: true }).catch(() => {})

    // Mark offline on page leave
    const handleOffline = () => {
      navigator.sendBeacon?.("/api/offline", JSON.stringify({ username }))
      setDoc(userDocRef, { isOnline: false }, { merge: true }).catch(() => {})
    }

    window.addEventListener("beforeunload", handleOffline)
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        setDoc(userDocRef, { isOnline: false }, { merge: true }).catch(() => {})
      } else {
        setDoc(userDocRef, { isOnline: true }, { merge: true }).catch(() => {})
      }
    })

    return () => {
      window.removeEventListener("beforeunload", handleOffline)
    }
  }, [authenticated, username])

  const handleLogout = useCallback((clickX?: number, clickY?: number) => {
    sessionStorage.removeItem("v0-guide-auth")
    sessionStorage.removeItem("v0-guide-username")
    if (username) {
      const userDocRef = doc(db, "users", username)
      setDoc(userDocRef, { isOnline: false }, { merge: true }).catch(() => {})
    }
    if (clickX !== undefined && clickY !== undefined) {
      setRipple({ x: clickX, y: clickY })
      setTimeout(() => {
        setAuthenticated(false)
        setUsername("")
        setHomeReady(false)
      }, 500)
    } else {
      setAuthenticated(false)
      setUsername("")
      setHomeReady(false)
    }
  }, [username])

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
      </div>
    )
  }

  if (!authenticated) {
    return (
      <AuthGate
        onAuthenticated={(name) => {
          setUsername(name)
          setHomeReady(false)
          setAuthenticated(true)
          // Trigger sidebar+content slide-in next frame
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setHomeReady(true)
            })
          })
        }}
      />
    )
  }

  return (
    <div className="relative" style={{ minHeight: "100vh" }}>
      {/* Logout ripple: expands from logout button position */}
      {ripple && (
        <div
          className="fixed inset-0 z-[9999] pointer-events-none"
          onAnimationEnd={() => setRipple(null)}
        >
          <div
            className="absolute rounded-full animate-login-ripple"
            style={{
              left: ripple.x,
              top: ripple.y,
              transform: "translate(-50%, -50%)",
            }}
          />
        </div>
      )}
      <MainLayout username={username} onLogout={handleLogout} homeReady={homeReady} />
    </div>
  )
}
