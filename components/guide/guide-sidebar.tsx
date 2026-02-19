"use client"

import { useState } from "react"
import { guideCategories, searchItems, type GuideItem } from "@/lib/guide-data"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRef, useEffect } from "react"
import {
  Search,
  Rocket,
  Layout,
  Palette,
  FileText,
  Star,
  CheckCircle,
  ChevronRight,
  X,
  BookOpen,
  Moon,
  Sun,
  Minus,
  Plus,
  LogOut,
  Home,
  User,
} from "lucide-react"

const iconMap: Record<string, React.ReactNode> = {
  rocket: <Rocket className="h-4 w-4" />,
  book: <BookOpen className="h-4 w-4" />,
  layout: <Layout className="h-4 w-4" />,
  palette: <Palette className="h-4 w-4" />,
  file: <FileText className="h-4 w-4" />,
  star: <Star className="h-4 w-4" />,
  check: <CheckCircle className="h-4 w-4" />,
}

interface GuideSidebarProps {
  selectedId: string | null
  onSelectItem: (item: GuideItem) => void
  onGoHome: () => void
  onLogout?: (clickX?: number, clickY?: number) => void
  username?: string
}

export function GuideSidebar({
  selectedId,
  onSelectItem,
  onGoHome,
  onLogout,
  username,
}: GuideSidebarProps) {
  const [sidebarSearch, setSidebarSearch] = useState("")
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    if (profileOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [profileOpen])
  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    guideCategories.map((c) => c.id)
  )

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  const filteredResults = sidebarSearch.trim()
    ? searchItems(sidebarSearch)
    : null

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-sidebar">
      <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4">
        {/* Left: Home button + Font size controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={onGoHome}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
            title="홈"
          >
            <Home className="h-3.5 w-3.5" />
          </button>
          <div className="h-4 w-px bg-sidebar-border mx-0.5" />
          <button
            onClick={() => {
              const root = document.documentElement
              const current = parseFloat(getComputedStyle(root).fontSize)
              if (current > 12) root.style.fontSize = `${current - 1}px`
            }}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
            title="글씨 작게"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="text-[10px] text-muted-foreground w-5 text-center">Aa</span>
          <button
            onClick={() => {
              const root = document.documentElement
              const current = parseFloat(getComputedStyle(root).fontSize)
              if (current < 20) root.style.fontSize = `${current + 1}px`
            }}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
            title="글씨 크게"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex items-center gap-1">
          {/* Dark mode toggle */}
          <button
            onClick={() => {
              const root = document.documentElement
              const isDark = root.classList.contains("dark")
              if (isDark) {
                root.classList.remove("dark")
                localStorage.setItem("theme", "light")
              } else {
                root.classList.add("dark")
                localStorage.setItem("theme", "dark")
              }
            }}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
            title="다크모드 전환"
          >
            <Sun className="h-3.5 w-3.5 hidden dark:block" />
            <Moon className="h-3.5 w-3.5 block dark:hidden" />
          </button>
          {/* User Profile */}
          {onLogout && (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen((v) => !v)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
                title="프로필"
              >
                <User className="h-3.5 w-3.5" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-full mt-1 z-50 w-44 rounded-lg border border-border bg-popover p-2 shadow-md">
                  <div className="px-2 py-1.5 text-xs font-medium text-foreground truncate">
                    {username || "사용자"}
                  </div>
                  <div className="my-1 h-px bg-border" />
                  <button
                    onClick={(e) => {
                      setProfileOpen(false)
                      onLogout(e.clientX, e.clientY)
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>로그아웃</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="px-3 pt-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={sidebarSearch}
            onChange={(e) => setSidebarSearch(e.target.value)}
            placeholder="검색..."
            className="h-9 w-full rounded-lg border border-sidebar-border bg-sidebar pl-9 pr-8 text-xs text-sidebar-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-sidebar-ring transition-all"
          />
          {sidebarSearch && (
            <button
              onClick={() => setSidebarSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1 px-3 py-3">
        {filteredResults ? (
          <div className="flex flex-col gap-0.5">
            <p className="px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {filteredResults.length}개 결과
            </p>
            {filteredResults.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onSelectItem(item)
                  setSidebarSearch("")
                }}
                className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs transition-colors ${
                  selectedId === item.id
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                <span className="truncate">{item.title}</span>
              </button>
            ))}
            {filteredResults.length === 0 && (
              <p className="px-2 py-8 text-center text-xs text-muted-foreground">
                검색 결과가 없습니다.
              </p>
            )}
          </div>
        ) : (
          <nav className="flex flex-col gap-1">
            {guideCategories.map((category) => {
              const isExpanded = expandedCategories.includes(category.id)
              return (
                <div key={category.id}>
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
                  >
                    <span className="text-muted-foreground">
                      {iconMap[category.icon]}
                    </span>
                    <span className="flex-1 text-left">{category.label}</span>
                    <ChevronRight
                      className={`h-3 w-3 text-muted-foreground transition-transform duration-200 ${
                        isExpanded ? "rotate-90" : ""
                      }`}
                    />
                  </button>

                  {isExpanded && (
                    <div className="ml-4 flex flex-col gap-0.5 border-l border-sidebar-border pl-3 py-0.5">
                      {category.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => onSelectItem(item)}
                          className={`flex w-full items-center rounded-md px-2 py-1.5 text-left text-xs transition-colors ${
                            selectedId === item.id
                              ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                              : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                          }`}
                        >
                          <span className="truncate">{item.title}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
        )}
      </ScrollArea>
    </aside>
  )
}
