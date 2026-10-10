import Link from 'next/link'
import { ClipboardCheck } from 'lucide-react'
import { AuthForm } from '@/components/auth-form'

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next = '/' } = await searchParams
  return (
    <main className="grid min-h-screen place-items-center bg-[#E0E5EC] px-5 py-12 text-[#3D4852]">
      <section className="w-full max-w-md rounded-[28px] bg-[#E0E5EC] p-8 neu-extruded sm:p-10">
        <Link href="/" className="inline-flex items-center gap-3 font-bold"><span className="grid size-10 place-items-center rounded-[14px] neu-extruded-sm text-[#6C63FF]"><ClipboardCheck size={19} /></span>Second Opinion</Link>
        <h1 className="mt-8 text-3xl font-extrabold">Create your account</h1>
        <p className="mt-2 text-sm text-[#6B7280]">Auditing stays available without an account. Sign up to save results.</p>
        <AuthForm mode="signup" next={next} />
      </section>
    </main>
  )
}
