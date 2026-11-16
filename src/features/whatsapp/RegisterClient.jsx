import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Check, Info } from 'lucide-react'

const REGISTER_IMAGE_URL =
  'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=1400&q=80'

const inputClass =
  'mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100'

export function WhatsAppRegisterClient() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    firstName: 'WhatsApp AI Agent',
    lastName: 'Admin',
    email: 'admin@leadhive.ai',
    company: 'M3 Hive',
    agree: true,
  })

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setForm((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    navigate('/whatsapp/dashboard', {
      state: { name: `${form.firstName} ${form.lastName}`.trim() || 'Admin' },
    })
  }

  return (
    <main className="grid min-h-screen grid-cols-1 bg-white md:grid-cols-12">
      <section className="relative hidden overflow-hidden bg-slate-900 md:col-span-7 md:flex md:items-center md:justify-center">
        <img
          src={REGISTER_IMAGE_URL}
          alt="Messaging and social apps on a phone"
          loading="eager"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-900/70 to-green-950/80"
        />
        <div className="relative z-10 max-w-lg px-12 text-white">
          <h1 className="text-4xl font-bold leading-tight">
            WhatsApp conversations, ready for your team
          </h1>
          <p className="mt-4 text-lg text-white/80">
            Review the demo setup and explore your WhatsApp lead dashboard.
          </p>
          <div className="mt-10 flex items-center gap-3 text-white/90">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-green-300">
              <WhatsAppIcon />
            </span>
            <span className="font-medium">WhatsApp Business</span>
            <Check className="ml-auto h-4 w-4 text-white/60" aria-hidden="true" />
          </div>
        </div>
      </section>

      <div className="relative h-44 w-full overflow-hidden md:hidden">
        <img
          src={REGISTER_IMAGE_URL}
          alt="Messaging and social apps on a phone"
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover object-center"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/40 to-transparent"
        />
        <p className="absolute bottom-4 left-6 right-6 text-lg font-semibold text-white">
          WhatsApp conversations, ready for your team
        </p>
      </div>

      <section className="flex items-center justify-center px-6 py-12 md:col-span-5 md:px-10">
        <div className="w-full max-w-md">
          <button
            type="button"
            onClick={() => navigate('/test-demo')}
            className="mb-6 text-sm font-medium text-gray-600 transition hover:text-gray-900 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
          >
            ← All services
          </button>
          <h2 className="text-3xl font-bold text-gray-900">Connect WhatsApp Account</h2>
          <p className="mt-2 text-gray-600">
            Review your demo details and open the WhatsApp dashboard.
          </p>

          <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
            <span>
              <strong>Demo setup:</strong> These details are pre-configured to show how the
              WhatsApp workflow works.
            </span>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="whatsapp-firstName" className="text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  id="whatsapp-firstName"
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
                <label htmlFor="whatsapp-lastName" className="text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  id="whatsapp-lastName"
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
              <label htmlFor="whatsapp-email" className="text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="whatsapp-email"
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
              <label htmlFor="whatsapp-company" className="text-sm font-medium text-gray-700">
                Company Name
              </label>
              <input
                id="whatsapp-company"
                name="company"
                type="text"
                value={form.company}
                onChange={handleChange}
                autoComplete="organization"
                required
                className={inputClass}
              />
            </div>

            <label htmlFor="whatsapp-agree" className="flex items-start gap-2 text-sm text-gray-600">
              <input
                id="whatsapp-agree"
                name="agree"
                type="checkbox"
                checked={form.agree}
                onChange={handleChange}
                required
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 accent-green-600"
              />
              <span>I agree to the terms and conditions.</span>
            </label>

            <button
              type="submit"
              className="w-full rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
            >
              Open WhatsApp Dashboard
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6" aria-hidden="true">
      <path d="M12 2a9.9 9.9 0 0 0-8.55 14.9L2 22l5.25-1.37A9.9 9.9 0 1 0 12 2Zm0 18.16c-1.46 0-2.9-.39-4.16-1.13l-.3-.18-3.11.82.82-3.02-.19-.31a8.22 8.22 0 1 1 6.94 3.82Zm4.52-6.15c-.24-.12-1.47-.73-1.7-.81-.23-.09-.39-.13-.56.12-.17.25-.65.81-.79.98-.14.16-.28.18-.53.06-.25-.12-1.06-.39-2.01-1.24-.74-.65-1.24-1.46-1.39-1.71-.14-.25-.01-.38.11-.5l.38-.44c.12-.14.16-.25.25-.41.08-.17.04-.32-.02-.44l-.76-1.84c-.2-.48-.4-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.78 2.71 4.31 3.8 2.53 1.09 2.53.73 2.99.69.45-.05 1.47-.6 1.67-1.18.21-.59.21-1.09.15-1.19-.06-.1-.22-.16-.47-.28Z" />
    </svg>
  )
}
