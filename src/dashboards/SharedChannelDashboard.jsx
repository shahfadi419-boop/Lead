import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ExternalLink, RefreshCw } from 'lucide-react';
import {
  getPlatformEngagement,
  getPlatformLeads,
  getPlatformPageInfo,
  getPlatformStats,
} from './api';

const EMPTY_SOURCE = {
  stats: null,
  leads: null,
  engagement: null,
  pageInfo: null,
  errors: {},
};

const PLATFORM_LABELS = {
  facebook: 'Facebook',
  whatsapp: 'WhatsApp Business',
};

const METRICS = [
  { label: 'Total Leads', key: 'total_leads' },
  { label: 'Engaged Users', key: 'engaged_users' },
  { label: 'Total Messages', key: 'total_messages' },
  { label: 'Qualified Leads', key: 'qualified_leads' },
];

function formatMetric(value) {
  return typeof value === 'number' && Number.isFinite(value)
    ? value.toLocaleString()
    : '—';
}

function formatCell(value) {
  if (value === null || value === undefined || value === '') return '—';
  return String(value);
}

function getChannelStats(stats, platform) {
  const platformStats = stats?.by_platform?.find(
    (item) => String(item.platform || '').toLowerCase() === platform,
  );
  return {
    total_leads: platformStats?.leads,
    engaged_users: platformStats?.engaged_users,
    total_messages: platformStats?.total_messages,
    qualified_leads: platformStats?.qualified,
  };
}

function getChannelDashboardData(data, platform) {
  const engagement = data.engagement?.by_platform?.find(
    (item) => String(item.platform || '').toLowerCase() === platform,
  );

  return {
    ...data,
    stats: data.stats ? getChannelStats(data.stats, platform) : null,
    leads: Array.isArray(data.leads)
      ? data.leads.filter((lead) => String(lead.platform || '').toLowerCase() === platform)
      : data.leads,
    engagement,
    hasUnsegmentedEngagement: Boolean(data.engagement && !engagement),
  };
}

function getConnection(pageInfo, label) {
  return label === 'WhatsApp Business'
    ? pageInfo?.whatsapp || pageInfo
    : pageInfo?.facebook || pageInfo;
}

function MetricCards({ stats, loading, label }) {
  return (
    <section
      aria-label={`${label} metrics`}
      className="grid grid-cols-2 overflow-hidden rounded-xl border border-slate-200 bg-white md:grid-cols-4"
    >
      {METRICS.map(({ label: metricLabel, key }, index) => (
        <div
          key={key}
          className={`min-h-24 px-5 py-5 sm:px-6 ${
            index > 0 ? 'border-l border-slate-200' : ''
          } ${index === 2 ? 'max-md:border-l-0' : ''} ${
            index > 1 ? 'max-md:border-t border-slate-200' : ''
          }`}
        >
          <p className="text-sm text-slate-500">{metricLabel}</p>
          <p className="mt-2 text-2xl font-semibold leading-none text-slate-900">
            {loading && !stats ? 'Loading…' : formatMetric(stats?.[key])}
          </p>
        </div>
      ))}
    </section>
  );
}

function LeadsTable({ data, loading, label }) {
  const leads = Array.isArray(data.leads) ? data.leads : [];
  const leadsLoading = loading && data.leads === null && !data.errors.leads;
  const sharedColumns = [
    { label: 'Name', value: (lead) => lead.name },
    { label: 'Phone', value: (lead) => lead.phone ? 'Hidden' : '—' },
    { label: 'Email', value: (lead) => lead.email },
  ];
  const columns = label === 'Real Estate'
    ? [
      ...sharedColumns,
      { label: 'Property Type', value: (lead) => lead.property_type },
      { label: 'City / Area', value: (lead) => lead.city_or_area },
      { label: 'Budget', value: (lead) => lead.budget_range || lead.budget },
      { label: 'Preferred Call Time', value: (lead) => lead.preferred_call_time },
      { label: 'Platform', value: (lead) => lead.platform },
      { label: 'Stage', value: (lead) => lead.stage },
      { label: 'Score', value: (lead) => lead.score },
      { label: 'Messages', value: (lead) => lead.message_count },
      {
        label: 'Handoff Requested',
        value: (lead) => typeof lead.handoff_requested === 'boolean'
          ? lead.handoff_requested ? 'Yes' : 'No'
          : lead.handoff_requested,
      },
    ]
    : label === 'Visa'
      ? [
        ...sharedColumns,
        { label: 'Visa Interest', value: (lead) => lead.visa_interest },
        { label: 'Country', value: (lead) => lead.country },
        { label: 'Preferred Call Time', value: (lead) => lead.preferred_calling_time || lead.preferred_call_time },
        { label: 'Platform', value: (lead) => lead.platform },
        { label: 'Status', value: (lead) => lead.lead_status || lead.stage },
      ]
      : [
        ...sharedColumns,
        { label: 'Interest', value: (lead) => lead.visa_interest || lead.property_type },
        { label: 'Country', value: (lead) => lead.country },
        { label: 'Budget', value: (lead) => lead.budget || lead.budget_range },
        { label: 'Preferred Call Time', value: (lead) => lead.preferred_calling_time || lead.preferred_call_time },
        { label: 'Platform', value: (lead) => lead.platform },
        { label: 'Status', value: (lead) => lead.lead_status || lead.stage },
      ];

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h3 className="text-sm font-semibold text-slate-900">{label} Leads</h3>
        <span className="text-xs text-slate-500">
          {data.errors.leads ? 'Error loading leads' : `${leads.length} leads`}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200">
              {columns.map(({ label: columnLabel }) => (
                <th
                  key={columnLabel}
                  scope="col"
                  className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 first:pl-5"
                >
                  {columnLabel}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leads.length ? leads.map((lead, index) => (
              <tr
                key={lead.thread_id || lead.id || `${label}-${index}`}
                className="border-b border-slate-100 last:border-0"
              >
                {columns.map(({ label: columnLabel, value }) => (
                  <td
                    key={columnLabel}
                    className="whitespace-nowrap px-4 py-3 text-sm text-slate-600 first:pl-5"
                  >
                    {formatCell(value(lead))}
                  </td>
                ))}
              </tr>
            )) : (
              <tr>
                <td colSpan={columns.length} className="px-5 py-7 text-center text-sm text-slate-500">
                  {leadsLoading
                    ? `Loading ${label} leads…`
                    : data.errors.leads
                      ? `Could not load ${label} leads. Use Refresh to try again.`
                      : `No ${label} leads yet.`}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function LiveExperienceLink({ label, href, platform }) {
  const isWhatsApp = platform === 'whatsapp';
  const text = isWhatsApp
    ? 'WhatsApp Experience Center'
    : 'Facebook Experience Center';

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open ${label} ${text}`}
      className={`inline-flex min-h-14 w-[420px] max-w-full items-center justify-center gap-3 rounded-xl border-2 px-5 py-3 text-center text-base font-bold shadow-md transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
        isWhatsApp
          ? 'border-emerald-500 bg-[#25D366] text-white hover:border-emerald-600 hover:bg-emerald-600 focus-visible:ring-emerald-500'
          : 'border-[#1877F2] bg-[#1877F2] text-white hover:border-[#166FE5] hover:bg-[#166FE5] focus-visible:ring-blue-500'
      }`}
    >
      <span
        aria-hidden="true"
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white ${
          isWhatsApp ? 'bg-white/20' : 'bg-white/20'
        }`}
      >
        {isWhatsApp ? 'W' : 'f'}
      </span>
      <span className="whitespace-nowrap">{text}</span>
      <ExternalLink size={18} className="shrink-0" aria-hidden="true" />
    </a>
  );
}

function SourceDashboard({ label, data, loading }) {
  const engagement = data.engagement || {};
  const buckets = Array.isArray(engagement.buckets) ? engagement.buckets : [];
  const connection = getConnection(data.pageInfo, label);

  return (
    <section aria-label={`${label} dashboard`} className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-xl font-bold text-slate-900">{label}</h2>
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
          data.errors.pageInfo
            ? 'bg-red-50 text-red-700'
            : connection?.connected
              ? 'bg-emerald-50 text-emerald-700'
              : data.pageInfo
                ? 'bg-amber-50 text-amber-800'
                : 'bg-slate-100 text-slate-600'
        }`}>
          {data.errors.pageInfo
            ? 'Connection status unavailable'
            : connection?.connected
              ? 'Connected'
              : data.pageInfo
                ? 'Not connected'
                : 'Checking connection…'}
        </span>
        {connection?.page_name && (
          <span className="text-sm text-slate-500">{connection.page_name}</span>
        )}
      </div>

      {Object.keys(data.errors).length > 0 && (
        <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Some {label} data could not be loaded. Check this backend connection and use Refresh to try again.
        </p>
      )}
      {data.hasUnsegmentedEngagement && (
        <p className="text-xs text-slate-500">
          Separate {label} engagement data is not available from the backend.
        </p>
      )}

      <MetricCards
        stats={data.stats}
        loading={loading}
        label={label}
      />
      <LeadsTable data={data} loading={loading} label={label} />

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="text-sm font-semibold text-slate-900">
            {label} Engagement
          </h3>
          <p className="mt-1 text-xs text-slate-500">Engagement grouped by conversation depth</p>
        </div>
        <div className="space-y-4 px-5 py-6">
          {data.errors.engagement ? (
            <p className="text-sm text-red-600">Could not load engagement data. Use Refresh to try again.</p>
          ) : buckets.length ? buckets.map((bucket) => (
            <div key={bucket.label} className="flex items-center gap-3 text-sm">
              <span className="w-32 shrink-0 text-slate-600">{bucket.label}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-500"
                  style={{ width: `${Math.min(Math.max(Number(bucket.percentage) || 0, 0), 100)}%` }}
                />
              </div>
              <span className="w-12 text-right text-slate-500">{formatMetric(bucket.users)}</span>
            </div>
          )) : (
            <p className="text-sm text-slate-500">
              {loading && data.engagement === null
                ? 'Loading engagement data…'
                : data.hasUnsegmentedEngagement
                  ? `Separate ${label} engagement data is not available from the backend.`
                  : 'No engagement data yet.'}
            </p>
          )}
          <div className="grid grid-cols-3 gap-4 border-t border-slate-200 pt-5">
            <div>
              <p className="text-sm text-slate-500">Conversion Rate</p>
              <p className="mt-1 text-xl font-bold text-slate-900">
                {typeof data.stats?.qualified_leads === 'number' &&
                typeof engagement.total_users === 'number'
                  ? `${(engagement.total_users
                    ? (data.stats.qualified_leads / engagement.total_users) * 100
                    : 0).toFixed(1)}%`
                  : '—'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-500">Total Qualified</p>
              <p className="mt-1 text-xl font-bold text-emerald-600">
                {formatMetric(data.stats?.qualified_leads)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Total Users</p>
              <p className="mt-1 text-xl font-bold text-slate-900">
                {formatMetric(engagement.total_users)}
              </p>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}

export function SharedChannelDashboard({ platform, onNavigate }) {
  const [dashboard, setDashboard] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('visa');
  const activeRequest = useRef(null);
  const loadedSources = useRef(new Set());

  const loadSource = useCallback(async (source, signal, force = false) => {
    if (!force && loadedSources.current.has(source)) return;

    const dashboardKey = source === 'facebook'
      ? 'visa'
      : source === 'real-estate'
        ? 'realEstate'
        : 'whatsapp';
    const requests = [
      ['stats', () => getPlatformStats(source, { signal })],
      ['leads', () => getPlatformLeads(source, { signal })],
      ['engagement', () => getPlatformEngagement(source, { signal })],
      ['pageInfo', () => getPlatformPageInfo(source, { signal })],
    ];

    setDashboard((current) => ({
      ...current,
      [dashboardKey]: current[dashboardKey] || { ...EMPTY_SOURCE },
    }));

    let allRequestsSucceeded = true;
    await Promise.all(requests.map(async ([key, request]) => {
      try {
        const value = await request();
        if (signal.aborted) return;
        setDashboard((current) => {
          const sourceData = current[dashboardKey] || { ...EMPTY_SOURCE };
          const errors = { ...sourceData.errors };
          delete errors[key];
          return {
            ...current,
            [dashboardKey]: { ...sourceData, [key]: value, errors },
          };
        });
      } catch (error) {
        if (signal.aborted) return;
        allRequestsSucceeded = false;
        console.error(`[${source} dashboard] Could not load ${key}`, error);
        setDashboard((current) => {
          const sourceData = current[dashboardKey] || { ...EMPTY_SOURCE };
          return {
            ...current,
            [dashboardKey]: {
              ...sourceData,
              errors: { ...sourceData.errors, [key]: error },
            },
          };
        });
      }
    }));

    if (!signal.aborted && allRequestsSucceeded) loadedSources.current.add(source);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    activeRequest.current = controller;
    const source = platform === 'facebook'
      ? activeView === 'visa' ? 'facebook' : 'real-estate'
      : 'whatsapp';
    setLoading(!loadedSources.current.has(source));
    loadSource(source, controller.signal).finally(() => {
      if (controller.signal.aborted) return;
      setLoading(false);
      if (activeRequest.current === controller) activeRequest.current = null;
    });

    return () => {
      controller.abort();
      if (activeRequest.current === controller) activeRequest.current = null;
    };
  }, [activeView, loadSource, platform]);

  const refreshDashboard = async () => {
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    setLoading(true);
    const source = platform === 'facebook'
      ? activeView === 'visa' ? 'facebook' : 'real-estate'
      : 'whatsapp';
    loadedSources.current.delete(source);
    await loadSource(source, controller.signal, true);
    if (controller.signal.aborted) return;
    setLoading(false);
    if (activeRequest.current === controller) activeRequest.current = null;
  };

  const title = PLATFORM_LABELS[platform];
  const whatsappConnection = getConnection(dashboard.whatsapp?.pageInfo, 'WhatsApp Business');
  const whatsappNumber = whatsappConnection?.number?.replace(/\D/g, '');
  const whatsappLiveExperienceUrl = whatsappConnection?.connected && whatsappNumber
    ? `https://wa.me/${whatsappNumber}`
    : null;
  const dashboardViews = [
    { id: 'visa', label: 'Visa' },
    { id: 'realEstate', label: 'Real Estate' },
  ];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Back to LeadHive
            </button>
            <p className="text-sm text-slate-500">
              {new Intl.DateTimeFormat('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              }).format(new Date())}
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              {platform === 'facebook' ? 'Facebook Lead Dashboard' : `${title} Lead Dashboard`}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {platform === 'facebook'
                ? 'Separate Visa and Real Estate performance dashboards.'
                : 'Lead performance and engagement overview.'}
            </p>
          </div>
          <button
            type="button"
            onClick={refreshDashboard}
            disabled={loading}
            className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} aria-hidden="true" />
            Refresh
          </button>
        </header>

        <section
          aria-label="Live experiences"
          className="flex min-h-10 flex-wrap items-center gap-3"
        >
          {platform === 'facebook' && (
            <>
              {activeView === 'visa' && (
                <LiveExperienceLink
                  label="Visa"
                  href="https://www.facebook.com/messages/t/1416240811568711"
                  platform="facebook"
                />
              )}
              {activeView === 'realEstate' && (
                <LiveExperienceLink
                  label="Real Estate"
                  href="https://www.facebook.com/messages/t/1451401514714679"
                  platform="facebook"
                />
              )}
            </>
          )}
          {platform === 'whatsapp' && whatsappLiveExperienceUrl && (
            <LiveExperienceLink
              label="WhatsApp Business"
              href={whatsappLiveExperienceUrl}
              platform="whatsapp"
            />
          )}
        </section>

        {platform === 'facebook' && (
          <nav
            aria-label="Facebook dashboard views"
            className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-2"
          >
            {dashboardViews.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                aria-pressed={activeView === id}
                onClick={() => {
                  setLoading(!loadedSources.current.has(
                    id === 'visa' ? 'facebook' : 'real-estate',
                  ));
                  setActiveView(id);
                }}
                className={`min-h-10 rounded-lg px-4 text-sm font-medium transition ${
                  activeView === id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        )}

        {platform === 'facebook' ? (
          <>
            {activeView === 'visa' && (
              <SourceDashboard
                label="Visa"
                data={getChannelDashboardData(dashboard.visa || EMPTY_SOURCE, 'facebook')}
                loading={loading}
              />
            )}
            {activeView === 'realEstate' && (
              <SourceDashboard
                label="Real Estate"
                data={dashboard.realEstate || EMPTY_SOURCE}
                loading={loading}
              />
            )}
          </>
        ) : (
          <SourceDashboard
            label={title}
            data={getChannelDashboardData(dashboard.whatsapp || EMPTY_SOURCE, 'whatsapp')}
            loading={loading}
            liveExperienceUrl={null}
          />
        )}
      </div>
    </main>
  );
}
