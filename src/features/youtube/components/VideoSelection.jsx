// Workspace panel: choose the one video LeadHive should monitor.
// Data: GET /selection-videos/{channel_id} lists uploads, POST /selection-videos/save saves exactly one.
import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUpRight, BarChart3, Check, MessageSquare, Play, RefreshCw, Search, ThumbsUp } from 'lucide-react'
import { setCommentMonitoring, YoutubeApiError, youtubeRequest } from '../api'
import { useYoutubeResource } from '../hooks'
import { getVideoItems } from '../videoPayload'

const VIDEO_LIMIT = 5
const DESCRIPTION_MAX = 800

// Backend fields -> the small shape this screen uses
function toVideo(raw) {
  return {
    id: raw.youtube_video_id,
    title: raw.title || 'Untitled video',
    description: raw.description || '',
    views: raw.views || 0,
    likes: raw.likes || 0,
    comments: raw.comments || 0,
    selected: Boolean(raw.selected), // true when this video was saved earlier
    descriptionRequired: true,
    thumbnail: raw.youtube_video_id ? `https://i.ytimg.com/vi/${raw.youtube_video_id}/mqdefault.jpg` : '',
  }
}

export function VideoSelection({ channel, video, onVideoSaved, onVideoPreview, commentsPanel }) {
  const channelId = channel?.id
  const [refresh, setRefresh] = useState(0)
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState(video?.id || null)
  // Descriptions the user typed, by video id (falls back to the video's own description)
  const [descriptions, setDescriptions] = useState(video ? { [video.id]: video.description } : {})
  const [savingId, setSavingId] = useState(null)
  const [saveError, setSaveError] = useState('')
  const [analyticsOpenId, setAnalyticsOpenId] = useState(video?.id || null)
  const [descriptionAttentionId, setDescriptionAttentionId] = useState(null)
  const [resettingMonitoring, setResettingMonitoring] = useState(false)
  const monitoringResetForVideo = useRef(null)

  const { data, error, loading } = useYoutubeResource(
    channelId ? `/selection-videos/${encodeURIComponent(channelId)}?limit=${VIDEO_LIMIT}` : null,
    refresh,
  )
  const videos = useMemo(
    () => getVideoItems(data).map(toVideo).filter(item => item.id),
    [data],
  )

  // On first load, restore the backend selection; older saved videos without descriptions need updating.
  // The ref stops this from running again later and overriding the user's own choice.
  const prefilled = useRef(false)
  useEffect(() => {
    if (prefilled.current || !videos.length) return
    prefilled.current = true
    if (video) return // already saved in this session
    const saved = videos.find(item => item.selected)
    if (!saved) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedId(saved.id)
    onVideoPreview?.({ id: saved.id, title: saved.title, description: saved.description })
    if (saved.description.trim()) {
      onVideoSaved({ id: saved.id, title: saved.title, description: saved.description })
      setAnalyticsOpenId(saved.id)
    } else {
      setDescriptionAttentionId(saved.id)
      onVideoSaved(null)
    }
  }, [videos, video, onVideoPreview, onVideoSaved])

  const descriptionFor = item => descriptions[item.id] ?? item.description
  const selected = videos.find(item => item.id === selectedId) || null
  const isSaved = Boolean(
    video &&
    selected &&
    video.id === selectedId &&
    video.description?.trim() === descriptionFor(selected).trim(),
  )

  const query = search.trim().toLowerCase()
  const filteredVideos = query
    ? videos.filter(item => `${item.title} ${descriptionFor(item)}`.toLowerCase().includes(query))
    : videos

  // Picking a video selects and saves it immediately.
  function selectVideo(id) {
    if (id === selectedId) return
    setSelectedId(id)
    if (!id) setDescriptionAttentionId(null)
    setAnalyticsOpenId(null)
    setSaveError('')
    if (video) onVideoSaved(null)
  }

  function updateDescription(id, value) {
    setDescriptions(current => ({ ...current, [id]: value.slice(0, DESCRIPTION_MAX) }))
    if (value.trim()) setDescriptionAttentionId(current => current === id ? null : current)
    if (value.trim()) setSaveError('')
    if (video) onVideoSaved(null)
  }

  async function saveVideo(item, description = descriptionFor(item)) {
    if (!item || savingId) return
    if (item.descriptionRequired && !description.trim()) {
      setSaveError('Add a video description before selecting this video.')
      return
    }
    if (item.id === video?.id && description.trim() === video.description?.trim()) return

    setSavingId(item.id)
    setSaveError('')
    try {
      await youtubeRequest('/selection-videos/save', {
        method: 'POST',
        body: {
          channel_id: channelId,
          videos: [{ youtube_video_id: item.id, description: description.trim() }],
        },
      })
      onVideoSaved({ id: item.id, title: item.title, description: description.trim() })
      setAnalyticsOpenId(item.id)
    } catch (err) {
      setSaveError(
        err instanceof YoutubeApiError && err.status === 401
          ? 'Your session expired. Go back to the Channel step and reconnect.'
          : err.message || 'Unable to save your video selection.',
      )
    } finally {
      setSavingId(null)
    }
  }

  async function handleSelect(item) {
    if (savingId || resettingMonitoring) return
    if (selectedId === item.id) {
      if (!isSaved) {
        if (!await disableMonitoringForSelection(item.id)) return
        await saveVideo(item)
        return
      }
      selectVideo('')
      onVideoPreview?.(null)
      monitoringResetForVideo.current = null
      await disableMonitoringForSelection(item.id)
      return
    }

    selectVideo(item.id)
    monitoringResetForVideo.current = null
    const description = descriptionFor(item)
    setDescriptionAttentionId(
      item.descriptionRequired && !description.trim() ? item.id : null,
    )
    onVideoPreview?.({ id: item.id, title: item.title, description })
    if (!await disableMonitoringForSelection(item.id)) return
    await saveVideo(item, description)
  }

  async function handleDescriptionBlur(item) {
    if (selectedId === item.id && !isSaved && descriptionFor(item).trim()) {
      if (!await disableMonitoringForSelection(item.id)) return
      saveVideo(item)
    }
  }

  async function disableMonitoringForSelection(id) {
    if (monitoringResetForVideo.current === id) return true

    setResettingMonitoring(true)
    try {
      const response = await setCommentMonitoring(false)
      if (response?.enabled !== false) {
        throw new Error('The server did not confirm that automatic comment monitoring was turned off.')
      }
      monitoringResetForVideo.current = id
      return true
    } catch (err) {
      setSaveError(
        err.message || 'Could not turn off automatic comment monitoring for the new video selection.',
      )
      return false
    } finally {
      setResettingMonitoring(false)
    }
  }

  // Safety net: Next is locked without a channel, but guard anyway
  if (!channel) {
    return <p className="text-sm text-gray-500">Select a channel in the first step.</p>
  }

  return (
    <section className="space-y-6">
      <header className="mb-6">
        <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
          Select a video to generate AI-powered replies to its comments.
        </h1>
      </header>

      {/* Load failure with retry */}
      {error && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => setRefresh(n => n + 1)}
            className="mt-2 rounded-lg border border-red-300 bg-white px-3 py-1 font-medium hover:bg-red-100"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.5fr)]">
        <section aria-labelledby="video-list-heading" className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 id="video-list-heading" className="text-lg font-bold text-gray-900">Select a video</h2>
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              selected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}>
              {selected ? '1 selected' : 'None selected'}
            </span>
          </div>

          <label className="mt-4 flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 focus-within:border-red-500">
            <Search size={16} className="shrink-0 text-gray-400" aria-hidden="true" />
            <span className="sr-only">Search videos</span>
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search videos..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </label>

          {loading && (
            <div className="mt-4 space-y-4" role="status" aria-label="Loading videos">
              {Array.from({ length: 3 }, (_, index) => (
                <article key={index} className="rounded-xl border-2 border-gray-200 p-3">
                  <div className="flex gap-3">
                    <div className="lh-youtube-skeleton aspect-video w-28 shrink-0 rounded-lg" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="lh-youtube-skeleton h-4 w-4/5 rounded-full" />
                      <div className="lh-youtube-skeleton h-3 w-2/3 rounded-full" />
                    </div>
                  </div>
                  <div className="lh-youtube-skeleton mt-4 h-20 rounded-lg" />
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="lh-youtube-skeleton h-9 rounded-lg" />
                    <div className="lh-youtube-skeleton h-9 rounded-lg" />
                  </div>
                </article>
              ))}
            </div>
          )}
          {!loading && !videos.length && !error && (
            <p className="mt-4 text-sm text-gray-500">
              No channel content found. Make sure your connected YouTube channel has public videos.
            </p>
          )}
          {!loading && videos.length > 0 && !filteredVideos.length && (
            <p className="mt-4 text-sm text-gray-500">No videos match your search.</p>
          )}

          {!loading && <div className="mt-4 space-y-4">
            {filteredVideos.map(item => {
              const isSelected = selectedId === item.id
              const text = descriptionFor(item)
              const missing = item.descriptionRequired && !text.trim()

              return (
                <article
                  key={item.id}
                  className={`rounded-xl border-2 p-3 transition ${
                    isSelected ? 'border-red-500 bg-red-50/60' : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="grid grid-cols-[minmax(96px,0.8fr)_minmax(0,1.4fr)] items-center gap-3">
                    <a
                      href={`https://www.youtube.com/watch?v=${encodeURIComponent(item.id)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Watch ${item.title} on YouTube`}
                      className="relative block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                    >
                      <img
                        src={item.thumbnail}
                        alt=""
                        loading="lazy"
                        onError={e => { e.currentTarget.style.display = 'none' }}
                        className="aspect-video w-full rounded-lg bg-gray-100 object-cover"
                      />
                      <span className="absolute right-1 top-1 inline-flex items-center gap-1 rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-medium text-white">
                        <Play size={10} fill="currentColor" aria-hidden="true" /> YouTube
                      </span>
                    </a>
                    <div className="min-w-0">
                      <h3 className="font-semibold leading-5 text-gray-900">{item.title}</h3>
                    </div>
                  </div>

                  <div className="mt-3">
                    <label htmlFor={`video-description-${item.id}`} className="block text-xs font-medium text-gray-600">
                      Video description <span className="font-normal text-amber-700">(required)</span>
                    </label>
                    <textarea
                      id={`video-description-${item.id}`}
                      rows={3}
                      maxLength={DESCRIPTION_MAX}
                      value={text}
                      required
                      onChange={e => {
                        updateDescription(item.id, e.target.value)
                        if (isSelected) {
                          onVideoPreview?.({ id: item.id, title: item.title, description: e.target.value })
                        }
                      }}
                      onBlur={() => handleDescriptionBlur(item)}
                      disabled={!isSelected || isSaved}
                      title={isSelected && isSaved ? 'Description is locked after selecting this video.' : undefined}
                      placeholder="Describe what this video is about..."
                      aria-invalid={Boolean(isSelected && missing)}
                      className={`mt-1 w-full resize-y rounded-lg border bg-white px-3 py-2 text-sm leading-5 text-gray-700 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 ${
                        descriptionAttentionId === item.id && missing
                          ? 'lh-description-attention border-amber-500'
                          : 'border-gray-300'
                      }`}
                    />
                    <div className="mt-1 flex items-start justify-between gap-2 text-[11px] leading-4 text-gray-500">
                      <small>The description helps LeadHive understand the video context for AI-generated engagement.</small>
                      <span className="shrink-0">{text.length} / {DESCRIPTION_MAX}</span>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => handleSelect(item)}
                      disabled={Boolean(savingId) || resettingMonitoring}
                      className={`inline-flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold ${
                        isSelected
                          ? 'border-red-200 bg-red-50 text-red-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {savingId === item.id
                        ? 'Saving...'
                        : isSelected
                          ? isSaved
                            ? <><Check size={15} aria-hidden="true" /> Selected · Unselect</>
                            : missing
                              ? 'Add description'
                              : 'Retry selection'
                          : 'Select this video'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setAnalyticsOpenId(current => current === item.id ? null : item.id)}
                      disabled={Boolean(savingId) || resettingMonitoring || !isSelected || !isSaved}
                      title={isSaved ? undefined : 'Select and save this video to view its analytics.'}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <BarChart3 size={16} aria-hidden="true" />
                      {analyticsOpenId === item.id ? 'Hide analytics' : 'View analytics'}
                    </button>
                  </div>

                  {analyticsOpenId === item.id && (
                    <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-3" aria-label="Video analytics">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-medium text-gray-600">Video analytics</p>
                        <button
                          type="button"
                          onClick={() => setRefresh(value => value + 1)}
                          disabled={loading}
                          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                          aria-label="Refresh video analytics"
                        >
                          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} aria-hidden="true" />
                          Refresh
                        </button>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {[
                          ['Views', item.views, Play],
                          ['Likes', item.likes, ThumbsUp],
                          ['Comments', item.comments, MessageSquare],
                        ].map(([label, value, Icon]) => (
                          <div key={label} className="rounded-lg bg-white p-2 text-center">
                            <Icon size={15} className="mx-auto text-red-600" aria-hidden="true" />
                            <p className="mt-1 text-[11px] text-gray-500">{label}</p>
                            <p className="text-sm font-semibold text-gray-900">{Number(value).toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </article>
              )
            })}
          </div>}

          {saveError && (
            <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {saveError}
            </p>
          )}
        </section>

        <section aria-labelledby="video-comments-heading" className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="border-b border-gray-100 pb-4">
            <div className="flex items-start">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 id="video-comments-heading" className="text-lg font-semibold text-gray-900">Comments &amp; AI replies</h2>
                    {selected && <p className="mt-0.5 truncate text-xs text-gray-500">{selected.title}</p>}
                  </div>
                  {selected && (
                    <div className="flex w-full min-w-0 flex-col items-start gap-1.5 rounded-lg border border-red-100 bg-red-50/50 p-2 sm:w-64 sm:shrink-0">
                      <a
                        href={`https://www.youtube.com/watch?v=${encodeURIComponent(selected.id)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-md bg-white px-2.5 py-1.5 text-xs font-semibold text-red-700 shadow-sm ring-1 ring-red-100 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                      >
                        Open on YouTube <ArrowUpRight size={13} aria-hidden="true" />
                      </a>
                      <p className="text-[11px] leading-4 text-gray-600">
                        Open this video on YouTube to view it, check its comments, and try posting a comment directly on YouTube.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          {commentsPanel}
        </section>
      </div>
    </section>
  )
}
