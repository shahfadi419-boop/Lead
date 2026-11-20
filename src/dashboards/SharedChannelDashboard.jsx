import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ExternalLink, RefreshCw } from 'lucide-react';
import {
  getVisaEngagement,
  getVisaLeads,
  getVisaStats,
  getPlatformEngagement,
  getPlatformLeads,
  getPlatformStats,
  triggerVisaExtraction,
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

function formatSummary(value) {
  if (value === null || value === undefined || value === '') return '—';

  const text = String(value)
    .replace(/^\s*-\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n');
  return text
    .split(/(\*\*[^*]+\*\*|\*[^*]+\*|\r?\n)/g)
    .map((part, index) => {
      if (!part) return null;
      if (part === '\n' || part === '\r\n') {
        return <br key={`line-${index}`} />;
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={`bold-${index}`} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <strong key={`bold-${index}`} className="font-bold text-slate-900">{part.slice(1, -1)}</strong>;
      }
      return part;
    });
}


const LEAD_STATUS_LABELS = {
  qualified_ready_for_call: '🔥 Hot Lead',
  hot_lead: '🔥 Hot Lead',
  hot: '🔥 Hot Lead',
  qualified_missing_call_time: '📞 Qualified Lead',
  qualified: '📞 Qualified Lead',
  warm_missing_contact_details: '📇 No Details Lead',
  warm_missing_contact: '📵 No Contact Lead',
  warm_lead: '🌤️ Warm Lead',
  warm: '🌤️ Warm Lead',
  new: '✨ New Lead',
};

function formatLeadStatus(status) {
  if (typeof status !== 'string' || !status.trim()) return status;
  const normalized = status.trim().toLowerCase().replace(/[\s-]+/g, '_');
  return LEAD_STATUS_LABELS[normalized] || status;
}

function maskPhone(phone) {
  const s = String(phone).replace(/\s+/g, '');
  if (s.length <= 6) return '****';
  return s.slice(0, 4) + ' **** ' + s.slice(-3);
}

function getLeadTimestamp(lead) {
  const timestamp = lead.created_at ?? lead.createdAt ?? lead.updated_at ?? lead.timestamp;
  if (typeof timestamp === 'number') return timestamp;
  if (typeof timestamp !== 'string' || !timestamp.trim()) return Number.NEGATIVE_INFINITY;
  const parsed = Date.parse(timestamp);
  return Number.isFinite(parsed) ? parsed : Number.NEGATIVE_INFINITY;
}

function formatLeadDateTime(lead) {
  const timestamp = getLeadTimestamp(lead);
  if (!Number.isFinite(timestamp)) return '—';

  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(timestamp);
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
  const leads = Array.isArray(data.leads)
    ? data.leads
      .map((lead, index) => ({ lead, index, timestamp: getLeadTimestamp(lead) }))
      .sort((a, b) => b.timestamp - a.timestamp || a.index - b.index)
      .map(({ lead }) => lead)
    : [];
  const leadsLoading = loading && data.leads === null && !data.errors.leads;
  const sharedColumns = [
    { label: 'Name', value: (lead) => lead.name },
    { label: 'Phone', value: (lead) => lead.phone ? maskPhone(lead.phone) : '—' },
  ];
  const sourceColumns = label === 'Real Estate'
    ? [
      ...sharedColumns,
      { label: 'Property Type', value: (lead) => lead.property_type },
      { label: 'City / Area', value: (lead) => lead.city_or_area },
      { label: 'Budget', value: (lead) => lead.budget_range || lead.budget },
      { label: 'Preferred Call Time', value: (lead) => lead.preferred_call_time },
      { label: 'Platform', value: (lead) => lead.platform },
      { label: 'Status', value: (lead) => formatLeadStatus(lead.stage) },
      { label: 'Summary', value: (lead) => lead.summary || '—' },
    ]
    : label === 'Visa'
      ? [
        ...sharedColumns,
        { label: 'Visa Interest', value: (lead) => lead.visa_interest },
        { label: 'Country', value: (lead) => lead.country },
        { label: 'Preferred Call Time', value: (lead) => lead.preferred_calling_time || lead.preferred_call_time },
        { label: 'Platform', value: (lead) => lead.platform },
        { label: 'Status', value: (lead) => formatLeadStatus(lead.lead_status || lead.stage) },
        { label: 'Summary', value: (lead) => lead.summary || '—' },
      ]
      : [
        ...sharedColumns,
        { label: 'Interest', value: (lead) => lead.visa_interest || lead.property_type },
        { label: 'Country', value: (lead) => lead.country },
        { label: 'Preferred Call Time', value: (lead) => lead.preferred_calling_time || lead.preferred_call_time },
        { label: 'Platform', value: (lead) => lead.platform },
        { label: 'Status', value: (lead) => formatLeadStatus(lead.lead_status || lead.stage) },
        { label: 'Summary', value: (lead) => lead.summary || '—', render: formatSummary },
      ];
  const columns = [
    ...sourceColumns,
    { label: 'Date & Time', value: formatLeadDateTime },
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
        <table className="w-full min-w-[1150px] border-collapse text-center">
          <thead>
            <tr className="border-b border-slate-200">
              {columns.map(({ label: columnLabel }) => (
                <th
                  key={columnLabel}
                  scope="col"
                  className="whitespace-nowrap border-r border-slate-300 px-4 py-3 text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-700 last:border-r-0"
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
                className="border-b border-slate-300 last:border-0"
              >
                {columns.map(({ label: columnLabel, value }) => (
                  <td
                    key={columnLabel}
                    className={
                      columnLabel === 'Summary'
                        ? 'w-[360px] min-w-[360px] max-w-[360px] whitespace-normal border-r border-slate-300 px-4 py-3 text-left align-top text-sm leading-6 text-slate-600 last:border-r-0'
                        : 'whitespace-nowrap border-r border-slate-300 px-4 py-3 text-sm text-slate-600 last:border-r-0'
                    }
                  >
                    {columnLabel === 'Summary'
                      ? formatSummary(value(lead))
                      : formatCell(value(lead))}
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

function LiveExperienceLink({ label, href, platform, displayPhoneNumber, linkText }) {
  const isWhatsApp = platform === 'whatsapp';
  const text = isWhatsApp
    ? linkText || 'WhatsApp Experience Center'
    : linkText || 'Facebook Experience Center';

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
      <span className="flex flex-col items-center whitespace-nowrap leading-tight">
        <span>{text}</span>
        {displayPhoneNumber && (
          <span className="mt-1 text-sm font-semibold">{displayPhoneNumber}</span>
        )}
      </span>
      <ExternalLink size={18} className="shrink-0" aria-hidden="true" />
    </a>
  );
}

function SourceDashboard({ label, data, loading, isVisaSource, showConnectionStatus }) {
  const engagement = data.engagement || {};
  const buckets = Array.isArray(engagement.buckets) ? engagement.buckets : [];

  return (
    <section aria-label={`${label} dashboard`} className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-xl font-bold text-slate-900">{label}</h2>
        {showConnectionStatus && (
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            data.errors.stats
              ? 'bg-red-50 text-red-700'
              : data.stats
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-slate-100 text-slate-600'
          }`}>
            {data.errors.stats ? 'Connection unavailable' : data.stats ? 'Connected' : 'Connecting…'}
          </span>
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

function transformSsePayload(raw) {
  return {
    stats: {
      by_platform: [{
        platform: raw.stats.platform,
        leads: raw.stats.total_leads,
        engaged_users: raw.stats.engaged_users,
        total_messages: raw.stats.total_messages,
        qualified: raw.stats.total_leads,
      }],
    },
    leads: raw.leads,
    engagement: {
      by_platform: [raw.engagement],
      total_users: raw.engagement.total_users,
      buckets: raw.engagement.buckets,
    },
    pageInfo: null,
    errors: {},
  };
}

export function SharedChannelDashboard({ platform, onNavigate }) {
  const [dashboard, setDashboard] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeView, setActiveView] = useState('realEstate');
  const activeRequest = useRef(null);
  const loadedSources = useRef(new Set());

  const source = platform === 'facebook'
    ? activeView === 'visa' ? 'facebook' : 'real-estate'
    : 'whatsapp';
  const isVisaSource = source === 'facebook' || source === 'whatsapp';

  const loadSource = useCallback(async (source, signal, force = false) => {
    if (!force && loadedSources.current.has(source)) return;

    const dashboardKey = source === 'facebook'
      ? 'visa'
      : source === 'real-estate'
        ? 'realEstate'
        : 'whatsapp';
    // facebook (visa tab) and whatsapp → ai-lead-generator backend (port 8000)
    // real-estate → existing devtunnel backend
    const isVisa = source === 'facebook' || source === 'whatsapp';
    const requests = isVisa
      ? [
          ['stats',      () => getVisaStats(source, { signal })],
          ['leads',      () => getVisaLeads(source, { signal })],
          ['engagement', () => getVisaEngagement(source, { signal })],
        ]
      : [
          ['stats',      () => getPlatformStats(source, { signal })],
          ['leads',      () => getPlatformLeads(source, { signal })],
          ['engagement', () => getPlatformEngagement(source, { signal })],
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
    setRefreshing(false);
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

  // SSE live updates — visa sources (facebook visa tab + whatsapp)
  useEffect(() => {
    if (!isVisaSource) return;
    const dashboardKey = source === 'facebook' ? 'visa' : 'whatsapp';
    const visaStreamUrl = import.meta.env.DEV
      ? `/visa-sse/dashboard/stream?platform=${source}`
      : `/api/visa-stream?platform=${source}`;
    const es = new EventSource(visaStreamUrl);

    es.onmessage = (event) => {
      try {
        setDashboard((current) => ({
          ...current,
          [dashboardKey]: transformSsePayload(JSON.parse(event.data)),
        }));
      } catch (e) {
        console.error('[SSE visa] parse error', e);
      }
    };

    es.onerror = () => console.warn('[SSE visa] connection error, browser will retry');

    return () => es.close();
  }, [source, isVisaSource]);

  // SSE live updates — real estate source
  useEffect(() => {
    if (source !== 'real-estate') return;
    const realEstateStreamUrl = import.meta.env.DEV
      ? '/real-estate-sse/estate/dashboard/stream'
      : '/api/real-estate-stream';
    const es = new EventSource(realEstateStreamUrl);

    es.onmessage = (event) => {
      try {
        const raw = JSON.parse(event.data);
        setDashboard((current) => ({
          ...current,
          realEstate: { ...raw, errors: {} },
        }));
      } catch (e) {
        console.error('[SSE real-estate] parse error', e);
      }
    };

    es.onerror = () => console.warn('[SSE real-estate] connection error, browser will retry');

    return () => es.close();
  }, [source]);

  const refreshDashboard = async () => {
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    setRefreshing(true);
    setLoading(true);
    loadedSources.current.delete(source);
    try {
      if (isVisaSource) {
        // Fire extraction and give Celery ~3s to process before re-fetching
        await triggerVisaExtraction({ signal: controller.signal }).catch(() => {});
        await new Promise((resolve) => setTimeout(resolve, 3000));
        if (controller.signal.aborted) return;
      }
      await loadSource(source, controller.signal, true);
    } finally {
      if (controller.signal.aborted) return;
      setLoading(false);
      setRefreshing(false);
      if (activeRequest.current === controller) activeRequest.current = null;
    }
  };

  const title = PLATFORM_LABELS[platform];
  const whatsappNumber = (
    import.meta.env.VITE_WHATSAPP_NUMBER || '923099104811'
  ).replace(/\D/g, '');
  const whatsappLiveExperienceUrl = whatsappNumber ? `https://wa.me/${whatsappNumber}` : null;
  const dashboardViews = [
    { id: 'realEstate', label: 'Real Estate' },
    { id: 'visa', label: 'Visa' },
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
          <div className="flex flex-wrap items-start gap-3">
            <button
              type="button"
              onClick={refreshDashboard}
              disabled={loading}
              className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} aria-hidden="true" />
              Refresh
            </button>
            {refreshing && platform === 'facebook' && (
              <p
                role="status"
                className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-900"
              >
                Recheck in 5 minutes
              </p>
            )}
          </div>
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
                  linkText="Click for live experience"
                />
              )}
              {activeView === 'realEstate' && (
                <LiveExperienceLink
                  label="Real Estate"
                  href="https://www.facebook.com/messages/t/1451401514714679"
                  platform="facebook"
                  linkText="Click for live experience"
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
                isVisaSource
                showConnectionStatus
              />
            )}
            {activeView === 'realEstate' && (
              <SourceDashboard
                label="Real Estate"
                data={dashboard.realEstate || EMPTY_SOURCE}
                loading={loading}
                showConnectionStatus
              />
            )}
          </>
        ) : (
          <SourceDashboard
            label={title}
            data={getChannelDashboardData(dashboard.whatsapp || EMPTY_SOURCE, 'whatsapp')}
            loading={loading}
            isVisaSource
          />
        )}
      </div>
    </main>
  );
}
