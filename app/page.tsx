'use client'

import { useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, BookOpen, Check, CheckCircle2, ChevronRight, CircleAlert, ClipboardCheck, FileText, Info, LoaderCircle, Menu, Minus, Plus, Search, ShieldAlert, Sparkles, Target, Upload, X, Zap } from 'lucide-react'
import { createLiveAudit, demoAudit, exampleAudits, getCounts, getHighlightParts, isAnalyzeResponse, isExtractPdfResponse, verdictLabels, type Audit, type Claim, type Source, type Verdict } from '@/lib/audit-data'
import { AccountMenu } from '@/components/account-menu'
import { SaveAuditButton } from '@/components/save-audit-button'

/* ── Verdict styling (neumorphic) ─────────────────────────────────── */

const verdictStyles: Record<Verdict, string> = {
  supported: 'bg-[#ECFDF5] text-[#059669]',
  contradicted: 'bg-[#FEF2F2] text-[#DC2626]',
  insufficient_evidence: 'bg-[#FFFBEB] text-[#D97706]',
  ambiguous: 'bg-[#F1F5F9] text-[#64748B]',
}
const verdictDot: Record<Verdict, string> = {
  supported: 'bg-[#059669]',
  contradicted: 'bg-[#DC2626]',
  insufficient_evidence: 'bg-[#D97706]',
  ambiguous: 'bg-[#64748B]',
}
const verdictHighlight: Record<Verdict, string> = {
  supported: 'bg-[#D1FAE5] text-[#065F46] decoration-[#059669]',
  contradicted: 'bg-[#FEE2E2] text-[#991B1B] decoration-[#DC2626]',
  insufficient_evidence: 'bg-[#FEF3C7] text-[#92400E] decoration-[#D97706]',
  ambiguous: 'bg-[#E2E8F0] text-[#334155] decoration-[#64748B]',
}
const MAX_PDF_SIZE = 10 * 1024 * 1024

function hasPdfSignature(bytes: Uint8Array) {
  const signature = [0x25, 0x50, 0x44, 0x46, 0x2d]
  const searchLength = Math.min(bytes.length, 1024)
  for (let offset = 0; offset <= searchLength - signature.length; offset += 1) {
    if (signature.every((byte, index) => bytes[offset + index] === byte)) return true
  }
  return false
}

/* ── Shared Components ────────────────────────────────────────────── */

function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className={`flex items-center gap-3 font-display font-bold tracking-tight text-lg ${light ? 'text-white' : 'text-[#3D4852]'}`}>
      <span className={`grid size-10 place-items-center rounded-[${light ? '12px' : '16px'}] ${light ? 'bg-white/15' : 'bg-[#E0E5EC] neu-extruded-sm'} text-[#6C63FF]`}>
        <ClipboardCheck size={19} />
      </span>
      <span>Second Opinion</span>
    </div>
  )
}

function NeuButton({
  children,
  onClick,
  variant = 'primary',
  className = '',
  type = 'button',
  disabled,
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
  className?: string
  type?: 'button' | 'submit'
  disabled?: boolean
}) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-[16px] px-6 py-3 text-sm font-semibold transition-all duration-300 ease-out neu-focus-ring-extruded'
  const styles = {
    primary: 'bg-[#6C63FF] text-white neu-extruded-sm hover:-translate-y-[1px] hover:bg-[#8B84FF] active:translate-y-[0.5px] active:neu-accent-pressed',
    secondary: 'bg-[#E0E5EC] text-[#3D4852] neu-extruded-sm hover:-translate-y-[1px] hover:neu-extruded active:translate-y-[0.5px] active:neu-pressed',
    ghost: 'text-[#6B7280] hover:bg-[#E0E5EC] hover:neu-inset-sm',
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${styles[variant]} ${disabled ? 'opacity-40 cursor-not-allowed !translate-y-0' : ''} ${className}`}
    >
      {children}
    </button>
  )
}

function Badge({ verdict }: { verdict: Verdict }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold tracking-wide neu-inset-sm ${verdictStyles[verdict]}`}>
      <span className={`size-1.5 rounded-full ${verdictDot[verdict]}`} />
      {verdictLabels[verdict]}
    </span>
  )
}

/* ── Decorative Neumorphic Circles ────────────────────────────────── */

function NeuDecoration() {
  return (
    <div className="absolute -right-16 -top-16 pointer-events-none hidden lg:block" aria-hidden="true">
      <div className="relative size-64 rounded-full bg-[#E0E5EC] neu-extruded animate-float">
        <div className="absolute inset-6 rounded-full bg-[#E0E5EC] neu-inset-deep">
          <div className="absolute inset-6 rounded-full bg-[#E0E5EC] neu-extruded-sm transition-transform duration-500 hover:scale-105">
            <div className="absolute inset-4 rounded-full bg-[#E0E5EC] neu-inset-sm" />
          </div>
        </div>
      </div>
    </div>
  )
}

function NeuDecorationSmall() {
  return (
    <div className="absolute -left-10 bottom-10 pointer-events-none hidden lg:block" aria-hidden="true">
      <div className="size-32 rounded-full bg-[#E0E5EC] neu-extruded-sm animate-float-delay">
        <div className="absolute inset-4 rounded-full bg-[#E0E5EC] neu-inset" />
      </div>
    </div>
  )
}

/* ── Landing Page ─────────────────────────────────────────────────── */

function Landing({ onStart, onDemo }: { onStart: () => void; onDemo: () => void }) {
  const [menu, setMenu] = useState(false)

  return (
    <div className="min-h-screen bg-[#E0E5EC] text-[#3D4852]">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#E0E5EC]/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm font-medium text-[#6B7280] md:flex">
            <a href="#features" className="transition-colors duration-300 hover:text-[#6C63FF]">Features</a>
            <a href="#how-it-works" className="transition-colors duration-300 hover:text-[#6C63FF]">How it works</a>
            <a href="#principles" className="transition-colors duration-300 hover:text-[#6C63FF]">Principles</a>
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <AccountMenu />
            <NeuButton onClick={onStart}>Start an Audit <ArrowRight size={16} /></NeuButton>
          </div>
          <button
            aria-label="Open navigation"
            className="rounded-[12px] p-3 md:hidden bg-[#E0E5EC] neu-extruded-sm transition-all duration-300 active:neu-inset-sm"
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {menu && (
          <nav className="flex flex-col gap-4 px-5 py-5 md:hidden animate-slide-up bg-[#E0E5EC] neu-extruded mx-5 mb-4 rounded-[16px]">
            <a href="#features" onClick={() => setMenu(false)} className="px-4 py-3 rounded-[12px] font-medium text-sm hover:neu-inset-sm transition-all duration-300">Features</a>
            <a href="#how-it-works" onClick={() => setMenu(false)} className="px-4 py-3 rounded-[12px] font-medium text-sm hover:neu-inset-sm transition-all duration-300">How it works</a>
            <a href="#principles" onClick={() => setMenu(false)} className="px-4 py-3 rounded-[12px] font-medium text-sm hover:neu-inset-sm transition-all duration-300">Principles</a>
            <AccountMenu />
            <NeuButton onClick={onStart}>Start an Audit</NeuButton>
          </nav>
        )}
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 lg:grid-cols-[.9fr_1.1fr] lg:px-8 lg:py-32">
            <div className="animate-slide-up">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#E0E5EC] neu-extruded-sm px-4 py-2 text-xs font-semibold text-[#6C63FF]">
                <Sparkles size={13} /> Evidence-first AI auditing
              </div>
              <h1 className="font-display max-w-xl text-5xl font-extrabold tracking-tight text-[#3D4852] sm:text-6xl lg:text-7xl leading-[1.1]">
                Don&apos;t just trust the answer.{' '}
                <span className="text-[#6C63FF]">Audit it.</span>
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-8 text-[#6B7280]">
                Inspect AI-generated claims, trace the evidence, and uncover unsupported statements with an audit you can actually verify.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <NeuButton onClick={onStart}>Start an Audit <ArrowRight size={16} /></NeuButton>
                <NeuButton variant="secondary" onClick={onDemo}>Explore Demo</NeuButton>
              </div>
              <p className="mt-7 text-sm font-medium text-[#6B7280]">
                Evidence first. Transparent verdicts. Honest uncertainty.
              </p>
            </div>
            <div className="relative">
              <NeuDecoration />
              <Preview />
            </div>
          </div>
          <NeuDecorationSmall />
        </section>

        {/* Problem */}
        <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[.16em] text-[#6C63FF]">The problem</p>
            <h2 className="font-display mt-3 text-3xl font-bold tracking-tight">
              Confidence is not the same as correctness.
            </h2>
          </div>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              ['01', 'AI can sound certain while being wrong.'],
              ['02', 'Unsupported statements can appear alongside correct facts.'],
              ['03', 'A verdict without inspectable evidence is difficult to trust.'],
            ].map(([n, t]) => (
              <div
                key={n}
                className="rounded-[32px] bg-[#E0E5EC] neu-extruded p-8 transition-all duration-300 hover:-translate-y-1 hover:neu-extruded-hover group"
              >
                <span className="inline-flex size-12 items-center justify-center rounded-full bg-[#E0E5EC] neu-inset-deep text-sm font-bold text-[#6C63FF] transition-transform duration-500 group-hover:scale-105">
                  {n}
                </span>
                <p className="mt-8 text-lg font-semibold leading-7">{t}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-[.16em] text-[#6C63FF]">Designed for inspection</p>
            <h2 className="font-display mt-3 max-w-2xl text-3xl font-bold tracking-tight">
              Every finding has a trail back to the source.
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {([
                [Target, 'Claim-level verification', 'Break answers into precise, reviewable units.'],
                [BookOpen, 'Evidence-grounded auditing', 'See the exact passages behind each verdict.'],
                [Search, 'Precise error localization', 'Find the phrase that needs another look.'],
                [Zap, 'Reasoning consistency checks', 'Surface possible gaps without overclaiming.'],
                [Info, 'Uncertainty handling', 'Distinguish missing evidence from contradiction.'],
                [ShieldAlert, 'Confidence-aware reporting', 'Keep estimates visible, never disguised as proof.'],
              ] as const).map(([Icon, title, copy]) => {
                const I = Icon as typeof Target
                return (
                  <div
                    key={title as string}
                    className="rounded-[32px] bg-[#E0E5EC] neu-extruded p-8 transition-all duration-300 hover:-translate-y-1 hover:neu-extruded-hover group"
                  >
                    <div className="grid size-14 place-items-center rounded-[16px] bg-[#E0E5EC] neu-inset-deep transition-transform duration-500 group-hover:scale-105 group-hover:rotate-3">
                      <I className="text-[#6C63FF]" size={24} />
                    </div>
                    <h3 className="mt-6 font-display font-bold text-[#3D4852]">{title as string}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#6B7280]">{copy as string}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[.7fr_1.3fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[.16em] text-[#6C63FF]">How it works</p>
              <h2 className="font-display mt-3 text-3xl font-bold tracking-tight">
                A clear path from answer to evidence.
              </h2>
            </div>
            <div className="grid gap-6">
              {[
                ['01', 'Submit', 'Add an AI-generated answer and one or more source materials it should be checked against.'],
                ['02', 'Inspect', 'Review each claim with a readable verdict and explanation.'],
                ['03', 'Understand', 'Trace evidence, limitations, and uncertainty before relying on the answer.'],
              ].map(([n, t, c]) => (
                <div
                  className="flex gap-5 rounded-[24px] bg-[#E0E5EC] neu-extruded-sm p-6 transition-all duration-300 hover:-translate-y-0.5 hover:neu-extruded"
                  key={n}
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#E0E5EC] neu-inset text-sm font-bold text-[#6C63FF]">
                    {n}
                  </span>
                  <div>
                    <h3 className="font-display font-bold">{t}</h3>
                    <p className="mt-1 text-sm leading-6 text-[#6B7280]">{c}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Principles */}
        <section id="principles" className="relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
            <div className="rounded-[32px] bg-[#E0E5EC] neu-extruded p-10 md:p-16">
              <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[.16em] text-[#6C63FF]">Our principles</p>
                  <h2 className="font-display mt-3 max-w-xl text-3xl font-bold tracking-tight">
                    Honest review is more useful than false certainty.
                  </h2>
                </div>
                <div className="grid max-w-xl gap-4 text-sm text-[#6B7280] sm:grid-cols-2">
                  {[
                    'Unsupported does not mean false.',
                    'Evidence should be traceable.',
                    'Confidence is not proof.',
                    'Ambiguity should be acknowledged.',
                  ].map((t) => (
                    <div
                      className="flex gap-3 items-start rounded-[16px] bg-[#E0E5EC] neu-inset-sm p-4"
                      key={t}
                    >
                      <Check size={16} className="mt-0.5 shrink-0 text-[#6C63FF]" />
                      <span className="font-medium">{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-7xl px-5 py-20 text-center lg:px-8">
          <h2 className="font-display text-3xl font-bold tracking-tight">
            Make every claim worth examining.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[#6B7280]">
            A focused workspace for reviewing what an AI answer says, what the evidence supports, and what still needs a human eye.
          </p>
          <NeuButton className="mt-8" onClick={onStart}>
            Start an Audit <ArrowRight size={16} />
          </NeuButton>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <Logo />
          <span className="text-sm text-[#6B7280]">Findings depend on the available source material.</span>
        </div>
      </footer>
    </div>
  )
}

/* ── Preview Card (Hero) ──────────────────────────────────────────── */

function Preview() {
  return (
    <div className="rounded-[32px] bg-[#E0E5EC] neu-extruded p-4 transition-all duration-300 hover:-translate-y-1 hover:neu-extruded-hover">
      <div className="rounded-[24px] bg-[#E0E5EC] neu-inset p-5">
        <div className="flex items-center justify-between pb-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6B7280]">Demo audit</p>
            <p className="mt-1 text-sm font-bold font-display">Q3 performance summary</p>
          </div>
          <Badge verdict="contradicted" />
        </div>
        <div className="grid gap-4 py-3 text-xs leading-6 sm:grid-cols-[1fr_180px]">
          <div className="rounded-[16px] bg-[#E0E5EC] neu-extruded-sm p-4 text-[#6B7280]">
            <p>
              The report shows that revenue grew by{' '}
              <mark className="rounded-lg bg-[#FEE2E2] px-1.5 py-0.5 text-[#991B1B] font-medium">25% year over year.</mark>{' '}
              The company currently operates{' '}
              <mark className="rounded-lg bg-[#D1FAE5] px-1.5 py-0.5 text-[#065F46] font-medium">20 offices.</mark>
            </p>
            <p className="mt-3 text-[#A0AEC0]">Select a highlighted claim to inspect its evidence.</p>
          </div>
          <div className="rounded-[16px] bg-[#E0E5EC] neu-extruded-sm p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">Evidence</p>
            <p className="mt-3 border-l-2 border-[#DC2626] pl-2 text-[11px] leading-5 text-[#6B7280]">
              &ldquo;Revenue increased by 12% compared with the same quarter last year.&rdquo;
            </p>
            <p className="mt-3 text-[10px] text-[#A0AEC0]">Q3 performance report</p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── App Shell (Sidebar + Header) ─────────────────────────────────── */

function AppShell({
  children,
  onBack,
  onDemo,
}: {
  children: React.ReactNode
  onBack: () => void
  onDemo?: () => void
}) {
  return (
    <div className="min-h-screen bg-[#E0E5EC] text-[#3D4852]">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 px-4 py-5 lg:block z-40">
        <div className="h-full rounded-[24px] bg-[#E0E5EC] neu-extruded p-5 flex flex-col">
          <Logo />
          <div className="mt-10 flex flex-col gap-2">
            <button
              onClick={onBack}
              className="flex items-center gap-3 rounded-[16px] bg-[#6C63FF] px-4 py-3 text-sm font-semibold text-white neu-extruded-sm transition-all duration-300 hover:-translate-y-[1px]"
            >
              <Plus size={16} /> New Audit
            </button>
            <button
              onClick={onDemo}
              className="flex items-center gap-3 rounded-[16px] bg-[#E0E5EC] px-4 py-3 text-sm font-medium text-[#6B7280] transition-all duration-300 hover:neu-inset-sm"
            >
              <ClipboardCheck size={16} /> Demo Audit
            </button>
            <Link href="/history" className="flex items-center gap-3 rounded-[16px] bg-[#E0E5EC] px-4 py-3 text-sm font-medium text-[#6B7280] transition-all duration-300 hover:neu-inset-sm">
              <FileText size={16} /> Audit History
            </Link>
          </div>
          <div className="mt-auto pt-4">
            <button className="flex items-center gap-3 px-4 py-3 text-sm text-[#6B7280] rounded-[16px] transition-all duration-300 hover:neu-inset-sm w-full">
              <BookOpen size={16} /> Methodology
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between px-5 lg:px-8 backdrop-blur-md bg-[#E0E5EC]/80">
          <button onClick={onBack} className="lg:hidden">
            <Logo />
          </button>
          <span className="hidden text-sm font-medium text-[#6B7280] lg:inline">Evidence workspace</span>
          <AccountMenu />
        </header>
        {children}
      </div>
    </div>
  )
}

/* ── Input Workspace (Multi-source) ───────────────────────────────── */

function InputWorkspace({
  onBack,
  onDemo,
  onResults,
}: {
  onBack: () => void
  onDemo: () => void
  onResults: (audit: Audit) => void
}) {
  const [answer, setAnswer] = useState('')
  const [sources, setSources] = useState([{ title: '', text: '' }])
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState('')
  const [loadingStage, setLoadingStage] = useState<'idle' | 'extracting' | 'analyzing'>('idle')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const loading = loadingStage !== 'idle'
  const hasPastedSource = sources.some((source) => source.text.trim())

  const loadExample = (i: number) => {
    setAnswer(exampleAudits[i].answer)
    setSources([{ title: 'Illustrative source', text: exampleAudits[i].source }])
    setPdfFile(null)
    setError('')
  }

  const addSource = () => {
    setSources([...sources, { title: '', text: '' }])
  }

  const removeSource = (index: number) => {
    setSources(sources.filter((_, j) => j !== index))
  }

  const updateSource = (index: number, field: 'title' | 'text', value: string) => {
    setSources(sources.map((s, j) => (j === index ? { ...s, [field]: value } : s)))
  }

  const selectPdf = async (file: File | undefined) => {
    if (!file) return
    if (hasPastedSource) {
      setError('Remove the pasted source text before selecting a PDF. Use one source type per audit.')
      return
    }
    setPdfFile(null)
    if (file.size === 0) {
      setError('The selected file is empty. Select a PDF file.')
      return
    }
    if (file.size > MAX_PDF_SIZE) {
      setError('The selected PDF exceeds the 10 MB file-size limit.')
      return
    }
    let signatureBytes: Uint8Array
    try {
      signatureBytes = new Uint8Array(await file.slice(0, 1024).arrayBuffer())
    } catch {
      setError('The selected file could not be read. Select a different PDF.')
      return
    }
    if (!hasPdfSignature(signatureBytes)) {
      setError('The selected file is not a valid PDF. Choose a genuine PDF document.')
      return
    }
    setPdfFile(file)
    setError('')
  }

  const run = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    if (!answer.trim()) {
      setError('Add an AI-generated answer before running the audit.')
      return
    }
    if (hasPastedSource && pdfFile) {
      setError('Choose either pasted source text or one PDF, not both.')
      return
    }
    if (!hasPastedSource && !pdfFile) {
      setError('Add pasted source text or select one PDF before running the audit.')
      return
    }
    setError('')
    setLoadingStage(pdfFile ? 'extracting' : 'analyzing')

    try {
      let submittedSources: Source[]
      let source: string

      if (pdfFile) {
        const formData = new FormData()
        formData.append('file', pdfFile)
        const extractionResponse = await fetch('/api/extract-pdf', {
          method: 'POST',
          body: formData,
        })
        const extractionData: unknown = await extractionResponse.json().catch(() => null)
        if (!extractionResponse.ok) {
          const apiError = extractionData as { error?: { message?: string } } | null
          throw new Error(apiError?.error?.message || `PDF extraction failed with status ${extractionResponse.status}.`)
        }
        if (!isExtractPdfResponse(extractionData)) throw new Error('The server returned an unexpected PDF extraction response.')
        source = extractionData.text
        submittedSources = [{ id: 'source-1', title: pdfFile.name, text: extractionData.text }]
        setLoadingStage('analyzing')
      } else {
        submittedSources = sources
          .filter((item) => item.text.trim())
          .map((item, index) => ({ id: `source-${index + 1}`, title: item.title.trim() || `Source ${index + 1}`, text: item.text }))
        source = submittedSources.map((item) => item.text).join('\n\n')
      }

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer, source }),
      })
      const data: unknown = await res.json().catch(() => null)
      if (!res.ok) {
        const apiError = data as { error?: { message?: string } } | null
        throw new Error(apiError?.error?.message || `Audit request failed with status ${res.status}.`)
      }
      if (!isAnalyzeResponse(data)) throw new Error('The server returned an unexpected audit response.')
      onResults(createLiveAudit(data, answer, submittedSources, pdfFile?.name))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The audit could not be completed. Please try again.')
    } finally {
      setLoadingStage('idle')
    }
  }

  return (
    <AppShell onBack={onBack} onDemo={onDemo}>
      <div className="mx-auto max-w-4xl px-5 py-10 lg:px-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#6C63FF]">New Audit</p>
            <h1 className="font-display mt-2 text-3xl font-bold tracking-tight">
              Check an AI-generated answer against its source material.
            </h1>
          </div>
          <span className="hidden rounded-full bg-[#E0E5EC] neu-extruded-sm px-4 py-2 text-xs font-semibold text-[#6C63FF] sm:inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-[#6C63FF] animate-pulse-soft" />
            Live analysis
          </span>
        </div>

        <form onSubmit={run} className="mt-10 flex flex-col gap-7">
          {/* AI Answer */}
          <label className="flex flex-col gap-3">
            <span className="text-sm font-bold font-display">AI-generated answer</span>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={7}
              placeholder="Paste the answer you want to inspect..."
              className="rounded-[16px] bg-[#E0E5EC] neu-inset p-5 text-sm leading-7 outline-none transition-all duration-300 placeholder:text-[#A0AEC0] focus:neu-inset-deep neu-focus-ring"
            />
          </label>

          {/* Source Material */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold font-display">Source material</h2>
                <p className="mt-1 text-xs text-[#6B7280]">
                  Add one or more text sources, or upload a PDF.
                </p>
              </div>
              <span className="hidden sm:inline text-xs text-[#A0AEC0] bg-[#E0E5EC] neu-inset-sm rounded-full px-3 py-1.5">
                {sources.filter((s) => s.text.trim()).length} source{sources.filter((s) => s.text.trim()).length !== 1 ? 's' : ''} added
              </span>
            </div>

            {/* Source Cards */}
            {sources.map((source, i) => (
              <div
                className="rounded-[24px] bg-[#E0E5EC] neu-extruded p-6 transition-all duration-300 animate-slide-up"
                key={i}
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="grid size-8 place-items-center rounded-full bg-[#E0E5EC] neu-inset text-xs font-bold text-[#6C63FF]">
                      {i + 1}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                      Source {i + 1}
                    </span>
                  </div>
                  {sources.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSource(i)}
                      className="grid size-8 place-items-center rounded-[10px] bg-[#E0E5EC] text-[#6B7280] neu-extruded-sm transition-all duration-300 hover:text-[#DC2626] hover:neu-inset-sm active:neu-inset"
                      disabled={loading}
                      aria-label={`Remove source ${i + 1}`}
                    >
                      <Minus size={14} />
                    </button>
                  )}
                </div>
                <div className="flex flex-col gap-4">
                  <input
                    value={source.title}
                    onChange={(e) => updateSource(i, 'title', e.target.value)}
                    placeholder="Source title (optional)"
                    disabled={Boolean(pdfFile) || loading}
                    className="rounded-[12px] bg-[#E0E5EC] neu-inset-sm px-4 py-3 text-sm outline-none transition-all duration-300 placeholder:text-[#A0AEC0] focus:neu-inset-deep disabled:cursor-not-allowed disabled:opacity-40 neu-focus-ring"
                  />
                  <textarea
                    value={source.text}
                    onChange={(e) => updateSource(i, 'text', e.target.value)}
                    rows={4}
                    placeholder="Paste source text here..."
                    disabled={Boolean(pdfFile) || loading}
                    className="rounded-[16px] bg-[#E0E5EC] neu-inset p-4 text-sm leading-6 outline-none transition-all duration-300 placeholder:text-[#A0AEC0] focus:neu-inset-deep disabled:cursor-not-allowed disabled:opacity-40 neu-focus-ring"
                  />
                </div>
              </div>
            ))}

            {/* Add Source Button */}
            <NeuButton
              variant="secondary"
              onClick={addSource}
              disabled={Boolean(pdfFile) || loading}
              className="self-start"
            >
              <Plus size={16} /> Add another source
            </NeuButton>

            {/* Divider */}
            <div className="flex items-center gap-4 py-2">
              <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#A0AEC0]/30 to-transparent" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#A0AEC0]">or upload PDF</span>
              <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#A0AEC0]/30 to-transparent" />
            </div>

            {/* PDF Upload */}
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={(event) => {
                void selectPdf(event.target.files?.[0])
                event.target.value = ''
              }}
            />
            {pdfFile ? (
              <div className="rounded-[24px] bg-[#E0E5EC] neu-extruded p-6 animate-slide-up">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-4">
                    <span className="grid size-12 shrink-0 place-items-center rounded-[16px] bg-[#E0E5EC] neu-inset-deep text-[#6C63FF]">
                      <FileText size={22} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">{pdfFile.name}</p>
                      <p className="mt-1 text-xs text-[#6B7280]">
                        {(pdfFile.size / 1024 / 1024).toFixed(2)} MB · PDF selected
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <NeuButton variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={loading}>
                      Replace
                    </NeuButton>
                    <button
                      type="button"
                      onClick={() => {
                        setPdfFile(null)
                        setError('')
                      }}
                      disabled={loading}
                      className="inline-flex items-center gap-1.5 rounded-[12px] px-4 py-2.5 text-sm font-semibold text-[#6B7280] bg-[#E0E5EC] neu-extruded-sm transition-all duration-300 hover:text-[#DC2626] hover:neu-inset-sm disabled:opacity-40"
                    >
                      <X size={15} /> Remove
                    </button>
                  </div>
                </div>
                {loadingStage === 'extracting' && (
                  <p className="mt-4 flex items-center gap-2 text-xs font-medium text-[#6C63FF]">
                    <LoaderCircle className="animate-spin" size={14} /> Uploading and extracting PDF text…
                  </p>
                )}
              </div>
            ) : (
              <button
                type="button"
                disabled={hasPastedSource || loading}
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={(event) => {
                  event.preventDefault()
                  if (!hasPastedSource && !loading) setDragActive(true)
                }}
                onDragOver={(event) => event.preventDefault()}
                onDragLeave={(event) => {
                  event.preventDefault()
                  setDragActive(false)
                }}
                onDrop={(event) => {
                  event.preventDefault()
                  setDragActive(false)
                  if (!hasPastedSource && !loading) void selectPdf(event.dataTransfer.files?.[0])
                }}
                className={`flex flex-col items-center rounded-[24px] bg-[#E0E5EC] px-6 py-10 text-center transition-all duration-300 ${
                  dragActive ? 'neu-inset-deep scale-[0.99]' : 'neu-inset hover:neu-inset-deep'
                } disabled:cursor-not-allowed disabled:opacity-40`}
              >
                <span className="grid size-14 place-items-center rounded-full bg-[#E0E5EC] neu-extruded-sm text-[#6C63FF] transition-transform duration-300 group-hover:scale-105">
                  <Upload size={22} />
                </span>
                <span className="mt-4 text-sm font-bold">Drop a PDF here or choose a file</span>
                <span className="mt-1.5 text-xs text-[#6B7280]">Text-based PDF only · maximum 10 MB</span>
                {hasPastedSource && (
                  <span className="mt-3 text-xs font-medium text-[#D97706]">Clear pasted source text to enable PDF upload.</span>
                )}
              </button>
            )}
            {error && (
              <div className="rounded-[16px] bg-[#E0E5EC] neu-inset p-4 text-sm text-[#DC2626] font-medium animate-slide-up flex items-start gap-3" role="alert">
                <CircleAlert size={18} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <NeuButton type="submit" disabled={loading}>
              {loadingStage === 'extracting'
                ? 'Extracting PDF…'
                : loadingStage === 'analyzing'
                  ? 'Analyzing…'
                  : 'Run Audit'}{' '}
              {loading ? <LoaderCircle className="animate-spin" size={16} /> : <ArrowRight size={16} />}
            </NeuButton>
            <NeuButton variant="secondary" onClick={() => loadExample(0)} disabled={loading}>
              Load Example
            </NeuButton>
            <button
              type="button"
              onClick={() => {
                setAnswer('')
                setSources([{ title: '', text: '' }])
                setPdfFile(null)
                setError('')
              }}
              className="px-4 py-2.5 text-sm font-semibold text-[#6B7280] transition-colors duration-300 hover:text-[#3D4852] rounded-[12px]"
              disabled={loading}
            >
              Clear
            </button>
          </div>
          <p className="text-xs leading-5 text-[#A0AEC0]">
            Custom audits use the live analysis API. Demo data appears only when you explicitly open Demo Audit.
          </p>
        </form>
      </div>
    </AppShell>
  )
}

/* ── Live Results ─────────────────────────────────────────────────── */

function LiveResults({
  audit,
  onNew,
  onBack,
  onDemo,
}: {
  audit: Audit
  onNew: () => void
  onBack: () => void
  onDemo: () => void
}) {
  const [selected, setSelected] = useState<Claim | undefined>(audit.claims[0])
  const [filter, setFilter] = useState<'all' | Verdict>('all')
  const [query, setQuery] = useState('')
  const fallbackCounts = useMemo(() => getCounts(audit.claims), [audit.claims])
  const counts = audit.summary
    ? {
        supported: audit.summary.supported,
        contradicted: audit.summary.contradicted,
        insufficient_evidence: audit.summary.unsupported,
        ambiguous: audit.summary.ambiguous,
      }
    : fallbackCounts
  const totalClaims = audit.summary?.total_claims ?? audit.claims.length
  const filtered = audit.claims.filter((claim) => {
    const matchesFilter = filter === 'all' || claim.verdict === filter
    return matchesFilter && `${claim.text} ${claim.explanation}`.toLowerCase().includes(query.toLowerCase())
  })
  const parts = getHighlightParts(audit.original_answer, audit.claims)
  const hasContradictions = counts.contradicted > 0

  return (
    <AppShell onBack={onNew} onDemo={onDemo}>
      <div className="mx-auto max-w-[1500px] px-5 py-7 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-5 pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm font-semibold text-[#6C63FF]">Audit results</p>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E0E5EC] neu-extruded-sm px-3 py-1.5 text-[11px] font-semibold text-[#6C63FF]">
                <span className="size-2 rounded-full bg-[#6C63FF] animate-pulse-soft" />
                Live analysis
              </span>
            </div>
            <h1 className="font-display mt-2 text-2xl font-bold tracking-tight">{audit.title}</h1>
            <p className={`mt-2 flex items-center gap-2 text-sm font-medium ${hasContradictions ? 'text-[#DC2626]' : 'text-[#059669]'}`}>
              {hasContradictions ? <CircleAlert size={16} /> : <CheckCircle2 size={16} />}
              {hasContradictions ? 'Contradictory claims found · review needed' : 'Analysis complete · no contradictions found'}
            </p>
          </div>
          <div className="flex flex-wrap items-start gap-3">
            <SaveAuditButton audit={audit} />
            <NeuButton variant="secondary" onClick={onBack}>Edit input</NeuButton>
            <NeuButton onClick={onNew}>New audit <Plus size={16} /></NeuButton>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-5">
          {(
            [
              ['all', 'Claims reviewed', totalClaims, 'text-[#3D4852]'],
              ['supported', 'Supported', counts.supported, 'text-[#059669]'],
              ['contradicted', 'Contradicted', counts.contradicted, 'text-[#DC2626]'],
              ['insufficient_evidence', 'Insufficient evidence', counts.insufficient_evidence, 'text-[#D97706]'],
              ['ambiguous', 'Ambiguous', counts.ambiguous, 'text-[#64748B]'],
            ] as const
          ).map(([key, label, value, color]) => (
            <button
              key={key}
              onClick={() => setFilter(filter === key ? 'all' : key)}
              className={`rounded-[20px] bg-[#E0E5EC] p-5 text-left transition-all duration-300 ${
                filter === key ? 'neu-inset-deep' : 'neu-extruded-sm hover:-translate-y-[1px] hover:neu-extruded'
              }`}
            >
              <p className="text-xs font-medium text-[#6B7280]">{label}</p>
              <p className={`mt-2 text-2xl font-bold font-display ${color}`}>{value}</p>
            </button>
          ))}
        </div>

        {/* 3-column Layout */}
        <div className="mt-7 grid gap-5 xl:grid-cols-[minmax(260px,.8fr)_minmax(360px,1fr)_minmax(300px,.9fr)]">
          {/* Original Answer */}
          <section className="rounded-[24px] bg-[#E0E5EC] neu-extruded p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold">Original answer</h2>
              <span className="text-xs text-[#A0AEC0]">{audit.original_answer.length} chars</span>
            </div>
            <p className="mt-5 text-sm leading-8 text-[#6B7280]">
              {parts.map((part, index) =>
                part.claim ? (
                  <button
                    key={index}
                    onClick={() => setSelected(part.claim)}
                    className={`mx-0.5 rounded-lg px-1.5 py-0.5 text-left underline decoration-2 underline-offset-4 transition-all duration-300 ${verdictHighlight[part.claim.verdict]} hover:brightness-95`}
                  >
                    {part.text}
                  </button>
                ) : (
                  <span key={index}>{part.text}</span>
                )
              )}
            </p>
            <div className="mt-7 pt-4 text-xs text-[#A0AEC0]">
              Highlighted claims use the exact offsets returned by the analysis API.
            </div>
          </section>

          {/* Claim Findings */}
          <section className="min-w-0 rounded-[24px] bg-[#E0E5EC] neu-extruded p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-display font-bold">
                Claim findings{' '}
                <span className="ml-1 text-sm font-normal text-[#6B7280]">({filtered.length})</span>
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-[#A0AEC0]" size={15} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search claims"
                  className="w-full rounded-[12px] bg-[#E0E5EC] neu-inset-sm py-2.5 pl-9 pr-3 text-xs outline-none transition-all duration-300 focus:neu-inset-deep sm:w-44 placeholder:text-[#A0AEC0] neu-focus-ring"
                />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 pb-4">
              {(
                [
                  ['all', 'All'],
                  ['supported', 'Supported'],
                  ['contradicted', 'Contradicted'],
                  ['insufficient_evidence', 'Insufficient'],
                  ['ambiguous', 'Ambiguous'],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all duration-300 ${
                    filter === key
                      ? 'bg-[#6C63FF] text-white neu-extruded-sm'
                      : 'bg-[#E0E5EC] text-[#6B7280] neu-inset-sm hover:neu-inset'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex max-h-[620px] flex-col gap-3 overflow-auto pt-2">
              {filtered.map((claim) => (
                <button
                  key={claim.id}
                  onClick={() => setSelected(claim)}
                  className={`rounded-[16px] bg-[#E0E5EC] p-4 text-left transition-all duration-300 ${
                    selected?.id === claim.id
                      ? 'neu-inset scale-[0.99]'
                      : 'neu-extruded-sm hover:-translate-y-[1px] hover:neu-extruded'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#A0AEC0]">
                      Claim {audit.claims.indexOf(claim) + 1}
                    </span>
                    <Badge verdict={claim.verdict} />
                  </div>
                  <p className="mt-2 text-sm font-semibold leading-6">{claim.text}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#6B7280]">{claim.explanation}</p>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-[#A0AEC0]">
                    <span className="capitalize">{claim.confidenceLevel ? `${claim.confidenceLevel} confidence` : 'Review needed'}</span>
                    <span className="inline-flex items-center gap-1 font-bold text-[#6C63FF]">
                      Inspect <ChevronRight size={13} />
                    </span>
                  </div>
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="p-8 text-center text-sm text-[#6B7280] rounded-[16px] bg-[#E0E5EC] neu-inset">No claims match this filter.</div>
              )}
            </div>
          </section>

          {/* Evidence Inspector */}
          <LiveEvidenceInspector claim={selected} sources={audit.sources} />
        </div>
      </div>
    </AppShell>
  )
}

/* ── Live Evidence Inspector ──────────────────────────────────────── */

function LiveEvidenceInspector({ claim, sources }: { claim?: Claim; sources: Audit['sources'] }) {
  if (!claim)
    return (
      <section className="rounded-[24px] bg-[#E0E5EC] neu-extruded p-6 text-sm text-[#6B7280]">
        No factual claims were extracted from this answer.
      </section>
    )

  return (
    <section className="rounded-[24px] bg-[#E0E5EC] neu-extruded p-6 animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#A0AEC0]">Evidence inspector</p>
          <h2 className="mt-2 font-display font-bold">Claim detail</h2>
        </div>
        <Badge verdict={claim.verdict} />
      </div>
      <p className="mt-5 text-sm font-semibold leading-6">{claim.text}</p>
      <p className="mt-4 text-sm leading-6 text-[#6B7280]">{claim.explanation}</p>

      {/* Confidence */}
      <div className="mt-5 rounded-[16px] bg-[#E0E5EC] neu-inset p-4">
        <div className="flex justify-between text-xs">
          <span className="font-medium text-[#6B7280]">Estimated confidence</span>
          <span className="font-bold capitalize">{claim.confidenceLevel ?? 'Not available'}</span>
        </div>
        <p className="mt-2 text-[11px] text-[#A0AEC0]">An estimate, not proof of correctness.</p>
      </div>

      {/* Evidence */}
      <div className="mt-6 flex flex-col gap-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#A0AEC0]">Relevant passages</h3>
        {claim.evidence.length ? (
          claim.evidence.map((evidence, index) => {
            const source = sources.find((item) => item.id === evidence.sourceId) ?? sources[0]
            return (
              <div key={index} className="rounded-[16px] bg-[#E0E5EC] neu-inset p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold">{source?.title ?? 'Submitted source'}</span>
                  <span
                    className={`text-[10px] font-bold uppercase rounded-full px-2 py-1 ${
                      evidence.relation === 'contradicts'
                        ? 'text-[#DC2626] bg-[#FEF2F2]'
                        : 'text-[#059669] bg-[#ECFDF5]'
                    }`}
                  >
                    {evidence.relation}
                  </span>
                </div>
                <blockquote className="mt-3 border-l-2 border-[#6C63FF] pl-3 text-xs leading-5 text-[#6B7280] italic">
                  &ldquo;{evidence.quote}&rdquo;
                </blockquote>
                <p className="mt-3 flex items-center gap-1.5 text-[11px] leading-5 text-[#059669]">
                  <CheckCircle2 size={13} /> Exact quote verified in submitted source
                </p>
              </div>
            )
          })
        ) : (
          <div className="rounded-[16px] bg-[#E0E5EC] neu-inset p-5">
            <div className="flex gap-2 text-sm font-bold text-[#D97706]">
              <Info size={16} /> No verified evidence quote
            </div>
            <p className="mt-2 text-xs leading-5 text-[#6B7280]">{claim.limitation}</p>
          </div>
        )}
      </div>
    </section>
  )
}

/* ── Demo Results ─────────────────────────────────────────────────── */

function Results({ audit, onNew, onBack }: { audit: Audit; onNew: () => void; onBack: () => void }) {
  const [selected, setSelected] = useState(audit.claims[2])
  const [filter, setFilter] = useState<'all' | Verdict | 'reasoning' | 'safety'>('all')
  const [query, setQuery] = useState('')
  const counts = useMemo(() => getCounts(audit.claims), [audit.claims])
  const filtered = audit.claims.filter((c) => {
    const matchesFilter =
      filter === 'all' ||
      c.verdict === filter ||
      (filter === 'safety' && c.categories.includes('safety_concern')) ||
      (filter === 'reasoning' && c.categories.includes('reasoning_inconsistency'))
    return matchesFilter && `${c.text} ${c.explanation}`.toLowerCase().includes(query.toLowerCase())
  })
  const parts = getHighlightParts(audit.original_answer, audit.claims)

  return (
    <AppShell onBack={onNew}>
      <div className="mx-auto max-w-[1500px] px-5 py-7 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-5 pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm font-semibold text-[#6C63FF]">Audit results</p>
              <span className="rounded-full bg-[#E0E5EC] neu-inset-sm px-3 py-1.5 text-[11px] font-semibold text-[#6B7280]">
                Demo data
              </span>
            </div>
            <h1 className="font-display mt-2 text-2xl font-bold tracking-tight">{audit.title}</h1>
            <p className="mt-2 flex items-center gap-2 text-sm font-medium text-[#DC2626]">
              <CircleAlert size={16} /> Contradictory claims found · review needed
            </p>
          </div>
          <div className="flex gap-3">
            <NeuButton variant="secondary" onClick={onBack}>Edit input</NeuButton>
            <NeuButton onClick={onNew}>New audit <Plus size={16} /></NeuButton>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-5">
          {(
            [
              ['all', 'Claims reviewed', audit.claims.length, 'text-[#3D4852]'],
              ['supported', 'Supported', counts.supported, 'text-[#059669]'],
              ['contradicted', 'Contradicted', counts.contradicted, 'text-[#DC2626]'],
              ['insufficient_evidence', 'Insufficient evidence', counts.insufficient_evidence, 'text-[#D97706]'],
              ['ambiguous', 'Ambiguous', counts.ambiguous, 'text-[#64748B]'],
            ] as const
          ).map(([key, label, value, color]) => (
            <button
              key={key}
              onClick={() => setFilter(filter === key ? 'all' : (key as typeof filter))}
              className={`rounded-[20px] bg-[#E0E5EC] p-5 text-left transition-all duration-300 ${
                filter === key ? 'neu-inset-deep' : 'neu-extruded-sm hover:-translate-y-[1px] hover:neu-extruded'
              }`}
            >
              <p className="text-xs font-medium text-[#6B7280]">{label}</p>
              <p className={`mt-2 text-2xl font-bold font-display ${color}`}>{value}</p>
            </button>
          ))}
        </div>

        {/* 3-column */}
        <div className="mt-7 grid gap-5 xl:grid-cols-[minmax(260px,.8fr)_minmax(360px,1fr)_minmax(300px,.9fr)]">
          {/* Original Answer */}
          <section className="rounded-[24px] bg-[#E0E5EC] neu-extruded p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold">Original answer</h2>
              <span className="text-xs text-[#A0AEC0]">{audit.original_answer.length} chars</span>
            </div>
            <p className="mt-5 text-sm leading-8 text-[#6B7280]">
              {parts.map((part, i) =>
                part.claim ? (
                  <button
                    key={i}
                    onClick={() => setSelected(part.claim!)}
                    className={`mx-0.5 rounded-lg px-1.5 py-0.5 text-left underline decoration-2 underline-offset-4 transition-all duration-300 ${verdictHighlight[part.claim.verdict]} hover:brightness-95`}
                  >
                    {part.text}
                  </button>
                ) : (
                  <span key={i}>{part.text}</span>
                )
              )}
            </p>
            <div className="mt-7 pt-4 text-xs text-[#A0AEC0]">
              Highlighted claims are interactive. Select one to inspect the evidence trail.
            </div>
          </section>

          {/* Claim Findings */}
          <section className="min-w-0 rounded-[24px] bg-[#E0E5EC] neu-extruded p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-display font-bold">
                Claim findings{' '}
                <span className="ml-1 text-sm font-normal text-[#6B7280]">({filtered.length})</span>
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-[#A0AEC0]" size={15} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search claims"
                  className="w-full rounded-[12px] bg-[#E0E5EC] neu-inset-sm py-2.5 pl-9 pr-3 text-xs outline-none transition-all duration-300 focus:neu-inset-deep sm:w-44 placeholder:text-[#A0AEC0] neu-focus-ring"
                />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 pb-4">
              {[
                ['all', 'All'],
                ['supported', 'Supported'],
                ['contradicted', 'Contradicted'],
                ['insufficient_evidence', 'Insufficient'],
                ['ambiguous', 'Ambiguous'],
                ['safety', 'Safety flags'],
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as typeof filter)}
                  className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all duration-300 ${
                    filter === key
                      ? 'bg-[#6C63FF] text-white neu-extruded-sm'
                      : 'bg-[#E0E5EC] text-[#6B7280] neu-inset-sm hover:neu-inset'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex max-h-[620px] flex-col gap-3 overflow-auto pt-2">
              {filtered.map((claim) => (
                <button
                  key={claim.id}
                  onClick={() => setSelected(claim)}
                  className={`rounded-[16px] bg-[#E0E5EC] p-4 text-left transition-all duration-300 ${
                    selected.id === claim.id
                      ? 'neu-inset scale-[0.99]'
                      : 'neu-extruded-sm hover:-translate-y-[1px] hover:neu-extruded'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#A0AEC0]">
                      Claim {audit.claims.indexOf(claim) + 1}
                    </span>
                    <Badge verdict={claim.verdict} />
                  </div>
                  <p className="mt-2 text-sm font-semibold leading-6">{claim.text}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#6B7280]">{claim.explanation}</p>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-[#A0AEC0]">
                    <span>{claim.confidence ? `${Math.round(claim.confidence * 100)}% confidence` : 'Review needed'}</span>
                    <span className="inline-flex items-center gap-1 font-bold text-[#6C63FF]">
                      Inspect <ChevronRight size={13} />
                    </span>
                  </div>
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="p-8 text-center text-sm text-[#6B7280] rounded-[16px] bg-[#E0E5EC] neu-inset">
                  No claims match this filter.
                </div>
              )}
            </div>
          </section>

          {/* Evidence Inspector */}
          <EvidenceInspector claim={selected} sources={audit.sources} />
        </div>
      </div>
    </AppShell>
  )
}

/* ── Demo Evidence Inspector ──────────────────────────────────────── */

function EvidenceInspector({ claim, sources }: { claim: Claim; sources: Audit['sources'] }) {
  return (
    <section className="rounded-[24px] bg-[#E0E5EC] neu-extruded p-6 animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#A0AEC0]">Evidence inspector</p>
          <h2 className="mt-2 font-display font-bold">Claim detail</h2>
        </div>
        <Badge verdict={claim.verdict} />
      </div>
      <p className="mt-5 text-sm font-semibold leading-6">{claim.text}</p>
      <p className="mt-4 text-sm leading-6 text-[#6B7280]">{claim.explanation}</p>

      {/* Confidence bar */}
      {claim.confidence && (
        <div className="mt-5 rounded-[16px] bg-[#E0E5EC] neu-inset p-4">
          <div className="flex justify-between text-xs">
            <span className="font-medium text-[#6B7280]">Estimated confidence</span>
            <span className="font-bold">{Math.round(claim.confidence * 100)}%</span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-[#E0E5EC] neu-inset-sm overflow-hidden">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-[#6C63FF] to-[#8B84FF] transition-all duration-500"
              style={{ width: `${claim.confidence * 100}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] text-[#A0AEC0]">An estimate, not proof of correctness.</p>
        </div>
      )}

      {/* Evidence passages */}
      <div className="mt-6 flex flex-col gap-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#A0AEC0]">Relevant passages</h3>
        {claim.evidence.length ? (
          claim.evidence.map((e, i) => {
            const source = sources.find((s) => s.id === e.sourceId) || sources[0]
            return (
              <div key={i} className="rounded-[16px] bg-[#E0E5EC] neu-inset p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold">{source.title}</span>
                  <span
                    className={`text-[10px] font-bold uppercase rounded-full px-2 py-1 ${
                      e.relation === 'contradicts' ? 'text-[#DC2626] bg-[#FEF2F2]' : 'text-[#059669] bg-[#ECFDF5]'
                    }`}
                  >
                    {e.relation}
                  </span>
                </div>
                <blockquote className="mt-3 border-l-2 border-[#6C63FF] pl-3 text-xs leading-5 text-[#6B7280] italic">
                  &ldquo;{e.quote}&rdquo;
                </blockquote>
                <p className="mt-3 text-[11px] leading-5 text-[#A0AEC0]">{e.why}</p>
                <button className="mt-3 text-xs font-bold text-[#6C63FF] transition-colors duration-300 hover:text-[#8B84FF]">
                  View in source <ArrowRight className="inline" size={12} />
                </button>
              </div>
            )
          })
        ) : (
          <div className="rounded-[16px] bg-[#E0E5EC] neu-inset p-5">
            <div className="flex gap-2 text-sm font-bold text-[#D97706]">
              <Info size={16} /> Evidence is insufficient
            </div>
            <p className="mt-2 text-xs leading-5 text-[#6B7280]">{claim.limitation}</p>
          </div>
        )}
      </div>

      {/* Safety flag */}
      {claim.categories.includes('safety_concern') && (
        <div className="mt-5 flex gap-3 rounded-[16px] bg-[#E0E5EC] neu-inset p-4 text-xs leading-5 text-[#D97706]">
          <ShieldAlert size={16} className="shrink-0" />
          <span>
            <strong>Review needed:</strong> This recommendation may require separate operational review. Safety concerns
            are distinct from factual verdicts.
          </span>
        </div>
      )}
    </section>
  )
}

/* ── Root Page ─────────────────────────────────────────────────────── */

export default function Page() {
  const [view, setView] = useState<'landing' | 'input' | 'results'>('landing')
  const [audit, setAudit] = useState<Audit>(demoAudit)
  const showDemo = () => {
    setAudit(demoAudit)
    setView('results')
  }

  if (view === 'input')
    return (
      <InputWorkspace
        onBack={() => setView('landing')}
        onDemo={showDemo}
        onResults={(next) => {
          setAudit(next)
          setView('results')
        }}
      />
    )
  if (view === 'results')
    return audit.mode === 'live' ? (
      <LiveResults audit={audit} onNew={() => setView('input')} onBack={() => setView('input')} onDemo={showDemo} />
    ) : (
      <Results audit={audit} onNew={() => setView('input')} onBack={() => setView('input')} />
    )
  return <Landing onStart={() => setView('input')} onDemo={showDemo} />
}
