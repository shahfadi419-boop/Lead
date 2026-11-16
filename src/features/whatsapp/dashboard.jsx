import { useCallback, useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { useLocation } from 'react-router'
import {
  getWhatsAppEngagement,
  getWhatsAppLeads,
  getWhatsAppPageInfo,
  getWhatsAppStats,
} from './api'

const leadColumns = [
  { label: 'Name', key: 'name' },
  { label: 'Phone', key: 'phone' },
  { label: 'Email', key: 'email' },
  { label: 'Country', key: 'country' },
  { label: 'Visa Interest', key: 'visa_interest' },
  { label: 'Preferred Call Time', key: 'preferred_calling_time' },
  { label: 'Status', key: 'lead_status' },
]

function formatToday(date) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

function metricValue(value) {
  return typeof value === 'number' && Number.isFinite(value)
    ? value.toLocaleString()
    : '—'
}

export function WhatsAppDashboard() {
  const location = useLocation()
  const [dashboard, setDashboard] = useState({
    stats: null,
    leads: null,
    engagement: null,
    pageInfo: null,
    errors: {},
  })
  const [loading, setLoading] = useState(true)
  const name = location.state?.name || 'WhatsApp Admin'

  const requestDashboard = useCallback(async () => {
    const requests = await Promise.allSettled([
      getWhatsAppStats(),
      getWhatsAppLeads(),
      getWhatsAppEngagement(),
      getWhatsAppPageInfo(),
    ])
    const keys = ['stats', 'leads', 'engagement', 'pageInfo']
    const next = { stats: null, leads: null, engagement: null, pageInfo: null, errors: {} }

    requests.forEach((result, index) => {
      const key = keys[index]
      if (result.status === 'fulfilled') {
        next[key] = result.value
      } else {
        next.errors[key] = result.reason
        console.error(`[WhatsApp dashboard] Could not load ${key}`, result.reason)
      }
    })

    return next
  }, [])

  useEffect(() => {
    let active = true
    requestDashboard().then((next) => {
      if (!active) return
      setDashboard(next)
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [requestDashboard])

  const refreshDashboard = () => {
    setLoading(true)
    requestDashboard().then((next) => {
      setDashboard(next)
      setLoading(false)
    })
  }

  const stats = dashboard.stats || {}
  const whatsappStats = stats.by_platform?.find(
    (platform) => platform.platform?.toLowerCase() === 'whatsapp',
  )
  const leads = Array.isArray(dashboard.leads)
    ? dashboard.leads.filter((lead) => lead.platform?.toLowerCase() === 'whatsapp')
    : []
  const whatsappInfo = dashboard.pageInfo?.whatsapp
  const whatsappNumber = whatsappInfo?.number?.replace(/\D/g, '')
  const whatsappLiveUrl = whatsappInfo?.connected && whatsappNumber
    ? `https://wa.me/${whatsappNumber}`
    : null
  const engagement = dashboard.engagement || {}
  const buckets = Array.isArray(engagement.buckets) ? engagement.buckets : []
  const errorMessage = Object.values(dashboard.errors).find(Boolean)

  const metrics = [
    { label: 'WhatsApp Leads', value: whatsappStats?.leads },
    { label: 'Qualified Leads', value: whatsappStats?.qualified },
    { label: 'All-channel Messages', value: stats.total_messages },
    { label: 'WhatsApp Number', value: whatsappInfo?.number },
  ]

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-5xl space-y-5">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm text-slate-500">{formatToday(new Date())}</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              Good afternoon, {name}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              WhatsApp Business · Lead Intelligence Dashboard
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={refreshDashboard}
              disabled={loading}
              className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} aria-hidden="true" />
              Refresh
            </button>
            {whatsappLiveUrl && (
              <a
                href={whatsappLiveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-green-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
              >
                <WhatsAppIcon />
                WhatsApp Live Experience
              </a>
            )}
          </div>
        </header>

        <section
          aria-label="WhatsApp connection status"
          className="flex flex-wrap items-center gap-3 rounded-md border border-slate-200 bg-white px-4 py-3"
        >
          <WhatsAppIcon />
          <span className="text-sm font-medium text-slate-700">WhatsApp Business</span>
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            dashboard.errors.pageInfo
              ? 'bg-red-50 text-red-700'
              : whatsappInfo?.connected
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-slate-100 text-slate-600'
          }`}>
            {dashboard.errors.pageInfo
              ? 'Status unavailable'
              : loading && !dashboard.pageInfo
                ? 'Checking connection…'
                : whatsappInfo?.connected
                  ? 'Connected'
                  : 'Not connected'}
          </span>
          {whatsappInfo?.quality_rating && (
            <span className="text-sm text-slate-500">
              Quality: {whatsappInfo.quality_rating}
            </span>
          )}
          {dashboard.errors.pageInfo && (
            <span className="text-sm text-red-600">Could not reach backend</span>
          )}
        </section>

        {errorMessage && (
          <p role="alert" className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Some WhatsApp data could not be loaded. Use Refresh to try again.
          </p>
        )}

        <section
          aria-label="WhatsApp lead metrics"
          className="grid grid-cols-2 overflow-hidden rounded-md border border-slate-200 bg-white md:grid-cols-4"
        >
          {metrics.map(({ label, value }, index) => (
            <div
              key={label}
              className={`min-h-24 px-5 py-5 sm:px-6 ${
                index > 0 ? 'border-l border-slate-200' : ''
              } ${index === 2 ? 'max-md:border-l-0' : ''} ${
                index > 1 ? 'max-md:border-t border-slate-200' : ''
              }`}
            >
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-2 text-2xl font-semibold leading-none text-slate-900">
                {loading && !dashboard.stats
                  ? 'Loading…'
                  : typeof value === 'number'
                    ? metricValue(value)
                    : value || '—'}
              </p>
            </div>
          ))}
        </section>

        <section className="overflow-hidden rounded-md border border-slate-200 bg-white">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-slate-200 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">WhatsApp Leads</h2>
            <span className="text-xs text-slate-500">
              {dashboard.errors.leads ? 'Error loading leads' : `${leads.length} leads`}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200">
                  {leadColumns.map(({ label }) => (
                    <th
                      key={label}
                      scope="col"
                      className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 first:pl-5"
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.length ? leads.map((lead, index) => (
                  <tr
                    key={lead.thread_id || lead.user_id || `whatsapp-${index}`}
                    className="border-b border-slate-100 last:border-0"
                  >
                    {leadColumns.map(({ key, label }) => (
                      <td
                        key={label}
                        className="whitespace-nowrap px-4 py-3 text-sm text-slate-600 first:pl-5"
                      >
                        {lead[key] || '—'}
                      </td>
                    ))}
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={leadColumns.length} className="px-5 py-7 text-center text-sm text-slate-500">
                      {loading
                        ? 'Loading WhatsApp leads…'
                        : dashboard.errors.leads
                          ? 'Could not load WhatsApp leads. Use Refresh to try again.'
                          : 'No WhatsApp leads yet.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="overflow-hidden rounded-md border border-slate-200 bg-white">
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">Engagement Overview</h2>
            <span className="text-xs text-slate-500">
              All channels · The backend does not currently split engagement by platform
            </span>
          </div>
          <div className="px-5 py-6">
            <div className="min-h-12 space-y-3">
              {dashboard.errors.engagement ? (
                <p className="text-sm text-red-600">Could not load engagement data.</p>
              ) : buckets.length ? (
                buckets.map((bucket) => (
                  <div key={bucket.label} className="flex items-center gap-3 text-sm">
                    <span className="w-36 shrink-0 text-slate-600">{bucket.label}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-green-500"
                        style={{
                          width: `${Math.min(Math.max(Number(bucket.percentage) || 0, 0), 100)}%`,
                        }}
                      />
                    </div>
                    <span className="w-12 text-right text-slate-500">{bucket.users}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  {loading ? 'Loading engagement data…' : 'No engagement data yet.'}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-5">
              <div>
                <p className="text-sm text-slate-500">All-channel Users</p>
                <p className="mt-1 text-xl font-bold text-slate-900">
                  {metricValue(engagement.total_users)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">WhatsApp Qualified Leads</p>
                <p className="mt-1 text-xl font-bold text-emerald-600">
                  {metricValue(whatsappStats?.qualified)}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

function WhatsAppIcon() {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-700" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M12 2a9.9 9.9 0 0 0-8.55 14.9L2 22l5.25-1.37A9.9 9.9 0 1 0 12 2Zm0 18.16c-1.46 0-2.9-.39-4.16-1.13l-.3-.18-3.11.82.82-3.02-.19-.31a8.22 8.22 0 1 1 6.94 3.82Zm4.52-6.15c-.24-.12-1.47-.73-1.7-.81-.23-.09-.39-.13-.56.12-.17.25-.65.81-.79.98-.14.16-.28.18-.53.06-.25-.12-1.06-.39-2.01-1.24-.74-.65-1.24-1.46-1.39-1.71-.14-.25-.01-.38.11-.5l.38-.44c.12-.14.16-.25.25-.41.08-.17.04-.32-.02-.44l-.76-1.84c-.2-.48-.4-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.78 2.71 4.31 3.8 2.53 1.09 2.53.73 2.99.69.45-.05 1.47-.6 1.67-1.18.21-.59.21-1.09.15-1.19-.06-.1-.22-.16-.47-.28Z" />
      </svg>
    </span>
  )
}
