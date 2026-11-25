import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, UserPlus } from 'lucide-react'
import AuthLayout from '../layouts/AuthLayout'
import { Field } from '../components/Field'
import { useAuth } from '../store/AuthContext'
import { errorMessage } from '../utils/api'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (busy) return
    const next: Record<string, string> = {}
    if (!name.trim()) next.name = 'Tell us your name.'
    if (!EMAIL_RE.test(email.trim())) next.email = 'Enter a valid email address.'
    if (password.length < 8) next.password = 'Use at least 8 characters.'
    if (confirm !== password) next.confirm = 'Passwords don’t match.'
    setErrors(next)
    setFormError('')
    if (Object.keys(next).length) return

    setBusy(true)
    try {
      await signup(name.trim(), email.trim(), password)
      navigate('/', { replace: true })
    } catch (err) {
      setFormError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout title="Create your account" subtitle="It takes a minute. Start with a clean, empty money map." footer={<>Already have an account? <Link to="/login" className="underline decoration-[3px] decoration-titlebar underline-offset-4 hover:bg-butter hover:text-ink">Log in</Link></>}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Name" error={errors.name}>
          <input className="field" autoComplete="name" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} placeholder="What should we call you?" />
        </Field>
        <Field label="Email" error={errors.email}>
          <input className="field" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Password" error={errors.password}>
            <div className="relative">
              <input className="field !pr-11" type={show ? 'text' : 'password'} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="button" aria-label={show ? 'Hide passwords' : 'Show passwords'} onClick={() => setShow((s) => !s)} className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-muted hover:text-fg">
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </Field>
          <Field label="Confirm password" error={errors.confirm}>
            <input className="field" type={show ? 'text' : 'password'} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </Field>
        </div>
        {formError && (
          <p role="alert" className="rounded-xl border-[3px] border-line bg-coral px-3 py-2 font-bold text-ink">{formError}</p>
        )}
        <button type="submit" disabled={busy} className="btn w-full bg-mint !py-2.5 text-base">
          <UserPlus size={18} /> {busy ? 'Creating account…' : 'Sign up'}
        </button>
      </form>
    </AuthLayout>
  )
}
