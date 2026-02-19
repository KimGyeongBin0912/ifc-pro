import { generateText } from "ai"

export const maxDuration = 10

export async function POST(req: Request) {
  const { messages } = await req.json()

  // 최근 메시지에서 텍스트 추출
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const texts = messages.slice(0, 6).map((m: any) => {
    if (m.parts && Array.isArray(m.parts)) {
      return m.parts.map((p: any) => (typeof p.text === "string" ? p.text : "")).join("")
    }
    return typeof m.content === "string" ? m.content : ""
  }).filter(Boolean).join("\n")

  const { text } = await generateText({
    model: "openai/gpt-4o-mini",
    system: "대화 내용을 보고 15자 이내의 한국어 제목을 만들어주세요. 제목만 출력하세요. 따옴표나 설명 없이 제목만.",
    prompt: texts.slice(0, 500),
  })

  return Response.json({ title: text.trim().replace(/['"]/g, "").slice(0, 20) })
}
