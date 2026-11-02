import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Eye,
  MessageSquare,
  Play,
  RefreshCw,
  Sparkles,
  ThumbsUp,
  Users,
  Video,
} from 'lucide-react'

const VIDEO_ID = 'BIek57Kj3ag'
const VIDEO_TITLE = 'What and How to Use | NourDoc'
const DEFAULT_VIDEO_DESCRIPTION = 'A walkthrough introducing NourDoc and explaining how to use the platform.'

const CHANNEL_ANALYTICS = [
  [['Subscribers', Users, '12.4K'], ['Videos', Video, '86'], ['Views', BarChart3, '1.2M']],
  [['Subscribers', Users, '12.5K'], ['Videos', Video, '87'], ['Views', BarChart3, '1.21M']],
]

const VIDEO_ANALYTICS = [
  [['Views', Eye, '28.6K'], ['Likes', ThumbsUp, '1.4K'], ['Comments', MessageSquare, '86']],
  [['Views', Eye, '28.7K'], ['Likes', ThumbsUp, '1.41K'], ['Comments', MessageSquare, '87']],
]

const SAMPLE_COMMENTS = [
  {
    author: '@NourDocViewer',
    text: 'Hi, I’m new to NourDoc. Can you tell me how it works?',
    reply: {
      author: '@NourDoc',
      text: 'Hello! Thanks for reaching out. This video gives you a quick introduction to NourDoc.',
    },
  },
  {
    author: '@HealthLearner',
    text: 'Where can I learn more about the platform?',
    reply: {
      author: '@NourDoc',
      text: 'Thanks for your question. Please visit NourDoc’s official resources for more information.',
    },
  },
  {
    author: '@NewViewer',
    text: 'Is there a guide for getting started?',
    reply: null,
  },
]

export function InteractiveDemo2() {
  const [showWalkthrough, setShowWalkthrough] = useState(false)
  const [channelSelected, setChannelSelected] = useState(false)
  const [persona, setPersona] = useState({
    businessName: 'NourDoc',
    tone: 'Professional and helpful',
    services: 'NourDoc is a healthcare platform. Use this demo to introduce its services and help viewers get started.',
    rules: 'Be clear and helpful. Do not provide medical advice; direct specific questions to NourDoc’s official resources.',
  })
  const [videoDescription, setVideoDescription] = useState(DEFAULT_VIDEO_DESCRIPTION)
  const [videoSelected, setVideoSelected] = useState(false)
  const [commentsLoading, setCommentsLoading] = useState(false)
  const commentsLoadingTimer = useRef(null)
  const [aiRepliesEnabled, setAiRepliesEnabled] = useState(false)
  const [aiReplyLoading, setAiReplyLoading] = useState(false)
  const aiReplyTimer = useRef(null)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [videoAnalyticsIndex, setVideoAnalyticsIndex] = useState(0)
  const [showChannelAnalytics, setShowChannelAnalytics] = useState(false)
  const [channelAnalyticsIndex, setChannelAnalyticsIndex] = useState(0)
  const canContinue =
    channelSelected &&
    persona.businessName.trim() &&
    persona.tone &&
    persona.services.trim() &&
    persona.rules.trim()

  useEffect(() => () => {
    window.clearTimeout(commentsLoadingTimer.current)
    window.clearTimeout(aiReplyTimer.current)
  }, [])

  function updatePersona(field, value) {
    setPersona(current => ({ ...current, [field]: value }))
  }

  function selectVideo() {
    if (videoSelected) return

    setVideoSelected(true)
    setAiRepliesEnabled(false)
    setAiReplyLoading(false)
    window.clearTimeout(aiReplyTimer.current)
    aiReplyTimer.current = null
    setCommentsLoading(true)
    window.clearTimeout(commentsLoadingTimer.current)
    commentsLoadingTimer.current = window.setTimeout(() => {
      setCommentsLoading(false)
      commentsLoadingTimer.current = null
    }, 2500)
  }

  function unselectVideo() {
    setVideoSelected(false)
    setAiRepliesEnabled(false)
    setAiReplyLoading(false)
    window.clearTimeout(aiReplyTimer.current)
    aiReplyTimer.current = null
    setCommentsLoading(false)
    window.clearTimeout(commentsLoadingTimer.current)
    commentsLoadingTimer.current = null
  }

  function toggleAIReplies() {
    if (aiRepliesEnabled) {
      setAiRepliesEnabled(false)
      setAiReplyLoading(false)
      window.clearTimeout(aiReplyTimer.current)
      aiReplyTimer.current = null
      return
    }

    setAiRepliesEnabled(true)
    setAiReplyLoading(true)
    window.clearTimeout(aiReplyTimer.current)
    aiReplyTimer.current = window.setTimeout(() => {
      setAiReplyLoading(false)
      aiReplyTimer.current = null
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3 sm:px-6">
          <img src="/leadhive-logo.png" alt="LeadHive AI" className="h-8 w-auto shrink-0" />
          <span className="hidden h-6 w-px bg-gray-300 sm:block" aria-hidden="true" />
          <span className="hidden text-sm font-semibold text-gray-700 sm:block">YouTube Intelligence</span>
          <div className="flex-1" />
          <Link to="/" className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900">
            <ArrowLeft size={15} aria-hidden="true" />
            Go to Home
          </Link>
        </div>
      </header>

      {!showWalkthrough ? (
        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
          <div className="mb-6 flex items-center justify-center">
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-current="step"
                onClick={() => setShowWalkthrough(false)}
                className="rounded-lg border border-red-100 bg-red-50 px-4 py-2 text-base font-bold text-red-700 shadow-sm transition-colors"
              >
                Step 1
              </button>
              <span className="text-sm font-semibold text-gray-400">of</span>
              <button
                type="button"
                onClick={() => setShowWalkthrough(true)}
                disabled={!canContinue}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-base font-semibold text-gray-700 shadow-sm transition-colors hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Step 2
              </button>
            </div>
          </div>
          <header className="mb-7">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
              Choose your channel and set your business details
            </h1>
          </header>

          <div className="grid items-start gap-5 lg:grid-cols-[minmax(230px,0.7fr)_minmax(0,1.5fr)]">
            <section aria-labelledby="demo-channel-heading" className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50 text-sm font-bold text-red-600">1</span>
                <div className="min-w-0">
                  <h2 id="demo-channel-heading" className="text-lg font-bold leading-6 text-gray-900">Choose your channel</h2>
                </div>
              </div>
              <button
                type="button"
                aria-pressed={channelSelected}
                onClick={() => {
                  if (channelSelected) setShowChannelAnalytics(false)
                  setChannelSelected(!channelSelected)
                }}
                className={`mt-4 flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition ${
                  channelSelected ? 'border-red-500 bg-red-50/60' : 'border-gray-200 bg-white hover:border-red-200'
                }`}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-600 text-white shadow-sm">
                  <Play size={18} fill="currentColor" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-gray-900">NourDoc</span>
                  <span className="mt-0.5 block text-xs font-medium text-red-600">YouTube</span>
                  <span className="block text-xs text-gray-500">Demo channel</span>
                </span>
                <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  channelSelected ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${channelSelected ? 'bg-green-500' : 'bg-gray-400'}`} aria-hidden="true" />
                  {channelSelected ? 'Connected' : 'Disconnected'}
                </span>
              </button>
              {channelSelected && (
                <button
                  type="button"
                  aria-expanded={showChannelAnalytics}
                  onClick={() => setShowChannelAnalytics(current => !current)}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                >
                  <BarChart3 size={16} aria-hidden="true" />
                  {showChannelAnalytics ? 'Hide channel analytics' : 'Channel analytics'}
                </button>
              )}
              {channelSelected && showChannelAnalytics && (
                <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-3" aria-label="Channel analytics">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium text-gray-600">Channel analytics</p>
                    <button
                      type="button"
                      onClick={() => setChannelAnalyticsIndex(index => (index + 1) % CHANNEL_ANALYTICS.length)}
                      className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                      aria-label="Refresh channel analytics"
                    >
                      <RefreshCw size={13} aria-hidden="true" />
                      Refresh
                    </button>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {CHANNEL_ANALYTICS[channelAnalyticsIndex].map(([label, Icon, value]) => (
                      <div key={label} className="rounded-lg bg-white p-2 text-center">
                        <Icon size={15} className="mx-auto text-red-600" aria-hidden="true" />
                        <p className="mt-1 text-[11px] text-gray-500">{label}</p>
                        <p className="text-sm font-semibold text-gray-900">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <p className="mt-3 text-xs leading-5 text-gray-500">This is where your video and comments come from.</p>
            </section>

            <section aria-labelledby="demo-persona-heading" className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-center gap-3 text-center">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50 text-sm font-bold text-red-600">2</span>
                <h2 id="demo-persona-heading" className="text-lg font-extrabold text-gray-900">Set your business details</h2>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="mb-1 block text-sm font-medium text-gray-700">Business name</span>
                  <input
                    value={channelSelected ? persona.businessName : ''}
                    onChange={event => updatePersona('businessName', event.target.value)}
                    disabled={!channelSelected}
                    maxLength={255}
                    placeholder="e.g. NourDoc"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1 block text-sm font-medium text-gray-700">How should AI sound?</span>
                  <select
                    value={channelSelected ? persona.tone : ''}
                    onChange={event => updatePersona('tone', event.target.value)}
                    disabled={!channelSelected}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  >
                    <option value="">Choose a style</option>
                    <option value="Professional and helpful">Professional and helpful</option>
                    <option value="Casual and friendly">Casual and friendly</option>
                    <option value="Witty and humorous">Witty and humorous</option>
                  </select>
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1 block text-sm font-medium text-gray-700">What does your business do?</span>
                  <textarea
                    value={channelSelected ? persona.services : ''}
                    onChange={event => updatePersona('services', event.target.value)}
                    disabled={!channelSelected}
                    maxLength={800}
                    rows={2}
                    placeholder="Briefly describe your product or service"
                    className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1 block text-sm font-medium text-gray-700">Any rules for AI?</span>
                  <textarea
                    value={channelSelected ? persona.rules : ''}
                    onChange={event => updatePersona('rules', event.target.value)}
                    disabled={!channelSelected}
                    maxLength={300}
                    rows={2}
                    placeholder="For example: be clear, and don’t give medical advice"
                    className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  />
                </label>
              </div>
            </section>
          </div>

          <div className="mt-6 flex flex-col-reverse items-start justify-between gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:items-center">
            <p className="text-xs text-gray-500">Demo only. Your entries stay in this page and are not saved.</p>
            <button
              type="button"
              disabled={!canContinue}
              onClick={() => setShowWalkthrough(true)}
              className="lh-primary-action inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save and continue <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>
        </main>
          ) : (
            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
              <div className="mb-6 flex items-center justify-center">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowWalkthrough(false)}
                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-base font-semibold text-gray-700 shadow-sm transition-colors hover:border-gray-300 hover:bg-gray-50"
                  >
                    Step 1
                  </button>
                  <span className="text-sm font-semibold text-gray-400">of</span>
                  <button
                    type="button"
                    aria-current="step"
                    onClick={() => setShowWalkthrough(true)}
                    className="rounded-lg border border-red-100 bg-red-50 px-4 py-2 text-base font-bold text-red-700 shadow-sm transition-colors"
                  >
                    Step 2
                  </button>
                </div>
              </div>
              <header className="mb-6">
                <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                  Select a video to generate AI-powered replies to its comments.
                </h1>
              </header>

              <div className="grid items-start gap-5 lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.5fr)]">
                <section aria-labelledby="demo-videos-heading" className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50 text-sm font-bold text-red-600">3</span>
                    <h2 id="demo-videos-heading" className="text-lg font-bold text-gray-900">Videos</h2>
                  </div>
                  <article className={`mt-4 rounded-xl border-2 p-3 transition ${videoSelected ? 'border-red-500 bg-red-50/60' : 'border-gray-200 bg-white'}`}>
                    <div className="grid grid-cols-[minmax(96px,0.8fr)_minmax(0,1.4fr)] items-center gap-3">
                      <img
                        src={`https://i.ytimg.com/vi/${VIDEO_ID}/mqdefault.jpg`}
                        alt=""
                        className="aspect-video w-full rounded-lg bg-gray-100 object-cover"
                      />
                      <div className="min-w-0">
                        <h3 className="font-semibold leading-5 text-gray-900">{VIDEO_TITLE}</h3>
                      </div>
                    </div>
                    <label className="mt-3 block">
                      <span className="mb-1 block text-xs font-medium text-gray-600">Video description</span>
                      <textarea
                        value={videoDescription}
                        onChange={event => setVideoDescription(event.target.value)}
                        disabled={videoSelected}
                        maxLength={1000}
                        rows={3}
                        placeholder="Write a short description of this video"
                        className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm leading-5 text-gray-700 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
                      />
                    </label>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <button
                        type="button"
                        aria-pressed={videoSelected}
                        onClick={() => {
                          if (videoSelected) {
                            unselectVideo()
                          } else {
                            selectVideo()
                          }
                          setShowAnalytics(false)
                        }}
                        className={`inline-flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold ${
                          videoSelected ? 'border-red-200 bg-red-50 text-red-700' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {videoSelected ? 'Unselect video' : 'Select this video'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          selectVideo()
                          setShowAnalytics(current => !current)
                        }}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                      >
                        <BarChart3 size={16} aria-hidden="true" />
                        {showAnalytics ? 'Hide analytics' : 'View analytics'}
                      </button>
                    </div>
                    {showAnalytics && (
                      <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-3" aria-label="Video analytics">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-medium text-gray-600">Video analytics</p>
                          <button
                            type="button"
                            onClick={() => setVideoAnalyticsIndex(index => (index + 1) % VIDEO_ANALYTICS.length)}
                            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                            aria-label="Refresh video analytics"
                          >
                            <RefreshCw size={13} aria-hidden="true" />
                            Refresh
                          </button>
                        </div>
                        <div className="mt-3 grid grid-cols-3 gap-2">
                          {VIDEO_ANALYTICS[videoAnalyticsIndex].map(([label, Icon, value]) => (
                            <div key={label} className="rounded-lg bg-white p-2 text-center">
                              <Icon size={15} className="mx-auto text-red-600" aria-hidden="true" />
                              <p className="mt-1 text-[11px] text-gray-500">{label}</p>
                              <p className="text-sm font-semibold text-gray-900">{value}</p>
                            </div>
                          ))}
                        </div>
                        <p className="mt-2 text-[11px] text-gray-500">Demo analytics shown for illustration.</p>
                      </div>
                    )}
                  </article>
                </section>

                <section aria-labelledby="demo-command-center-heading" className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
                  <div className="border-b border-gray-100 pb-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50 text-sm font-bold text-red-600">4</span>
                      <div>
                        <h2 id="demo-command-center-heading" className="text-lg font-semibold text-gray-900">Comments</h2>
                      </div>
                    </div>
                  </div>
                  {videoSelected && !commentsLoading && (
                    <>
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                        aiRepliesEnabled ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        3 comments
                      </span>
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                        {aiRepliesEnabled && !aiReplyLoading ? '3 thread replies' : '2 thread replies'}
                      </span>
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                        aiRepliesEnabled && !aiReplyLoading ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {aiRepliesEnabled && !aiReplyLoading ? '0 awaiting AI reply' : '1 awaiting AI reply'}
                      </span>
                      </div>
                      <div className={`mt-4 flex items-center justify-between gap-4 rounded-2xl border p-4 shadow-sm transition-all sm:p-5 ${
                        aiRepliesEnabled
                          ? 'border-red-300 bg-gradient-to-r from-red-50 via-white to-rose-50 shadow-red-100'
                          : 'border-red-100 bg-gradient-to-r from-red-50 via-white to-rose-50'
                      }`}>
                        <div className="flex min-w-0 items-center gap-3">
                          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                            aiRepliesEnabled ? 'bg-red-600 text-white shadow-md shadow-red-200' : 'bg-white text-red-600 shadow-sm'
                          }`}>
                            <Sparkles size={21} aria-hidden="true" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 sm:text-base">AI-powered replies</p>
                            <p className="mt-0.5 text-xs leading-5 text-gray-600 sm:text-sm">
                              Respond to comments in your brand voice, automatically.
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={aiRepliesEnabled}
                          aria-label={aiRepliesEnabled ? 'Disable AI replies' : 'Enable AI replies'}
                          onClick={toggleAIReplies}
                          className="group flex shrink-0 flex-col items-center gap-1.5 rounded-xl p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                        >
                          <span className={`relative inline-flex h-9 w-16 items-center rounded-full p-1 transition-colors ${
                            aiRepliesEnabled ? 'bg-red-600' : 'bg-gray-300 group-hover:bg-gray-400'
                          }`}>
                            <span className={`h-7 w-7 rounded-full bg-white shadow-md transition-transform duration-200 ${
                              aiRepliesEnabled ? 'translate-x-7' : 'translate-x-0'
                            }`} />
                          </span>
                          <span className={`text-xs font-bold ${
                            aiRepliesEnabled ? 'text-red-700' : 'text-gray-600'
                          }`}>
                            {aiRepliesEnabled ? 'ON' : 'TURN ON'}
                          </span>
                        </button>
                      </div>
                    </>
                  )}

                  {commentsLoading ? (
                    <div className="flex min-h-[220px] flex-col items-center justify-center gap-3" role="status" aria-live="polite">
                      <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-gray-200 border-t-red-600" aria-hidden="true" />
                      <span className="text-sm font-medium text-gray-600">Loading comments...</span>
                    </div>
                  ) : !videoSelected ? (
                    <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
                      <Video size={34} className="text-gray-300" aria-hidden="true" />
                      <h3 className="mt-3 font-semibold text-gray-800">Choose a video to view its comments</h3>
                    </div>
                  ) : aiRepliesEnabled ? (
                    <div className="mt-4 space-y-3">
                      {SAMPLE_COMMENTS.map(comment => {
                        const generatedReply = aiRepliesEnabled && !aiReplyLoading && !comment.reply
                          ? {
                              author: '@NourDoc AI',
                              text: 'Absolutely! Watch the NourDoc introduction video above for a helpful guide to getting started.',
                            }
                          : null
                        const reply = comment.reply || generatedReply

                        return (
                          <article key={comment.author} className="rounded-xl border border-gray-200 p-3 sm:p-4">
                            <div className="flex gap-3">
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600">@</span>
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                  <span className="text-sm font-semibold text-gray-900">{comment.author}</span>
                                  <span className="text-xs text-gray-400">Demo comment</span>
                                </div>
                                <p className="mt-1 text-sm text-gray-700">{comment.text}</p>

                                {reply ? (
                                  <div className="ml-3 mt-3 border-l-2 border-gray-200 pl-3 sm:ml-4 sm:pl-4">
                                    <p className="mb-2 text-xs text-gray-500">↳ 1 thread reply</p>
                                    <div className={`rounded-lg border p-3 ${
                                      generatedReply ? 'border-red-100 bg-red-50/50' : 'border-gray-200 bg-gray-50'
                                    }`}>
                                      <div className="flex flex-wrap items-center justify-between gap-2">
                                        <span className="text-sm font-semibold text-gray-900">{reply.author}</span>
                                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                          generatedReply ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-700'
                                        }`}>
                                          {generatedReply ? 'AI reply · demo' : 'User reply'}
                                        </span>
                                      </div>
                                      <p className="mt-1 text-sm text-gray-700">{reply.text}</p>
                                    </div>
                                  </div>
                                ) : aiReplyLoading ? (
                                  <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700" role="status" aria-live="polite">
                                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-red-200 border-t-red-600" aria-hidden="true" />
                                    Generating AI reply...
                                  </span>
                                ) : (
                                  <span className="mt-3 inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">
                                    Awaiting AI reply
                                  </span>
                                )}
                              </div>
                            </div>
                          </article>
                        )
                      })}
                    </div>
                  ) : null}
                </section>
              </div>

            </main>
          )}
    </div>
  )
}
