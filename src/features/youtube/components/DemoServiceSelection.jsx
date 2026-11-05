import { ArrowLeft, ArrowRight, Camera, LayoutGrid, MessageCircle, Music2 } from 'lucide-react'
import { Link } from 'react-router'

const services = [
  {
    name: 'YouTube',
    description: 'Connect YouTube for AI Assistance',
    href: '/flow?step=1',
    available: true,
    icon: (
      <svg width="26" height="20" viewBox="0 0 24 18" aria-hidden="true">
        <rect x="1" y="1" width="22" height="16" rx="5" fill="currentColor" />
        <path d="M10 5v8l6-4-6-4Z" fill="white" />
      </svg>
    ),
    iconClass: 'bg-red-50 text-red-600',
  },
  {
    name: 'Facebook',
    description: 'Manage conversations from your Facebook audience.',
    href: '/facebook',
    available: true,
    icon: <span className="text-2xl font-bold leading-none" aria-hidden="true">f</span>,
    iconClass: 'bg-blue-50 text-blue-600',
  },
  {
    name: 'Instagram',
    description: 'Respond to Instagram messages and comments.',
    icon: <Camera size={24} aria-hidden="true" />,
    iconClass: 'bg-pink-50 text-pink-600',
  },
  {
    name: 'TikTok',
    description: 'Discover AI-powered engagement for TikTok.',
    icon: <Music2 size={24} aria-hidden="true" />,
    iconClass: 'bg-gray-100 text-gray-900',
  },
  {
    name: 'WhatsApp',
    description: 'See how LeadHive can support WhatsApp conversations.',
    icon: <MessageCircle size={24} aria-hidden="true" />,
    iconClass: 'bg-green-50 text-green-600',
  },
]

function ServiceCard({ service }) {
  const content = (
    <>
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${service.iconClass}`}>
        {service.icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-gray-900">{service.name}</span>
          {!service.available && (
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-500">
              Coming soon
            </span>
          )}
        </span>
        <span className="mt-1 block text-sm leading-5 text-gray-600">{service.description}</span>
      </span>
      {service.available && <ArrowRight size={18} className="shrink-0 text-cyan-700" aria-hidden="true" />}
    </>
  )

  const className = `flex h-full min-h-32 w-full items-center gap-4 rounded-2xl border bg-white p-4 text-left shadow-sm transition sm:p-5 ${
    service.available
      ? 'border-gray-200 hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2'
      : 'cursor-not-allowed border-gray-200'
  }`

  return service.available ? (
    <Link to={service.href} className={className}>
      {content}
    </Link>
  ) : (
    <button type="button" disabled aria-disabled="true" className={className}>
      {content}
    </button>
  )
}

export function DemoServiceSelection() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="lh-app-header">
        <div className="lh-app-header-inner">
          <Link
            to="/"
            aria-label="Go to LeadHive home"
            className="lh-app-header-logo shrink-0 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2"
          >
            <img src="/leadhive-logo.png" alt="LeadHive AI" />
          </Link>
          <span className="hidden h-6 w-px bg-gray-300 sm:block" aria-hidden="true" />
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold text-slate-800 sm:gap-2 sm:text-sm">
            <LayoutGrid size={17} className="text-cyan-600" aria-hidden="true" />
            <span>Demo Services</span>
          </span>
          <span className="flex-1" />
          <Link
            to="/"
            className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2"
          >
            <ArrowLeft size={15} aria-hidden="true" />
            Go to Home
          </Link>
        </div>
      </header>

      <main className="demo-services-main mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <section aria-labelledby="demo-services-title">
          <div className="text-center">
            <h1 id="demo-services-title" className="text-2xl font-bold leading-tight tracking-tight text-slate-900 sm:text-3xl">
              Choose a service to explore
            </h1>
            <p className="mx-auto mt-2 max-w-full text-sm leading-6 text-gray-600">
              See how LeadHive helps manage customer conversations across your channels. Choose YouTube to start the available walkthrough.
            </p>
          </div>

          <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-6">
            {services.map((service, index) => {
              const columnStart = [
                'md:col-start-1',
                'md:col-start-3',
                'md:col-start-5',
                'md:col-start-2',
                'md:col-start-4',
              ][index]
              return (
                <div
                  key={service.name}
                  className={`md:col-span-2 ${columnStart}`}
                >
                  <ServiceCard service={service} />
                </div>
              )
            })}
          </div>

          <p className="mt-5 text-center text-xs text-gray-500">
            More channel demos are on the way.
          </p>
        </section>
      </main>
    </div>
  )
}
