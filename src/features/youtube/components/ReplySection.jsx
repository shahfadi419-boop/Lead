// Workspace panel: review saved comments and configure background monitoring.
// Data: GET /auth/comment-monitoring, GET /comments/{channel_id}/{video_id},
// PUT /auth/comment-monitoring.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  CornerDownRight,
  MessageSquare,
  RefreshCw,
  Sparkles,
  ThumbsUp,
  Video,
} from 'lucide-react'
import {
  getCommentMonitoring,
  setCommentMonitoring,
  YoutubeApiError,
  youtubeRequest,
} from '../api'
import { useYoutubeResource } from '../hooks'
import {
  getCommentFetchIntervalMs,
  toCommentFetchIntervalMinutes,
} from '../commentPolling'

const enc = encodeURIComponent

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
  const aiReply = typeof (raw.ai_reply || raw.aiReply) === 'string'
    ? raw.ai_reply || raw.aiReply
    : ''
  const replyStatus = String(raw.reply_status || raw.replyStatus || '').trim().toLowerCase()
  const authorChannelId =
    (typeof inner.authorChannelId === 'string' ? inner.authorChannelId : inner.authorChannelId?.value) ||
    inner.author_channel_id ||
    inner.author_channel?.id ||
    (typeof raw.authorChannelId === 'string' ? raw.authorChannelId : raw.authorChannelId?.value) ||
    raw.author_channel_id ||
    ''
  const canReply = raw.can_reply ?? raw.canReply
  const rawReplies = Array.isArray(raw.replies)
    ? raw.replies
    : Array.isArray(raw.replies?.comments)
      ? raw.replies.comments
      : []
  const replies = rawReplies
    .map(reply => toComment(reply, channelId))
    .filter(Boolean)
  const hasChannelReply = replies.some(reply => (
    reply.isAiReply ||
    (channelId && reply.authorChannelId === channelId) ||
    (aiReply && normalizedText(reply.text) === normalizedText(aiReply))
  ))
  const hasRepliedFlag =
    raw.is_replied === true ||
    raw.isReplied === true ||
    raw.replied === true ||
    raw.has_reply === true ||
    raw.hasReply === true
  const explicitlyReplied =
    (hasRepliedFlag && replies.length === 0) ||
    (/(^|[_\s-])(posted|replied|sent)([_\s-]|$)/.test(replyStatus) &&
      !/(failed|pending|not[_\s-]?posted)/.test(replyStatus)) ||
    Boolean(
      raw.youtube_reply_id ||
      raw.youtubeReplyId ||
      raw.posted_reply_id ||
      raw.postedReplyId
    ) ||
    Boolean(aiReply.trim()) ||
    hasChannelReply
  const awaitingReply =
    !explicitlyReplied &&
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
    canReply: canReply !== false,
    aiReply,
    authorChannelId,
    isAiReply:
      raw.is_ai_reply === true ||
      raw.isAiReply === true ||
      raw.ai_generated === true ||
      raw.aiGenerated === true,
    // Replies to this comment (same shape as a comment)
    replies,
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

function flattenCommentTree(comments) {
  return comments.flatMap(comment => [
    comment,
    ...flattenCommentTree(comment.replies),
  ])
}

function getReplySnapshot(comments) {
  return JSON.stringify(comments.map(comment => ({
    id: comment.id,
    author: comment.author,
    text: comment.text,
    published: comment.published,
    isReplied: comment.isReplied,
    aiReply: comment.aiReply,
    isAiReply: comment.isAiReply,
    replies: JSON.parse(getReplySnapshot(comment.replies)),
  })))
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

      {reply.isReplied && (
        <div className="ml-3 mt-3 rounded-lg border border-green-200 bg-white p-3 text-sm sm:ml-5">
          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700">
            <CheckCircle2 size={14} /> AI reply posted
          </span>
          <p className="mt-1 break-words text-gray-700">
            {reply.aiReply || 'Reply posted on YouTube.'}
          </p>
        </div>
      )}

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

export function ReplySection({
  channel,
  video,
  isVideoSaved = false,
  commentFetchInterval,
  onCommentFetchIntervalChange,
}) {
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
  const postingRef = useRef(false)
  const seenCommentsRef = useRef({ key: '', ids: new Set() })
  const previousEnabledRef = useRef(false)
  const [posting, setPosting] = useState(false)
  const [postError, setPostError] = useState('')
  const [postResult, setPostResult] = useState(null)
  const postRefreshAttemptRef = useRef(null)
  const postRefreshKeyRef = useRef('')
  const postReplySnapshotRef = useRef('')

  useEffect(() => {
    const controller = new AbortController()
    async function loadMonitoringPreference() {
      try {
        const response = await getCommentMonitoring({ signal: controller.signal })
        if (typeof response?.enabled !== 'boolean') {
          throw new Error('The server returned an invalid comment monitoring setting.')
        }
        const intervalMinutes = response.comment_fetch_interval_minutes
        if (
          intervalMinutes !== '' &&
          Number.isInteger(Number(intervalMinutes)) &&
          Number(intervalMinutes) >= 1 &&
          Number(intervalMinutes) <= 1440
        ) {
          onCommentFetchIntervalChange?.(Number(intervalMinutes))
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
  }, [onCommentFetchIntervalChange])

  const { data, error, loading } = useYoutubeResource(
    channelId && videoId
      ? `/comments/${enc(channelId)}/${enc(videoId)}`
      : null,
    refresh,
    getCommentFetchIntervalMs(commentFetchInterval),
  )

  const comments = useMemo(() => toComments(data, channelId), [data, channelId])
  const allComments = useMemo(() => flattenCommentTree(comments), [comments])
  const replyCount = useMemo(
    () => allComments.length - comments.length,
    [allComments, comments.length],
  )
  const unreplied = allComments.filter(comment => !comment.isReplied).length
  const awaitingReplyCount = useMemo(
    () => allComments.filter(comment => comment.awaitingReply).length,
    [allComments],
  )
  const allReplied = allComments.length > 0 && unreplied === 0

  const generateAndPostReplies = useCallback(async () => {
    if (!channelId || !videoId || postingRef.current) return

    postingRef.current = true
    postReplySnapshotRef.current = getReplySnapshot(comments)
    setPosting(true)
    setPostError('')
    try {
      const result = await youtubeRequest(
        `/ai/${enc(channelId)}/${enc(videoId)}/generate-and-post-replies`,
        { method: 'POST' },
      )
      setPostResult(result)
      postRefreshAttemptRef.current = 0
      postRefreshKeyRef.current = `${channelId}:${videoId}`
      setRefresh(value => value + 1)
    } catch (error) {
      setPostError(
        error instanceof YoutubeApiError && error.status === 401
          ? 'Your session expired. Reconnect your YouTube channel.'
          : error.message || 'Could not process saved comments. The background monitor will continue retrying.',
      )
    } finally {
      postingRef.current = false
      setPosting(false)
    }
  }, [channelId, comments, videoId])

  useEffect(() => {
    if (postRefreshAttemptRef.current === null || loading) return
    if (postRefreshKeyRef.current !== `${channelId}:${videoId}`) {
      postRefreshAttemptRef.current = null
      return
    }

    if (data && getReplySnapshot(comments) !== postReplySnapshotRef.current) {
      postRefreshAttemptRef.current = null
      return
    }

    if (postRefreshAttemptRef.current >= 10) {
      postRefreshAttemptRef.current = null
      return
    }

    const timeout = globalThis.setTimeout(() => {
      if (postRefreshAttemptRef.current === null) return
      postRefreshAttemptRef.current += 1
      setRefresh(value => value + 1)
    }, 1500)

    return () => globalThis.clearTimeout(timeout)
  }, [channelId, comments, data, loading, refresh, videoId])

  useEffect(() => {
    const justEnabled = monitoringState.enabled && !previousEnabledRef.current
    previousEnabledRef.current = monitoringState.enabled
    if (justEnabled) {
      generateAndPostReplies()
      return
    }

    if (loading || !data || !channelId || !videoId) return

    const key = `${channelId}:${videoId}`
    const seen = seenCommentsRef.current
    if (seen.key !== key) {
      seenCommentsRef.current = { key, ids: new Set(allComments.map(comment => comment.id)) }
      return
    }

    const newComments = allComments.filter(comment => !seen.ids.has(comment.id))
    newComments.forEach(comment => seen.ids.add(comment.id))

    const hasNewReplyableComment = newComments.some(comment => (
      comment.awaitingReply
    ))
    if (monitoringState.enabled && hasNewReplyableComment) {
      generateAndPostReplies()
    }
  }, [allComments, channelId, comments, data, generateAndPostReplies, loading, monitoringState.enabled, videoId])

  async function toggleAutomaticReplies() {
    if (!isVideoSaved || monitoringState.loading || monitoringSavingRef.current) return

    const wasEnabled = monitoringState.enabled
    const enabled = !wasEnabled
    monitoringSavingRef.current = true

    setMonitoringState({ loading: false, saving: true, enabled: false, error: '' })
    try {
      const response = await setCommentMonitoring(enabled, {
        commentFetchIntervalMinutes: toCommentFetchIntervalMinutes(commentFetchInterval),
      })
      if (typeof response?.enabled !== 'boolean' || response.enabled !== enabled) {
        throw new Error('The server did not confirm the requested comment monitoring setting.')
      }
      setMonitoringState({ loading: false, saving: false, enabled, error: '' })
      setRefresh(value => value + 1)
      monitoringSavingRef.current = false
      setPostError('')
      setPostResult(null)
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

  return (
    <div className="pt-4">
      {!video ? (
        <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
          <Video size={34} className="text-gray-300" aria-hidden="true" />
          <h3 className="mt-3 font-semibold text-gray-800">Choose a video to view its comments</h3>
        </div>
      ) : (
        <>
          <div aria-label="Comment and reply counts" className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
              </span>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                {replyCount} {replyCount === 1 ? 'thread reply' : 'thread replies'}
              </span>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                awaitingReplyCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-700'
              }`}>
                {awaitingReplyCount} awaiting AI reply
              </span>
            </div>
            <button
              type="button"
              onClick={() => setRefresh(value => value + 1)}
              disabled={!isVideoSaved || loading || monitoringState.saving}
              aria-label="Refresh comments"
              className="ml-auto inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 shadow-sm transition hover:border-red-300 hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
            >
              <RefreshCw size={15} aria-hidden="true" className={loading ? 'animate-spin' : ''} />
              {loading ? 'Refreshing...' : 'Refresh comments'}
            </button>
          </div>

          <div className={`mt-4 flex items-center justify-between gap-4 rounded-2xl border p-4 shadow-sm transition-all sm:p-5 ${
            monitoringState.enabled
              ? 'border-red-300 bg-gradient-to-r from-red-50 via-white to-rose-50 shadow-red-100'
              : 'border-red-100 bg-gradient-to-r from-red-50 via-white to-rose-50'
          }`}>
            <div className="flex min-w-0 items-center gap-3">
              <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-100 bg-white shadow-sm">
                <svg width="24" height="18" viewBox="0 0 24 18" aria-hidden="true">
                  <rect x="1" y="1" width="22" height="16" rx="5" fill="#ff0033" />
                  <path d="M10 5v8l6-4-6-4Z" fill="white" />
                </svg>
                <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-cyan-500 text-white shadow-sm" aria-hidden="true">
                  <Sparkles size={10} strokeWidth={2.5} />
                </span>
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 sm:text-base">YouTube AI replies</p>
                <p className="mt-0.5 text-xs leading-5 text-gray-600 sm:text-sm">
                  Automatically checks new comments and posts eligible AI replies.
                </p>
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-center">
              <button
                type="button"
                onClick={toggleAutomaticReplies}
                role="switch"
                aria-checked={monitoringState.enabled}
                aria-label="Automatic comment monitoring"
                title={isVideoSaved ? undefined : 'Save this video selection to enable AI replies.'}
                className="group flex flex-col items-center gap-1.5 rounded-xl p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
                disabled={!isVideoSaved || monitoringState.loading || monitoringState.saving}
              >
                <span className={`relative inline-flex h-9 w-16 items-center rounded-full p-1 transition-colors ${
                  monitoringState.enabled ? 'bg-red-600' : 'bg-gray-300 group-hover:bg-gray-400'
                }`}>
                  <span className={`h-7 w-7 rounded-full bg-white shadow-md transition-transform duration-200 ${
                    monitoringState.enabled ? 'translate-x-7' : 'translate-x-0'
                  }`} />
                </span>
                <span className={`text-xs font-bold ${
                  monitoringState.enabled ? 'text-red-700' : 'text-gray-600'
                }`}>
                  {monitoringState.loading ? 'LOADING' : monitoringState.saving ? 'SAVING' : monitoringState.enabled ? 'ON' : 'TURN ON'}
                </span>
              </button>
            </div>
          </div>
          {monitoringState.enabled && posting && (
            <span role="status" className="mt-3 block text-sm font-medium text-cyan-800">
              Processing saved comments...
            </span>
          )}

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

        {monitoringState.enabled && allReplied && (
          <p role="status" className="mt-4 flex items-center gap-2 text-sm font-medium text-green-700">
            <CheckCircle2 size={18} /> All comments have been replied to.
          </p>
        )}

        {error && (
          <div role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
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

        {!isVideoSaved ? (
          <div className="mt-5 flex min-h-[220px] flex-col items-center justify-center px-4 text-center">
            <MessageSquare size={34} className="text-gray-300" aria-hidden="true" />
            <h3 className="mt-3 font-semibold text-gray-800">Save this video to continue</h3>
            <p className="mt-1 max-w-sm text-sm text-gray-500">
              Save your selection to view comment counts and turn on AI-powered replies.
            </p>
          </div>
        ) : !monitoringState.enabled ? (
          null
        ) : loading && !data ? (
          <div className="mt-5 space-y-3" role="status" aria-label="Loading comments">
            {Array.from({ length: 4 }, (_, index) => (
              <article key={index} className="flex gap-3 rounded-xl border border-gray-200 p-4">
                <div className="lh-youtube-skeleton h-9 w-9 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="lh-youtube-skeleton h-3 w-1/4 rounded-full" />
                  <div className="lh-youtube-skeleton h-3 w-full rounded-full" />
                  <div className="lh-youtube-skeleton h-3 w-3/5 rounded-full" />
                  <div className="lh-youtube-skeleton ml-3 h-12 w-[85%] rounded-lg" />
                </div>
              </article>
            ))}
          </div>
        ) : (
        <div className="mt-5 space-y-4">
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
                      {!comment.isReplied && comment.awaitingReply && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                          Awaiting AI reply
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
        )}
          </>
        )}
        </div>
  )
}
