'use client'

import { useMemo, useRef, useState } from 'react'
import { ArrowRight, BookOpen, Check, CheckCircle2, ChevronRight, CircleAlert, ClipboardCheck, FileText, Filter, Info, LoaderCircle, Menu, Minus, Plus, Search, ShieldAlert, Sparkles, Target, Upload, X, Zap } from 'lucide-react'
import { createLiveAudit, demoAudit, exampleAudits, getCounts, getHighlightParts, isAnalyzeResponse, isExtractPdfResponse, verdictLabels, type Audit, type Claim, type Source, type Verdict } from '@/lib/audit-data'

const verdictStyles: Record<Verdict, string> = { supported: 'border-emerald-200 bg-emerald-50 text-emerald-800', contradicted: 'border-rose-200 bg-rose-50 text-rose-800', insufficient_evidence: 'border-amber-200 bg-amber-50 text-amber-800', ambiguous: 'border-slate-200 bg-slate-50 text-slate-700' }
const verdictDot: Record<Verdict, string> = { supported: 'bg-emerald-500', contradicted: 'bg-rose-500', insufficient_evidence: 'bg-amber-500', ambiguous: 'bg-slate-400' }
const MAX_PDF_SIZE = 10 * 1024 * 1024

function Logo({ light = false }: { light?: boolean }) { return <div className={`flex items-center gap-2.5 font-semibold tracking-tight ${light ? 'text-white' : 'text-slate-950'}`}><span className={`grid size-8 place-items-center rounded-lg ${light ? 'bg-white/15' : 'bg-indigo-600'} text-white`}><ClipboardCheck size={17} /></span><span>Second Opinion</span></div> }
function Button({ children, onClick, variant = 'primary', className = '', type = 'button', disabled }: { children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary' | 'ghost' | 'white'; className?: string; type?: 'button' | 'submit'; disabled?: boolean }) { const styles = { primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200', secondary: 'border border-slate-200 bg-white text-slate-800 hover:bg-slate-50', ghost: 'text-slate-600 hover:bg-slate-100', white: 'bg-white text-indigo-700 hover:bg-indigo-50' }; return <button type={type} onClick={onClick} disabled={disabled} className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${styles[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>{children}</button> }
function Badge({ verdict }: { verdict: Verdict }) { return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${verdictStyles[verdict]}`}><span className={`size-1.5 rounded-full ${verdictDot[verdict]}`} />{verdictLabels[verdict]}</span> }

function Landing({ onStart, onDemo }: { onStart: () => void; onDemo: () => void }) { const [menu, setMenu] = useState(false); return <div className="min-h-screen bg-white text-slate-950">
  <header className="border-b border-slate-100"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8"><Logo /><nav className="hidden items-center gap-8 text-sm text-slate-500 md:flex"><a href="#features" className="hover:text-slate-950">Features</a><a href="#how-it-works" className="hover:text-slate-950">How it works</a><a href="#principles" className="hover:text-slate-950">Principles</a></nav><div className="hidden md:block"><Button onClick={onStart}>Start an Audit <ArrowRight size={16} /></Button></div><button aria-label="Open navigation" className="rounded-md p-2 md:hidden" onClick={() => setMenu(!menu)}><Menu size={20} /></button></div>{menu && <nav className="flex flex-col gap-4 border-t border-slate-100 px-5 py-5 text-sm md:hidden"><a href="#features" onClick={() => setMenu(false)}>Features</a><a href="#how-it-works" onClick={() => setMenu(false)}>How it works</a><Button onClick={onStart}>Start an Audit</Button></nav>}</header>
  <main>
    <section className="relative overflow-hidden bg-[#f7f8fc]"><div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 lg:grid-cols-[.9fr_1.1fr] lg:px-8 lg:py-28"><div><div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-700"><Sparkles size={13} /> Evidence-first AI auditing</div><h1 className="max-w-xl text-5xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-6xl">Don&apos;t just trust the answer. <span className="text-indigo-600">Audit it.</span></h1><p className="mt-6 max-w-lg text-lg leading-8 text-slate-600">Inspect AI-generated claims, trace the evidence, and uncover unsupported statements with an audit you can actually verify.</p><div className="mt-8 flex flex-wrap gap-3"><Button onClick={onStart}>Start an Audit <ArrowRight size={16} /></Button><Button variant="secondary" onClick={onDemo}>Explore Demo</Button></div><p className="mt-7 text-sm font-medium text-slate-500">Evidence first. Transparent verdicts. Honest uncertainty.</p></div><Preview /> </div></section>
    <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8"><div className="max-w-xl"><p className="text-sm font-semibold uppercase tracking-[.16em] text-indigo-600">The problem</p><h2 className="mt-3 text-3xl font-semibold tracking-tight">Confidence is not the same as correctness.</h2></div><div className="mt-10 grid gap-5 md:grid-cols-3">{[['01','AI can sound certain while being wrong.'],['02','Unsupported statements can appear alongside correct facts.'],['03','A verdict without inspectable evidence is difficult to trust.']].map(([n,t]) => <div key={n} className="rounded-2xl border border-slate-200 p-6"><span className="text-sm font-semibold text-indigo-600">{n}</span><p className="mt-12 text-lg font-medium leading-7">{t}</p></div>)}</div></section>
    <section id="features" className="border-y border-slate-100 bg-[#fafbfc]"><div className="mx-auto max-w-7xl px-5 py-20 lg:px-8"><p className="text-sm font-semibold uppercase tracking-[.16em] text-indigo-600">Designed for inspection</p><h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight">Every finding has a trail back to the source.</h2><div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[[Target,'Claim-level verification','Break answers into precise, reviewable units.'],[BookOpen,'Evidence-grounded auditing','See the exact passages behind each verdict.'],[Search,'Precise error localization','Find the phrase that needs another look.'],[Zap,'Reasoning consistency checks','Surface possible gaps without overclaiming.'],[Info,'Uncertainty handling','Distinguish missing evidence from contradiction.'],[ShieldAlert,'Confidence-aware reporting','Keep estimates visible, never disguised as proof.']].map(([Icon,title,copy]) => { const I = Icon as typeof Target; return <div key={title as string} className="rounded-2xl border border-slate-200 bg-white p-6"><I className="text-indigo-600" size={21} /><h3 className="mt-5 font-semibold">{title as string}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{copy as string}</p></div> })}</div></div></section>
    <section id="how-it-works" className="mx-auto max-w-7xl px-5 py-20 lg:px-8"><div className="grid gap-12 lg:grid-cols-[.7fr_1.3fr]"><div><p className="text-sm font-semibold uppercase tracking-[.16em] text-indigo-600">How it works</p><h2 className="mt-3 text-3xl font-semibold tracking-tight">A clear path from answer to evidence.</h2></div><div className="grid gap-7">{[['01','Submit','Add an AI-generated answer and the source material it should be checked against.'],['02','Inspect','Review each claim with a readable verdict and explanation.'],['03','Understand','Trace evidence, limitations, and uncertainty before relying on the answer.']].map(([n,t,c]) => <div className="flex gap-5 border-b border-slate-200 pb-7" key={n}><span className="text-sm font-semibold text-indigo-600">{n}</span><div><h3 className="font-semibold">{t}</h3><p className="mt-1 text-sm leading-6 text-slate-500">{c}</p></div></div>)}</div></div></section>
    <section id="principles" className="bg-slate-950 text-white"><div className="mx-auto flex max-w-7xl flex-col gap-10 px-5 py-20 lg:flex-row lg:items-end lg:justify-between lg:px-8"><div><p className="text-sm font-semibold uppercase tracking-[.16em] text-indigo-300">Our principles</p><h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight">Honest review is more useful than false certainty.</h2></div><div className="grid max-w-xl gap-3 text-sm text-slate-300 sm:grid-cols-2">{['Unsupported does not mean false.','Evidence should be traceable.','Confidence is not proof.','Ambiguity should be acknowledged.'].map(t => <div className="flex gap-2" key={t}><Check size={16} className="mt-0.5 shrink-0 text-indigo-300" />{t}</div>)}</div></div></section>
    <section className="mx-auto max-w-7xl px-5 py-20 text-center lg:px-8"><h2 className="text-3xl font-semibold tracking-tight">Make every claim worth examining.</h2><p className="mx-auto mt-3 max-w-lg text-slate-500">A focused workspace for reviewing what an AI answer says, what the evidence supports, and what still needs a human eye.</p><Button className="mt-7" onClick={onStart}>Start an Audit <ArrowRight size={16} /></Button></section>
  </main><footer className="border-t border-slate-100"><div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8"><Logo /><span>Findings depend on the available source material.</span></div></footer>
</div> }

function Preview() { return <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-200/60"><div className="rounded-xl border border-slate-100 bg-[#fafbfc] p-4"><div className="flex items-center justify-between border-b border-slate-200 pb-3"><div><p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Demo audit</p><p className="mt-1 text-sm font-semibold">Q3 performance summary</p></div><Badge verdict="contradicted" /></div><div className="grid gap-3 py-4 text-xs leading-6 sm:grid-cols-[1fr_180px]"><div className="rounded-lg bg-white p-4 text-slate-600 shadow-sm"><p>The report shows that revenue grew by <mark className="rounded bg-rose-100 px-1 text-rose-800">25% year over year.</mark> The company currently operates <mark className="rounded bg-emerald-100 px-1 text-emerald-800">20 offices.</mark></p><p className="mt-3 text-slate-400">Select a highlighted claim to inspect its evidence.</p></div><div className="rounded-lg border border-slate-200 bg-white p-3"><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Evidence</p><p className="mt-3 border-l-2 border-rose-300 pl-2 text-[11px] leading-5 text-slate-600">“Revenue increased by 12% compared with the same quarter last year.”</p><p className="mt-3 text-[10px] text-slate-400">Q3 performance report</p></div></div></div></div> }

function LiveResults({ audit, onNew, onBack, onDemo }: { audit: Audit; onNew: () => void; onBack: () => void; onDemo: () => void }) {
  const [selected, setSelected] = useState<Claim | undefined>(audit.claims[0]);
  const [filter, setFilter] = useState<'all' | Verdict>('all');
  const [query, setQuery] = useState('');
  const fallbackCounts = useMemo(() => getCounts(audit.claims), [audit.claims]);
  const counts = audit.summary ? {
    supported: audit.summary.supported,
    contradicted: audit.summary.contradicted,
    insufficient_evidence: audit.summary.unsupported,
    ambiguous: audit.summary.ambiguous,
  } : fallbackCounts;
  const totalClaims = audit.summary?.total_claims ?? audit.claims.length;
  const filtered = audit.claims.filter((claim) => {
    const matchesFilter = filter === 'all' || claim.verdict === filter;
    return matchesFilter && `${claim.text} ${claim.explanation}`.toLowerCase().includes(query.toLowerCase());
  });
  const parts = getHighlightParts(audit.original_answer, audit.claims);
  const hasContradictions = counts.contradicted > 0;

  return (
    <AppShell onBack={onNew} onDemo={onDemo}>
      <div className="mx-auto max-w-[1500px] px-5 py-7 lg:px-8">
        <div className="flex flex-col gap-5 border-b border-slate-200 pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm font-semibold text-indigo-600">Audit results</p>
              <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700">Live analysis</span>
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">{audit.title}</h1>
            <p className={`mt-2 flex items-center gap-2 text-sm ${hasContradictions ? 'text-rose-700' : 'text-emerald-700'}`}>
              {hasContradictions ? <CircleAlert size={16} /> : <CheckCircle2 size={16} />}
              {hasContradictions ? 'Contradictory claims found · review needed' : 'Analysis complete · no contradictions found'}
            </p>
          </div>
          <div className="flex gap-2"><Button variant="secondary" onClick={onBack}>Edit input</Button><Button onClick={onNew}>New audit <Plus size={16} /></Button></div>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-5">
          {([['all', 'Claims reviewed', totalClaims, 'text-slate-950'], ['supported', 'Supported', counts.supported, 'text-emerald-700'], ['contradicted', 'Contradicted', counts.contradicted, 'text-rose-700'], ['insufficient_evidence', 'Insufficient evidence', counts.insufficient_evidence, 'text-amber-700'], ['ambiguous', 'Ambiguous', counts.ambiguous, 'text-slate-600']] as const).map(([key, label, value, color]) => (
            <button key={key} onClick={() => setFilter(filter === key ? 'all' : key)} className={`rounded-xl border bg-white p-4 text-left transition hover:border-indigo-300 ${filter === key ? 'border-indigo-400 ring-2 ring-indigo-100' : 'border-slate-200'}`}><p className="text-xs font-medium text-slate-500">{label}</p><p className={`mt-2 text-2xl font-semibold ${color}`}>{value}</p></button>
          ))}
        </div>

        <div className="mt-7 grid gap-5 xl:grid-cols-[minmax(260px,.8fr)_minmax(360px,1fr)_minmax(300px,.9fr)]">
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between"><h2 className="font-semibold">Original answer</h2><span className="text-xs text-slate-400">{audit.original_answer.length} characters</span></div>
            <p className="mt-5 text-sm leading-8 text-slate-700">{parts.map((part, index) => part.claim ? <button key={index} onClick={() => setSelected(part.claim)} className={`mx-0.5 rounded px-1 text-left underline decoration-2 underline-offset-4 ${verdictStyles[part.claim.verdict]} decoration-current`}>{part.text}</button> : <span key={index}>{part.text}</span>)}</p>
            <div className="mt-7 border-t border-slate-100 pt-4 text-xs text-slate-400">Highlighted claims use the exact offsets returned by the analysis API.</div>
          </section>

          <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><h2 className="font-semibold">Claim findings <span className="ml-1 text-sm font-normal text-slate-400">({filtered.length})</span></h2><div className="relative"><Search className="absolute left-3 top-2.5 text-slate-400" size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search claims" className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-xs outline-none focus:border-indigo-500 sm:w-44" /></div></div>
            <div className="mt-4 flex flex-wrap gap-1.5 border-b border-slate-100 pb-4">{([['all', 'All'], ['supported', 'Supported'], ['contradicted', 'Contradicted'], ['insufficient_evidence', 'Insufficient'], ['ambiguous', 'Ambiguous']] as const).map(([key, label]) => <button key={key} onClick={() => setFilter(key)} className={`rounded-md px-2 py-1 text-[11px] font-medium ${filter === key ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>{label}</button>)}</div>
            <div className="flex max-h-[620px] flex-col gap-2 overflow-auto pt-2">
              {filtered.map((claim) => <button key={claim.id} onClick={() => setSelected(claim)} className={`rounded-lg border p-4 text-left transition ${selected?.id === claim.id ? 'border-indigo-300 bg-indigo-50/40' : 'border-transparent hover:border-slate-200 hover:bg-slate-50'}`}><div className="flex items-start justify-between gap-3"><span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Claim {audit.claims.indexOf(claim) + 1}</span><Badge verdict={claim.verdict} /></div><p className="mt-2 text-sm font-medium leading-6 text-slate-800">{claim.text}</p><p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{claim.explanation}</p><div className="mt-3 flex items-center justify-between text-[11px] text-slate-400"><span className="capitalize">{claim.confidenceLevel ? `${claim.confidenceLevel} confidence` : 'Review needed'}</span><span className="inline-flex items-center gap-1 font-semibold text-indigo-600">Inspect <ChevronRight size={13} /></span></div></button>)}
              {filtered.length === 0 && <div className="p-8 text-center text-sm text-slate-500">No claims match this filter.</div>}
            </div>
          </section>

          <LiveEvidenceInspector claim={selected} sources={audit.sources} />
        </div>
      </div>
    </AppShell>
  );
}

function LiveEvidenceInspector({ claim, sources }: { claim?: Claim; sources: Audit['sources'] }) {
  if (!claim) return <section className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500">No factual claims were extracted from this answer.</section>;

  return <section className="rounded-xl border border-slate-200 bg-white p-5">
    <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Evidence inspector</p><h2 className="mt-2 font-semibold">Claim detail</h2></div><Badge verdict={claim.verdict} /></div>
    <p className="mt-5 text-sm font-medium leading-6 text-slate-800">{claim.text}</p>
    <p className="mt-4 text-sm leading-6 text-slate-600">{claim.explanation}</p>
    <div className="mt-5 rounded-lg bg-slate-50 p-3"><div className="flex justify-between text-xs"><span className="font-medium text-slate-600">Estimated confidence</span><span className="font-semibold capitalize text-slate-800">{claim.confidenceLevel ?? 'Not available'}</span></div><p className="mt-2 text-[11px] text-slate-400">An estimate, not proof of correctness.</p></div>
    <div className="mt-6 flex flex-col gap-4"><h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Relevant passages</h3>{claim.evidence.length ? claim.evidence.map((evidence, index) => { const source = sources.find((item) => item.id === evidence.sourceId) ?? sources[0]; return <div key={index} className="rounded-lg border border-slate-200 p-3"><div className="flex items-center justify-between gap-2"><span className="text-xs font-semibold text-slate-700">{source?.title ?? 'Submitted source'}</span><span className={`text-[10px] font-semibold uppercase ${evidence.relation === 'contradicts' ? 'text-rose-600' : 'text-emerald-600'}`}>{evidence.relation}</span></div><blockquote className="mt-3 border-l-2 border-indigo-300 pl-3 text-xs leading-5 text-slate-600">“{evidence.quote}”</blockquote><p className="mt-3 flex items-center gap-1.5 text-[11px] leading-5 text-emerald-700"><CheckCircle2 size={13} /> Exact quote verified in submitted source</p></div> }) : <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50/50 p-4"><div className="flex gap-2 text-sm font-semibold text-amber-900"><Info size={16} /> No verified evidence quote</div><p className="mt-2 text-xs leading-5 text-amber-800">{claim.limitation}</p></div>}</div>
  </section>;
}

function InputWorkspace({ onBack, onDemo, onResults }: { onBack: () => void; onDemo: () => void; onResults: (audit: Audit) => void }) {
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState([{ title: '', text: '' }]);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [loadingStage, setLoadingStage] = useState<'idle' | 'extracting' | 'analyzing'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loading = loadingStage !== 'idle';
  const hasPastedSource = sources.some((source) => source.text.trim());

  const loadExample = (i: number) => {
    setAnswer(exampleAudits[i].answer);
    setSources([{ title: 'Illustrative source', text: exampleAudits[i].source }]);
    setPdfFile(null);
    setError('');
  };

  const selectPdf = (file: File | undefined) => {
    if (!file) return;
    if (hasPastedSource) {
      setError('Remove the pasted source text before selecting a PDF. Use one source type per audit.');
      return;
    }
    if (!file.name.toLowerCase().endsWith('.pdf') || (file.type && file.type !== 'application/pdf')) {
      setError('Select a PDF file. Other file types are not supported.');
      return;
    }
    if (file.size > MAX_PDF_SIZE) {
      setError('The selected PDF exceeds the 10 MB file-size limit.');
      return;
    }
    if (file.size === 0) {
      setError('The selected PDF is empty.');
      return;
    }
    setPdfFile(file);
    setError('');
  };

  const run = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) {
      setError('Add an AI-generated answer before running the audit.');
      return;
    }
    if (hasPastedSource && pdfFile) {
      setError('Choose either pasted source text or one PDF, not both.');
      return;
    }
    if (!hasPastedSource && !pdfFile) {
      setError('Add pasted source text or select one PDF before running the audit.');
      return;
    }
    setError('');
    setLoadingStage(pdfFile ? 'extracting' : 'analyzing');

    try {
      let submittedSources: Source[];
      let source: string;

      if (pdfFile) {
        const formData = new FormData();
        formData.append('file', pdfFile);
        const extractionResponse = await fetch('/api/extract-pdf', {
          method: 'POST',
          body: formData,
        });
        const extractionData: unknown = await extractionResponse.json().catch(() => null);
        if (!extractionResponse.ok) {
          const apiError = extractionData as { error?: { message?: string } } | null;
          throw new Error(apiError?.error?.message || `PDF extraction failed with status ${extractionResponse.status}.`);
        }
        if (!isExtractPdfResponse(extractionData)) throw new Error('The server returned an unexpected PDF extraction response.');
        source = extractionData.text;
        submittedSources = [{ id: 'source-1', title: pdfFile.name, text: extractionData.text }];
        setLoadingStage('analyzing');
      } else {
        submittedSources = sources
          .filter((item) => item.text.trim())
          .map((item, index) => ({ id: `source-${index + 1}`, title: item.title.trim() || `Source ${index + 1}`, text: item.text }));
        source = submittedSources.map((item) => item.text).join('\n\n');
      }

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer, source })
      });
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const apiError = data as { error?: { message?: string } } | null;
        throw new Error(apiError?.error?.message || `Audit request failed with status ${res.status}.`);
      }
      if (!isAnalyzeResponse(data)) throw new Error('The server returned an unexpected audit response.');
      onResults(createLiveAudit(data, answer, submittedSources));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The audit could not be completed. Please try again.');
    } finally {
      setLoadingStage('idle');
    }
  };

  return (
    <AppShell onBack={onBack} onDemo={onDemo}>
      <div className="mx-auto max-w-4xl px-5 py-10 lg:px-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-indigo-600">New Audit</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Check an AI-generated answer against its source material.</h1>
          </div>
          <span className="hidden rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 sm:inline-flex">Live analysis</span>
        </div>
        <form onSubmit={run} className="mt-10 flex flex-col gap-7">
          {error && <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">{error}</div>}
          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold">AI-generated answer</span>
            <textarea value={answer} onChange={e => setAnswer(e.target.value)} rows={7} placeholder="Paste the answer you want to inspect..." className="rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" />
          </label>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold">Source material</h2>
                <p className="mt-1 text-xs text-slate-500">Paste source text or upload one text-based PDF.</p>
              </div>
              <span className="text-xs text-slate-400">Text or PDF · 10 MB max</span>
            </div>
            {sources.map((source, i) => (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4" key={i}>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Source {i+1}</span>
                  {sources.length > 1 && <button type="button" onClick={() => setSources(sources.filter((_, j) => j !== i))} className="text-xs font-medium text-slate-500 hover:text-rose-600">Remove</button>}
                </div>
                <div className="flex flex-col gap-3">
                  <input value={source.title} onChange={e => setSources(sources.map((s, j) => j === i ? { ...s, title: e.target.value } : s))} placeholder="Source title" disabled={Boolean(pdfFile) || loading} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400" />
                  <textarea value={source.text} onChange={e => setSources(sources.map((s, j) => j === i ? { ...s, text: e.target.value } : s))} rows={4} placeholder="Paste source text..." disabled={Boolean(pdfFile) || loading} className="rounded-lg border border-slate-200 bg-white p-3 text-sm leading-6 outline-none focus:border-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400" />
                </div>
              </div>
            ))}
            <Button variant="secondary" onClick={() => setSources([...sources, { title: '', text: '' }])} disabled={Boolean(pdfFile) || loading}><Plus size={16} /> Add another source</Button>

            <div className="flex items-center gap-3 py-1"><span className="h-px flex-1 bg-slate-200" /><span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">or upload PDF</span><span className="h-px flex-1 bg-slate-200" /></div>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={(event) => {
                selectPdf(event.target.files?.[0]);
                event.target.value = '';
              }}
            />
            {pdfFile ? (
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-white text-indigo-600 shadow-sm"><FileText size={19} /></span>
                    <div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{pdfFile.name}</p><p className="mt-1 text-xs text-slate-500">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB · PDF selected</p></div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={loading}>Replace</Button>
                    <button type="button" onClick={() => { setPdfFile(null); setError(''); }} disabled={loading} className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-white hover:text-rose-600 disabled:opacity-50"><X size={15} /> Remove</button>
                  </div>
                </div>
                {loadingStage === 'extracting' && <p className="mt-3 flex items-center gap-2 border-t border-indigo-100 pt-3 text-xs font-medium text-indigo-700"><LoaderCircle className="animate-spin" size={14} /> Uploading and extracting PDF text…</p>}
              </div>
            ) : (
              <button
                type="button"
                disabled={hasPastedSource || loading}
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={(event) => { event.preventDefault(); if (!hasPastedSource && !loading) setDragActive(true); }}
                onDragOver={(event) => event.preventDefault()}
                onDragLeave={(event) => { event.preventDefault(); setDragActive(false); }}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragActive(false);
                  if (!hasPastedSource && !loading) selectPdf(event.dataTransfer.files?.[0]);
                }}
                className={`flex flex-col items-center rounded-xl border-2 border-dashed px-5 py-8 text-center transition ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 bg-white hover:border-indigo-400 hover:bg-indigo-50/30'} disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:opacity-60`}
              >
                <span className="grid size-10 place-items-center rounded-full bg-indigo-50 text-indigo-600"><Upload size={18} /></span>
                <span className="mt-3 text-sm font-semibold text-slate-800">Drop a PDF here or choose a file</span>
                <span className="mt-1 text-xs text-slate-500">Text-based PDF only · maximum 10 MB</span>
                {hasPastedSource && <span className="mt-3 text-xs font-medium text-amber-700">Clear pasted source text to enable PDF upload.</span>}
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-6">
            <Button type="submit" disabled={loading}>{loadingStage === 'extracting' ? 'Extracting PDF…' : loadingStage === 'analyzing' ? 'Analyzing…' : 'Run Audit'} {loading ? <LoaderCircle className="animate-spin" size={16} /> : <ArrowRight size={16} />}</Button>
            <Button variant="secondary" onClick={() => loadExample(0)} disabled={loading}>Load Example</Button>
            <button type="button" onClick={() => { setAnswer(''); setSources([{ title: '', text: '' }]); setPdfFile(null); setError(''); }} className="px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-900" disabled={loading}>Clear</button>
          </div>
          <p className="text-xs leading-5 text-slate-400">Custom audits use the live analysis API. Demo data appears only when you explicitly open Demo Audit.</p>
        </form>
      </div>
    </AppShell>
  );
}

function AppShell({ children, onBack, onDemo }: { children: React.ReactNode; onBack: () => void; onDemo?: () => void }) { return <div className="min-h-screen bg-[#f7f8fc] text-slate-950"><aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white px-4 py-5 lg:block"><Logo /><div className="mt-10 flex flex-col gap-1"><button onClick={onBack} className="flex items-center gap-3 rounded-lg bg-indigo-50 px-3 py-2.5 text-sm font-semibold text-indigo-700"><Plus size={16} /> New Audit</button><button onClick={onDemo} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-500 hover:bg-slate-50"><ClipboardCheck size={16} /> Demo Audit</button><button className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-500 hover:bg-slate-50"><FileText size={16} /> Demo History</button></div><div className="absolute bottom-5 left-4 right-4 border-t border-slate-100 pt-4"><button className="flex items-center gap-3 px-3 py-2 text-sm text-slate-500"><BookOpen size={16} /> Methodology</button></div></aside><div className="lg:pl-64"><header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 lg:px-8"><button onClick={onBack} className="lg:hidden"><Logo /></button><span className="hidden text-sm text-slate-400 lg:inline">Evidence workspace</span><button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Open menu"><Menu size={19} /></button></header>{children}</div></div> }

function Results({ audit, onNew, onBack }: { audit: Audit; onNew: () => void; onBack: () => void }) { const [selected, setSelected] = useState(audit.claims[2]); const [filter, setFilter] = useState<'all' | Verdict | 'reasoning' | 'safety'>('all'); const [query, setQuery] = useState(''); const counts = useMemo(() => getCounts(audit.claims), [audit.claims]); const filtered = audit.claims.filter(c => { const matchesFilter = filter === 'all' || c.verdict === filter || (filter === 'safety' && c.categories.includes('safety_concern')) || (filter === 'reasoning' && c.categories.includes('reasoning_inconsistency')); return matchesFilter && `${c.text} ${c.explanation}`.toLowerCase().includes(query.toLowerCase()) }); const parts = getHighlightParts(audit.original_answer, audit.claims); return <AppShell onBack={onNew}><div className="mx-auto max-w-[1500px] px-5 py-7 lg:px-8"><div className="flex flex-col gap-5 border-b border-slate-200 pb-7 sm:flex-row sm:items-end sm:justify-between"><div><div className="flex flex-wrap items-center gap-3"><p className="text-sm font-semibold text-indigo-600">Audit results</p><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">Demo data</span></div><h1 className="mt-2 text-2xl font-semibold tracking-tight">{audit.title}</h1><p className="mt-2 flex items-center gap-2 text-sm text-rose-700"><CircleAlert size={16} /> Contradictory claims found · review needed</p></div><div className="flex gap-2"><Button variant="secondary" onClick={onBack}>Edit input</Button><Button onClick={onNew}>New audit <Plus size={16} /></Button></div></div><div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-5">{([['all','Claims reviewed',audit.claims.length,'text-slate-950'],['supported','Supported',counts.supported,'text-emerald-700'],['contradicted','Contradicted',counts.contradicted,'text-rose-700'],['insufficient_evidence','Insufficient evidence',counts.insufficient_evidence,'text-amber-700'],['ambiguous','Ambiguous',counts.ambiguous,'text-slate-600']] as const).map(([key,label,value,color]) => <button key={key} onClick={() => setFilter(filter === key ? 'all' : key as typeof filter)} className={`rounded-xl border bg-white p-4 text-left transition hover:border-indigo-300 ${filter === key ? 'border-indigo-400 ring-2 ring-indigo-100' : 'border-slate-200'}`}><p className="text-xs font-medium text-slate-500">{label}</p><p className={`mt-2 text-2xl font-semibold ${color}`}>{value}</p></button>)}</div><div className="mt-7 grid gap-5 xl:grid-cols-[minmax(260px,.8fr)_minmax(360px,1fr)_minmax(300px,.9fr)]"><section className="rounded-xl border border-slate-200 bg-white p-5"><div className="flex items-center justify-between"><h2 className="font-semibold">Original answer</h2><span className="text-xs text-slate-400">{audit.original_answer.length} characters</span></div><p className="mt-5 text-sm leading-8 text-slate-700">{parts.map((part,i) => part.claim ? <button key={i} onClick={() => setSelected(part.claim!)} className={`mx-0.5 rounded px-1 text-left underline decoration-2 underline-offset-4 ${verdictStyles[part.claim.verdict]} decoration-current`}>{part.text}</button> : <span key={i}>{part.text}</span>)}</p><div className="mt-7 border-t border-slate-100 pt-4 text-xs text-slate-400">Highlighted claims are interactive. Select one to inspect the evidence trail.</div></section><section className="min-w-0 rounded-xl border border-slate-200 bg-white p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><h2 className="font-semibold">Claim findings <span className="ml-1 text-sm font-normal text-slate-400">({filtered.length})</span></h2><div className="relative"><Search className="absolute left-3 top-2.5 text-slate-400" size={15} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search claims" className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-xs outline-none focus:border-indigo-500 sm:w-44" /></div></div><div className="mt-4 flex flex-wrap gap-1.5 border-b border-slate-100 pb-4">{[['all','All'],['supported','Supported'],['contradicted','Contradicted'],['insufficient_evidence','Insufficient'],['ambiguous','Ambiguous'],['safety','Safety flags']].map(([key,label]) => <button key={key} onClick={() => setFilter(key as typeof filter)} className={`rounded-md px-2 py-1 text-[11px] font-medium ${filter === key ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>{label}</button>)}</div><div className="flex max-h-[620px] flex-col gap-2 overflow-auto pt-2">{filtered.map((claim,i) => <button key={claim.id} onClick={() => setSelected(claim)} className={`rounded-lg border p-4 text-left transition ${selected.id === claim.id ? 'border-indigo-300 bg-indigo-50/40' : 'border-transparent hover:border-slate-200 hover:bg-slate-50'}`}><div className="flex items-start justify-between gap-3"><span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Claim {audit.claims.indexOf(claim)+1}</span><Badge verdict={claim.verdict} /></div><p className="mt-2 text-sm font-medium leading-6 text-slate-800">{claim.text}</p><p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{claim.explanation}</p><div className="mt-3 flex items-center justify-between text-[11px] text-slate-400"><span>{claim.confidence ? `${Math.round(claim.confidence*100)}% confidence` : 'Review needed'}</span><span className="inline-flex items-center gap-1 font-semibold text-indigo-600">Inspect <ChevronRight size={13} /></span></div></button>)}{filtered.length === 0 && <div className="p-8 text-center text-sm text-slate-500">No claims match this filter.</div>}</div></section><EvidenceInspector claim={selected} sources={audit.sources} /></div></div></AppShell> }

function EvidenceInspector({ claim, sources }: { claim: Claim; sources: Audit['sources'] }) { return <section className="rounded-xl border border-slate-200 bg-white p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Evidence inspector</p><h2 className="mt-2 font-semibold">Claim detail</h2></div><Badge verdict={claim.verdict} /></div><p className="mt-5 text-sm font-medium leading-6 text-slate-800">{claim.text}</p><p className="mt-4 text-sm leading-6 text-slate-600">{claim.explanation}</p>{claim.confidence && <div className="mt-5 rounded-lg bg-slate-50 p-3"><div className="flex justify-between text-xs"><span className="font-medium text-slate-600">Estimated confidence</span><span className="font-semibold text-slate-800">{Math.round(claim.confidence*100)}%</span></div><div className="mt-2 h-1.5 rounded-full bg-slate-200"><div className="h-1.5 rounded-full bg-indigo-500" style={{ width: `${claim.confidence*100}%` }} /></div><p className="mt-2 text-[11px] text-slate-400">An estimate, not proof of correctness.</p></div>}<div className="mt-6 flex flex-col gap-4"><h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Relevant passages</h3>{claim.evidence.length ? claim.evidence.map((e,i) => { const source = sources.find(s => s.id === e.sourceId) || sources[0]; return <div key={i} className="rounded-lg border border-slate-200 p-3"><div className="flex items-center justify-between gap-2"><span className="text-xs font-semibold text-slate-700">{source.title}</span><span className={`text-[10px] font-semibold uppercase ${e.relation === 'contradicts' ? 'text-rose-600' : 'text-emerald-600'}`}>{e.relation}</span></div><blockquote className="mt-3 border-l-2 border-indigo-300 pl-3 text-xs leading-5 text-slate-600">“{e.quote}”</blockquote><p className="mt-3 text-[11px] leading-5 text-slate-400">{e.why}</p><button className="mt-3 text-xs font-semibold text-indigo-600">View in source <ArrowRight className="inline" size={12} /></button></div> }) : <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50/50 p-4"><div className="flex gap-2 text-sm font-semibold text-amber-900"><Info size={16} /> Evidence is insufficient</div><p className="mt-2 text-xs leading-5 text-amber-800">{claim.limitation}</p></div>}</div>{claim.categories.includes('safety_concern') && <div className="mt-5 flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900"><ShieldAlert size={16} className="shrink-0" /><span><strong>Review needed:</strong> This recommendation may require separate operational review. Safety concerns are distinct from factual verdicts.</span></div>}</section> }

export default function Page() {
  const [view, setView] = useState<'landing' | 'input' | 'results'>('landing');
  const [audit, setAudit] = useState<Audit>(demoAudit);
  const showDemo = () => { setAudit(demoAudit); setView('results'); };

  if (view === 'input') return <InputWorkspace onBack={() => setView('landing')} onDemo={showDemo} onResults={(next) => { setAudit(next); setView('results'); }} />;
  if (view === 'results') return audit.mode === 'live'
    ? <LiveResults audit={audit} onNew={() => setView('input')} onBack={() => setView('input')} onDemo={showDemo} />
    : <Results audit={audit} onNew={() => setView('input')} onBack={() => setView('input')} />;
  return <Landing onStart={() => setView('input')} onDemo={showDemo} />;
}
