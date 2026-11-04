// Step 1 of FlowWidget: connect Google/YouTube and pick the channel LeadHive should manage.
// Data: GET /auth/channels (401 = not connected yet). The picked channel is lifted to FlowWidget.
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { BarChart3, Link2, RefreshCw, Trash2, Users } from 'lucide-react'
import { deleteAccount, disconnectYoutube } from '../api'
import { useYoutubeResource } from '../hooks'
import { FlowLoader } from './FlowLoader'
import { PersonaSelection } from './PersonaSelection'

// Full-page redirect to Google (the Vite proxy forwards /auth to the backend)
const CONNECT_URL = '/auth/google/login'
const AUTH_RETURN_KEY = 'leadhive.youtube.auth-return'

function markAuthReturn() {
  sessionStorage.setItem(AUTH_RETURN_KEY, 'pending')
}

// Messages for the ?auth=failed&reason=... values the backend callback can send
const FAILURE_MESSAGES = {
  access_denied: 'YouTube permission was not granted.',
  provider_denied: 'Google declined the sign-in.',
  token_exchange: 'Google sign-in could not be completed. Please try again.',
  channel_fetch: "We couldn't retrieve your YouTube channel.",
  no_youtube_channel: 'No YouTube channel was found for this Google account.',
}
const FALLBACK_FAILURE = 'The connection could not be completed. Try connecting again.'

const ONBOARDING_STEPS = [
  { title: 'Connect your account', text: 'Sign in securely with Google.' },
  { title: 'Choose a channel', text: 'Select the YouTube channel you want to manage.' },
  { title: 'Set up AI replies', text: 'Choose how AI should respond to your audience.' },
]

function toImageUrl(value, insideImageField = false) {
  if (typeof value === 'string') {
    const url = value.trim()
    return /^(https?:\/\/|\/\/|\/|data:image\/|blob:)/i.test(url) ? url : ''
  }
  if (!value || typeof value !== 'object') return ''

  const entries = Array.isArray(value)
    ? value.map(item => ['', item])
    : Object.entries(value)
  for (const [key, nestedValue] of entries) {
    const imageField = /thumb|image|avatar|photo|picture|icon|logo/i.test(key)
    if (imageField || insideImageField || /^(url|src|href)$/i.test(key)) {
      const imageUrl = toImageUrl(nestedValue, true)
      if (imageUrl) return imageUrl
    }
  }

  return ''
}

// Backend fields -> the small shape the rest of the flow uses
function findChannelThumbnail(value) {
  if (!value || typeof value !== 'object') return ''

  for (const [key, nestedValue] of Object.entries(value)) {
    if (/thumb|image|avatar|photo|picture|icon|logo/i.test(key)) {
      const imageUrl = toImageUrl(nestedValue, true)
      if (imageUrl) return imageUrl
    }

    const nestedThumbnail = findChannelThumbnail(nestedValue)
    if (nestedThumbnail) return nestedThumbnail
  }

  return ''
}

function toChannel(raw) {
  const thumbnail =
    toImageUrl(raw.channel_thumbnail, true) ||
    toImageUrl(raw.channel_thumbnail_url, true) ||
    toImageUrl(raw.channel_logo, true) ||
    toImageUrl(raw.channel_logo_url, true) ||
    toImageUrl(raw.logo, true) ||
    toImageUrl(raw.logo_url, true) ||
    toImageUrl(raw.thumbnail_url, true) ||
    toImageUrl(raw.thumbnail, true) ||
    toImageUrl(raw.profile_image_url, true) ||
    toImageUrl(raw.avatar_url, true) ||
    toImageUrl(raw.channel_avatar_url, true) ||
    toImageUrl(raw.channel_image_url, true) ||
    toImageUrl(raw.channel_profile_picture, true) ||
    toImageUrl(raw.profile_picture, true) ||
    toImageUrl(raw.image_url, true) ||
    toImageUrl(raw.picture, true) ||
    toImageUrl(raw.snippet?.thumbnails?.default, true) ||
    findChannelThumbnail(raw)

  return {
    id: raw.youtube_channel_id,
    name: raw.channel_name || raw.youtube_channel_id,
    thumbnail,
    subscribers: raw.channel_subscribers,
    views: raw.channel_views,
  }
}

// "1,234" for numeric values, '' when the backend sends nothing usable
function formatCount(value) {
  if (value === null || value === undefined || value === '') return ''
  const n = Number(value)
  return Number.isFinite(n) ? n.toLocaleString() : ''
}

export function ChannelSelection({
  channel,
  onSelectChannel,
  onDisconnected,
  onAccountDeleted,
  profile,
  onProfileSaved,
  personaFormRef,
  onPersonaSavedAndContinue,
  onPersonaNext,
  commentFetchInterval,
  onCommentFetchIntervalChange,
}) {
  const [params] = useSearchParams()
  const [refresh, setRefresh] = useState(0)
  const [accountAction, setAccountAction] = useState('')
  const [accountActionError, setAccountActionError] = useState('')
  const [accountActionSuccess, setAccountActionSuccess] = useState('')
  const [analyticsChannelId, setAnalyticsChannelId] = useState(channel?.id ?? null)
  const { data, error, status, loading } = useYoutubeResource('/auth/channels', refresh)

  // Backend sent us back here with ?auth=failed&reason=...
  const connectionFailed = params.get('auth') === 'failed'
  const failureMessage = FAILURE_MESSAGES[params.get('reason')] || FALLBACK_FAILURE

  const notConnected = status === 401 // 401 just means "not signed in yet", not a real error
  const hardError = error && !notConnected
  const channels = useMemo(() => Array.isArray(data) ? data.map(toChannel) : [], [data])
  const hasChannels = channels.length > 0
  const isChannelSelected = hasChannels && channels.some(item => item.id === channel?.id)

  if (loading) return <FlowLoader message="Loading your connected channels..." />

  async function handleDisconnect() {
    const confirmed = window.confirm(
      'Disconnect your YouTube channel from LeadHive? You can connect it again later.',
    )
    if (!confirmed) return

    setAccountAction('disconnect')
    setAccountActionError('')
    setAccountActionSuccess('')
    try {
      await disconnectYoutube()
      onDisconnected?.()
      setAccountActionSuccess('YouTube channel disconnected successfully.')
      setRefresh(value => value + 1)
    } catch (actionError) {
      setAccountActionError(actionError?.message || 'Could not disconnect the YouTube channel. Please try again.')
    } finally {
      setAccountAction('')
    }
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      'Permanently delete your LeadHive account and all saved data? This action cannot be undone.',
    )
    if (!confirmed) return

    setAccountAction('delete')
    setAccountActionError('')
    setAccountActionSuccess('')
    try {
      await deleteAccount()
      onAccountDeleted?.()
    } catch (actionError) {
      setAccountActionError(actionError?.message || 'Could not delete the account. Please try again.')
      setAccountAction('')
    }
  }

  return (
    <section className={`mx-auto w-full space-y-6 ${hasChannels ? 'max-w-5xl' : ''}`}>
      {/* Heading + connect-another link */}
      <div className={`flex flex-wrap items-start justify-between gap-4 ${
        hasChannels ? '' : 'mx-auto w-full max-w-4xl flex-col items-center text-center'
      }`}>
        <div className={hasChannels ? '' : 'w-full'}>
          <h1 className={`text-[28px] font-semibold tracking-tight text-slate-900 sm:text-[30px] ${
            hasChannels ? 'text-left' : 'text-center'
          }`}>
            {hasChannels ? 'Choose your YouTube channel and set up your AI persona' : 'What LeadHive does'}
          </h1>
          {!hasChannels && (
            <p className="channel-intro-copy mt-2 text-sm leading-6 text-slate-600">
              LeadHive helps you track video performance and reply to comments with AI in your brand&apos;s voice.
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {hasChannels && (
            <a
              href={CONNECT_URL}
              onClick={markAuthReturn}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#2cc1df]/60 hover:bg-[#f2fcfe]"
            >
              <Link2 size={15} /> Connect another account
            </a>
          )}
        </div>
      </div>

      {connectionFailed && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {failureMessage}
        </p>
      )}

      {hardError && (
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

      <div className={`grid items-start gap-5 ${
        hasChannels
          ? 'lg:grid-cols-[minmax(230px,0.7fr)_minmax(0,1.5fr)]'
          : 'mx-auto w-full max-w-4xl grid-cols-1'
      }`}>
        {/* Left: onboarding intro */}
        {hasChannels ? (
          <div className="order-1">
            <h2 className="sr-only">Connected channels</h2>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div>
                <h3 className="text-lg font-bold leading-6 text-gray-900">Select a YouTube channel</h3>
                <p className="text-xs text-gray-500">
                  {channels.length} {channels.length === 1 ? 'channel' : 'channels'} available
                </p>
              </div>

              <div className="mt-4 space-y-3">
                {channels.map(item => {
                  const selected = channel?.id === item.id

                  return (
                    <article key={item.id}>
                      <button
                        type="button"
                        aria-pressed={selected}
                        onClick={() => {
                          onSelectChannel(selected ? null : item)
                          setAnalyticsChannelId(selected ? null : item.id)
                        }}
                        className={`mt-4 flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition ${
                          selected
                            ? 'border-red-500 bg-red-50/60'
                            : 'border-gray-200 bg-white hover:border-red-200'
                        }`}
                      >
                        {item.thumbnail ? (
                          <span className="relative h-10 w-10 shrink-0">
                            <img
                              src={item.thumbnail}
                              alt={`${item.name} channel thumbnail`}
                              className="h-10 w-10 rounded-full object-cover shadow-sm"
                              onError={event => {
                                event.currentTarget.hidden = true
                                const fallback = event.currentTarget.nextElementSibling
                                fallback?.classList.remove('hidden')
                                fallback?.classList.add('flex')
                              }}
                            />
                            <span className="absolute inset-0 hidden items-center justify-center rounded-full bg-red-600 text-white shadow-sm">
                              <svg width="18" height="14" viewBox="0 0 20 15" aria-hidden="true">
                                <path d="M8 3.5v8l6-4-6-4Z" fill="white" />
                              </svg>
                            </span>
                          </span>
                        ) : (
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-600 text-white shadow-sm">
                            <svg width="18" height="14" viewBox="0 0 20 15" aria-hidden="true">
                              <path d="M8 3.5v8l6-4-6-4Z" fill="white" />
                            </svg>
                          </span>
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-semibold text-gray-900">{item.name}</span>
                          <span className="mt-0.5 block text-xs font-medium text-red-600">YouTube</span>
                          <span className="block text-xs text-gray-500">Connected channel</span>
                        </span>
                        <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          selected ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${selected ? 'bg-green-500' : 'bg-gray-400'}`} aria-hidden="true" />
                          {selected ? 'Selected' : 'Connected'}
                        </span>
                      </button>
                      {selected && (
                        <button
                          type="button"
                          aria-expanded={analyticsChannelId === item.id}
                          onClick={() => setAnalyticsChannelId(current => current === item.id ? null : item.id)}
                          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                        >
                          <BarChart3 size={16} aria-hidden="true" />
                          {analyticsChannelId === item.id ? 'Hide channel analytics' : 'Channel analytics'}
                        </button>
                      )}
                      {selected && analyticsChannelId === item.id && (
                        <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-3" aria-label="Channel analytics">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-medium text-gray-600">Channel analytics</p>
                            <button
                              type="button"
                              onClick={() => setRefresh(value => value + 1)}
                              disabled={loading}
                              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                              aria-label="Refresh channel analytics"
                            >
                              <RefreshCw size={13} aria-hidden="true" className={loading ? 'animate-spin' : ''} />
                              {loading ? 'Refreshing...' : 'Refresh'}
                            </button>
                          </div>
                          <div className="mt-3 grid grid-cols-2 gap-2">
                            <div className="rounded-lg bg-white p-2 text-center">
                              <Users size={15} className="mx-auto text-red-600" aria-hidden="true" />
                              <p className="mt-1 text-[11px] text-gray-500">Subscribers</p>
                              <p className="text-sm font-semibold text-gray-900">{formatCount(item.subscribers) || '—'}</p>
                            </div>
                            <div className="rounded-lg bg-white p-2 text-center">
                              <BarChart3 size={15} className="mx-auto text-red-600" aria-hidden="true" />
                              <p className="mt-1 text-[11px] text-gray-500">Channel views</p>
                              <p className="text-sm font-semibold text-gray-900">{formatCount(item.views) || '—'}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      <p className="mt-3 text-xs leading-5 text-gray-500">
                        This is where your video and comments come from.
                      </p>
                    </article>
                  )
                })}
              </div>

              <section aria-labelledby="account-connection-heading" className="mt-4 border-t border-slate-200 pt-3">
                <h3 id="account-connection-heading" className="text-sm font-semibold text-slate-900">
                  Account settings
                </h3>
                <div className="mt-2 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800">YouTube connection</p>
                      <p className="text-xs leading-4 text-slate-600">Stop syncing this channel.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleDisconnect}
                      disabled={Boolean(accountAction)}
                      aria-busy={accountAction === 'disconnect'}
                      className="channel-settings-action channel-settings-action--disconnect"
                    >
                      <svg width="20" height="15" viewBox="0 0 20 15" aria-hidden="true">
                        <rect width="20" height="15" rx="4" fill="#ff0033" />
                        <path d="M8 3.5v8l6-4-6-4Z" fill="white" />
                      </svg>
                      {accountAction === 'disconnect' ? 'Disconnecting...' : 'Disconnect'}
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-red-100 bg-red-50/40 px-3 py-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800">LeadHive account</p>
                      <p className="text-xs leading-4 text-slate-600">Permanently delete your account and data.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleDeleteAccount}
                      disabled={Boolean(accountAction)}
                      aria-busy={accountAction === 'delete'}
                      className="channel-settings-action channel-settings-action--delete lh-primary-action"
                    >
                      <Trash2 size={16} aria-hidden="true" />
                      {accountAction === 'delete' ? 'Deleting...' : 'Delete Account'}
                    </button>
                  </div>
                </div>
                {accountActionError && <p role="alert" className="mt-3 text-sm text-red-700">{accountActionError}</p>}
                {accountActionSuccess && <p role="status" className="mt-3 text-sm text-green-700">{accountActionSuccess}</p>}
              </section>
            </div>
          </div>
        ) : (
        <aside
          aria-label="YouTube connection onboarding"
          className={`rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8 ${
            hasChannels ? '' : 'text-center'
          }`}
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            <Link2 size={14} /> Secure Google sign-in
          </span>

          <h2 className="mt-3 text-xl font-semibold leading-7 text-gray-900 sm:text-2xl">
            Connect YouTube Channel
          </h2>
          {/* Connect button only until at least one channel is connected */}
          {!loading && !hasChannels && (
            <div className="mt-4 flex flex-col items-center">
              <a
                href={CONNECT_URL}
                onClick={markAuthReturn}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition hover:border-red-200 hover:bg-red-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2"
              >
                <svg width="20" height="15" viewBox="0 0 20 15" aria-hidden="true">
                  <rect width="20" height="15" rx="4" fill="#ff0033" />
                  <path d="M8 3.5v8l6-4-6-4Z" fill="white" />
                </svg>
                Connect YouTube
              </a>
              <p className="mt-2 text-xs leading-5 text-gray-500">
                Connect your channel to explore video insights and AI-powered comment replies.
              </p>
              <p className="mt-1 text-[11px] leading-4 text-gray-400">
                You can review how we use your data in our{' '}
                <a className="channel-privacy-link font-medium underline underline-offset-2" href="/privacy">
                  Privacy Policy
                </a>.
              </p>
            </div>
          )}

          <div className={`mt-6 border-t border-gray-100 pt-4 ${
            hasChannels ? '' : 'text-left'
          }`}>
            <h3 className="text-sm font-semibold text-gray-900">Getting started</h3>
            <ol className={`mt-3 grid gap-3 ${
              hasChannels ? 'space-y-4' : 'sm:grid-cols-3'
            }`}>
            {ONBOARDING_STEPS.map((step, i) => (
              <li key={step.title} className={`flex items-start gap-3 ${
                hasChannels ? '' : 'rounded-xl border border-gray-100 bg-gray-50 p-3'
              }`}>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">
                  {i + 1}
                </span>
                <div className="min-w-0 pt-0.5">
                  <strong className="block text-sm leading-5 text-gray-900">{step.title}</strong>
                  <p className="mt-0.5 text-xs leading-5 text-gray-500">{step.text}</p>
                </div>
              </li>
            ))}
            </ol>
          </div>
        </aside>
        )}

        {isChannelSelected && (
          <div className="order-2 lg:order-2">
            <PersonaSelection
              key={channel.id}
              channel={channel}
              profile={profile}
              onProfileSaved={onProfileSaved}
              formRef={personaFormRef}
              onSavedAndContinue={onPersonaSavedAndContinue}
              onNext={onPersonaNext}
              commentFetchInterval={commentFetchInterval}
              onCommentFetchIntervalChange={onCommentFetchIntervalChange}
              embedded
            />
          </div>
        )}
        {hasChannels && !isChannelSelected && (
          <div className="order-2 flex min-h-64 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <div className="max-w-sm">
              <h2 className="mt-3 text-lg font-semibold text-slate-900">Set the AI persona</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Select a YouTube channel first. Then you can configure the AI persona for that channel.
              </p>
            </div>
          </div>
        )}
      </div>

    </section>
  )
}
