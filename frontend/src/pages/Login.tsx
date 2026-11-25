import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import AuthLayout from '../layouts/AuthLayout'
import { Field } from '../components/Field'
import { useAuth } from '../store/AuthContext'
import { errorMessage } from '../utils/api'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (busy) return
    const next: Record<string, string> = {}
    if (!email.trim()) next.email = 'Enter your email.'
    if (!password) next.password = 'Enter your password.'
    setErrors(next)
    setFormError('')
    if (Object.keys(next).length) return

    setBusy(true)
    try {
      await login(email.trim(), password)
      navigate(from, { replace: true })
    } catch (err) {
      setFormError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to open your money map." footer={<>New here? <Link to="/signup" className="underline decoration-[3px] decoration-titlebar underline-offset-4 hover:bg-butter hover:text-ink">Create an account</Link></>}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Email" error={errors.email}>
          <input className="field" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </Field>
        <Field label="Password" error={errors.password}>
          <div className="relative">
            <input className="field !pr-11" type={show ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="button" aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow((s) => !s)} className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-muted hover:text-fg">
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </Field>
        {formError && (
          <p role="alert" className="rounded-xl border-[3px] border-line bg-coral px-3 py-2 font-bold text-ink">{formError}</p>
        )}
        <button type="submit" disabled={busy} className="btn w-full bg-mint !py-2.5 text-base">
          <LogIn size={18} /> {busy ? 'Logging in…' : 'Log in'}
        </button>
      </form>
    </AuthLayout>
  )
}
