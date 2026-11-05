import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Check, Info } from 'lucide-react'

const REGISTER_IMAGE_URL =
  'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=1400&q=80'

const platforms = [
  {
    name: 'Facebook',
    color: '#1877F2',
    iconPath:
      'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
  },
]

const inputClass =
  'mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100'

export function RegisterClient() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    firstName: 'GoForeign',
    lastName: 'Admin',
    email: 'admin@goforeign.com',
    company: 'GoForeign',
    agree: true,
    platform: 'Facebook',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setForm((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value,
    }))
    setSubmitted(false)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (form.platform === 'Facebook') {
      navigate('/visa/dashboard', {
        state: { name: `${form.firstName} ${form.lastName}`.trim() || 'Admin' },
      })
      return
    }
    setSubmitted(true)
  }

  return (
    <main className="grid min-h-screen grid-cols-1 bg-white md:grid-cols-12">
      <section className="relative hidden overflow-hidden bg-slate-900 md:col-span-7 md:flex md:items-center md:justify-center">
        <img
          src={REGISTER_IMAGE_URL}
          alt="Social and messaging app icons on a phone"
          loading="eager"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-900/70 to-blue-900/80"
        />
        <div className="relative z-10 max-w-lg px-12 text-white">
          <h1 className="text-4xl font-bold leading-tight">
            One inbox for every conversation
          </h1>
          <p className="mt-4 text-lg text-white/80">
            Connect the account your customers already message you on — we take it from there.
          </p>
          <ul className="mt-10 space-y-4">
            {platforms.map(({ name, color, Icon, iconPath }) => (
              <li key={name} className="flex items-center gap-3 text-white/90">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10"
                  style={{ color }}
                >
                  {Icon ? (
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d={iconPath} />
                    </svg>
                  )}
                </span>
                <span className="font-medium">{name}</span>
                <Check className="ml-auto h-4 w-4 text-white/40" aria-hidden="true" />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="relative h-44 w-full overflow-hidden md:hidden">
        <img
          src={REGISTER_IMAGE_URL}
          alt="Social and messaging app icons on a phone"
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover object-center"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/40 to-transparent"
        />
        <p className="absolute bottom-4 left-6 right-6 text-lg font-semibold text-white">
          One inbox for every conversation
        </p>
      </div>

      <section className="flex items-center justify-center px-6 py-12 md:col-span-5 md:px-10">
        <div className="w-full max-w-md">
          <button
            type="button"
            onClick={() => navigate('/test-demo')}
            className="mb-6 text-sm font-medium text-gray-600 transition hover:text-gray-900 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            ← All services
          </button>
          <h2 className="text-3xl font-bold text-gray-900">Connect Account</h2>
          <p className="mt-2 text-gray-600">
            Review your details and connect to the dashboard.
          </p>

          <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
            <span>
              <strong>Demo setup:</strong> These details are pre-configured details to show you how the
              connection process works.
            </span>
          </div>

          <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" aria-hidden="true" />
            <span>
              <strong>Facebook setup is ready.</strong> Account connection will be enabled when
              the Facebook backend is connected.
            </span>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={form.firstName}
                  onChange={handleChange}
                  autoComplete="given-name"
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={form.lastName}
                  onChange={handleChange}
                  autoComplete="family-name"
                  required
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="company" className="text-sm font-medium text-gray-700">
                Company Name
              </label>
              <input
                id="company"
                name="company"
                type="text"
                value={form.company}
                onChange={handleChange}
                autoComplete="organization"
                required
                className={inputClass}
              />
            </div>

            <label htmlFor="agree" className="flex items-start gap-2 text-sm text-gray-600">
              <input
                id="agree"
                name="agree"
                type="checkbox"
                checked={form.agree}
                onChange={handleChange}
                required
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 accent-blue-600"
              />
              <span>I agree to the terms and conditions.</span>
            </label>

            {submitted && (
              <p role="status" aria-live="polite" className="text-sm text-blue-800">
                Your details are ready. Facebook backend connection will be added next.
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Connect {form.platform} Account
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}
