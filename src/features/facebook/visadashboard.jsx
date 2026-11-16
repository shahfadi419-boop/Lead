import { useCallback, useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { useLocation } from 'react-router'
import {
  getFacebookEngagement,
  getFacebookLeads,
  getFacebookPageInfo,
  getFacebookStats,
} from './api'
import {
  getRealEstateEngagement,
  getRealEstateLeads,
  getRealEstatePageInfo,
  getRealEstateStats,
} from '../../real-estate/api'

const metricDefinitions = [
  { label: 'Total Leads', key: 'total_leads' },
  { label: 'Engaged Users', key: 'engaged_users' },
  { label: 'Total Messages', key: 'total_messages' },
  { label: 'Qualified Leads', key: 'qualified_leads' },
]

const businessViews = {
  visa: {
    label: 'Visa',
    columns: [
      { label: 'Name', key: 'name' },
      { label: 'Phone', key: 'phone' },
      { label: 'Email', key: 'email' },
      { label: 'Country', key: 'country' },
      { label: 'Visa Interest', key: 'visa_interest' },
      { label: 'Preferred Call Time', key: 'preferred_calling_time' },
      { label: 'Platform', key: 'platform' },
      { label: 'Status', key: 'lead_status' },
    ],
  },
  realEstate: {
    label: 'Real Estate',
    columns: [
      { label: 'Name', key: 'name' },
      { label: 'Phone', key: 'phone' },
      { label: 'Email', key: 'email' },
      { label: 'Property Type', key: 'property_type' },
      { label: 'City / Area', key: 'city_or_area' },
      { label: 'Budget Range', key: 'budget_range' },
      { label: 'Financing', key: 'financing_method' },
      { label: 'Purchase Timeline', key: 'purchase_timeline' },
      { label: 'Preferred Call Time', key: 'preferred_call_time' },
      { label: 'Platform', key: 'platform' },
      { label: 'Stage', key: 'stage' },
    ],
  },
}

function formatToday(date) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

function formatMetric(value) {
  return typeof value === 'number' && Number.isFinite(value)
    ? value.toLocaleString()
    : '—'
}

function BusinessSection({ businessKey, data, loading }) {
  const business = businessViews[businessKey]
  const stats = data.stats || {}
  const leads = Array.isArray(data.leads) ? data.leads : []
  const engagement = data.engagement || {}
  const buckets = Array.isArray(engagement.buckets) ? engagement.buckets : []
  const totalQualified = stats.qualified_leads
  const totalUsers = engagement.total_users
  const canCalculateConversion =
    typeof totalQualified === 'number' &&
    typeof totalUsers === 'number' &&
    Number.isFinite(totalQualified) &&
    Number.isFinite(totalUsers)
  const conversionRate = canCalculateConversion
    ? totalUsers
      ? `${((totalQualified / totalUsers) * 100).toFixed(1)}%`
      : '0.0%'
    : '—'
  const isRealEstate = businessKey === 'realEstate'
  const facebookConnection = data.pageInfo?.facebook
  const whatsappConnection = data.pageInfo?.whatsapp
  const channelStatuses = [
    { name: 'Facebook', connection: facebookConnection },
    { name: 'WhatsApp', connection: whatsappConnection },
  ].filter(Boolean)

  return (
    <div className="space-y-5">
      <section
        aria-label={`${business.label} connection status`}
        className="flex flex-wrap items-center gap-3 rounded-md border border-slate-200 bg-white px-4 py-3"
      >
        <span
          aria-hidden="true"
          className={`flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-xs font-semibold ${
            isRealEstate
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-blue-100 text-blue-700'
          }`}
        >
          {isRealEstate ? 'RE' : 'V'}
        </span>
        {isRealEstate ? (
          <div className="flex flex-wrap gap-2">
            {channelStatuses.map(({ name, connection }) => {
              const statusUnavailable = Boolean(data.errors.pageInfo) || !data.pageInfo
              const connected = Boolean(connection?.connected)
              return (
                <span
                  key={name}
                  title={connection?.reason || undefined}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    connected
                      ? 'bg-emerald-50 text-emerald-700'
                      : statusUnavailable
                        ? 'bg-red-50 text-red-700'
                        : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {name}: {statusUnavailable ? 'Status unavailable' : connected ? 'Connected' : 'Not connected'}
                </span>
              )
            })}
          </div>
        ) : (
          <span className="text-sm text-slate-600">
            {data.pageInfo?.connected
              ? `Visa Facebook connected${data.pageInfo.page_name ? `: ${data.pageInfo.page_name}` : ''}`
              : data.pageInfo
                ? 'Visa Facebook not connected'
                : 'Visa Facebook connection status unavailable'}
          </span>
        )}
        {!isRealEstate && (data.errors.pageInfo || (data.pageInfo && !data.pageInfo.connected)) ? (
          <span className="text-sm text-red-500">
            ({data.errors.pageInfo ? 'Could not reach backend' : 'No Facebook page connected'})
          </span>
        ) : null}
      </section>

      {isRealEstate && (
        <p className={`rounded-md border px-4 py-3 text-sm ${
          Object.keys(data.errors).length
            ? 'border-amber-200 bg-amber-50 text-amber-900'
            : 'border-emerald-200 bg-emerald-50 text-emerald-900'
        }`}>
          {Object.keys(data.errors).length
            ? 'Some Real Estate data could not be loaded. Use Refresh to try again.'
            : 'Real Estate dashboard data is connected to its live API.'}
        </p>
      )}

      <section
        aria-label={`${business.label} lead metrics`}
        className="grid grid-cols-2 overflow-hidden rounded-md border border-slate-200 bg-white md:grid-cols-4"
      >
        {metricDefinitions.map(({ label, key }, index) => (
          <div
            key={key}
            className={`min-h-24 px-5 py-5 sm:px-6 ${
              index > 0 ? 'border-l border-slate-200' : ''
            } ${index === 2 ? 'max-md:border-l-0' : ''} ${
              index > 1 ? 'max-md:border-t border-slate-200' : ''
            }`}
          >
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold leading-none text-slate-900">
              {loading && !data.stats ? 'Loading…' : formatMetric(stats[key])}
            </p>
          </div>
        ))}
      </section>

      <section className="overflow-hidden rounded-md border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-slate-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-900">
            {isRealEstate ? 'Real Estate Leads' : 'Visa Leads'}
          </h2>
          <span className="text-xs text-slate-500">
            {isRealEstate
              ? data.errors.leads
                ? 'Error loading leads'
                : `${leads.length} leads`
              : data.errors.leads
                ? 'Error loading leads'
                : `${leads.length} leads`}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200">
                {business.columns.map(({ label }) => (
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
                  key={lead.thread_id || lead.id || `${businessKey}-${index}`}
                  className="border-b border-slate-100 last:border-0"
                >
                  {business.columns.map(({ key, label }) => (
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
                  <td
                    colSpan={business.columns.length}
                    className="px-5 py-7 text-center text-sm text-slate-500"
                  >
                    {isRealEstate
                      ? loading
                        ? 'Loading Real Estate leads…'
                        : data.errors.leads
                          ? 'Could not load Real Estate leads. Use Refresh to try again.'
                          : 'No Real Estate leads yet.'
                      : loading
                        ? 'Loading leads…'
                        : data.errors.leads
                          ? 'Could not load leads. Use Refresh to try again.'
                          : 'No leads yet.'}
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
          <span className="text-xs text-slate-500">Bucketed by conversation depth</span>
        </div>
        <div className="px-5 py-6">
          <div className="min-h-12 space-y-3">
            {data.errors.engagement ? (
              <p className="text-sm text-red-600">Could not load engagement data.</p>
            ) : buckets.length ? (
              buckets.map((bucket) => (
                <div key={bucket.label} className="flex items-center gap-3 text-sm">
                  <span className="w-32 shrink-0 text-slate-600">{bucket.label}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-500"
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
          <div className="grid grid-cols-3 gap-4 border-t border-slate-200 pt-5">
            <div>
              <p className="text-sm text-slate-500">Conversion Rate</p>
              <p className="mt-1 text-xl font-bold text-slate-900">
                {conversionRate}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-500">Total Qualified</p>
              <p className="mt-1 text-xl font-bold text-emerald-600">
                {formatMetric(totalQualified)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Total Users</p>
              <p className="mt-1 text-xl font-bold text-slate-900">
                {formatMetric(totalUsers)}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export function VisaDashboard() {
  const location = useLocation()
  const [activeView, setActiveView] = useState('overview')
  const [dashboard, setDashboard] = useState({
    visa: { stats: null, leads: null, engagement: null, pageInfo: null, errors: {} },
    realEstate: { stats: null, leads: null, engagement: null, pageInfo: null, errors: {} },
  })
  const [loading, setLoading] = useState(true)
  const name = location.state?.name || 'Admin'

  const requestDashboard = useCallback(async () => {
    const [visa, realEstate] = await Promise.all([
      Promise.allSettled([
        getFacebookStats(),
        getFacebookLeads(),
        getFacebookEngagement(),
        getFacebookPageInfo(),
      ]),
      Promise.allSettled([
        getRealEstateStats(),
        getRealEstateLeads(),
        getRealEstateEngagement(),
        getRealEstatePageInfo(),
      ]),
    ])
    const keys = ['stats', 'leads', 'engagement', 'pageInfo']

    return Object.fromEntries(
      [['visa', visa], ['realEstate', realEstate]].map(([business, results]) => {
        const next = { stats: null, leads: null, engagement: null, pageInfo: null, errors: {} }
        results.forEach((result, index) => {
          const key = keys[index]
          if (result.status === 'fulfilled') {
            next[key] = result.value
          } else {
            next.errors[key] = result.reason
            console.error(`[${business} dashboard] Could not load ${key}`, result.reason)
          }
        })
        return [business, next]
      }),
    )
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

  const tabs = [
    { id: 'overview', label: 'Combined Overview' },
    { id: 'visa', label: 'Visa' },
    { id: 'realEstate', label: 'Real Estate' },
  ]
  const isComplete = metricDefinitions.every(({ key }) => (
    typeof dashboard.visa.stats?.[key] === 'number' &&
    Number.isFinite(dashboard.visa.stats[key]) &&
    typeof dashboard.realEstate.stats?.[key] === 'number' &&
    Number.isFinite(dashboard.realEstate.stats[key])
  ))

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
              Visa &amp; Real Estate · Lead Intelligence Dashboard
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={refreshDashboard}
                disabled={loading}
                className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
              >
                <RefreshCw size={15} className={loading ? 'animate-spin' : ''} aria-hidden="true" />
                Refresh
              </button>
              <a
                href="https://www.facebook.com/messages/t/1416240811568711"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                <span aria-hidden="true" className="font-bold text-blue-600">f</span>
                Visa Page
              </a>
              <a
                href="https://www.facebook.com/messages/t/1451401514714679"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                <span aria-hidden="true" className="font-bold text-blue-600">f</span>
                Real Estate Agent
              </a>
            </div>
          </div>
        </header>

        <nav
          aria-label="Dashboard sections"
          className="flex flex-wrap gap-2 rounded-md border border-slate-200 bg-white p-2"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              aria-current={activeView === tab.id ? 'page' : undefined}
              onClick={() => setActiveView(tab.id)}
              className={`min-h-10 rounded px-4 text-sm font-medium transition ${
                activeView === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {activeView === 'overview' ? (
          <div className="space-y-5">
            <section
              aria-label="Combined visa and real estate metrics"
              className="overflow-hidden rounded-md border border-slate-200 bg-white"
            >
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-sm font-semibold text-slate-900">Combined Business Overview</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Totals combine Visa and Real Estate data when both sources are connected.
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4">
                {metricDefinitions.map(({ label, key }, index) => {
                  const total = isComplete
                    ? dashboard.visa.stats[key] + dashboard.realEstate.stats[key]
                    : null
                  return (
                    <div
                      key={key}
                      className={`min-h-24 px-5 py-5 sm:px-6 ${
                        index > 0 ? 'border-l border-slate-200' : ''
                      } ${index === 2 ? 'max-md:border-l-0' : ''} ${
                        index > 1 ? 'max-md:border-t border-slate-200' : ''
                      }`}
                    >
                      <p className="text-sm text-slate-500">{label}</p>
                      <p className="mt-2 text-2xl font-semibold leading-none text-slate-900">
                        {formatMetric(total)}
                      </p>
                    </div>
                  )
                })}
              </div>
              {!isComplete && (
                <p className="border-t border-slate-200 px-5 py-3 text-sm text-amber-800">
                  Combined totals will be available after the Real Estate API is connected.
                </p>
              )}
            </section>

            <div className="grid gap-5 md:grid-cols-2">
              {['visa', 'realEstate'].map((businessKey) => {
                const business = businessViews[businessKey]
                const data = dashboard[businessKey]
                const hasConnectedChannel = businessKey === 'realEstate'
                  ? Boolean(data.pageInfo?.facebook?.connected || data.pageInfo?.whatsapp?.connected)
                  : Boolean(data.pageInfo?.connected)
                return (
                  <section
                    key={businessKey}
                    aria-label={`${business.label} overview`}
                    className="overflow-hidden rounded-md border border-slate-200 bg-white"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                      <h2 className="text-sm font-semibold text-slate-900">{business.label}</h2>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        hasConnectedChannel
                          ? 'bg-emerald-50 text-emerald-700'
                          : data.errors.pageInfo
                            ? 'bg-red-50 text-red-700'
                            : 'bg-slate-100 text-slate-600'
                      }`}>
                        {hasConnectedChannel
                          ? 'Connected'
                          : data.errors.pageInfo
                            ? 'Connection error'
                            : 'No connected channels'}
                      </span>
                    </div>
                    <dl className="grid grid-cols-2">
                      {metricDefinitions.map(({ label, key }, index) => (
                        <div
                          key={key}
                          className={`px-5 py-4 ${
                            index > 1 ? 'border-t border-slate-100' : ''
                          } ${index % 2 ? 'border-l border-slate-100' : ''}`}
                        >
                          <dt className="text-xs text-slate-500">{label}</dt>
                          <dd className="mt-1 text-lg font-semibold text-slate-900">
                            {loading && !data.stats
                                ? 'Loading…'
                                : formatMetric(data.stats?.[key])}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </section>
                )
              })}
            </div>
          </div>
        ) : (
          <BusinessSection
            businessKey={activeView}
            data={dashboard[activeView]}
            loading={loading}
          />
        )}
      </div>
    </main>
  )
}
