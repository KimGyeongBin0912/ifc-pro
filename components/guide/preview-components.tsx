"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command"
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
  Bell,
  Bookmark,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Copy,
  CreditCard,
  Download,
  Edit,
  ExternalLink,
  Eye,
  Filter,
  Github,
  Globe,
  Heart,
  Home,
  Image,
  Info,
  Loader2,
  Lock,
  LogIn,
  LogOut,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Minus,
  Moon,
  MoreHorizontal,
  Package,
  Pause,
  Phone,
  Play,
  Plus,
  Power,
  RefreshCw,
  Save,
  Search,
  Send,
  Settings,
  Share,
  ShoppingCart,
  Star,
  Sun,
  ThumbsUp,
  Trash2,
  TrendingUp,
  Upload,
  User,
  Users,
  Video,
  X,
  Zap,
  BarChart3,
  FileText,
  Share2,
  LayoutDashboard,
  AlignLeft,
  Type,
} from "lucide-react"

// ─── Wrapper ───
function PreviewBlock({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/20">
      <div className="rounded-t-xl border-b border-border bg-muted/40 px-4 py-2.5">
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </p>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

// ─── Labeled wrapper: hover shows name ───
function Labeled({
  name,
  children,
}: {
  name: string
  children: React.ReactNode
}) {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex">{children}</span>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="max-w-[260px] text-xs leading-relaxed whitespace-normal z-50"
        >
          {name}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// ─── Button Previews ───
export function ButtonPreview() {
  const [loading, setLoading] = useState(false)
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [following, setFollowing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [playing, setPlaying] = useState(false)

  const handleLoading = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 2000)
  }

  const handleCopy = () => {
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 1. 기본 6가지 변형 */}
      <PreviewBlock title="기본 버튼 6종 - v0에 '~버튼 만들어줘' 라고 말할 때 사용">
        <div className="flex flex-wrap gap-2">
          <Labeled name='"기본 버튼" - 가장 눈에 띄는 주요 버튼'><Button variant="default">기본 버튼</Button></Labeled>
          <Labeled name='"보조 버튼" - 덜 중요한 액션'><Button variant="secondary">보조 버튼</Button></Labeled>
          <Labeled name='"테두리 버튼" - 테두리만 있는 깔끔한 버튼'><Button variant="outline">테두리 버튼</Button></Labeled>
          <Labeled name='"투명 버튼" - 배경 없이 텍스트만'><Button variant="ghost">투명 버튼</Button></Labeled>
          <Labeled name='"링크 버튼" - 링크처럼 생긴 버튼'><Button variant="link">링크 버튼</Button></Labeled>
          <Labeled name='"삭제 버튼" - 빨간색 위험 액션용'><Button variant="destructive">삭제 버튼</Button></Labeled>
        </div>
      </PreviewBlock>

      {/* 2. 크기 비교 */}
      <PreviewBlock title='버튼 크기 - "작은/기본/큰 버튼" 으로 요청'>
        <div className="flex flex-wrap items-center gap-3">
          <Labeled name='"작은 버튼" - 태그, 필터에 사용'><Button size="sm">작은 버튼</Button></Labeled>
          <Labeled name='"기본 크기 버튼"'><Button size="default">기본 크기</Button></Labeled>
          <Labeled name='"큰 버튼" - 히어로, CTA에 사용'><Button size="lg">큰 버튼</Button></Labeled>
          <Labeled name='"아이콘만 있는 버튼" - 검색, 닫기 등'><Button size="icon"><Plus className="h-4 w-4" /></Button></Labeled>
        </div>
      </PreviewBlock>

      {/* 3. 아이콘 + 텍스트 조합 */}
      <PreviewBlock title='아이콘 버튼 - "~아이콘이 있는 버튼"으로 요청'>
        <div className="flex flex-wrap gap-2">
          <Labeled name='"메일 아이콘이 있는 이메일 보내기 버튼"'><Button><Mail className="h-4 w-4 mr-2" />이메일 보내기</Button></Labeled>
          <Labeled name='"다운로드 아이콘이 있는 내려받기 버튼"'><Button variant="outline"><Download className="h-4 w-4 mr-2" />내려받기</Button></Labeled>
          <Labeled name='"공유 아이콘이 있는 공유하기 버튼"'><Button variant="secondary"><Share className="h-4 w-4 mr-2" />공유하기</Button></Labeled>
          <Labeled name='"업로드 아이콘이 있는 파일 올리기 버튼"'><Button variant="outline"><Upload className="h-4 w-4 mr-2" />파일 올리기</Button></Labeled>
          <Labeled name='"저장 아이콘이 있는 저��하기 버튼"'><Button><Save className="h-4 w-4 mr-2" />저장하기</Button></Labeled>
          <Labeled name='"전송 아이콘이 있는 보내기 버튼"'><Button><Send className="h-4 w-4 mr-2" />보내기</Button></Labeled>
        </div>
      </PreviewBlock>

      {/* 4. 오른쪽에 아이콘 */}
      <PreviewBlock title='오른쪽 화살표 버튼 - "오른쪽에 화살표 아이콘"으로 요청'>
        <div className="flex flex-wrap gap-2">
          <Labeled name='"다음 단계 버튼, 오른쪽 화살표"'><Button>다음 단계 <ArrowRight className="h-4 w-4 ml-2" /></Button></Labeled>
          <Labeled name='"자세히 보기 버튼, 오른쪽에 외부 링크 아이콘"'><Button variant="outline">자세히 보기 <ExternalLink className="h-4 w-4 ml-2" /></Button></Labeled>
          <Labeled name='"더보기 버튼, 아래 화살표"'><Button variant="ghost">더보기 <ChevronDown className="h-4 w-4 ml-2" /></Button></Labeled>
          <Labeled name='"새 탭에서 열기 버튼"'><Button variant="link">새 탭에서 열기 <ArrowUpRight className="h-4 w-4 ml-1" /></Button></Labeled>
        </div>
      </PreviewBlock>

      {/* 5. 아이콘만 있는 버튼들 */}
      <PreviewBlock title='아이콘만 있는 버튼 - "~아이콘 버튼"으로 요청'>
        <div className="flex flex-wrap gap-2">
          <Labeled name='"검색 아이콘 버튼"'><Button size="icon" variant="outline"><Search className="h-4 w-4" /></Button></Labeled>
          <Labeled name='"설정 아이콘 버튼"'><Button size="icon" variant="outline"><Settings className="h-4 w-4" /></Button></Labeled>
          <Labeled name='"알림 아이콘 버튼"'><Button size="icon" variant="outline"><Bell className="h-4 w-4" /></Button></Labeled>
          <Labeled name='"닫기 아이콘 버튼"'><Button size="icon" variant="ghost"><X className="h-4 w-4" /></Button></Labeled>
          <Labeled name='"더보기(점 3개) 아이콘 버튼"'><Button size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button></Labeled>
          <Labeled name='"편집 아이콘 버튼"'><Button size="icon" variant="ghost"><Edit className="h-4 w-4" /></Button></Labeled>
          <Labeled name='"삭제 아이콘 버튼"'><Button size="icon" variant="ghost" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button></Labeled>
          <Labeled name='"복사 아이콘 버튼"'><Button size="icon" variant="ghost"><Copy className="h-4 w-4" /></Button></Labeled>
          <Labeled name='"새로고침 아이콘 버튼"'><Button size="icon" variant="ghost"><RefreshCw className="h-4 w-4" /></Button></Labeled>
          <Labeled name='"필터 아이콘 버튼"'><Button size="icon" variant="outline"><Filter className="h-4 w-4" /></Button></Labeled>
          <Labeled name='"추가(+) 아이콘 버튼"'><Button size="icon"><Plus className="h-4 w-4" /></Button></Labeled>
          <Labeled name='"전원 아이콘 버튼"'><Button size="icon" variant="outline"><Power className="h-4 w-4" /></Button></Labeled>
        </div>
      </PreviewBlock>

      {/* 6. 토글 버튼 (클릭 시 상태 변경) */}
      <PreviewBlock title='토글 버튼 - "클릭하면 상태가 바뀌는 버튼"으로 요청'>
        <div className="flex flex-wrap gap-3">
          <Labeled name='"좋아요 버튼 - 누르면 빨간 하트로 변하는"'>
            <Button
              size="icon"
              variant={liked ? "default" : "outline"}
              onClick={() => setLiked(!liked)}
              className={liked ? "bg-red-500 hover:bg-red-600 border-red-500 text-white" : ""}
            >
              <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
            </Button>
          </Labeled>
          <Labeled name='"북마크 버튼 - 누르면 저장되는"'>
            <Button
              size="icon"
              variant={bookmarked ? "default" : "outline"}
              onClick={() => setBookmarked(!bookmarked)}
            >
              <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-current" : ""}`} />
            </Button>
          </Labeled>
          <Labeled name='"좋아요 버튼 + 숫자 - 누르면 수가 올라가는"'>
            <Button
              variant={liked ? "default" : "outline"}
              onClick={() => setLiked(!liked)}
              className={liked ? "bg-red-500 hover:bg-red-600 border-red-500 text-white" : ""}
            >
              <Heart className={`h-4 w-4 mr-1.5 ${liked ? "fill-current" : ""}`} />
              {liked ? "13" : "12"}
            </Button>
          </Labeled>
          <Labeled name='"팔로우 버튼 - 누르면 팔로잉으로 바뀌는"'>
            <Button
              variant={following ? "outline" : "default"}
              onClick={() => setFollowing(!following)}
              size="sm"
            >
              {following ? (
                <><Check className="h-3.5 w-3.5 mr-1.5" />팔로잉</>
              ) : (
                <><Plus className="h-3.5 w-3.5 mr-1.5" />팔로우</>
              )}
            </Button>
          </Labeled>
          <Labeled name='"별점 버튼 - 누르면 노란별로 변하는"'>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => { }}
              className="text-yellow-500"
            >
              <Star className="h-4 w-4 fill-current" />
            </Button>
          </Labeled>
          <Labeled name='"재생/일시정지 버튼"'>
            <Button
              size="icon"
              variant="outline"
              onClick={() => setPlaying(!playing)}
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          </Labeled>
        </div>
      </PreviewBlock>

      {/* 7. 상태가 있는 버튼 */}
      <PreviewBlock title='상태 버튼 - "로딩 중/비활성 상태 포함"으로 요청'>
        <div className="flex flex-wrap items-center gap-3">
          <Labeled name='"비활성화된 버튼 - 누를 수 없는 회색 버튼"'><Button disabled>비활성 버튼</Button></Labeled>
          <Labeled name='"로딩 중인 버튼 - 스피너가 돌아가는"'>
            <Button onClick={handleLoading} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {loading ? "처리 중..." : "클릭하면 로딩"}
            </Button>
          </Labeled>
          <Labeled name='"복사 완료 버튼 - 누르면 체크로 바뀌는"'>
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? <><Check className="h-3.5 w-3.5 mr-1.5" />복사됨</> : <><Copy className="h-3.5 w-3.5 mr-1.5" />복사</>}
            </Button>
          </Labeled>
        </div>
      </PreviewBlock>

      {/* 8. 버튼 그룹 */}
      <PreviewBlock title='버튼 그룹 - "3개 버튼이 하나로 연결된"으로 요청'>
        <div className="flex flex-col gap-4">
          <div className="flex">
            <Labeled name='"왼쪽/가운데/오른쪽으로 나뉜 그룹 버튼"'>
              <div className="flex">
                <Button variant="outline" className="rounded-r-none border-r-0">일별</Button>
                <Button variant="outline" className="rounded-none border-r-0">주별</Button>
                <Button variant="outline" className="rounded-l-none">월별</Button>
              </div>
            </Labeled>
          </div>
          <div className="flex">
            <Labeled name='"하나만 선택된 그룹 버튼"'>
              <div className="flex">
                <Button className="rounded-r-none">목록</Button>
                <Button variant="outline" className="rounded-none border-r-0 border-l-0">그리드</Button>
                <Button variant="outline" className="rounded-l-none">보드</Button>
              </div>
            </Labeled>
          </div>
        </div>
      </PreviewBlock>

      {/* 9. 소셜/로그인 버튼 */}
      <PreviewBlock title='소셜 로그인 버튼 - "구글/깃허브 로그인 버튼"으로 요청'>
        <div className="flex flex-col gap-2 max-w-xs">
          <Labeled name='"구글로 로그인 버튼"'>
            <Button variant="outline" className="w-full justify-center">
              <Globe className="h-4 w-4 mr-2" />
              Google로 계속하기
            </Button>
          </Labeled>
          <Labeled name='"깃허브로 로그인 버튼"'>
            <Button className="w-full justify-center">
              <Github className="h-4 w-4 mr-2" />
              GitHub로 로그인
            </Button>
          </Labeled>
          <Labeled name='"이메일로 로그인 버튼"'>
            <Button variant="outline" className="w-full justify-center">
              <Mail className="h-4 w-4 mr-2" />
              이메일로 계속하기
            </Button>
          </Labeled>
        </div>
      </PreviewBlock>

      {/* 10. 전체 너비 버튼 */}
      <PreviewBlock title='전체 너비 버튼 - "가로로 꽉 차는 버튼"으로 요청'>
        <div className="flex flex-col gap-2 max-w-sm">
          <Labeled name='"가로로 꽉 차는 기본 버튼"'>
            <Button className="w-full">회원가입</Button>
          </Labeled>
          <Labeled name='"가로로 꽉 차는 테두리 버튼"'>
            <Button variant="outline" className="w-full">이미 계정이 있나요? 로그인</Button>
          </Labeled>
        </div>
      </PreviewBlock>

      {/* 11. CTA 조합 */}
      <PreviewBlock title='CTA 버튼 조합 - "메인 버튼 + 보조 버튼 나란히"로 요청'>
        <div className="flex flex-col gap-4">
          <Labeled name='"큰 시작 버튼 + 더 알아보기 버튼 나란히"'>
            <div className="flex gap-3">
              <Button size="lg">시작하기 <ArrowRight className="h-4 w-4 ml-2" /></Button>
              <Button size="lg" variant="outline">더 알아보기</Button>
            </div>
          </Labeled>
          <Labeled name='"무료 체험 버튼 + 데모 보기 버튼"'>
            <div className="flex gap-3">
              <Button size="lg"><Zap className="h-4 w-4 mr-2" />무료 체험 시작</Button>
              <Button size="lg" variant="ghost"><Play className="h-4 w-4 mr-2" />데모 보기</Button>
            </div>
          </Labeled>
          <Labeled name='"결제하기 큰 버튼 + 보안 안내 텍스트"'>
            <div className="flex flex-col items-center gap-2">
              <Button size="lg" className="w-full max-w-xs"><CreditCard className="h-4 w-4 mr-2" />결제하기</Button>
              <p className="text-xs text-muted-foreground flex items-center gap-1"><Lock className="h-3 w-3" />안전한 SSL 결제</p>
            </div>
          </Labeled>
        </div>
      </PreviewBlock>

      {/* 12. 뱃지가 있는 버튼 */}
      <PreviewBlock title='알림/뱃지 버튼 - "숫자 뱃지가 있는 알림 버튼"으로 요청'>
        <div className="flex flex-wrap gap-3">
          <Labeled name='"빨간 점이 있는 알림 버튼"'>
            <Button size="icon" variant="outline" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500" />
            </Button>
          </Labeled>
          <Labeled name='"숫자 뱃지가 있는 알림 버튼"'>
            <Button size="icon" variant="outline" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">3</span>
            </Button>
          </Labeled>
          <Labeled name='"NEW 뱃지가 있는 버튼"'>
            <Button variant="outline">
              새 기능 <Badge className="ml-2 text-[9px] py-0 px-1.5">NEW</Badge>
            </Button>
          </Labeled>
          <Labeled name='"장바구니 아이콘 + 수량 뱃지"'>
            <Button size="icon" variant="outline" className="relative">
              <ShoppingCart className="h-4 w-4" />
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-[9px] font-bold text-background">2</span>
            </Button>
          </Labeled>
        </div>
      </PreviewBlock>

      {/* 13. 실제 사용 예시 조합 */}
      <PreviewBlock title="실제 화면에서 자주 보이는 버튼 조합들">
        <div className="flex flex-col gap-5">
          {/* 게시글 반응 버튼 */}
          <div>
            <p className="text-[10px] text-muted-foreground mb-2 font-medium">SNS 게시글 반응 버튼 - "좋아요, 댓글, 공유 버튼 한 줄로"</p>
            <div className="flex gap-1">
              <Labeled name='"좋아요 버튼"'><Button variant="ghost" size="sm"><Heart className="h-3.5 w-3.5 mr-1.5" />좋아요</Button></Labeled>
              <Labeled name='"댓글 버튼"'><Button variant="ghost" size="sm"><MessageCircle className="h-3.5 w-3.5 mr-1.5" />댓글</Button></Labeled>
              <Labeled name='"공유 버튼"'><Button variant="ghost" size="sm"><Share className="h-3.5 w-3.5 mr-1.5" />공유</Button></Labeled>
              <Labeled name='"북마크 버튼"'><Button variant="ghost" size="sm"><Bookmark className="h-3.5 w-3.5" /></Button></Labeled>
            </div>
          </div>
          <Separator />
          {/* 편집 액션 버튼 */}
          <div>
            <p className="text-[10px] text-muted-foreground mb-2 font-medium">편집 화면 상단 버튼 - "저장, 미리보기, 삭제 버튼"</p>
            <div className="flex gap-2">
              <Labeled name='"저장 버튼"'><Button size="sm"><Save className="h-3.5 w-3.5 mr-1.5" />저장</Button></Labeled>
              <Labeled name='"미리보기 버튼"'><Button variant="outline" size="sm"><Eye className="h-3.5 w-3.5 mr-1.5" />미리보기</Button></Labeled>
              <div className="flex-1" />
              <Labeled name='"삭제 버튼 (오른쪽 분리)"'><Button variant="ghost" size="sm" className="text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5 mr-1.5" />삭제</Button></Labeled>
            </div>
          </div>
          <Separator />
          {/* 페이지 이동 */}
          <div>
            <p className="text-[10px] text-muted-foreground mb-2 font-medium">페이지 이동 버튼 - "이전/다음 페이지 버튼"</p>
            <div className="flex justify-between">
              <Labeled name='"이전 페이지 버튼"'><Button variant="outline" size="sm"><ArrowLeft className="h-3.5 w-3.5 mr-1.5" />이전</Button></Labeled>
              <Labeled name='"다음 페이지 버튼"'><Button size="sm">다음 <ArrowRight className="h-3.5 w-3.5 ml-1.5" /></Button></Labeled>
            </div>
          </div>
          <Separator />
          {/* 헤더 액션 */}
          <div>
            <p className="text-[10px] text-muted-foreground mb-2 font-medium">헤더 오른쪽 버튼들 - "검색, 알림, 프로필 아이콘"</p>
            <div className="flex items-center gap-1">
              <Labeled name='"검색 아이콘 버튼"'><Button size="icon" variant="ghost"><Search className="h-4 w-4" /></Button></Labeled>
              <Labeled name='"알림 아이콘 버튼 (빨간 점)"'>
                <Button size="icon" variant="ghost" className="relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
                </Button>
              </Labeled>
              <Labeled name='"프로필 아바타 버튼"'>
                <Button size="icon" variant="ghost" className="rounded-full">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-xs">JD</AvatarFallback>
                  </Avatar>
                </Button>
              </Labeled>
            </div>
          </div>
          <Separator />
          {/* 빈 상태 액션 */}
          <div>
            <p className="text-[10px] text-muted-foreground mb-2 font-medium">빈 화면 안내 버튼 - "아무것도 없을 때 만들기 버튼"</p>
            <div className="flex flex-col items-center gap-2 py-3 rounded-lg border border-dashed border-border">
              <Package className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-xs text-muted-foreground">아직 항목이 없습니다</p>
              <Labeled name='"+ 새로 만들기 버튼"'><Button size="sm"><Plus className="h-3.5 w-3.5 mr-1.5" />새로 만들기</Button></Labeled>
            </div>
          </div>
        </div>
      </PreviewBlock>
    </div>
  )
}

// ─── Form Previews ───
export function FormPreview() {
  const [switchVal, setSwitchVal] = useState(false)
  const [sliderVal, setSliderVal] = useState([50])

  return (
    <div className="flex flex-col gap-6">
      <PreviewBlock title="Text Inputs">
        <div className="flex flex-col gap-4 max-w-sm">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email-demo">Email</Label>
            <Input id="email-demo" type="email" placeholder="you@example.com" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password-demo">Password</Label>
            <Input id="password-demo" type="password" placeholder="Enter password" />
            <p className="text-[11px] text-muted-foreground">Must be at least 8 characters.</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bio-demo">Bio</Label>
            <Textarea id="bio-demo" placeholder="Tell us about yourself..." rows={3} />
          </div>
        </div>
      </PreviewBlock>

      <PreviewBlock title="Select & Dropdown">
        <div className="max-w-sm">
          <Label>Role</Label>
          <Select>
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="editor">Editor</SelectItem>
              <SelectItem value="viewer">Viewer</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </PreviewBlock>

      <PreviewBlock title="Toggle Controls">
        <div className="flex flex-col gap-4 max-w-sm">
          <div className="flex items-center justify-between">
            <Label htmlFor="notif-switch">Notifications</Label>
            <Switch id="notif-switch" checked={switchVal} onCheckedChange={setSwitchVal} />
          </div>
          <Separator />
          <div className="flex items-start gap-3">
            <Checkbox id="terms" />
            <Label htmlFor="terms" className="text-sm leading-relaxed">
              I agree to the Terms of Service and Privacy Policy
            </Label>
          </div>
          <Separator />
          <div className="flex flex-col gap-2">
            <Label>Volume: {sliderVal[0]}%</Label>
            <Slider value={sliderVal} onValueChange={setSliderVal} max={100} step={1} />
          </div>
        </div>
      </PreviewBlock>

      <PreviewBlock title="Form with Validation (Example)">
        <div className="flex flex-col gap-4 max-w-sm">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name-error" className="text-foreground">Name</Label>
            <Input id="name-error" defaultValue="" className="border-destructive" />
            <p className="text-[11px] text-destructive">Name is required.</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email-success" className="text-foreground">Email</Label>
            <Input id="email-success" defaultValue="user@example.com" className="border-green-500" />
            <p className="text-[11px] text-green-600">Looks good!</p>
          </div>
          <Button className="mt-2">Submit</Button>
        </div>
      </PreviewBlock>
    </div>
  )
}

// ─── Card Previews ───
export function CardPreview() {
  return (
    <div className="flex flex-col gap-6">
      <PreviewBlock title="Basic Card">
        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card description goes here.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This is a basic card component with header, content, and footer sections.
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="ghost" size="sm">Cancel</Button>
            <Button size="sm">Save</Button>
          </CardFooter>
        </Card>
      </PreviewBlock>

      <PreviewBlock title="Pricing Cards">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { name: "Starter", price: "$9", features: ["5 projects", "1GB storage", "Email support"] },
            { name: "Pro", price: "$29", features: ["Unlimited projects", "10GB storage", "Priority support", "Analytics"], popular: true },
            { name: "Enterprise", price: "$99", features: ["Everything in Pro", "100GB storage", "24/7 support", "Custom integrations", "SLA"] },
          ].map((plan) => (
            <Card key={plan.name} className={plan.popular ? "border-foreground shadow-md" : ""}>
              <CardHeader className="pb-3">
                {plan.popular && <Badge className="w-fit mb-2 text-[10px]">Popular</Badge>}
                <CardTitle className="text-base">{plan.name}</CardTitle>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-xs text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="flex flex-col gap-1.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Check className="h-3 w-3 text-foreground shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" size="sm" variant={plan.popular ? "default" : "outline"}>
                  Choose {plan.name}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </PreviewBlock>

      <PreviewBlock title="Stats Card">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Total Revenue", value: "$45,231", change: "+20.1%", icon: TrendingUp },
            { label: "Active Users", value: "2,350", change: "+12.5%", icon: Users },
            { label: "Page Views", value: "1.2M", change: "+8.2%", icon: Eye },
            { label: "Orders", value: "573", change: "+4.7%", icon: ShoppingCart },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] text-muted-foreground font-medium">{stat.label}</p>
                  <stat.icon className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <p className="text-xl font-bold text-foreground">{stat.value}</p>
                <p className="text-[10px] text-green-600 mt-0.5">{stat.change} from last month</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </PreviewBlock>

      <PreviewBlock title="User Profile Card">
        <Card className="max-w-xs">
          <CardContent className="flex flex-col items-center p-6">
            <Avatar className="h-16 w-16 mb-3">
              <AvatarFallback className="text-lg bg-foreground text-background">JD</AvatarFallback>
            </Avatar>
            <h3 className="text-sm font-semibold text-foreground">Jane Doe</h3>
            <p className="text-xs text-muted-foreground">Product Designer</p>
            <div className="flex gap-4 mt-4 text-center">
              <div>
                <p className="text-sm font-semibold text-foreground">142</p>
                <p className="text-[10px] text-muted-foreground">Posts</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">1.2K</p>
                <p className="text-[10px] text-muted-foreground">Followers</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">89</p>
                <p className="text-[10px] text-muted-foreground">Following</p>
              </div>
            </div>
            <Button size="sm" className="mt-4 w-full">Follow</Button>
          </CardContent>
        </Card>
      </PreviewBlock>
    </div>
  )
}

// ─── Dialog & Modal Previews ───
export function DialogPreview() {
  return (
    <div className="flex flex-col gap-6">
      {/* 1. 가운데 다이얼로그 (Dialog) */}
      <PreviewBlock title='다이얼로그 (Dialog) - "버튼 누르면 가운데에 팝업 창"'>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              프로필 수정
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>프로필 수정</DialogTitle>
              <DialogDescription>이름과 이메일을 수정할 수 있습니다.</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <div className="flex flex-col gap-1.5">
                <Label>이름</Label>
                <Input placeholder="홍길동" defaultValue="홍길동" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>이메일</Label>
                <Input placeholder="email@example.com" defaultValue="hong@example.com" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm">취소</Button>
              <Button size="sm">저장</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PreviewBlock>

      {/* 2. 확인 팝업 (Alert Dialog) */}
      <PreviewBlock title='확인 팝업 (Alert Dialog) - "정말 삭제하시겠습니까?" 확인/취소'>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              삭제하기
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
              <AlertDialogDescription>
                이 작업은 되돌릴 수 없습니다. 해당 항목이 서버에서 영구적으로 삭제됩니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                삭제
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </PreviewBlock>

      {/* 3. 사이드 패널 (Sheet) */}
      <PreviewBlock title='사이드 패널 (Sheet) - "오른쪽에서 밀려 나오는 설정 패널"'>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Open Settings
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Settings</SheetTitle>
              <SheetDescription>Manage your account preferences.</SheetDescription>
            </SheetHeader>
            <div className="flex flex-col gap-4 py-4">
              <div className="flex items-center justify-between">
                <Label>Dark Mode</Label>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label>Email Notifications</Label>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex flex-col gap-1.5">
                <Label>Language</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ko">Korean</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ja">Japanese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </PreviewBlock>

      {/* 4. 하단 드로어 (Drawer) */}
      <PreviewBlock title='하단 드로어 (Drawer) - "아래에서 올라오는 메뉴 (모바일)"'>
        <Drawer>
          <DrawerTrigger asChild>
            <Button size="sm" variant="outline">
              <Menu className="h-4 w-4 mr-2" />
              옵션 열기
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>정렬 방식</DrawerTitle>
              <DrawerDescription>원하는 정렬 방식을 선택하세요.</DrawerDescription>
            </DrawerHeader>
            <div className="flex flex-col gap-1 px-4 pb-2">
              {["최신순", "인기순", "가격 낮은순", "가격 높은순", "평점순"].map((item) => (
                <button key={item} className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm hover:bg-accent transition-colors text-left">
                  <Check className="h-4 w-4 text-muted-foreground" />
                  {item}
                </button>
              ))}
            </div>
            <DrawerFooter>
              <Button variant="outline">닫기</Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </PreviewBlock>

      {/* 5. 검색 팔레트 (Command) */}
      <PreviewBlock title='검색 팔레트 (Command) - "Ctrl+K 검색창 스타일"'>
        <div className="rounded-lg border border-border shadow-md max-w-sm">
          <Command>
            <CommandInput placeholder="검색어를 입력하세요..." />
            <CommandList>
              <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
              <CommandGroup heading="페이지">
                <CommandItem><Home className="h-4 w-4 mr-2" />홈</CommandItem>
                <CommandItem><User className="h-4 w-4 mr-2" />프로필</CommandItem>
                <CommandItem><Settings className="h-4 w-4 mr-2" />설정</CommandItem>
              </CommandGroup>
              <CommandGroup heading="최근 검색">
                <CommandItem><Clock className="h-4 w-4 mr-2" />대시보드 만들기</CommandItem>
                <CommandItem><Clock className="h-4 w-4 mr-2" />버튼 스타일 변경</CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      </PreviewBlock>

      {/* 6. 툴팁 (Tooltip) */}
      <PreviewBlock title='툴팁 (Tooltip) - "마우스 올리면 설명 말풍선"'>
        <TooltipProvider>
          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon">
                  <Heart className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add to favorites</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon">
                  <Share className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Share this page</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon">
                  <Star className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add to bookmarks</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </PreviewBlock>

      <PreviewBlock title="Accordion">
        <Accordion type="single" collapsible className="w-full max-w-sm">
          <AccordionItem value="faq-1">
            <AccordionTrigger className="text-sm">What is v0?</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">
              v0 is an AI-powered UI generation tool by Vercel.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="faq-2">
            <AccordionTrigger className="text-sm">Is it free?</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">
              v0 offers both free and paid plans with different usage limits.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="faq-3">
            <AccordionTrigger className="text-sm">What frameworks are supported?</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">
              v0 primarily generates React and Next.js code with Tailwind CSS.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </PreviewBlock>
    </div>
  )
}

// ─── Navigation Previews ───
export function NavigationPreview() {
  return (
    <div className="flex flex-col gap-6">
      <PreviewBlock title="Navbar">
        <div className="rounded-lg border border-border bg-background p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <span className="text-sm font-bold text-foreground">Brand</span>
              <nav className="hidden sm:flex items-center gap-4">
                {["Home", "Products", "About", "Contact"].map((item) => (
                  <span
                    key={item}
                    className={`text-xs cursor-pointer transition-colors ${item === "Home" ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {item}
                  </span>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Search className="h-4 w-4" />
              </Button>
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-[10px] bg-foreground text-background">U</AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="icon" className="h-8 w-8 sm:hidden">
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </PreviewBlock>

      <PreviewBlock title="Sidebar Navigation">
        <div className="flex rounded-lg border border-border overflow-hidden bg-background max-w-md">
          <div className="w-48 border-r border-border bg-muted/30 p-3">
            <p className="text-xs font-bold text-foreground mb-3">Dashboard</p>
            <nav className="flex flex-col gap-0.5">
              {[
                { icon: Home, label: "Home", active: true },
                { icon: BarChart3, label: "Analytics", active: false },
                { icon: Users, label: "Users", active: false },
                { icon: FileText, label: "Documents", active: false },
                { icon: Settings, label: "Settings", active: false },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs cursor-pointer transition-colors ${item.active
                      ? "bg-foreground text-background font-medium"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </div>
              ))}
            </nav>
          </div>
          <div className="flex-1 p-4">
            <p className="text-xs text-muted-foreground">Main content area</p>
          </div>
        </div>
      </PreviewBlock>

      <PreviewBlock title="Tabs Navigation">
        <Tabs defaultValue="overview" className="max-w-sm">
          <TabsList>
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs">Analytics</TabsTrigger>
            <TabsTrigger value="reports" className="text-xs">Reports</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-3">
            <p className="text-xs text-muted-foreground">Overview content goes here.</p>
          </TabsContent>
          <TabsContent value="analytics" className="mt-3">
            <p className="text-xs text-muted-foreground">Analytics content goes here.</p>
          </TabsContent>
          <TabsContent value="reports" className="mt-3">
            <p className="text-xs text-muted-foreground">Reports content goes here.</p>
          </TabsContent>
        </Tabs>
      </PreviewBlock>

      <PreviewBlock title="Breadcrumb">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-muted-foreground hover:text-foreground cursor-pointer">Home</span>
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
          <span className="text-muted-foreground hover:text-foreground cursor-pointer">Products</span>
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
          <span className="text-foreground font-medium">Detail</span>
        </div>
      </PreviewBlock>

      <PreviewBlock title="Bottom Tab Bar (Mobile)">
        <div className="rounded-lg border border-border bg-background max-w-xs mx-auto">
          <div className="flex items-center justify-around py-2">
            {[
              { icon: Home, label: "Home", active: true },
              { icon: Search, label: "Search", active: false },
              { icon: Plus, label: "Create", active: false },
              { icon: Heart, label: "Saved", active: false },
              { icon: User, label: "Profile", active: false },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-0.5 cursor-pointer">
                <item.icon
                  className={`h-4 w-4 ${item.active ? "text-foreground" : "text-muted-foreground"}`}
                />
                <span
                  className={`text-[9px] ${item.active ? "text-foreground font-medium" : "text-muted-foreground"}`}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </PreviewBlock>
    </div>
  )
}

// ─── Table & Data Display Previews ───
export function DataDisplayPreview() {
  return (
    <div className="flex flex-col gap-6">
      <PreviewBlock title="Data Table">
        <div className="rounded-md border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Name</TableHead>
                <TableHead className="text-xs">Email</TableHead>
                <TableHead className="text-xs">Role</TableHead>
                <TableHead className="text-xs">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { name: "Kim Minjun", email: "minjun@email.com", role: "Admin", status: "Active" },
                { name: "Lee Sohee", email: "sohee@email.com", role: "Editor", status: "Active" },
                { name: "Park Jihoon", email: "jihoon@email.com", role: "Viewer", status: "Inactive" },
              ].map((user) => (
                <TableRow key={user.email}>
                  <TableCell className="text-xs font-medium text-foreground">{user.name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === "Admin" ? "default" : "secondary"} className="text-[10px]">
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${user.status === "Active" ? "bg-green-500" : "bg-muted-foreground"}`}
                      />
                      <span className="text-xs text-muted-foreground">{user.status}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </PreviewBlock>

      <PreviewBlock title="Badges">
        <div className="flex flex-wrap gap-2">
          <Labeled name='Badge default - 주요 상태'><Badge>Default</Badge></Labeled>
          <Labeled name='Badge secondary - 보조'><Badge variant="secondary">Secondary</Badge></Labeled>
          <Labeled name='Badge outline - 카테고리'><Badge variant="outline">Outline</Badge></Labeled>
          <Labeled name='Badge destructive - 에러'><Badge variant="destructive">Error</Badge></Labeled>
          <Labeled name='커스텀 Badge - 성공'><Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-0">Success</Badge></Labeled>
          <Labeled name='커스텀 Badge - 경고'><Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-0">Warning</Badge></Labeled>
        </div>
      </PreviewBlock>

      <PreviewBlock title="Progress & Status">
        <div className="flex flex-col gap-4 max-w-sm">
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Upload Progress</span>
              <span className="text-foreground font-medium">67%</span>
            </div>
            <Progress value={67} />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Storage Used</span>
              <span className="text-foreground font-medium">89%</span>
            </div>
            <Progress value={89} />
          </div>
        </div>
      </PreviewBlock>

      <PreviewBlock title="Avatar Group">
        <div className="flex items-center">
          <div className="flex -space-x-2">
            {["JD", "SK", "MJ", "YH"].map((initials, i) => (
              <Avatar key={initials} className="h-8 w-8 border-2 border-background">
                <AvatarFallback className="text-[10px] bg-foreground text-background">
                  {initials}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          <span className="ml-3 text-xs text-muted-foreground">+12 others</span>
        </div>
      </PreviewBlock>
    </div>
  )
}

// ─── Layout Pattern Previews ───
export function LayoutPreview() {
  return (
    <div className="flex flex-col gap-6">
      <PreviewBlock title="Sidebar + Content">
        <div className="flex rounded-lg border border-border overflow-hidden h-40 bg-background">
          <div className="w-1/4 border-r border-border bg-muted/30 p-2">
            <div className="h-3 w-full rounded bg-muted mb-2" />
            <div className="h-2 w-3/4 rounded bg-muted mb-1.5" />
            <div className="h-2 w-3/4 rounded bg-muted mb-1.5" />
            <div className="h-2 w-3/4 rounded bg-muted mb-1.5" />
            <div className="h-2 w-3/4 rounded bg-muted" />
          </div>
          <div className="flex-1 p-3">
            <div className="h-3 w-1/3 rounded bg-muted mb-3" />
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="h-12 rounded bg-muted" />
              <div className="h-12 rounded bg-muted" />
              <div className="h-12 rounded bg-muted" />
            </div>
            <div className="h-2 w-full rounded bg-muted mb-1.5" />
            <div className="h-2 w-5/6 rounded bg-muted mb-1.5" />
            <div className="h-2 w-4/6 rounded bg-muted" />
          </div>
        </div>
      </PreviewBlock>

      <PreviewBlock title="Header + Content + Footer">
        <div className="flex flex-col rounded-lg border border-border overflow-hidden h-40 bg-background">
          <div className="border-b border-border bg-muted/30 p-2 flex justify-between items-center">
            <div className="h-2.5 w-16 rounded bg-muted" />
            <div className="flex gap-2">
              <div className="h-2 w-10 rounded bg-muted" />
              <div className="h-2 w-10 rounded bg-muted" />
              <div className="h-2 w-10 rounded bg-muted" />
            </div>
          </div>
          <div className="flex-1 p-3">
            <div className="h-3 w-1/4 rounded bg-muted mb-2 mx-auto" />
            <div className="h-2 w-1/2 rounded bg-muted mb-3 mx-auto" />
            <div className="grid grid-cols-3 gap-2">
              <div className="h-16 rounded bg-muted" />
              <div className="h-16 rounded bg-muted" />
              <div className="h-16 rounded bg-muted" />
            </div>
          </div>
          <div className="border-t border-border bg-muted/30 p-2 flex justify-center">
            <div className="h-2 w-24 rounded bg-muted" />
          </div>
        </div>
      </PreviewBlock>

      <PreviewBlock title="Grid Layouts">
        <div className="flex flex-col gap-3">
          <p className="text-[11px] text-muted-foreground">2 Columns</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="h-14 rounded-md bg-muted border border-border" />
            <div className="h-14 rounded-md bg-muted border border-border" />
          </div>
          <p className="text-[11px] text-muted-foreground">3 Columns</p>
          <div className="grid grid-cols-3 gap-2">
            <div className="h-14 rounded-md bg-muted border border-border" />
            <div className="h-14 rounded-md bg-muted border border-border" />
            <div className="h-14 rounded-md bg-muted border border-border" />
          </div>
          <p className="text-[11px] text-muted-foreground">Bento Grid (Mixed)</p>
          <div className="grid grid-cols-3 grid-rows-2 gap-2">
            <div className="col-span-2 row-span-2 h-28 rounded-md bg-muted border border-border" />
            <div className="h-[52px] rounded-md bg-muted border border-border" />
            <div className="h-[52px] rounded-md bg-muted border border-border" />
          </div>
        </div>
      </PreviewBlock>

      <PreviewBlock title="Split Layout (Auth Page Style)">
        <div className="flex rounded-lg border border-border overflow-hidden h-40 bg-background">
          <div className="w-1/2 bg-foreground p-3 flex items-center justify-center">
            <div className="text-center">
              <div className="h-3 w-16 rounded bg-background/30 mb-2 mx-auto" />
              <div className="h-2 w-24 rounded bg-background/20 mx-auto" />
            </div>
          </div>
          <div className="w-1/2 p-3 flex items-center justify-center">
            <div className="w-full max-w-[120px]">
              <div className="h-2 w-12 rounded bg-muted mb-2" />
              <div className="h-5 w-full rounded bg-muted mb-2" />
              <div className="h-2 w-12 rounded bg-muted mb-2" />
              <div className="h-5 w-full rounded bg-muted mb-3" />
              <div className="h-5 w-full rounded bg-foreground" />
            </div>
          </div>
        </div>
      </PreviewBlock>
    </div>
  )
}

// ─── Color & Typography Previews ───
export function ColorTypographyPreview() {
  return (
    <div className="flex flex-col gap-6">
      <PreviewBlock title="Design Tokens (Color Palette)">
        <div className="grid grid-cols-2 gap-2">
          {[
            { name: "Background", cls: "bg-background border", text: "text-foreground" },
            { name: "Foreground", cls: "bg-foreground", text: "text-background" },
            { name: "Muted", cls: "bg-muted", text: "text-muted-foreground" },
            { name: "Accent", cls: "bg-accent", text: "text-accent-foreground" },
            { name: "Primary", cls: "bg-primary", text: "text-primary-foreground" },
            { name: "Secondary", cls: "bg-secondary", text: "text-secondary-foreground" },
            { name: "Destructive", cls: "bg-destructive", text: "text-destructive-foreground" },
            { name: "Border", cls: "bg-border", text: "text-foreground" },
          ].map((c) => (
            <div key={c.name} className={`rounded-md p-3 ${c.cls}`}>
              <p className={`text-[10px] font-medium ${c.text}`}>{c.name}</p>
            </div>
          ))}
        </div>
      </PreviewBlock>

      <PreviewBlock title="Typography Scale">
        <div className="flex flex-col gap-3">
          <p className="text-3xl font-bold text-foreground tracking-tight">Heading 1 (text-3xl)</p>
          <p className="text-2xl font-semibold text-foreground tracking-tight">Heading 2 (text-2xl)</p>
          <p className="text-xl font-semibold text-foreground">Heading 3 (text-xl)</p>
          <p className="text-lg font-medium text-foreground">Heading 4 (text-lg)</p>
          <p className="text-base text-foreground">Body text (text-base)</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Secondary text - Used for descriptions and helper text. (text-sm)
          </p>
          <p className="text-xs text-muted-foreground">Caption text (text-xs)</p>
        </div>
      </PreviewBlock>

      <PreviewBlock title="Dark / Light Mode Toggle">
        <div className="flex gap-3">
          <div className="flex-1 rounded-lg p-4 bg-white border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Sun className="h-3.5 w-3.5 text-gray-900" />
              <p className="text-xs font-medium text-gray-900">Light Mode</p>
            </div>
            <p className="text-[10px] text-gray-500">Clean, bright interface</p>
          </div>
          <div className="flex-1 rounded-lg p-4 bg-gray-950 border border-gray-800">
            <div className="flex items-center gap-2 mb-2">
              <Moon className="h-3.5 w-3.5 text-gray-100" />
              <p className="text-xs font-medium text-gray-100">Dark Mode</p>
            </div>
            <p className="text-[10px] text-gray-400">Easy on the eyes</p>
          </div>
        </div>
      </PreviewBlock>
    </div>
  )
}

// ─── Animation Previews ───
export function AnimationPreview() {
  return (
    <div className="flex flex-col gap-6">
      <PreviewBlock title="Hover Effects (hover over the cards)">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-border bg-background p-4 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-lg cursor-pointer">
            <p className="text-xs font-medium text-foreground">Lift</p>
            <p className="text-[10px] text-muted-foreground mt-1">translateY + shadow</p>
          </div>
          <div className="rounded-lg border border-border bg-background p-4 text-center transition-all duration-200 hover:scale-105 cursor-pointer">
            <p className="text-xs font-medium text-foreground">Scale</p>
            <p className="text-[10px] text-muted-foreground mt-1">scale(1.05)</p>
          </div>
          <div className="rounded-lg border border-border bg-background p-4 text-center transition-all duration-200 hover:border-foreground cursor-pointer">
            <p className="text-xs font-medium text-foreground">Border</p>
            <p className="text-[10px] text-muted-foreground mt-1">border-color</p>
          </div>
        </div>
      </PreviewBlock>

      <PreviewBlock title="Loading Animations">
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-foreground" />
            <p className="text-[10px] text-muted-foreground">Spinner</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-1">
              <div className="h-2 w-2 rounded-full bg-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="h-2 w-2 rounded-full bg-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="h-2 w-2 rounded-full bg-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <p className="text-[10px] text-muted-foreground">Dots</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="h-5 w-5 animate-pulse rounded-full bg-foreground/30" />
            <p className="text-[10px] text-muted-foreground">Pulse</p>
          </div>
        </div>
      </PreviewBlock>

      <PreviewBlock title="Skeleton Loading">
        <div className="flex flex-col gap-3 max-w-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
            <div className="flex-1 flex flex-col gap-1.5">
              <div className="h-3 w-1/3 rounded bg-muted animate-pulse" />
              <div className="h-2 w-1/2 rounded bg-muted animate-pulse" />
            </div>
          </div>
          <div className="h-2 w-full rounded bg-muted animate-pulse" />
          <div className="h-2 w-5/6 rounded bg-muted animate-pulse" />
          <div className="h-2 w-4/6 rounded bg-muted animate-pulse" />
        </div>
      </PreviewBlock>

      <PreviewBlock title="Button Hover States">
        <div className="flex flex-wrap gap-2">
          <Button className="transition-all duration-200 hover:shadow-md">
            Shadow
          </Button>
          <Button variant="outline" className="transition-all duration-200 hover:bg-foreground hover:text-background">
            Fill on Hover
          </Button>
          <Button variant="ghost" className="transition-all duration-200 hover:scale-105">
            Scale
          </Button>
        </div>
      </PreviewBlock>
    </div>
  )
}

// ─── Toast & Alert Preview ───
export function ToastAlertPreview() {
  return (
    <div className="flex flex-col gap-6">
      <PreviewBlock title="Alert Examples">
        <div className="flex flex-col gap-3 max-w-md">
          <div className="flex items-start gap-3 rounded-lg border border-border p-4">
            <Check className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">Success</p>
              <p className="text-xs text-muted-foreground">Your changes have been saved.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-destructive bg-destructive/5 p-4">
            <X className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-destructive">Error</p>
              <p className="text-xs text-muted-foreground">Something went wrong. Please try again.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-yellow-300 bg-yellow-50 p-4">
            <Star className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Warning</p>
              <p className="text-xs text-yellow-700">Your trial expires in 3 days.</p>
            </div>
          </div>
        </div>
      </PreviewBlock>

      <PreviewBlock title="Toast Style (Preview)">
        <div className="flex flex-col gap-2 items-end max-w-sm ml-auto">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-background shadow-lg p-3">
            <Check className="h-3.5 w-3.5 text-green-600 shrink-0" />
            <p className="text-xs text-foreground">Saved successfully.</p>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-background shadow-lg p-3">
            <p className="text-xs text-foreground">Item deleted.</p>
            <button className="text-xs font-medium text-primary hover:underline">Undo</button>
          </div>
        </div>
      </PreviewBlock>
    </div>
  )
}

// ─── Dropdown Preview ───
export function DropdownPreview() {
  return (
    <div className="flex flex-col gap-6">
      <PreviewBlock title='드롭다운 메뉴 (Dropdown Menu) - "클릭하면 아래로 옵션 목록"'>
        <div className="flex flex-wrap gap-3">
          <Labeled name='"계정 드롭다운 - 프로필/설정/삭제"'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="text-xs h-8">
                  <User className="h-3 w-3 mr-1.5" />내 계정
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel className="text-xs">내 계정</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-xs"><User className="h-3.5 w-3.5 mr-2" />프로필</DropdownMenuItem>
                <DropdownMenuItem className="text-xs"><Settings className="h-3.5 w-3.5 mr-2" />설정</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-xs text-destructive"><Trash2 className="h-3.5 w-3.5 mr-2" />계정 삭제</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Labeled>

          <Labeled name='"더보기 드롭다운 - 보기/다운로드/공유/삭제"'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="text-xs">작업</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-xs"><Eye className="h-3.5 w-3.5 mr-2" />보기</DropdownMenuItem>
                <DropdownMenuItem className="text-xs"><Download className="h-3.5 w-3.5 mr-2" />다운로드</DropdownMenuItem>
                <DropdownMenuItem className="text-xs"><Share className="h-3.5 w-3.5 mr-2" />공유</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-xs text-destructive"><Trash2 className="h-3.5 w-3.5 mr-2" />삭제</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Labeled>
        </div>
      </PreviewBlock>
    </div>
  )
}

// ─── Spacing Preview ───
export function SpacingPreview() {
  return (
    <div className="flex flex-col gap-6">
      <PreviewBlock title="Spacing Scale">
        <div className="flex flex-col gap-2">
          {[
            { label: "gap-1 (4px)", size: "w-1" },
            { label: "gap-2 (8px)", size: "w-2" },
            { label: "gap-4 (16px)", size: "w-4" },
            { label: "gap-6 (24px)", size: "w-6" },
            { label: "gap-8 (32px)", size: "w-8" },
            { label: "gap-12 (48px)", size: "w-12" },
            { label: "gap-16 (64px)", size: "w-16" },
            { label: "gap-20 (80px)", size: "w-20" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <span className="text-[10px] text-muted-foreground w-24 shrink-0">{s.label}</span>
              <div className={`h-3 rounded bg-foreground/20 ${s.size}`} />
            </div>
          ))}
        </div>
      </PreviewBlock>

      <PreviewBlock title="Before / After (Spacing)">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] text-destructive font-medium mb-2">Before (Too tight)</p>
            <div className="rounded-lg border border-border p-2">
              <div className="h-2 w-1/2 rounded bg-muted mb-1" />
              <div className="h-1.5 w-3/4 rounded bg-muted mb-1" />
              <div className="h-6 w-full rounded bg-muted mb-1" />
              <div className="h-6 w-full rounded bg-muted mb-1" />
              <div className="h-6 w-1/3 rounded bg-foreground" />
            </div>
          </div>
          <div>
            <p className="text-[10px] text-green-600 font-medium mb-2">After (Better spacing)</p>
            <div className="rounded-lg border border-border p-5">
              <div className="h-2.5 w-1/2 rounded bg-muted mb-2" />
              <div className="h-1.5 w-3/4 rounded bg-muted mb-4" />
              <div className="h-7 w-full rounded bg-muted mb-3" />
              <div className="h-7 w-full rounded bg-muted mb-4" />
              <div className="h-7 w-1/3 rounded bg-foreground" />
            </div>
          </div>
        </div>
      </PreviewBlock>
    </div>
  )
}

// ─── Shadow & Border Preview ───
export function ShadowBorderPreview() {
  return (
    <div className="flex flex-col gap-6">
      <PreviewBlock title="Shadow Scale">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "shadow-sm", cls: "shadow-sm" },
            { label: "shadow", cls: "shadow" },
            { label: "shadow-md", cls: "shadow-md" },
            { label: "shadow-lg", cls: "shadow-lg" },
            { label: "shadow-xl", cls: "shadow-xl" },
            { label: "shadow-2xl", cls: "shadow-2xl" },
          ].map((s) => (
            <Labeled key={s.label} name={s.label}>
              <div className={`rounded-lg bg-background border border-border p-4 text-center ${s.cls}`}>
                <p className="text-[10px] font-medium text-foreground">{s.label}</p>
              </div>
            </Labeled>
          ))}
        </div>
      </PreviewBlock>

      <PreviewBlock title="Border Radius">
        <div className="flex flex-wrap gap-3 items-end">
          {[
            { label: "rounded-sm", cls: "rounded-sm", size: "h-12 w-12" },
            { label: "rounded", cls: "rounded", size: "h-12 w-12" },
            { label: "rounded-md", cls: "rounded-md", size: "h-12 w-12" },
            { label: "rounded-lg", cls: "rounded-lg", size: "h-12 w-12" },
            { label: "rounded-xl", cls: "rounded-xl", size: "h-12 w-12" },
            { label: "rounded-2xl", cls: "rounded-2xl", size: "h-12 w-12" },
            { label: "rounded-full", cls: "rounded-full", size: "h-12 w-12" },
          ].map((r) => (
            <Labeled key={r.label} name={r.label}>
              <div className={`bg-foreground/10 border border-border ${r.cls} ${r.size}`} />
            </Labeled>
          ))}
        </div>
      </PreviewBlock>
    </div>
  )
}

// ─── Landing Page Preview ───
export function LandingPagePreview() {
  return (
    <div className="flex flex-col gap-6">
      <PreviewBlock title="Landing Page Structure">
        <div className="flex flex-col rounded-lg border border-border overflow-hidden bg-background text-[9px]">
          {/* Navbar */}
          <div className="border-b border-border px-3 py-2 flex items-center justify-between bg-muted/20">
            <span className="font-bold text-foreground">Logo</span>
            <div className="flex gap-3 text-muted-foreground">
              <span>Features</span><span>Pricing</span><span>Blog</span>
            </div>
            <div className="h-4 w-14 rounded bg-foreground" />
          </div>
          {/* Hero */}
          <div className="px-4 py-8 text-center">
            <div className="h-3 w-2/3 rounded bg-foreground mx-auto mb-2" />
            <div className="h-2 w-1/2 rounded bg-muted mx-auto mb-3" />
            <div className="flex gap-2 justify-center">
              <div className="h-4 w-16 rounded bg-foreground" />
              <div className="h-4 w-16 rounded border border-border" />
            </div>
          </div>
          {/* Features */}
          <div className="px-4 py-4 border-t border-border">
            <div className="h-2 w-16 rounded bg-muted mx-auto mb-3" />
            <div className="grid grid-cols-3 gap-2">
              <div className="h-16 rounded bg-muted/50 border border-border p-2">
                <div className="h-3 w-3 rounded bg-foreground/20 mb-1" />
                <div className="h-1.5 w-2/3 rounded bg-muted" />
              </div>
              <div className="h-16 rounded bg-muted/50 border border-border p-2">
                <div className="h-3 w-3 rounded bg-foreground/20 mb-1" />
                <div className="h-1.5 w-2/3 rounded bg-muted" />
              </div>
              <div className="h-16 rounded bg-muted/50 border border-border p-2">
                <div className="h-3 w-3 rounded bg-foreground/20 mb-1" />
                <div className="h-1.5 w-2/3 rounded bg-muted" />
              </div>
            </div>
          </div>
          {/* Pricing */}
          <div className="px-4 py-4 border-t border-border">
            <div className="h-2 w-12 rounded bg-muted mx-auto mb-3" />
            <div className="grid grid-cols-3 gap-2">
              <div className="h-20 rounded border border-border p-2">
                <div className="h-1.5 w-8 rounded bg-muted mb-1" />
                <div className="h-2 w-6 rounded bg-foreground mb-1" />
                <div className="h-1 w-full rounded bg-muted mb-0.5" />
                <div className="h-1 w-full rounded bg-muted mb-0.5" />
                <div className="h-3 w-full rounded border border-border mt-1" />
              </div>
              <div className="h-20 rounded border-2 border-foreground p-2 shadow-sm">
                <div className="h-1.5 w-8 rounded bg-muted mb-1" />
                <div className="h-2 w-6 rounded bg-foreground mb-1" />
                <div className="h-1 w-full rounded bg-muted mb-0.5" />
                <div className="h-1 w-full rounded bg-muted mb-0.5" />
                <div className="h-3 w-full rounded bg-foreground mt-1" />
              </div>
              <div className="h-20 rounded border border-border p-2">
                <div className="h-1.5 w-8 rounded bg-muted mb-1" />
                <div className="h-2 w-6 rounded bg-foreground mb-1" />
                <div className="h-1 w-full rounded bg-muted mb-0.5" />
                <div className="h-1 w-full rounded bg-muted mb-0.5" />
                <div className="h-3 w-full rounded border border-border mt-1" />
              </div>
            </div>
          </div>
          {/* Footer */}
          <div className="border-t border-border px-3 py-2 bg-muted/20 text-center">
            <div className="h-1.5 w-24 rounded bg-muted mx-auto" />
          </div>
        </div>
      </PreviewBlock>
    </div>
  )
}

// ─── Dashboard Preview ───
export function DashboardPreview() {
  return (
    <div className="flex flex-col gap-6">
      <PreviewBlock title="Dashboard Structure">
        <div className="flex rounded-lg border border-border overflow-hidden bg-background h-52">
          {/* Sidebar */}
          <div className="w-1/4 border-r border-border bg-muted/20 p-2">
            <div className="h-3 w-full rounded bg-foreground/20 mb-3" />
            {["Home", "Analytics", "Users", "Orders", "Settings"].map((label) => (
              <div key={label} className={`flex items-center gap-1.5 px-1.5 py-1 rounded text-[8px] mb-0.5 ${label === "Home" ? "bg-foreground text-background font-medium" : "text-muted-foreground"}`}>
                <div className="h-2.5 w-2.5 rounded bg-current opacity-40" />
                {label}
              </div>
            ))}
          </div>
          {/* Main */}
          <div className="flex-1 p-3">
            <div className="h-2 w-16 rounded bg-muted mb-3" />
            <div className="grid grid-cols-4 gap-1.5 mb-3">
              {["$45K", "2.3K", "1.2M", "573"].map((val) => (
                <div key={val} className="rounded border border-border p-1.5">
                  <div className="h-1 w-8 rounded bg-muted mb-1" />
                  <p className="text-[9px] font-bold text-foreground">{val}</p>
                  <p className="text-[7px] text-green-600">+12%</p>
                </div>
              ))}
            </div>
            <div className="h-16 rounded border border-border bg-muted/20 mb-2 p-2">
              <div className="h-1 w-6 rounded bg-muted mb-1.5" />
              <div className="flex items-end gap-1 h-8">
                {[30, 45, 25, 60, 40, 55, 70, 50].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t bg-foreground/15" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
            <div className="h-12 rounded border border-border p-1.5">
              <div className="flex gap-2 mb-1 text-[7px] text-muted-foreground">
                <span className="flex-1">Name</span><span className="flex-1">Status</span><span className="flex-1">Amount</span>
              </div>
              <div className="flex gap-2 text-[7px]">
                <span className="flex-1 text-foreground">John</span>
                <span className="flex-1"><span className="bg-green-100 text-green-700 px-1 rounded text-[6px]">Active</span></span>
                <span className="flex-1 text-foreground">$120</span>
              </div>
            </div>
          </div>
        </div>
      </PreviewBlock>
    </div>
  )
}

// ─── Auth Page Preview ───
export function AuthPagePreview() {
  return (
    <div className="flex flex-col gap-6">
      <PreviewBlock title="Split Login Page">
        <div className="flex rounded-lg border border-border overflow-hidden h-44">
          <div className="w-1/2 bg-foreground p-4 flex flex-col justify-center items-center">
            <div className="h-6 w-6 rounded-lg bg-background/20 mb-2" />
            <div className="h-2 w-20 rounded bg-background/30 mb-1" />
            <div className="h-1.5 w-28 rounded bg-background/15" />
          </div>
          <div className="w-1/2 bg-background p-4 flex flex-col justify-center items-center">
            <div className="w-32">
              <div className="h-2 w-12 rounded bg-foreground mb-3" />
              <div className="h-1.5 w-8 rounded bg-muted mb-1" />
              <div className="h-5 w-full rounded border border-border mb-2" />
              <div className="h-1.5 w-8 rounded bg-muted mb-1" />
              <div className="h-5 w-full rounded border border-border mb-3" />
              <div className="h-5 w-full rounded bg-foreground mb-2" />
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[7px] text-muted-foreground">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="flex gap-1.5">
                <div className="flex-1 h-5 rounded border border-border" />
                <div className="flex-1 h-5 rounded border border-border" />
              </div>
            </div>
          </div>
        </div>
      </PreviewBlock>

      <PreviewBlock title="Center Card Login">
        <div className="flex justify-center py-4">
          <div className="w-48 rounded-xl border border-border bg-background p-4 shadow-sm">
            <div className="h-5 w-5 rounded bg-foreground mx-auto mb-2" />
            <div className="h-2 w-16 rounded bg-foreground mx-auto mb-1" />
            <div className="h-1.5 w-24 rounded bg-muted mx-auto mb-3" />
            <div className="h-5 w-full rounded border border-border mb-2" />
            <div className="h-5 w-full rounded border border-border mb-3" />
            <div className="h-5 w-full rounded bg-foreground mb-2" />
            <div className="flex gap-1.5">
              <div className="flex-1 h-5 rounded border border-border" />
              <div className="flex-1 h-5 rounded border border-border" />
            </div>
          </div>
        </div>
      </PreviewBlock>
    </div>
  )
}

// ─── Settings Page Preview ───
export function SettingsPagePreview() {
  const [emailNotif, setEmailNotif] = useState(true)
  const [pushNotif, setPushNotif] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  return (
    <div className="flex flex-col gap-6">
      <PreviewBlock title="설정 페이지 미리보기">
        <div className="w-full space-y-4">
          {/* Profile section */}
          <Labeled name='"프로필 설정 섹션"'>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">프로필 정보</CardTitle>
                <CardDescription className="text-xs">기본 정보를 수정하세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="text-xs">JD</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">홍길동</p>
                    <p className="text-[10px] text-muted-foreground">gildong@email.com</p>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs h-7">사진 변경</Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[10px]">이름</Label>
                    <Input defaultValue="홍길동" className="h-8 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">닉네임</Label>
                    <Input defaultValue="gildong" className="h-8 text-xs" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">이메일</Label>
                  <Input defaultValue="gildong@email.com" className="h-8 text-xs" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">자기소개</Label>
                  <Input defaultValue="안녕하세요! 개발을 좋아합니다." className="h-8 text-xs" />
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button size="sm" className="text-xs h-7">저장</Button>
              </CardFooter>
            </Card>
          </Labeled>
          {/* Notification section */}
          <Labeled name='"알림 설정 섹션 - 스위치 토글"'>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">알림 설정</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium">이메일 알림</p>
                    <p className="text-[10px] text-muted-foreground">새 소식을 이메일로 받습니다</p>
                  </div>
                  <Switch checked={emailNotif} onCheckedChange={setEmailNotif} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium">푸시 알림</p>
                    <p className="text-[10px] text-muted-foreground">브라우저 알림을 받습니다</p>
                  </div>
                  <Switch checked={pushNotif} onCheckedChange={setPushNotif} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium">마케팅 알림</p>
                    <p className="text-[10px] text-muted-foreground">이벤트 및 프로모션 정보</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </Labeled>
          {/* Appearance */}
          <Labeled name='"외관 설정 - 다크모드, 언어"'>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">외관 설정</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium">다크 모드</p>
                    <p className="text-[10px] text-muted-foreground">어두운 테마를 사용합니다</p>
                  </div>
                  <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium">언어</p>
                    <p className="text-[10px] text-muted-foreground">인터페이스 언어 설정</p>
                  </div>
                  <Badge variant="secondary" className="text-[9px]">한국어</Badge>
                </div>
              </CardContent>
            </Card>
          </Labeled>
          {/* Danger zone */}
          <Labeled name='"위험 영역 - 계정 삭제 등"'>
            <Card className="border-destructive/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-destructive">위험 영역</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium">비밀번호 변경</p>
                    <p className="text-[10px] text-muted-foreground">마지막 변경: 30일 전</p>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs h-7">변경</Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium">계정 삭제</p>
                    <p className="text-[10px] text-muted-foreground">모든 데이터가 영구 삭제됩니다</p>
                  </div>
                  <Button variant="destructive" size="sm" className="text-xs h-7">삭제</Button>
                </div>
              </CardContent>
            </Card>
          </Labeled>
        </div>
      </PreviewBlock>
    </div>
  )
}

// ─── E-commerce Preview ───
export function EcommercePreview() {
  return (
    <div className="flex flex-col gap-6">
      <PreviewBlock title="상품 카드 미리보기">
        <div className="w-full">
          {/* Category tabs */}
          <Labeled name='"카테고리 탭 + 정렬"'>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1.5">
                {["전체", "의류", "전자기기", "생활"].map((cat, i) => (
                  <Badge key={cat} variant={i === 0 ? "default" : "secondary"} className="text-[9px] cursor-pointer">{cat}</Badge>
                ))}
              </div>
              <Badge variant="outline" className="text-[9px]">최신순</Badge>
            </div>
          </Labeled>
          <div className="grid grid-cols-3 gap-3">
            {[
              { name: "무선 이어폰", price: "59,000", original: "79,000", badge: "인기" },
              { name: "스마트 워치", price: "189,000", original: null, badge: null },
              { name: "블루투스 스피커", price: "45,000", original: "65,000", badge: "할인" },
            ].map((item) => (
              <Labeled key={item.name} name={`"상품 카드 - ${item.name}"`}>
                <Card className="overflow-hidden group cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md">
                  <div className="aspect-square bg-muted/50 relative flex items-center justify-center">
                    <Package className="h-8 w-8 text-muted-foreground/30" />
                    {item.badge && (
                      <Badge className="absolute top-1.5 left-1.5 text-[8px] py-0">{item.badge}</Badge>
                    )}
                    <Button size="icon" variant="ghost" className="absolute top-1.5 right-1.5 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Heart className="h-3 w-3" />
                    </Button>
                  </div>
                  <CardContent className="p-2.5">
                    <p className="text-[10px] text-muted-foreground">브랜드명</p>
                    <p className="text-xs font-medium mt-0.5 truncate">{item.name}</p>
                    <div className="flex items-center gap-0.5 mt-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star key={i} className={`h-2 w-2 ${i <= 4 ? "text-yellow-500 fill-current" : "text-muted-foreground/30"}`} />
                      ))}
                      <span className="text-[8px] text-muted-foreground ml-0.5">(42)</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <p className="text-xs font-bold">{item.price}원</p>
                      {item.original && <p className="text-[9px] text-muted-foreground line-through">{item.original}원</p>}
                    </div>
                  </CardContent>
                </Card>
              </Labeled>
            ))}
          </div>
        </div>
      </PreviewBlock>
      <PreviewBlock title="장바구니 미리보기">
        <Labeled name='"장바구니 목록 - 상품, 수량, 가격"'>
          <div className="w-full space-y-3">
            {[
              { name: "무선 이어폰", price: "59,000", qty: 1 },
              { name: "스마트 워치", price: "189,000", qty: 2 },
            ].map((item) => (
              <div key={item.name} className="flex items-center gap-3 rounded-lg border border-border p-2.5">
                <div className="h-11 w-11 rounded-md bg-muted/50 flex items-center justify-center shrink-0">
                  <Package className="h-4 w-4 text-muted-foreground/40" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{item.name}</p>
                  <p className="text-[10px] text-muted-foreground">{item.price}원</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="outline" className="h-5 w-5"><Minus className="h-2.5 w-2.5" /></Button>
                  <span className="text-xs w-4 text-center">{item.qty}</span>
                  <Button size="icon" variant="outline" className="h-5 w-5"><Plus className="h-2.5 w-2.5" /></Button>
                </div>
              </div>
            ))}
            <Separator />
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>상품 금액</span><span>437,000원</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>배송비</span><span>무료</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">총 결제 금액</span>
                <span className="text-sm font-bold">437,000원</span>
              </div>
            </div>
            <Button className="w-full h-9 text-xs">결제하기</Button>
          </div>
        </Labeled>
      </PreviewBlock>
    </div>
  )
}

// ─── Blog Preview ───
export function BlogPreview() {
  return (
    <div className="flex flex-col gap-6">
      <PreviewBlock title="블로그 카드 목록">
        <div className="w-full">
          {/* Category filter tabs */}
          <Labeled name='"카테고리 필터 탭"'>
            <div className="flex items-center gap-1.5 mb-4">
              {["전체", "개발", "디자인", "입문", "팁"].map((cat, i) => (
                <Badge key={cat} variant={i === 0 ? "default" : "secondary"} className="text-[9px] cursor-pointer">{cat}</Badge>
              ))}
            </div>
          </Labeled>
          {/* Featured post */}
          <Labeled name='"Featured 글 - 큰 카드"'>
            <Card className="overflow-hidden cursor-pointer hover:bg-accent/20 transition-colors mb-3">
              <div className="flex gap-4 p-3">
                <div className="h-24 w-36 rounded-lg bg-muted/50 shrink-0 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-muted-foreground/30" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <Badge variant="secondary" className="text-[8px] py-0 w-fit mb-1">Featured</Badge>
                  <p className="text-sm font-bold">AI 시대의 웹 개발, 어떻게 달라질까?</p>
                  <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">
                    인공지능이 개발 방식을 바꾸고 있습니다. 바이브 코딩부터 자동 디자인까지, 최신 트렌드를 정리했습니다.
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Avatar className="h-3.5 w-3.5"><AvatarFallback className="text-[5px]">AI</AvatarFallback></Avatar>
                    <span className="text-[9px] text-muted-foreground">2025-01-20 / 10분 읽기</span>
                  </div>
                </div>
              </div>
            </Card>
          </Labeled>
          {/* Blog card list */}
          <div className="space-y-2">
            {[
              { title: "Next.js 15에서 달라진 점", cat: "개발", date: "2024-12-15", read: "5분" },
              { title: "비전공자를 위한 바이브 코딩", cat: "입문", date: "2024-12-10", read: "8분" },
              { title: "디자인 시스템 구축 가이드", cat: "디자인", date: "2024-12-05", read: "12분" },
            ].map((post) => (
              <Labeled key={post.title} name={`"블로그 카드 - ${post.title}"`}>
                <Card className="overflow-hidden cursor-pointer hover:bg-accent/30 transition-colors">
                  <div className="flex gap-3 p-3">
                    <div className="h-16 w-16 rounded-lg bg-muted/50 shrink-0 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-muted-foreground/30" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Badge variant="secondary" className="text-[8px] py-0">{post.cat}</Badge>
                        <span className="text-[9px] text-muted-foreground">{post.read} 읽기</span>
                      </div>
                      <p className="text-xs font-semibold truncate">{post.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                        이 글에서는 해당 주제에 대한 핵심 내용을 다룹니다.
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Avatar className="h-3.5 w-3.5"><AvatarFallback className="text-[5px]">JD</AvatarFallback></Avatar>
                        <span className="text-[9px] text-muted-foreground">{post.date}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Labeled>
            ))}
          </div>
        </div>
      </PreviewBlock>
      <PreviewBlock title="블로그 글 본문 레이아웃">
        <Labeled name='"블로그 글 본문 - 제목, 메타, 내용"'>
          <div className="w-full space-y-3">
            <div>
              <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground mb-2">
                <span>블로그</span><ChevronRight className="h-2.5 w-2.5" /><span>개발</span><ChevronRight className="h-2.5 w-2.5" /><span>Next.js</span>
              </div>
              <Badge variant="secondary" className="text-[8px] mb-1.5">개발</Badge>
              <h2 className="text-base font-bold">Next.js 15에서 달라진 점</h2>
              <div className="flex items-center gap-2 mt-1.5">
                <Avatar className="h-5 w-5"><AvatarFallback className="text-[7px]">JD</AvatarFallback></Avatar>
                <span className="text-[10px] text-muted-foreground">홍길동</span>
                <span className="text-[10px] text-muted-foreground">2024-12-15</span>
                <span className="text-[10px] text-muted-foreground">5분 읽기</span>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground leading-relaxed">
                이것은 블로그 본문 영역입니다. 실제 내용이 여기에 들어갑니다. 제목, 문단, 이미지, 코드 블록 등이 포함될 수 있습니다.
              </p>
              <div className="rounded-md bg-muted/40 p-3 h-16 flex items-center justify-center">
                <span className="text-[9px] text-muted-foreground">본문 이미지 영역</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                위 이미지처럼 중간중간 시각 자료를 넣으면 가독성이 훨씬 좋아집니다. 코드 블록도 넣을 수 있죠.
              </p>
            </div>
            <Separator />
            {/* Tags */}
            <Labeled name='"태그 목록"'>
              <div className="flex items-center gap-1.5">
                {["Next.js", "React", "SSR", "웹개발"].map(t => (
                  <Badge key={t} variant="outline" className="text-[8px]">{t}</Badge>
                ))}
              </div>
            </Labeled>
            <div className="flex items-center gap-1.5 pt-1">
              <Button variant="ghost" size="sm" className="h-7 text-[10px]"><Heart className="h-3 w-3 mr-1" />좋아요 24</Button>
              <Button variant="ghost" size="sm" className="h-7 text-[10px]"><MessageCircle className="h-3 w-3 mr-1" />댓글 8</Button>
              <Button variant="ghost" size="sm" className="h-7 text-[10px]"><Share className="h-3 w-3 mr-1" />공유</Button>
            </div>
          </div>
        </Labeled>
      </PreviewBlock>
    </div>
  )
}

// ─── API Integration Preview ───
export function ApiIntegrationPreview() {
  return (
    <div className="flex flex-col gap-6">
      <PreviewBlock title="Supabase 연동 예시">
        <Labeled name='"Supabase 연동 - 데이터 테이블 CRUD"'>
          <Card className="max-w-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-emerald-500/10 flex items-center justify-center">
                  <Zap className="h-3.5 w-3.5 text-emerald-600" />
                </div>
                Supabase 연동
              </CardTitle>
              <CardDescription className="text-xs">데이터베이스 CRUD 예시</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border border-border p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">users 테이블</span>
                  <Badge variant="secondary" className="text-[9px]">3 rows</Badge>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[10px] h-7">id</TableHead>
                      <TableHead className="text-[10px] h-7">name</TableHead>
                      <TableHead className="text-[10px] h-7">email</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="text-[10px] py-1.5">1</TableCell>
                      <TableCell className="text-[10px] py-1.5">김민수</TableCell>
                      <TableCell className="text-[10px] py-1.5">minsu@email.com</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-[10px] py-1.5">2</TableCell>
                      <TableCell className="text-[10px] py-1.5">이지은</TableCell>
                      <TableCell className="text-[10px] py-1.5">jieun@email.com</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="text-xs h-8 flex-1"><Plus className="h-3 w-3 mr-1" />추가</Button>
                <Button size="sm" variant="outline" className="text-xs h-8 flex-1"><Edit className="h-3 w-3 mr-1" />수정</Button>
                <Button size="sm" variant="destructive" className="text-xs h-8 flex-1"><Trash2 className="h-3 w-3 mr-1" />삭제</Button>
              </div>
            </CardContent>
          </Card>
        </Labeled>
      </PreviewBlock>
      <PreviewBlock title="환경변수 설정 안내">
        <Labeled name='"환경변수 (Vars) 설정 안내"'>
          <div className="max-w-md space-y-3">
            <div className="rounded-lg border border-dashed border-border p-4 space-y-2">
              <p className="text-xs font-medium">필요한 환경변수</p>
              {[
                { key: "SUPABASE_URL", value: "https://xxx.supabase.co", set: true },
                { key: "SUPABASE_ANON_KEY", value: "eyJhbGci...", set: true },
                { key: "STRIPE_SECRET_KEY", value: "", set: false },
              ].map((v) => (
                <div key={v.key} className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
                  <code className="text-[10px] font-mono">{v.key}</code>
                  {v.set ? (
                    <Badge variant="secondary" className="text-[9px] bg-emerald-500/10 text-emerald-600">설정됨</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[9px] bg-destructive/10 text-destructive">미설정</Badge>
                  )}
                </div>
              ))}
              <p className="text-[10px] text-muted-foreground">v0 사이드바 Vars 탭에서 설정하세요</p>
            </div>
          </div>
        </Labeled>
      </PreviewBlock>
    </div>
  )
}

// ─── AI Features Preview ───
export function AiFeaturesPreview() {
  const [input, setInput] = useState("")
  return (
    <div className="flex flex-col gap-6">
      <PreviewBlock title="AI 챗봇 UI">
        <Labeled name='"AI 채팅 인터페이스"'>
          <div className="max-w-sm rounded-lg border border-border overflow-hidden">
            <div className="border-b border-border bg-muted/40 px-3 py-2 flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-foreground" />
              <span className="text-xs font-medium">AI 어시스턴트</span>
            </div>
            <div className="p-3 space-y-3 max-h-[200px]">
              <div className="flex gap-2">
                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <User className="h-3 w-3" />
                </div>
                <div className="rounded-lg bg-muted/50 px-3 py-1.5">
                  <p className="text-xs">오늘 날씨 어때?</p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="h-6 w-6 rounded-full bg-foreground flex items-center justify-center shrink-0">
                  <Zap className="h-3 w-3 text-background" />
                </div>
                <div className="rounded-lg border border-border px-3 py-1.5">
                  <p className="text-xs">서울은 현재 맑고 기온은 12도입니다. 오후에 구름이 약간 끼겠습니다.</p>
                </div>
              </div>
            </div>
            <div className="border-t border-border p-2">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="메시지를 입력하세요..."
                  className="h-8 text-xs"
                />
                <Button size="sm" className="h-8 w-8 p-0"><Send className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          </div>
        </Labeled>
      </PreviewBlock>
      <PreviewBlock title="AI 텍스트 생성">
        <Labeled name='"AI 텍스트 생성 - 스트리밍 응답"'>
          <div className="max-w-sm space-y-3">
            <div className="rounded-lg border border-border p-3 space-y-2">
              <Label className="text-xs">주제</Label>
              <Input defaultValue="바이브 코딩의 장점" className="h-8 text-xs" />
              <Button size="sm" className="w-full h-8 text-xs"><Zap className="h-3 w-3 mr-1.5" />AI로 글 생성</Button>
            </div>
            <div className="rounded-lg bg-muted/30 border border-border p-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                바이브 코딩은 비전공자도 쉽게 웹 애플리케이션을 만들 수 있는 혁신적인 방법입니다. AI와 대화하듯 원하는 기능을 설명하면...
              </p>
              <div className="mt-2 flex items-center gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-foreground animate-pulse" />
                <span className="text-[10px] text-muted-foreground">생성 중...</span>
              </div>
            </div>
          </div>
        </Labeled>
      </PreviewBlock>
    </div>
  )
}

// ─── Responsive Design Preview ───
export function ResponsiveDesignPreview() {
  return (
    <div className="flex flex-col gap-6">
      <PreviewBlock title="반응형 레이아웃 비교">
        <div className="space-y-4">
          <Labeled name='"데스크탑 레이아웃 (3열 그리드)"'>
            <div>
              <p className="text-[10px] text-muted-foreground mb-2 font-medium">데스크탑 (3열)</p>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-lg border border-border bg-muted/30 p-3 text-center">
                    <div className="h-8 w-8 rounded bg-muted mx-auto mb-1.5" />
                    <p className="text-[10px] font-medium">카드 {i}</p>
                  </div>
                ))}
              </div>
            </div>
          </Labeled>
          <Labeled name='"태블릿 레이아웃 (2열 그리드)"'>
            <div>
              <p className="text-[10px] text-muted-foreground mb-2 font-medium">태블릿 (2열)</p>
              <div className="grid grid-cols-2 gap-2 max-w-[240px]">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-lg border border-border bg-muted/30 p-3 text-center">
                    <div className="h-8 w-8 rounded bg-muted mx-auto mb-1.5" />
                    <p className="text-[10px] font-medium">카드 {i}</p>
                  </div>
                ))}
              </div>
            </div>
          </Labeled>
          <Labeled name='"모바일 레이아웃 (1열 세로)"'>
            <div>
              <p className="text-[10px] text-muted-foreground mb-2 font-medium">모바일 (1열)</p>
              <div className="flex flex-col gap-2 max-w-[140px]">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-lg border border-border bg-muted/30 p-2.5 flex items-center gap-2">
                    <div className="h-6 w-6 rounded bg-muted shrink-0" />
                    <p className="text-[10px] font-medium">카드 {i}</p>
                  </div>
                ))}
              </div>
            </div>
          </Labeled>
        </div>
      </PreviewBlock>
      <PreviewBlock title="반응형 네비게이션">
        <div className="space-y-4">
          <Labeled name='"데스크탑: 가로 메뉴바"'>
            <div className="rounded-lg border border-border p-2.5 flex items-center justify-between max-w-sm">
              <span className="text-xs font-bold">Logo</span>
              <div className="flex gap-3">
                {["홈", "서비스", "가격", "문의"].map((m) => (
                  <span key={m} className="text-[10px] text-muted-foreground hover:text-foreground cursor-pointer">{m}</span>
                ))}
              </div>
            </div>
          </Labeled>
          <Labeled name='"모바일: 햄버거 메뉴"'>
            <div className="rounded-lg border border-border p-2.5 flex items-center justify-between max-w-[160px]">
              <span className="text-xs font-bold">Logo</span>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Menu className="h-4 w-4" /></Button>
            </div>
          </Labeled>
        </div>
      </PreviewBlock>
    </div>
  )
}

// ─── Performance / Loading Preview ───
export function PerformancePreview() {
  return (
    <div className="flex flex-col gap-6">
      <PreviewBlock title="로딩 상태들">
        <div className="grid grid-cols-2 gap-4">
          <Labeled name='"스피너 로딩 (Spinner) - 전체 로딩 시 사용"'>
            <div className="rounded-lg border border-border p-4 flex flex-col items-center gap-2 min-w-[180px]">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">로딩 중...</span>
            </div>
          </Labeled>
          <Labeled name='"프로그레스 바 (Progress) - 진행률 표시"'>
            <div className="rounded-lg border border-border p-4 space-y-2 min-w-[180px]">
              <Progress value={65} className="h-2" />
              <span className="text-[10px] text-muted-foreground">65% 완료</span>
            </div>
          </Labeled>
          <Labeled name='"스켈레톤 로딩 (Skeleton) - 텍스트 로딩 시 사용"'>
            <div className="rounded-lg border border-border p-4 space-y-2.5 min-w-[180px]">
              <div className="h-3 rounded bg-muted animate-pulse" style={{ width: "75%" }} />
              <div className="h-3 rounded bg-muted animate-pulse" style={{ width: "100%" }} />
              <div className="h-3 rounded bg-muted animate-pulse" style={{ width: "50%" }} />
            </div>
          </Labeled>
          <Labeled name='"카드 스켈레톤 - 이미지+텍스트 로딩 시 사용"'>
            <div className="rounded-lg border border-border p-4 space-y-2.5 min-w-[180px]">
              <div className="h-20 rounded-md bg-muted animate-pulse" style={{ width: "100%" }} />
              <div className="h-3 rounded bg-muted animate-pulse" style={{ width: "66%" }} />
              <div className="h-3 rounded bg-muted animate-pulse" style={{ width: "33%" }} />
            </div>
          </Labeled>
        </div>
      </PreviewBlock>
      <PreviewBlock title="빈 화면 / 에러 화면">
        <div className="grid grid-cols-2 gap-4">
          <Labeled name='"빈 상태 (Empty State) - 데이터 없을 때"'>
            <div className="rounded-lg border border-dashed border-border p-6 text-center min-w-[180px]">
              <Package className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-xs font-medium">데이터가 없습니다</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">새로운 항목을 추가해보세요</p>
              <Button size="sm" className="mt-3 h-7 text-[10px]"><Plus className="h-3 w-3 mr-1" />추가하기</Button>
            </div>
          </Labeled>
          <Labeled name='"에러 화면 (Error State) - 오류 발생 시"'>
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center min-w-[180px]">
              <X className="h-8 w-8 text-destructive/50 mx-auto mb-2" />
              <p className="text-xs font-medium text-destructive">오류가 발생했습니다</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">잠시 후 다시 시도해주세요</p>
              <Button size="sm" variant="outline" className="mt-3 h-7 text-[10px]"><RefreshCw className="h-3 w-3 mr-1" />다시 시도</Button>
            </div>
          </Labeled>
        </div>
      </PreviewBlock>
    </div>
  )
}

// ─── AI Models Preview ───
export function AiModelsPreview() {
  return (
    <div className="flex flex-col gap-6">
      <PreviewBlock title="AI 모델 비교 카드">
        <div className="grid grid-cols-3 gap-3">
          {[
            { name: "GPT-4o-mini", company: "OpenAI", speed: "빠름", quality: "좋음", cost: "저렴", color: "text-emerald-600 bg-emerald-500/10" },
            { name: "Claude Sonnet", company: "Anthropic", speed: "보통", quality: "우수", cost: "중간", color: "text-orange-600 bg-orange-500/10" },
            { name: "Gemini Flash", company: "Google", speed: "매우 빠름", quality: "좋음", cost: "저렴", color: "text-blue-600 bg-blue-500/10" },
          ].map((model) => (
            <Labeled key={model.name} name={`"${model.name} - ${model.company}"`}>
              <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className={`text-[9px] font-medium rounded px-1.5 py-0.5 w-fit ${model.color}`}>{model.company}</div>
                  <CardTitle className="text-xs mt-1">{model.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1.5 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">속도</span>
                    <span className="font-medium">{model.speed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">품질</span>
                    <span className="font-medium">{model.quality}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">비용</span>
                    <span className="font-medium">{model.cost}</span>
                  </div>
                </CardContent>
              </Card>
            </Labeled>
          ))}
        </div>
      </PreviewBlock>
      <PreviewBlock title="모델 선택 가이드">
        <Labeled name='"상황별 추천 모델 안내"'>
          <div className="max-w-md space-y-2">
            {[
              { situation: "일반 챗봇", model: "GPT-4o-mini", reason: "빠르고 저렴" },
              { situation: "긴 글 작성", model: "Claude Sonnet", reason: "글 품질 우수" },
              { situation: "실시간 응답", model: "Gemini Flash", reason: "가장 빠른 응답" },
              { situation: "복잡한 분석", model: "GPT-4.1", reason: "최고 성능" },
              { situation: "이미지 분석", model: "GPT-4o", reason: "멀티모달 지원" },
            ].map((item) => (
              <div key={item.situation} className="flex items-center gap-3 rounded-lg border border-border p-2.5">
                <Badge variant="secondary" className="text-[9px] shrink-0 py-0">{item.situation}</Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-medium">{item.model}</p>
                </div>
                <span className="text-[9px] text-muted-foreground shrink-0">{item.reason}</span>
              </div>
            ))}
          </div>
        </Labeled>
      </PreviewBlock>
    </div>
  )
}

// ─── Sidebar Preview ───
export function SidebarPreview() {
  const [active, setActive] = useState("dashboard")
  const menuItems = [
    { id: "dashboard", label: "대시보드", icon: LayoutDashboard },
    { id: "users", label: "사용자", icon: User },
    { id: "settings", label: "설정", icon: Settings },
  ]
  return (
    <div className="flex flex-col gap-6">
      <PreviewBlock title="사이드바">
        <Labeled name='"왼쪽 사이드바 - 메뉴 네비게이션"'>
          <div className="flex rounded-lg border border-border overflow-hidden max-w-md">
            <div className="w-[180px] border-r border-border bg-muted/30 p-3 space-y-1 shrink-0">
              <div className="flex items-center gap-2 px-2 mb-3">
                <div className="h-5 w-5 rounded bg-foreground" />
                <span className="text-xs font-bold">MyApp</span>
              </div>
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActive(item.id)}
                  className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[10px] transition-colors ${active === item.id
                      ? "bg-foreground text-background font-medium"
                      : "text-muted-foreground hover:bg-accent"
                    }`}
                >
                  <item.icon className="h-3 w-3" />
                  {item.label}
                </button>
              ))}
              <div className="border-t border-border mt-3 pt-3">
                <div className="flex items-center gap-2 px-2">
                  <div className="h-5 w-5 rounded-full bg-muted" />
                  <span className="text-[10px] text-muted-foreground">사용자</span>
                </div>
              </div>
            </div>
            <div className="flex-1 p-4">
              <p className="text-xs font-medium">{menuItems.find(m => m.id === active)?.label} 페이지</p>
              <p className="text-[10px] text-muted-foreground mt-1">메뉴를 클릭해보세요</p>
            </div>
          </div>
        </Labeled>
      </PreviewBlock>
    </div>
  )
}

// ─── Popover Preview ───
export function PopoverPreview() {
  return (
    <div className="flex flex-col gap-6">
      <PreviewBlock title='팝오버 (Popover) - "클릭하면 말풍선 형태로 옵션 표시"'>
        <div className="flex flex-wrap gap-3">
          <Labeled name='"공유 팝오버 - 클릭하면 공유 옵션 목록"'>
            <Popover>
              <PopoverTrigger asChild>
                <Button size="sm" variant="outline" className="text-xs h-8">
                  <Share2 className="h-3 w-3 mr-1.5" />공유
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2" align="start">
                <p className="text-[10px] font-medium text-muted-foreground px-2 py-1">공유하기</p>
                {["링크 복사", "카카오톡", "트위터"].map((item) => (
                  <button key={item} className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-accent transition-colors">
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    {item}
                  </button>
                ))}
              </PopoverContent>
            </Popover>
          </Labeled>

          <Labeled name='"알림 설정 팝오버 - 필터나 설정에 활용"'>
            <Popover>
              <PopoverTrigger asChild>
                <Button size="sm" variant="outline" className="text-xs h-8">
                  <Bell className="h-3 w-3 mr-1.5" />알림 설정
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-3" align="start">
                <p className="text-xs font-medium mb-3">알림 설정</p>
                <div className="space-y-3">
                  {["이메일 알림", "푸시 알림", "SMS 알림"].map((label) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-xs">{label}</span>
                      <Switch />
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </Labeled>
        </div>
      </PreviewBlock>
    </div>
  )
}

// ─── Tabs Preview ───
export function TabsPreview() {
  return (
    <div className="flex flex-col gap-6">
      <PreviewBlock title='탭 (Tabs) - "탭 클릭으로 내용 전환"'>
        <Labeled name='"상품 상세 탭 - 상세설명/리뷰/Q&A 전환"'>
          <Tabs defaultValue="desc" className="max-w-md w-full">
            <TabsList className="w-full">
              <TabsTrigger value="desc" className="flex-1 text-xs">상세설명</TabsTrigger>
              <TabsTrigger value="reviews" className="flex-1 text-xs">리뷰 (24)</TabsTrigger>
              <TabsTrigger value="qa" className="flex-1 text-xs">{'Q&A (3)'}</TabsTrigger>
            </TabsList>
            <TabsContent value="desc" className="mt-3">
              <p className="text-xs text-muted-foreground leading-relaxed">프리미엄 소재를 사용한 편안한 착용감의 제품입니다. 사계절 활용 가능하며, 세탁 후에도 형태가 유지됩니다.</p>
            </TabsContent>
            <TabsContent value="reviews" className="mt-3">
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} className={`h-3 w-3 ${i <= 4 ? "fill-foreground text-foreground" : "text-muted"}`} />)}
                  <span className="text-xs ml-1 font-medium">4.0</span>
                </div>
                <p className="text-xs text-muted-foreground">만족합니다. 배송도 빠르네요!</p>
              </div>
            </TabsContent>
            <TabsContent value="qa" className="mt-3">
              <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground">Q:</span> 사이즈가 큰가요? <span className="font-medium text-foreground">A:</span> 정사이즈입니다.</p>
            </TabsContent>
          </Tabs>
        </Labeled>
      </PreviewBlock>
    </div>
  )
}

// ─── Tooltip Preview ───
export function TooltipPreview() {
  return (
    <div className="flex flex-col gap-6">
      <PreviewBlock title='툴팁 (Tooltip) - "마우스 올리면 설명 말풍선"'>
        <Labeled name='"마우스 올리면 설명이 나타나는 툴팁"'>
          <TooltipProvider delayDuration={0}>
            <div className="flex items-center gap-1 rounded-lg border border-border p-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="flex h-8 w-8 items-center justify-center rounded hover:bg-accent transition-colors"><Type className="h-4 w-4" /></button>
                </TooltipTrigger>
                <TooltipContent><p className="text-xs">굵게 (Ctrl+B)</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="flex h-8 w-8 items-center justify-center rounded hover:bg-accent transition-colors"><AlignLeft className="h-4 w-4" /></button>
                </TooltipTrigger>
                <TooltipContent><p className="text-xs">왼쪽 정렬</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="flex h-8 w-8 items-center justify-center rounded hover:bg-accent transition-colors"><Trash2 className="h-4 w-4" /></button>
                </TooltipTrigger>
                <TooltipContent><p className="text-xs">삭제</p></TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </Labeled>
      </PreviewBlock>
    </div>
  )
}

// ─── Badge & Avatar Preview ───
export function BadgeAvatarPreview() {
  return (
    <div className="flex flex-col gap-6">
      <PreviewBlock title="배지 & 아바타">
        <div className="grid grid-cols-2 gap-4">
          <Labeled name='"상태 배지 - 색상별 상태 표시"'>
            <div className="flex flex-wrap gap-1.5">
              <Badge className="text-[9px] bg-emerald-500/10 text-emerald-600 border-emerald-200">활성</Badge>
              <Badge className="text-[9px] bg-destructive/10 text-destructive border-destructive/20">비활성</Badge>
              <Badge className="text-[9px] bg-yellow-500/10 text-yellow-600 border-yellow-200">대기</Badge>
              <Badge variant="secondary" className="text-[9px]">기본</Badge>
              <Badge className="text-[9px] bg-blue-500/10 text-blue-600 border-blue-200">NEW</Badge>
            </div>
          </Labeled>
          <Labeled name='"아바타 - 프로필 이미지/이니셜"'>
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">K</div>
                <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-background" />
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center text-[10px] font-bold text-blue-600">L</div>
              <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center text-[10px] font-bold text-orange-600">P</div>
              <div className="flex -space-x-2">
                {["K", "L", "P", "+3"].map((l, i) => (
                  <div key={i} className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[8px] font-bold">{l}</div>
                ))}
              </div>
            </div>
          </Labeled>
        </div>
      </PreviewBlock>
    </div>
  )
}

// ─── Accordion Preview ───
export function AccordionPreview() {
  return (
    <div className="flex flex-col gap-6">
      <PreviewBlock title='아코디언 (Accordion) - "클릭하면 접기/펼치기 되는 FAQ"'>
        <Labeled name='"FAQ 아코디언 - 질문 클릭 시 답변 펼쳐짐"'>
          <Accordion type="single" collapsible className="max-w-md w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-sm">배송은 얼마나 걸리나요?</AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground">
                주문 후 1~3일 이내 배송됩니다. 도서산간 지역은 1~2일 추가 소요될 수 있습니다.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-sm">교환/환불은 어떻게 하나요?</AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground">
                수령 후 7일 이내 고객센터(1588-0000)로 문의해주세요. 단순 변심 시 왕복 배송비가 부과됩니다.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-sm">해외 배송이 가능한가요?</AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground">
                현재 국내 배송만 지원합니다. 해외 배송은 2025년 상반기 오픈 예정입니다.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Labeled>
      </PreviewBlock>
    </div>
  )
}

// ─── Sheet/Drawer Preview ───
export function SheetDrawerPreview() {
  return (
    <div className="flex flex-col gap-6">
      <PreviewBlock title='시트 (Sheet) - "오른쪽에서 슬라이드로 나타나는 패널"'>
        <div className="flex flex-wrap gap-3">
          <Labeled name='"오른쪽에서 열리는 장바구니 시트"'>
            <Sheet>
              <SheetTrigger asChild>
                <Button size="sm" variant="outline" className="text-xs h-8">
                  <ShoppingCart className="h-3 w-3 mr-1.5" />장바구니 열기
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>장바구니 (2)</SheetTitle>
                  <SheetDescription>선택한 상품을 확인하세요.</SheetDescription>
                </SheetHeader>
                <div className="flex flex-col gap-3 py-4">
                  {[{ name: "프리미엄 티셔츠", price: "29,000" }, { name: "데님 팬츠", price: "49,000" }].map((item) => (
                    <div key={item.name} className="flex items-center gap-3 rounded-lg border border-border p-3">
                      <div className="h-12 w-12 rounded-lg bg-muted shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.price}원</p>
                      </div>
                      <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-destructive shrink-0">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">합계</span>
                    <span className="font-bold">78,000원</span>
                  </div>
                  <Button className="w-full">결제하기</Button>
                </div>
              </SheetContent>
            </Sheet>
          </Labeled>

          <Labeled name='"왼쪽에서 열리는 필터 시트"'>
            <Sheet>
              <SheetTrigger asChild>
                <Button size="sm" variant="outline" className="text-xs h-8">
                  <Filter className="h-3 w-3 mr-1.5" />필터
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>필터</SheetTitle>
                  <SheetDescription>원하는 조건으로 필터링하세요.</SheetDescription>
                </SheetHeader>
                <div className="flex flex-col gap-4 py-4">
                  <div className="space-y-2">
                    <Label className="text-xs">카테고리</Label>
                    <Select><SelectTrigger><SelectValue placeholder="전체" /></SelectTrigger><SelectContent><SelectItem value="all">전체</SelectItem><SelectItem value="top">상의</SelectItem><SelectItem value="bottom">하의</SelectItem></SelectContent></Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">가격대</Label>
                    <Slider defaultValue={[50000]} max={200000} step={10000} />
                    <p className="text-[10px] text-muted-foreground">최대 50,000원</p>
                  </div>
                  <Button className="mt-2">적용</Button>
                </div>
              </SheetContent>
            </Sheet>
          </Labeled>
        </div>
      </PreviewBlock>
    </div>
  )
}

// ─── Switch/Select Preview ───
export function SwitchSelectPreview() {
  const [switches, setSwitches] = useState([true, false, true])
  return (
    <div className="flex flex-col gap-6">
      <PreviewBlock title="스위치, 셀렉트, 슬라이더">
        <div className="grid grid-cols-2 gap-4">
          <Labeled name='"스위치 - 켜기/끄기 토글"'>
            <div className="space-y-2 min-w-[160px]">
              {["이메일 알림", "푸시 알림", "마케팅 수신"].map((label, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                  <span className="text-[10px]">{label}</span>
                  <button
                    onClick={() => {
                      const next = [...switches]
                      next[idx] = !next[idx]
                      setSwitches(next)
                    }}
                    className={`relative h-4 w-8 rounded-full transition-colors ${switches[idx] ? "bg-foreground" : "bg-muted"}`}
                  >
                    <div className={`absolute top-0.5 h-3 w-3 rounded-full bg-background transition-all ${switches[idx] ? "left-[18px]" : "left-0.5"}`} />
                  </button>
                </div>
              ))}
            </div>
          </Labeled>
          <Labeled name='"셀렉트 - 드롭다운 선택"'>
            <div className="space-y-2 min-w-[160px]">
              <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                <span className="text-[10px]">정렬</span>
                <select className="bg-transparent text-[10px] font-medium border-none focus:outline-none cursor-pointer">
                  <option>최신순</option>
                  <option>인기순</option>
                  <option>가격 낮은순</option>
                </select>
              </div>
              <div className="rounded-lg border border-border px-3 py-2 space-y-1.5">
                <span className="text-[10px] text-muted-foreground">슬라이더 - 값 조절</span>
                <input type="range" min="0" max="100" defaultValue="65" className="w-full h-1 accent-foreground cursor-pointer" />
                <div className="flex justify-between text-[8px] text-muted-foreground">
                  <span>0원</span>
                  <span className="font-medium text-foreground">65,000원</span>
                  <span>100,000원</span>
                </div>
              </div>
            </div>
          </Labeled>
        </div>
      </PreviewBlock>
    </div>
  )
}

// ─── Export Map ───
export const previewMap: Record<string, React.ComponentType> = {
  buttons: ButtonPreview,
  forms: FormPreview,
  cards: CardPreview,
  "dialogs-modals": DialogPreview,
  navigation: NavigationPreview,
  "data-display": DataDisplayPreview,
  "toast-alert": ToastAlertPreview,
  "dropdown-menu": DropdownPreview,
  sidebar: SidebarPreview,
  popover: PopoverPreview,
  tabs: TabsPreview,
  tooltip: TooltipPreview,
  "badge-avatar": BadgeAvatarPreview,
  accordion: AccordionPreview,
  "sheet-drawer": SheetDrawerPreview,
  "switch-select": SwitchSelectPreview,
  "layout-patterns": LayoutPreview,
  "spacing-whitespace": SpacingPreview,
  "color-typography": ColorTypographyPreview,
  animations: AnimationPreview,
  "shadows-borders": ShadowBorderPreview,
  "landing-page": LandingPagePreview,
  dashboard: DashboardPreview,
  "auth-pages": AuthPagePreview,
  "settings-page": SettingsPagePreview,
  ecommerce: EcommercePreview,
  "blog-page": BlogPreview,
  "api-integration": ApiIntegrationPreview,
  "ai-features": AiFeaturesPreview,
  "responsive-design": ResponsiveDesignPreview,
  performance: PerformancePreview,
  "ai-models": AiModelsPreview,
}
