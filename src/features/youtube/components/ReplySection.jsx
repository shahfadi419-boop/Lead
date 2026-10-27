// Step 4 of FlowWidget: review saved comments and configure background monitoring.
// Data: GET /auth/comment-monitoring, GET /comments/{channel_id}/{video_id},
// PUT /auth/comment-monitoring.
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  CornerDownRight,
  Info,
  MessageSquare,
  ThumbsUp,
} from 'lucide-react'
import {
  getCommentMonitoring,
  setCommentMonitoring,
  YoutubeApiError,
  youtubeRequest,
} from '../api'
import { useYoutubeResource } from '../hooks'

const enc = encodeURIComponent
const COMMENTS_POLL_INTERVAL_MS = 10_000

// The comments response shape isn't in the OpenAPI spec, so accept the likely variations
function toComment(raw, channelId) {
  if (!raw || typeof raw !== 'object') return null
  const inner = raw.snippet?.topLevelComment?.snippet || raw.snippet || raw
  const text =
    inner.text ||
    inner.textDisplay ||
    inner.textOriginal ||
    inner.comment_text ||
    inner.commentText ||
    (typeof inner.comment === 'string' ? inner.comment : '') ||
    ''
  const id =
    raw.youtube_comment_id ||
    raw.id ||
    raw.comment_id ||
    inner.id ||
    text.slice(0, 20)
  const aiReply = raw.ai_reply || raw.aiReply || ''
  const replyStatus = raw.reply_status || raw.replyStatus || ''
  const authorChannelId =
    (typeof inner.authorChannelId === 'string' ? inner.authorChannelId : inner.authorChannelId?.value) ||
    inner.author_channel_id ||
    inner.author_channel?.id ||
    (typeof raw.authorChannelId === 'string' ? raw.authorChannelId : raw.authorChannelId?.value) ||
    raw.author_channel_id ||
    ''
  const canReply = raw.can_reply ?? raw.canReply
  const explicitlyReplied =
    raw.is_replied === true ||
    raw.isReplied === true ||
    raw.replied === true ||
    raw.has_reply === true ||
    raw.hasReply === true ||
    replyStatus === 'posted' ||
    Boolean(raw.youtube_reply_id || raw.youtubeReplyId)
  const awaitingReply =
    !explicitlyReplied &&
    (raw.awaiting_reply === true ||
      raw.awaitingReply === true ||
      ['draft', 'failed'].includes(replyStatus)) &&
    (!channelId || authorChannelId !== channelId) &&
    canReply !== false &&
    Boolean(text.trim())

  return {
    id,
    author:
      inner.author ||
      inner.authorDisplayName ||
      inner.author_display_name ||
      inner.author_name ||
      'Unknown',
    text,
    published: inner.published_at || inner.publishedAt || inner.created_at || inner.published || '',
    likes: Number(inner.likes ?? inner.likeCount ?? inner.like_count ?? 0) || 0,
    isReplied: explicitlyReplied,
    awaitingReply,
    aiReply,
    authorChannelId,
    isAiReply:
      raw.is_ai_reply === true ||
      raw.isAiReply === true ||
      raw.ai_generated === true ||
      raw.aiGenerated === true,
    // Replies to this comment (same shape as a comment)
    replies: Array.isArray(raw.replies)
      ? raw.replies.map(reply => toComment(reply, channelId)).filter(Boolean)
      : [],
  }
}

// Accept a plain list or a list inside common API response envelopes
function toComments(payload, channelId) {
  const candidates = [
    payload,
    payload?.comments,
    payload?.items,
    payload?.data,
    payload?.data?.comments,
    payload?.data?.items,
    payload?.results,
    payload?.youtube_comments,
  ]
  const list = candidates.find(Array.isArray) || []
  return list.map(comment => toComment(comment, channelId)).filter(Boolean)
}

function countAwaitingReplies(comments) {
  return comments.reduce(
    (total, comment) =>
      total + Number(comment.awaitingReply) + countAwaitingReplies(comment.replies),
    0,
  )
}

function formatTime(value) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

function normalizedText(value) {
  return value.trim().toLowerCase()
}

function matchesStoredAiReply(reply, parentComment) {
  const aiReplyText = normalizedText(parentComment.aiReply)
  return Boolean(aiReplyText && normalizedText(reply.text) === aiReplyText)
}

function findAiAuthor(replies, parentComment) {
  for (const reply of replies) {
    if (reply.isAiReply || matchesStoredAiReply(reply, parentComment)) {
      if (reply.authorChannelId || reply.author !== 'Unknown') {
        return {
          channelId: reply.authorChannelId,
          author: normalizedText(reply.author),
        }
      }
    }

    const nestedAuthor = findAiAuthor(reply.replies, parentComment)
    if (nestedAuthor) return nestedAuthor
  }

  return null
}

function isAiReply(reply, parentComment, aiAuthor) {
  if (reply.isAiReply || matchesStoredAiReply(reply, parentComment)) return true
  if (!aiAuthor) return false
  if (aiAuthor.channelId && reply.authorChannelId) {
    return reply.authorChannelId === aiAuthor.channelId
  }
  return Boolean(aiAuthor.author && normalizedText(reply.author) === aiAuthor.author)
}

function ReplyItem({ reply, parentComment, aiAuthor }) {
  const aiReply = isAiReply(reply, parentComment, aiAuthor)
  return (
    <div
      className={`rounded-lg border p-3 ${aiReply ? 'border-green-200 bg-green-50/40' : 'border-gray-200 bg-gray-50'}`}
    >
      <header className="flex items-center justify-between gap-2">
        <div>
          <strong className="text-sm text-gray-900">{reply.author}</strong>
          {reply.published && (
            <time className="ml-2 text-xs text-gray-400">{formatTime(reply.published)}</time>
          )}
        </div>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
          aiReply ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'
        }`}>
          {aiReply ? 'AI reply' : 'User reply'}
        </span>
      </header>

      <p className="mt-1 break-words text-sm text-gray-700">{reply.text}</p>

      {reply.likes > 0 && (
        <span className="mt-2 inline-flex items-center gap-1 text-xs text-gray-500">
          <ThumbsUp size={13} /> {reply.likes}
        </span>
      )}

      <ReplyThread
        replies={reply.replies}
        parentComment={parentComment}
        aiAuthor={aiAuthor}
        nested
      />
    </div>
  )
}

// Replies under a comment, with AI-posted replies distinguished from other authors.
function ReplyThread({ replies, parentComment, aiAuthor, nested = false }) {
  if (!replies.length) return null
  return (
    <div className={`${nested ? 'ml-5 mt-3' : 'ml-12 mt-3 border-l-2 border-gray-200 pl-4'} space-y-3`}>
      {!nested && (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500">
          <CornerDownRight size={13} />
          {replies.length} {replies.length === 1 ? 'thread reply' : 'thread replies'}
        </span>
      )}
      {replies.map(reply => (
        <ReplyItem
          key={reply.id}
          reply={reply}
          parentComment={parentComment}
          aiAuthor={aiAuthor}
        />
      ))}
    </div>
  )
}

export function ReplySection({ channel, video }) {
  const channelId = channel?.id
  const videoId = video?.id
  const [refresh, setRefresh] = useState(0)
  const [monitoringState, setMonitoringState] = useState({
    loading: true,
    saving: false,
    enabled: false,
    error: '',
  })
  const monitoringSavingRef = useRef(false)
  const [posting, setPosting] = useState(false)
  const [postError, setPostError] = useState('')
  const [postResult, setPostResult] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    async function loadMonitoringPreference() {
      try {
        const response = await getCommentMonitoring({ signal: controller.signal })
        if (typeof response?.enabled !== 'boolean') {
          throw new Error('The server returned an invalid comment monitoring setting.')
        }
        setMonitoringState({ loading: false, saving: false, enabled: response.enabled, error: '' })
        setRefresh(value => value + 1)
      } catch (err) {
        if (controller.signal.aborted) return
        setMonitoringState({
          loading: false,
          saving: false,
          enabled: false,
          error: err.message || 'Could not load the comment monitoring setting.',
        })
      }
    }

    loadMonitoringPreference()
    return () => controller.abort()
  }, [])

  const { data, error, loading } = useYoutubeResource(
    !monitoringState.loading && channelId && videoId
      ? `/comments/${enc(channelId)}/${enc(videoId)}`
      : null,
    refresh,
      COMMENTS_POLL_INTERVAL_MS,
  )

  const comments = useMemo(() => toComments(data, channelId), [data, channelId])
  const replyCount = useMemo(
    () => comments.reduce((total, comment) => total + comment.replies.length, 0),
    [comments],
  )
  const unreplied = comments.filter(comment => !comment.isReplied).length
  const awaitingReplyCount = useMemo(() => countAwaitingReplies(comments), [comments])
  const allReplied = comments.length > 0 && unreplied === 0

  async function toggleAutomaticReplies() {
    if (monitoringState.loading || monitoringSavingRef.current) return

    const wasEnabled = monitoringState.enabled
    const enabled = !wasEnabled
    monitoringSavingRef.current = true

    setMonitoringState({ loading: false, saving: true, enabled: false, error: '' })
    try {
      const response = await setCommentMonitoring(enabled)
      if (typeof response?.enabled !== 'boolean' || response.enabled !== enabled) {
        throw new Error('The server did not confirm the requested comment monitoring setting.')
      }
      setMonitoringState({ loading: false, saving: false, enabled, error: '' })
      setRefresh(value => value + 1)
      monitoringSavingRef.current = false
      setPostError('')
      setPostResult(null)
      if (enabled) {
        setPosting(true)
        try {
          const result = await youtubeRequest(
            `/ai/${enc(channelId)}/${enc(videoId)}/generate-and-post-replies`,
            { method: 'POST' },
          )
          setPostResult(result)
          setRefresh(value => value + 1)
        } catch (error) {
          setPostError(
            error instanceof YoutubeApiError && error.status === 401
              ? 'Your session expired. Reconnect your YouTube channel.'
              : error.message || 'Could not process saved comments. The background monitor will continue retrying.',
          )
        } finally {
          setPosting(false)
        }
      }
    } catch (err) {
      monitoringSavingRef.current = false
      setMonitoringState({
        loading: false,
        saving: false,
        enabled: wasEnabled,
        error: err.message || 'Could not update the comment monitoring setting.',
      })
      if (wasEnabled) setRefresh(value => value + 1)
      return
    }
  }

  // Safety net: Next is locked until a video is saved, but guard anyway
  if (!channel || !video) {
    return <p className="text-sm text-gray-500">Select and save a video in the previous step first.</p>
  }

  return (
    <section className="space-y-6">
      {/* Heading */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Operations Console</p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">AI Command Center</h1>
        <p className="mt-2 text-sm text-gray-600">
          Review saved comments here. The background monitor processes eligible unreplied comments when enabled.
        </p>
      </div>

      {/* Monitored video card */}
      <section
        aria-labelledby="monitored-video-title"
        className="flex flex-wrap items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
      >
        <img
          src={`https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`}
          alt=""
          onError={e => { e.currentTarget.style.display = 'none' }}
          className="h-20 w-36 rounded-lg bg-gray-100 object-cover"
        />

        <div className="min-w-0 flex-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Monitored video</span>
          <h2 id="monitored-video-title" className="truncate text-lg font-semibold text-gray-900">
            {video.title}
          </h2>
          <span className="text-xs text-gray-500">Video ID: {videoId}</span>
        </div>

        <a
          href={`https://www.youtube.com/watch?v=${enc(videoId)}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Open on YouTube <ArrowUpRight size={15} />
        </a>
      </section>

      {/* Video context */}
      <section
        aria-labelledby="video-context-title"
        className="flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4"
      >
        <span className="text-blue-600" aria-hidden="true">
          <Info size={18} />
        </span>
        <div>
          <h2 id="video-context-title" className="text-sm font-semibold text-gray-900">
            About this video
          </h2>
          <p className="text-sm text-gray-600">{video.description || 'No video context provided.'}</p>
        </div>
      </section>

      {/* Comments and automatic reply controls */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-blue-600" aria-hidden="true">
              <MessageSquare size={20} />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Comments</h2>
              <p className="text-sm text-gray-500">
                {monitoringState.enabled
                  ? 'Monitoring is on. The background service checks comments and processes eligible unreplied comments.'
                  : 'Monitoring is off. Saved comments and the awaiting reply count remain visible; no automatic checks or replies run.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div aria-label="Comment and reply counts" className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
              </span>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                {replyCount} {replyCount === 1 ? 'thread reply' : 'thread replies'}
              </span>
              <span className={`rounded-full px-3 py-1 text-sm font-medium ${
                awaitingReplyCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-700'
              }`}>
                {awaitingReplyCount} awaiting AI reply
              </span>
            </div>
            {monitoringState.enabled && posting && (
              <span role="status" className="text-sm font-medium text-cyan-800">
                Processing saved comments...
              </span>
            )}
            <button
              type="button"
              onClick={toggleAutomaticReplies}
              disabled={monitoringState.loading || monitoringState.saving}
              aria-pressed={monitoringState.enabled}
              role="switch"
              aria-checked={monitoringState.enabled}
              aria-label="Automatic comment monitoring"
              className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60 ${
                monitoringState.enabled ? 'bg-green-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${
                  monitoringState.enabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="min-w-8 text-sm font-semibold text-gray-700">
              {monitoringState.loading ? 'Loading' : monitoringState.saving ? 'Saving' : monitoringState.enabled ? 'On' : 'Off'}
            </span>
          </div>
        </header>

        {monitoringState.error && (
          <div role="alert" className="mt-4 flex gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={18} className="shrink-0" />
            <div>
              <strong>Could not update comment monitoring.</strong>
              <p>{monitoringState.error}</p>
            </div>
          </div>
        )}

        {postError && (
          <div role="alert" className="mt-4 flex gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={18} className="shrink-0" />
            <div>
              <strong>Could not process saved comments.</strong>
              <p>{postError}</p>
            </div>
          </div>
        )}

        {postResult && (
          <div role="status" className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            {Math.max(0, Number(postResult.posted) || 0)} replies posted;{' '}
            {Math.max(0, Number(postResult.failed) || 0)} failed.
          </div>
        )}

        {allReplied && (
          <p role="status" className="mt-4 flex items-center gap-2 text-sm font-medium text-green-700">
            <CheckCircle2 size={18} /> All comments have been replied to.
          </p>
        )}

        <div className="mt-5 space-y-4">
            {loading && (
              <p role="status" className="text-sm text-gray-500">
                {comments.length > 0 ? 'Updating comments…' : 'Loading comments…'}
              </p>
            )}
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

            {!loading && !error && comments.length === 0 && (
              <p className="text-sm text-gray-500">
                No comments found for this video yet. As viewers comment on YouTube, they will appear here.
              </p>
            )}

            {comments.map(comment => (
              <article
                key={comment.id}
                className={
                  'rounded-xl border p-4 ' +
                  (comment.isReplied ? 'border-green-200 bg-green-50/40' : 'border-gray-200 bg-white')
                }
              >
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-600">
                    <span aria-hidden="true">{comment.author.charAt(0).toUpperCase() || '?'}</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <header className="flex items-center justify-between gap-2">
                      <div>
                        <strong className="text-sm text-gray-900">{comment.author}</strong>
                        {comment.published && (
                          <time className="ml-2 text-xs text-gray-400">{formatTime(comment.published)}</time>
                        )}
                      </div>
                      {comment.isReplied && (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          Reply posted
                        </span>
                      )}
                    </header>
                    <p className="mt-1 break-words text-sm text-gray-700">{comment.text}</p>
                    {comment.likes > 0 && (
                      <span className="mt-2 inline-flex items-center gap-1 text-xs text-gray-500">
                        <ThumbsUp size={13} /> {comment.likes}
                      </span>
                    )}
                  </div>
                </div>

                {comment.isReplied && (
                  <aside aria-label="Final posted reply" className="ml-12 mt-3 rounded-lg bg-white p-3 text-sm">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700">
                      <CheckCircle2 size={15} /> Final posted reply
                    </span>
                    <p className="mt-1 break-words text-gray-700">
                      {comment.aiReply || 'Reply posted on YouTube.'}
                    </p>
                  </aside>
                )}

                <ReplyThread
                  replies={comment.replies}
                  parentComment={comment}
                  aiAuthor={findAiAuthor(comment.replies, comment)}
                />
              </article>
            ))}
        </div>
      </div>
    </section>
  )
}
