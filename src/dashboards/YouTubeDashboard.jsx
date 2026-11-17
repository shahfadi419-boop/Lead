import { useEffect, useState } from 'react';
import { ArrowLeft, ExternalLink, Play, RefreshCw } from 'lucide-react';
import { getYouTubePinnedAnalytics } from './api';

const LIVE_EXPERIENCE_URL = 'https://www.youtube.com/watch?v=DYdVbE-c8co';
const INTERACTIVE_DEMO_URL = 'https://lead-old-draft.vercel.app/interactive-demo-2';
const AUTO_REPLIES_URL = 'https://lead-old-draft.vercel.app/flow?step=1';

function formatNumber(value) {
  return typeof value === 'number' && Number.isFinite(value)
    ? value.toLocaleString()
    : '—';
}

function Skeleton({ className = '' }) {
  return (
    <span
      aria-hidden="true"
      className={`block animate-pulse rounded bg-slate-200 ${className}`}
    />
  );
}

function YouTubeMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="currentColor"
        d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8Z"
      />
      <path fill="white" d="m9.6 15.6 6.2-3.6-6.2-3.6z" />
    </svg>
  );
}

function StatsCard({ label, value, loading, bordered = false }) {
  return (
    <div className={`min-h-24 px-5 py-4 ${bordered ? 'border-l border-slate-200' : ''}`}>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold leading-none text-slate-900">
        {loading ? (
          <Skeleton className="h-6 w-20" />
        ) : formatNumber(value)}
      </p>
    </div>
  );
}

export function YouTubeDashboard({ onNavigate }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    setAnalytics(null);

    getYouTubePinnedAnalytics({ signal: controller.signal })
      .then((response) => {
        if (!controller.signal.aborted) setAnalytics(response);
      })
      .catch((requestError) => {
        if (!controller.signal.aborted) setError(requestError.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [refreshKey]);

  const unansweredCount = Array.isArray(analytics?.unanswered_comments)
    ? analytics.unanswered_comments.length
    : 0;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-7xl space-y-5">
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
            <p className="text-sm text-slate-500">YouTube comment monitoring</p>
            <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white">
                <Play className="h-4 w-4 fill-current" aria-hidden="true" />
              </span>
              YouTube Video Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Pinned channel and video comment performance.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setRefreshKey((key) => key + 1)}
            disabled={loading}
            className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} aria-hidden="true" />
            Refresh
          </button>
        </header>

        <section aria-label="YouTube live experiences" className="grid grid-cols-1 items-start gap-4 md:grid-cols-3">
          <div className="min-w-0">
            <a
              href={LIVE_EXPERIENCE_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open YouTube Video"
              className="relative inline-flex h-14 w-full items-center justify-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-center text-base font-semibold text-rose-800 shadow-sm transition hover:-translate-y-0.5 hover:border-rose-300 hover:bg-rose-100 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 sm:px-6"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#FF0000] shadow-sm">
                <YouTubeMark />
              </span>
              <span>YouTube Video</span>
              <ExternalLink size={18} className="shrink-0" aria-hidden="true" />
            </a>
            <p className="mt-2 min-h-10 text-sm leading-5 text-slate-600">
              Leave a YouTube comment and track how many comments are still waiting for a reply:{' '}
              {loading ? (
                <Skeleton className="inline-block h-4 w-5 align-middle" />
              ) : error ? (
                'Count unavailable'
              ) : (
                unansweredCount.toLocaleString()
              )}
            </p>
          </div>
          <div className="min-w-0">
            <a
              href={INTERACTIVE_DEMO_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open Interactive Demo"
              className="relative inline-flex h-14 w-full items-center justify-center gap-3 rounded-xl border border-indigo-200 bg-white px-4 py-3 text-center text-base font-bold text-indigo-800 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 sm:px-6"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-[#FF0000]">
                <YouTubeMark />
              </span>
              <span>Interactive Demo</span>
              <ExternalLink size={18} className="shrink-0" aria-hidden="true" />
            </a>
            <p className="mt-2 min-h-10 text-sm leading-5 text-slate-600">
              Curious how it works? Explore our interactive demo and experience AI-powered YouTube engagement in action.
            </p>
          </div>
          <div className="min-w-0">
            <a
              href={AUTO_REPLIES_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open AI Auto Replies demo"
              className="relative inline-flex h-14 w-full items-center justify-center gap-3 rounded-xl border border-[#D90000] bg-[#FF0000] px-4 py-3 text-center text-base font-extrabold text-white shadow-md shadow-red-200/70 transition hover:-translate-y-0.5 hover:border-[#B80000] hover:bg-[#E60000] hover:shadow-lg hover:shadow-red-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 sm:px-6"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#FF0000] shadow-sm">
                <YouTubeMark />
              </span>
              <span>AI Auto Replies</span>
              <ExternalLink size={18} className="shrink-0" aria-hidden="true" />
            </a>
            <p className="mt-2 min-h-10 text-sm leading-5 text-slate-600">
              Let AI understand your business and video context to generate personalized, relevant replies to your audience.
            </p>
          </div>
        </section>

        {error && (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </p>
        )}

        <div className="grid gap-5 lg:grid-cols-2">
          <section
            aria-label="YouTube channel statistics"
            className="overflow-hidden rounded-xl border border-slate-200 bg-white"
          >
            <div className="border-b border-slate-200 px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-red-600">Channel</p>
              <h2 className="mt-1 break-words text-lg font-bold text-slate-900">
                {analytics?.channel_name || (loading ? <Skeleton className="mt-2 h-6 w-40" /> : 'Pinned channel')}
              </h2>
            </div>
            <div className="grid grid-cols-2">
              <StatsCard
                label="Subscribers"
                value={analytics?.channel_subscribers}
                loading={loading && !analytics}
              />
              <StatsCard
                label="Total Videos"
                value={analytics?.channel_total_videos}
                loading={loading && !analytics}
                bordered
              />
            </div>
          </section>

          <section
            aria-label="Selected YouTube video statistics"
            className="overflow-hidden rounded-xl border border-slate-200 bg-white"
          >
            <div className="flex items-start gap-3 border-b border-slate-200 px-5 py-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                <Play className="h-4 w-4 fill-current" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-red-600">Pinned video</p>
                <h2 className="mt-1 break-words text-lg font-bold text-slate-900">
                  {analytics?.video_title || (loading ? <Skeleton className="mt-2 h-6 w-52 max-w-full" /> : 'Pinned video')}
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-2">
              <StatsCard
                label="Views"
                value={analytics?.video_views}
                loading={loading && !analytics}
              />
              <StatsCard
                label="Likes"
                value={analytics?.video_likes}
                loading={loading && !analytics}
                bordered
              />
            </div>
          </section>
        </div>

        <section
          aria-label="Pinned video comment metrics"
          className="overflow-hidden rounded-xl border border-slate-200 bg-white"
        >
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">Comment Overview</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2">
            <StatsCard
              label="Total Video Comments"
              value={analytics?.video_comment_count}
              loading={loading}
            />
            <StatsCard
              label="Comments Without Channel Reply"
              value={unansweredCount}
              loading={loading}
              bordered
            />
          </div>
        </section>
      </div>
    </main>
  );
}
