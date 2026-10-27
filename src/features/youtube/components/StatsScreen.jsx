// Step 5 of FlowWidget: live channel and monitored-video dashboard.
// Loads channel analytics and GET /analytics/selected-videos/{channel.id}/{video.id}.
import { useMemo, useState } from 'react'
import {
  ArrowUpRight,
  BarChart3,
  Eye,
  ImageIcon,
  MessageSquare,
  RefreshCw,
  ThumbsUp,
  Users,
} from 'lucide-react'
import { useYoutubeResource } from '../hooks'
import { FlowLoader } from './FlowLoader'

function formatMetric(value) {
  if (value === null || value === undefined || value === '') return '—'
  const number = Number(value)
  return Number.isFinite(number) ? number.toLocaleString() : String(value)
}

function MetricCard({ label, value, description, Icon, iconStyle }) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <strong className="mt-2 block text-3xl font-bold tracking-tight text-gray-900">
            {formatMetric(value)}
          </strong>
        </div>
        <span className={`rounded-xl p-2.5 ${iconStyle}`} aria-hidden="true">
          <Icon size={19} />
        </span>
      </div>
      <p className="mt-3 text-xs text-gray-400">{description}</p>
    </article>
  )
}

export function StatsScreen({ channel, video }) {
  const [refresh, setRefresh] = useState(0)
  const path =
    channel?.id && video?.id
      ? `/analytics/selected-videos/${encodeURIComponent(channel.id)}/${encodeURIComponent(video.id)}`
      : null

  const {
    data: analytics,
    error: analyticsError,
    loading: analyticsLoading,
  } = useYoutubeResource(path, refresh)
  const {
    data: channelList,
    error: channelError,
    loading: channelLoading,
  } = useYoutubeResource(channel?.id ? '/auth/channels' : null, refresh)

  const channelMetrics = useMemo(
    () => Array.isArray(channelList)
      ? channelList.find(item => item.youtube_channel_id === channel?.id) || null
      : null,
    [channelList, channel?.id],
  )

  if (analyticsLoading) {
    return <FlowLoader message="Loading your analytics dashboard..." />
  }

  if (analyticsError || !analytics) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
        <p className="text-sm text-red-700">
          {analyticsError || 'Analytics are not available for this video yet.'}
        </p>
        <button
          type="button"
          onClick={() => setRefresh(value => value + 1)}
          className="mt-3 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    )
  }

  const videoId = analytics.youtube_video_id || video?.id
  const videoTitle = analytics.title || video?.title || 'Monitored video'
  const thumbnail =
    analytics.thumbnail || video?.thumbnail || video?.thumbnail_url ||
    (videoId ? `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg` : '')
  const channelName = analytics.channel_name || channel?.name || 'Connected channel'

  const channelStats = [
    {
      label: 'Subscribers',
      value: channelMetrics?.channel_subscribers ?? channel?.subscribers,
      description: 'Channel audience',
      Icon: Users,
      iconStyle: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Channel views',
      value: channelMetrics?.channel_views ?? channel?.views,
      description: 'Lifetime channel views',
      Icon: BarChart3,
      iconStyle: 'bg-indigo-50 text-indigo-600',
    },
  ]

  const videoStats = [
    {
      label: 'Views',
      value: analytics.views,
      description: 'Views on this video',
      Icon: Eye,
      iconStyle: 'bg-cyan-50 text-cyan-700',
    },
    {
      label: 'Likes',
      value: analytics.likes,
      description: 'Likes on this video',
      Icon: ThumbsUp,
      iconStyle: 'bg-rose-50 text-rose-600',
    },
    {
      label: 'Comments',
      value: analytics.youtube_comment_count,
      description: 'Includes YouTube comments and AI-posted replies',
      Icon: MessageSquare,
      iconStyle: 'bg-violet-50 text-violet-600',
    },
  ]

  return (
    <section className="space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            YouTube analytics
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Performance overview
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Your channel and selected video, together in one place.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setRefresh(value => value + 1)}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          <RefreshCw size={16} aria-hidden="true" />
          Refresh analytics
        </button>
      </header>

      <section className="flex flex-wrap items-center gap-4 rounded-2xl border border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/70 p-5 shadow-sm">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-lg font-bold text-white shadow-sm">
          {channelName.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Connected YouTube channel
          </span>
          <h2 className="mt-0.5 truncate text-lg font-semibold text-gray-900">{channelName}</h2>
          {channel?.id && (
            <p className="mt-0.5 truncate text-xs text-gray-500">Channel ID: {channel.id}</p>
          )}
        </div>
      </section>

      <section aria-labelledby="channel-overview-title" className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 id="channel-overview-title" className="text-lg font-semibold text-gray-900">
              Channel metrics
            </h2>
            <p className="mt-1 text-sm text-gray-500">Audience and lifetime channel reach.</p>
          </div>
          {channelLoading && (
            <span className="text-xs text-gray-400" role="status">Updating channel metrics...</span>
          )}
          {channelError && (
            <span className="text-xs text-amber-700" role="status">
              Channel metrics are temporarily unavailable.
            </span>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {channelStats.map(stat => <MetricCard key={stat.label} {...stat} />)}
        </div>
      </section>

      <section aria-labelledby="video-overview-title" className="space-y-3">
        <div>
          <h2 id="video-overview-title" className="text-lg font-semibold text-gray-900">
            Video metrics
          </h2>
          <p className="mt-1 text-sm text-gray-500">Engagement for the video you are monitoring.</p>
        </div>

        <article className="flex flex-wrap items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt=""
              className="h-16 w-28 shrink-0 rounded-lg bg-gray-100 object-cover"
            />
          ) : (
            <div className="flex h-16 w-28 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
              <ImageIcon size={22} aria-hidden="true" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              {channelName}
            </span>
            <h3 className="mt-1 truncate text-lg font-semibold text-gray-900">{videoTitle}</h3>
            {videoId && <p className="mt-1 text-xs text-gray-500">Video ID: {videoId}</p>}
          </div>
          {videoId && (
            <a
              href={`https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Open on YouTube <ArrowUpRight size={15} />
            </a>
          )}
        </article>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {videoStats.map(stat => <MetricCard key={stat.label} {...stat} />)}
        </div>
      </section>
    </section>
  )
}
