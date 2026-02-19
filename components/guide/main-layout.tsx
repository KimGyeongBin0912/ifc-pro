"use client"

import { useState, useEffect, useRef } from "react"
import type { GuideItem } from "@/lib/guide-data"
import { GuideSidebar } from "@/components/guide/guide-sidebar"
import { HomeContent } from "@/components/guide/home-content"
import { DetailView } from "@/components/guide/detail-view"
import {
  Menu,
  X,
  MessageCircle,
} from "lucide-react"

interface MainLayoutProps {
  username: string
  onLogout?: (clickX?: number, clickY?: number) => void
  homeReady?: boolean
}
export function MainLayout({ username, onLogout, homeReady = true }: MainLayoutProps) {
  const [selectedItem, setSelectedItem] = useState<GuideItem | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Floating chat state (chat content lives in HomeContent - single instance)
  const [floatingOpen, setFloatingOpen] = useState(false)
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

  // Expand floating → full size: same HomeContent instance, just CSS switch
  const expandToHome = () => {
    setFloatingExpanding(true)
    setTimeout(() => {
      setSelectedItem(null)
      setFloatingExpanding(false)
      setFloatingOpen(false)
    }, 700)
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

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-background transition-transform duration-300 md:relative md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <GuideSidebar
          onSelectItem={handleSelectItem}
          selectedItem={selectedItem}
          onLogout={onLogout}
          username={username}
          onGoHome={handleGoHome}
        />
      </div>

      {/* Main content column */}
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

        {/* Content area - DetailView when guide selected, hidden when on home */}
        {selectedItem && (
          <div
            ref={contentRef}
            className={`flex-1 overflow-y-auto overflow-x-hidden ${genieAnimating ? "animate-morph-to-button" : ""}`}
          >
            <DetailView item={selectedItem} onBack={handleGoHome} />
          </div>
        )}

        {/* HomeContent: always mounted, CSS position switches between full/floating */}
        <div ref={!selectedItem ? contentRef : undefined} className={
          !selectedItem
            ? `flex-1 overflow-y-auto overflow-x-hidden ${genieAnimating ? "animate-morph-to-button" : ""}`
            : floatingExpanding
              ? "fixed top-0 left-0 md:left-64 right-0 bottom-0 z-[60] transition-all duration-700 ease-in-out bg-background"
              : floatingOpen
                ? "fixed bottom-20 right-6 w-80 sm:w-96 h-[600px] z-50 rounded-2xl border border-border bg-background shadow-2xl overflow-hidden transition-all duration-200 opacity-100 translate-y-0"
                : "fixed bottom-20 right-6 w-80 sm:w-96 h-[600px] z-50 rounded-2xl border border-border bg-background shadow-2xl overflow-hidden transition-all duration-200 opacity-0 translate-y-2 pointer-events-none invisible"
        }>
          {/* White overlay to hide content during expand */}
          {floatingExpanding && (
            <div className="absolute inset-0 z-10 bg-background" />
          )}
          {/* Floating header: expand + close buttons, only shown in floating mode */}
          {selectedItem && !floatingExpanding && (
            <div className="flex items-center justify-between border-b border-border px-4 py-2.5 bg-muted/30 shrink-0">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-foreground" />
                <span className="text-sm font-semibold text-foreground">{"AI \uCC44\uD305"}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={expandToHome}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  title="\uD070 \uD654\uBA74\uC73C\uB85C \uBCF4\uAE30"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
                </button>
                <button
                  onClick={() => setFloatingOpen(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
          <HomeContent
            onSelectItem={handleSelectItem}
            username={username}
          />
        </div>
      </div>

      {/* Floating chat button - visible on guide pages */}
      {selectedItem && (
        <div ref={floatingRef} className="fixed bottom-6 right-6 z-50">
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
