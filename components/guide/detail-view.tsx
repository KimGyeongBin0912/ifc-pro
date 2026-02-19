"use client"

import { useState, useRef, useEffect } from "react"
import type { GuideItem } from "@/lib/guide-data"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Copy, Check, ArrowLeft, Lightbulb, Eye } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { previewMap } from "@/components/guide/preview-components"

interface DetailViewProps {
  item: GuideItem
  onBack: () => void
}

export function DetailView({ item, onBack }: DetailViewProps) {
  const [copied, setCopied] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const viewport = scrollRef.current?.querySelector("[data-radix-scroll-area-viewport]") as HTMLElement | null
    if (viewport) {
      viewport.scrollTop = 0
    }
  }, [item.id])

  const handleCopyPrompt = () => {
    if (item.promptExample) {
      navigator.clipboard.writeText(item.promptExample)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-border px-6 py-4">
        <button
          onClick={onBack}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors md:hidden"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex flex-col gap-0.5">
          <h1 className="text-lg font-semibold text-foreground tracking-tight">
            {item.title}
          </h1>
          <p className="text-xs text-muted-foreground">{item.description}</p>
        </div>
      </div>

      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="mx-auto max-w-4xl px-6 py-8">
          <article className="prose-custom">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h2: ({ children }) => (
                  <h2 className="mt-8 mb-4 text-xl font-semibold text-foreground tracking-tight first:mt-0">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="mt-6 mb-3 text-base font-semibold text-foreground">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="mb-4 text-sm text-muted-foreground leading-relaxed">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="mb-4 flex flex-col gap-1.5 pl-4">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="mb-4 flex flex-col gap-1.5 pl-4 list-decimal">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="text-sm text-muted-foreground leading-relaxed list-disc">
                    {children}
                  </li>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-foreground">
                    {children}
                  </strong>
                ),
                code: ({ children, className }) => {
                  const isBlock = className?.includes("language-")
                  if (isBlock) {
                    return (
                      <code className="block rounded-lg bg-muted p-4 text-xs font-mono text-foreground overflow-x-auto">
                        {children}
                      </code>
                    )
                  }
                  return (
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-foreground">
                      {children}
                    </code>
                  )
                },
                pre: ({ children }) => (
                  <pre className="mb-4 overflow-hidden rounded-lg border border-border">
                    {children}
                  </pre>
                ),
                table: ({ children }) => (
                  <div className="mb-4 overflow-x-auto rounded-lg border border-border">
                    <table className="w-full text-sm">{children}</table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-muted/50 border-b border-border">{children}</thead>
                ),
                tbody: ({ children }) => <tbody>{children}</tbody>,
                tr: ({ children }) => (
                  <tr className="border-b border-border last:border-0">{children}</tr>
                ),
                th: ({ children }) => (
                  <th className="px-3 py-2 text-left text-xs font-semibold text-foreground">{children}</th>
                ),
                td: ({ children }) => (
                  <td className="px-3 py-2 text-xs text-muted-foreground">{children}</td>
                ),
              }}
            >
              {item.content}
            </ReactMarkdown>
          </article>

          {previewMap[item.id] && (() => {
            const PreviewComponent = previewMap[item.id]
            return (
              <div className="mt-8">
                {item.promptExample && (
                  <div className="mb-6 rounded-xl border border-border bg-muted/30 p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="h-4 w-4 text-foreground" />
                      <h3 className="text-sm font-semibold text-foreground">
                        v0에 이렇게 말하면 됩니다
                      </h3>
                    </div>
                    <div className="relative">
                      <p className="rounded-lg bg-background border border-border p-4 text-sm text-foreground leading-relaxed">
                        {item.promptExample}
                      </p>
                      <button
                        onClick={handleCopyPrompt}
                        className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                        title="복사"
                      >
                        {copied ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="h-4 w-4 text-foreground" />
                  <h3 className="text-sm font-semibold text-foreground">
                    이렇게 생겼어요
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    - 마우스를 올리면 각 요소의 이름이 표시됩니다
                  </span>
                </div>
                <PreviewComponent />
              </div>
            )
          })()}

          {item.promptExample && !previewMap[item.id] && (
            <div className="mt-8 rounded-xl border border-border bg-muted/30 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="h-4 w-4 text-foreground" />
                <h3 className="text-sm font-semibold text-foreground">
                  v0에 이렇게 말하면 됩니다
                </h3>
              </div>
              <div className="relative">
                <p className="rounded-lg bg-background border border-border p-4 text-sm text-foreground leading-relaxed">
                  {item.promptExample}
                </p>
                <button
                  onClick={handleCopyPrompt}
                  className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  title="복사"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>
          )}

          {item.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-1.5">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-muted px-2 py-1 text-[10px] font-medium text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
