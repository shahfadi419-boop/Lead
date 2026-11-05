import { useCallback, useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { useLocation } from 'react-router'
import {
  getFacebookEngagement,
  getFacebookLeads,
  getFacebookPageInfo,
  getFacebookStats,
} from './api'

const leadColumns = [
  'Name',
  'Phone',
  'Email',
  'Country',
  'Visa Interest',
  'Preferred Call Time',
  'Platform',
  'Status',
]

function formatToday(date) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export function VisaDashboard() {
  const location = useLocation()
  const [dashboard, setDashboard] = useState({
    stats: null,
    leads: null,
    engagement: null,
    pageInfo: null,
    errors: {},
  })
  const [loading, setLoading] = useState(true)
  const name = location.state?.name || 'Admin'

  const requestDashboard = useCallback(async () => {
    const requests = await Promise.allSettled([
      getFacebookStats(),
      getFacebookLeads(),
      getFacebookEngagement(),
      getFacebookPageInfo(),
    ])
    const keys = ['stats', 'leads', 'engagement', 'pageInfo']
    const next = { stats: null, leads: null, engagement: null, pageInfo: null, errors: {} }

    requests.forEach((result, index) => {
      const key = keys[index]
      if (result.status === 'fulfilled') {
        next[key] = result.value
      } else {
        next.errors[key] = result.reason
        console.error(`[Facebook dashboard] Could not load ${key}`, result.reason)
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
  const metrics = [
    ['Total Leads', stats.total_leads],
    ['Engaged Users', stats.engaged_users],
    ['Total Messages', stats.total_messages],
    ['Qualified Leads', stats.qualified_leads],
  ]
  const leads = Array.isArray(dashboard.leads) ? dashboard.leads : []
  const engagement = dashboard.engagement || {}
  const buckets = Array.isArray(engagement.buckets) ? engagement.buckets : []
  const totalQualified = Number(stats.qualified_leads) || 0
  const totalUsers = Number(engagement.total_users) || 0
  const conversionRate = totalUsers ? (totalQualified / totalUsers) * 100 : 0
  const pageInfo = dashboard.pageInfo
  const pageInfoError = dashboard.errors.pageInfo

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
              GoForeign · Lead Intelligence Dashboard
            </p>
          </div>
          <button
            type="button"
            onClick={refreshDashboard}
            disabled={loading}
            className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} aria-hidden="true" />
            Refresh
          </button>
        </header>

        <section
          aria-label="Facebook connection status"
          className="flex flex-wrap items-center gap-3 rounded-md border border-slate-200 bg-white px-4 py-3"
        >
          <span
            aria-hidden="true"
            className="flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-full bg-slate-400 text-[12px] font-bold leading-none text-white"
          >
            f
          </span>
          <span className="text-sm text-slate-600">
            {pageInfo?.connected
              ? `Facebook connected${pageInfo.page_name ? `: ${pageInfo.page_name}` : ''}`
              : pageInfo
                ? 'Facebook not connected'
                : 'Facebook connection status unavailable'}
          </span>
          {(pageInfoError || (pageInfo && !pageInfo.connected)) && (
            <span className="text-sm text-red-500">
              ({pageInfoError ? 'Could not reach backend' : 'No Facebook page connected'})
            </span>
          )}
        </section>

        <section
          aria-label="Lead metrics"
          className="grid grid-cols-2 overflow-hidden rounded-md border border-slate-200 bg-white md:grid-cols-4"
        >
          {metrics.map(([metric, value], index) => (
            <div
              key={metric}
              className={`min-h-24 px-5 py-5 sm:px-6 ${
                index > 0 ? 'border-l border-slate-200' : ''
              } ${index === 2 ? 'max-md:border-l-0' : ''} ${
                index > 1 ? 'max-md:border-t border-slate-200' : ''
              }`}
            >
              <p className="text-sm text-slate-500">{metric}</p>
              <p className="mt-2 text-2xl font-semibold leading-none text-slate-900">
                {typeof value === 'number' ? value.toLocaleString() : loading ? 'Loading…' : '—'}
              </p>
            </div>
          ))}
        </section>

        <section className="overflow-hidden rounded-md border border-slate-200 bg-white">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-slate-200 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">All Leads</h2>
            <span className="text-xs text-slate-500">
              {dashboard.errors.leads ? 'Error loading leads' : `${leads.length} leads`}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200">
                  {leadColumns.map((column) => (
                    <th
                      key={column}
                      scope="col"
                      className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 first:pl-5"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.length ? leads.map((lead) => (
                  <tr key={lead.thread_id} className="border-b border-slate-100 last:border-0">
                    {[lead.name, lead.phone, lead.email, lead.country, lead.visa_interest,
                      lead.preferred_calling_time, lead.platform, lead.lead_status].map((value, index) => (
                        <td key={leadColumns[index]} className="whitespace-nowrap px-4 py-3 text-sm text-slate-600 first:pl-5">
                          {value || '—'}
                        </td>
                    ))}
                  </tr>
                )) : (
                    <tr>
                      <td colSpan={leadColumns.length} className="px-5 py-7 text-center text-sm text-slate-500">
                        {loading
                          ? 'Loading leads…'
                          : dashboard.errors.leads
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
              {dashboard.errors.engagement ? (
                <p className="text-sm text-red-600">Could not load engagement data.</p>
              ) : buckets.length ? (
                buckets.map((bucket) => (
                  <div key={bucket.label} className="flex items-center gap-3 text-sm">
                    <span className="w-32 shrink-0 text-slate-600">{bucket.label}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-blue-500"
                        style={{ width: `${Math.min(Math.max(Number(bucket.percentage) || 0, 0), 100)}%` }}
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
                <p className="mt-1 text-xl font-bold text-slate-900">{conversionRate.toFixed(1)}%</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-500">Total Qualified</p>
                <p className="mt-1 text-xl font-bold text-emerald-600">{totalQualified.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">Total Users</p>
                <p className="mt-1 text-xl font-bold text-slate-900">{totalUsers.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}