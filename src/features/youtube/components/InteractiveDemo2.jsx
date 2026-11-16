import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bot,
  Eye,
  Info,
  Loader2,
  MessageSquare,
  Play,
  RefreshCw,
  Send,
  Sparkles,
  ThumbsUp,
  Users,
  Video,
} from 'lucide-react'
import { youtubeRequest } from '../api'

const MAX_COMMENT_LENGTH = 400
const MAX_DEMO_USER_COMMENTS = 2
const DEMO_CHANNELS = ['NourDoc', 'NourDoc2']
const DEMO_VIDEOS = [
  {
    id: 'BIek57Kj3ag',
    title: 'What and How to Use | NourDoc',
    description: 'A walkthrough introducing NourDoc and explaining how to use the platform.',
  },
  {
    id: 'nourdoc-getting-started',
    title: 'Getting Started with NourDoc',
    description: 'A demo guide to help viewers get started with NourDoc.',
  },
]
const AUTH_RETURN_KEY = 'leadhive.youtube.auth-return'

const CHANNEL_ANALYTICS = [
  [
    [['Subscribers', Users, '12.4K'], ['Videos', Video, '86'], ['Views', BarChart3, '1.2M']],
    [['Subscribers', Users, '12.5K'], ['Videos', Video, '87'], ['Views', BarChart3, '1.21M']],
  ],
  [
    [['Subscribers', Users, '8.7K'], ['Videos', Video, '54'], ['Views', BarChart3, '742K']],
    [['Subscribers', Users, '8.8K'], ['Videos', Video, '55'], ['Views', BarChart3, '755K']],
  ],
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
  const [selectedChannel, setSelectedChannel] = useState('')
  const channelSelected = Boolean(selectedChannel)
  const [persona, setPersona] = useState({
    businessName: 'NourDoc',
    tone: 'Professional and helpful',
    services: 'NourDoc is a healthcare platform. Use this demo to introduce its services and help viewers get started.',
    rules: 'Be clear and helpful. Do not provide medical advice; direct specific questions to NourDoc’s official resources.',
  })
  const [videoDescriptions, setVideoDescriptions] = useState(() => Object.fromEntries(
    DEMO_VIDEOS.map(video => [video.id, video.description])
  ))
  const [selectedVideoId, setSelectedVideoId] = useState('')
  const videoSelected = Boolean(selectedVideoId)
  const [commentsLoading, setCommentsLoading] = useState(false)
  const commentsLoadingTimer = useRef(null)
  const [commentDraft, setCommentDraft] = useState('')
  const [userComments, setUserComments] = useState([])
  const [sendingComment, setSendingComment] = useState(false)
  const [aiRepliesEnabled, setAiRepliesEnabled] = useState(false)
  const [aiReplyLoading, setAiReplyLoading] = useState(false)
  const aiReplyTimer = useRef(null)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [videoAnalyticsIndex, setVideoAnalyticsIndex] = useState(0)
  const [channelAnalyticsIndices, setChannelAnalyticsIndices] = useState([0, 0])
  const [showChannelAnalytics, setShowChannelAnalytics] = useState(true)
  const canContinue =
    channelSelected &&
    persona.businessName.trim() &&
    persona.tone &&
    persona.services.trim() &&
    persona.rules.trim()
  const activeUserComments = userComments.filter(comment => !comment.error)
  const demoCommentLimitReached = userComments.length >= MAX_DEMO_USER_COMMENTS
  const demoCommentCount = SAMPLE_COMMENTS.length + activeUserComments.length
  const demoThreadReplyCount =
    SAMPLE_COMMENTS.filter(comment => comment.reply).length +
    (aiRepliesEnabled && !aiReplyLoading && SAMPLE_COMMENTS.some(comment => !comment.reply) ? 1 : 0) +
    activeUserComments.filter(comment => comment.reply).length
  const awaitingAiReplyCount =
    SAMPLE_COMMENTS.filter(comment => !comment.reply).length -
    (aiRepliesEnabled && !aiReplyLoading && SAMPLE_COMMENTS.some(comment => !comment.reply) ? 1 : 0) +
    activeUserComments.filter(comment => comment.pending || !comment.reply).length

  useEffect(() => () => {
    window.clearTimeout(commentsLoadingTimer.current)
    window.clearTimeout(aiReplyTimer.current)
  }, [])

  function updatePersona(field, value) {
    setPersona(current => ({ ...current, [field]: value }))
  }

  function updateUserComment(id, updates) {
    setUserComments(current => current.map(comment => (
      comment.id === id ? { ...comment, ...updates } : comment
    )))
  }

  async function submitComment(event) {
    event.preventDefault()
    const text = commentDraft.trim()
    if (
      !aiRepliesEnabled ||
      !text ||
      sendingComment ||
      userComments.length >= MAX_DEMO_USER_COMMENTS
    ) return

    const id = crypto.randomUUID()
    setCommentDraft('')
    setSendingComment(true)
    setUserComments(current => [
      { id, text, reply: '', error: '', pending: true, time: new Date() },
      ...current,
    ])

    try {
      const response = await youtubeRequest('/demo/reply', {
        method: 'POST',
        body: { comment: text },
      })
      updateUserComment(id, { reply: response.reply, pending: false })
    } catch (error) {
      updateUserComment(id, {
        error: error.message || 'Could not get a reply right now. Please try again.',
        pending: false,
      })
    } finally {
      setSendingComment(false)
    }
  }

  function selectVideo(videoId) {
    if (selectedVideoId === videoId) return

    setSelectedVideoId(videoId)
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
    setSelectedVideoId('')
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
      <header className="lh-app-header">
        <div className="lh-app-header-inner">
          <Link
            to="/"
            onClick={() => sessionStorage.removeItem(AUTH_RETURN_KEY)}
            aria-label="Go to LeadHive home"
            className="lh-app-header-logo shrink-0"
          >
            <img src="/leadhive-logo.png" alt="LeadHive AI" />
          </Link>
          <span className="hidden h-6 w-px bg-gray-300 sm:block" aria-hidden="true" />
          <Link
            to="/flow?step=1"
            onClick={() => sessionStorage.removeItem(AUTH_RETURN_KEY)}
            className="inline-flex min-w-0 shrink items-center gap-1.5 whitespace-nowrap text-xs font-semibold text-slate-800 transition hover:text-slate-600 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 sm:gap-2 sm:text-sm"
          >
            <svg width="18" height="14" viewBox="0 0 20 15" aria-hidden="true">
              <rect width="20" height="15" rx="4" fill="#ff0033" />
              <path d="M8 3.5v8l6-4-6-4Z" fill="white" />
            </svg>
            <span>YouTube Intelligence</span>
          </Link>
          <nav aria-label="Demo steps" className="flex flex-1 justify-center">
            <div className="flex flex-wrap items-center justify-center gap-1">
              <button
                type="button"
                aria-current={!showWalkthrough ? 'step' : undefined}
                onClick={() => setShowWalkthrough(false)}
                className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                  !showWalkthrough
                    ? 'bg-cyan-50 font-semibold text-cyan-700'
                    : 'font-medium text-gray-600 hover:bg-gray-50'
                }`}
              >
                Channel &amp; Persona
              </button>
              <button
                type="button"
                aria-current={showWalkthrough ? 'step' : undefined}
                onClick={() => setShowWalkthrough(true)}
                disabled={!canContinue}
                className={`rounded-lg px-3 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                  showWalkthrough
                    ? 'bg-cyan-50 font-semibold text-cyan-700'
                    : 'font-medium text-gray-600 hover:bg-gray-50'
                }`}
              >
                Videos, Replies &amp; Analytics
              </button>
            </div>
          </nav>
          <Link
            to="/test-demo"
            onClick={() => sessionStorage.removeItem(AUTH_RETURN_KEY)}
            aria-label="All demo services"
            title="All demo services"
            className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={15} aria-hidden="true" />
            <span className="hidden lg:inline">All services</span>
          </Link>
          <Link
            to="/"
            onClick={() => sessionStorage.removeItem(AUTH_RETURN_KEY)}
            className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={15} aria-hidden="true" />
            Go to Home
          </Link>
        </div>
      </header>

      {!showWalkthrough ? (
        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
          <header className="mb-7">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
              Select a YouTube channel and set the AI persona
            </h1>
          </header>

          <div className="grid items-start gap-5 lg:grid-cols-[minmax(230px,0.7fr)_minmax(0,1.5fr)]">
            <section aria-labelledby="demo-channel-heading" className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 id="demo-channel-heading" className="text-lg font-bold leading-6 text-gray-900">Select a YouTube channel</h2>
              <div role="note" className="mt-4 flex gap-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-amber-950 shadow-sm">
                <Info size={20} className="mt-0.5 shrink-0 text-amber-700" aria-hidden="true" />
                <div>
                  <p className="text-sm font-bold">Fictional demo channel</p>
                  <p className="mt-1 text-xs leading-5">
                    This channel and its stats are static sample data, shown only to demonstrate the process. It is not a real connected YouTube account.
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                {DEMO_CHANNELS.map(channel => {
                  const isSelected = selectedChannel === channel
                  const channelIndex = DEMO_CHANNELS.indexOf(channel)
                  return (
                    <div key={channel} className="space-y-2">
                      <button
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => {
                          setSelectedChannel(isSelected ? '' : channel)
                          setShowChannelAnalytics(!isSelected)
                        }}
                        className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition ${
                          isSelected ? 'border-red-500 bg-red-50/60' : 'border-gray-200 bg-white hover:border-red-200'
                        }`}
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-600 text-white shadow-sm">
                          <Play size={18} fill="currentColor" aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-semibold text-gray-900">{channel}</span>
                          <span className="mt-0.5 block text-xs font-medium text-red-600">YouTube</span>
                          <span className="block text-xs text-gray-500">Demo channel</span>
                        </span>
                        <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          isSelected ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-green-500' : 'bg-gray-400'}`} aria-hidden="true" />
                          {isSelected ? 'Connected' : 'Disconnected'}
                        </span>
                      </button>
                      {isSelected && (
                        <>
                          <button
                            type="button"
                            aria-expanded={showChannelAnalytics}
                            onClick={() => setShowChannelAnalytics(visible => !visible)}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                          >
                            <BarChart3 size={16} aria-hidden="true" />
                            {showChannelAnalytics ? 'Hide channel analytics' : 'Show channel analytics'}
                          </button>
                          {showChannelAnalytics && (
                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3" aria-label={`${channel} analytics`}>
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-xs font-medium text-gray-600">Channel analytics</p>
                                <button
                                  type="button"
                                  onClick={() => setChannelAnalyticsIndices(indices => indices.map((index, i) => (
                                    i === channelIndex ? (index + 1) % CHANNEL_ANALYTICS[channelIndex].length : index
                                  )))}
                                  className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                                  aria-label={`Refresh ${channel} analytics`}
                                >
                                  <RefreshCw size={13} aria-hidden="true" />
                                  Refresh
                                </button>
                              </div>
                              <div className="mt-3 grid grid-cols-3 gap-2">
                                {CHANNEL_ANALYTICS[channelIndex][channelAnalyticsIndices[channelIndex]].map(([label, Icon, value]) => (
                                  <div key={label} className="rounded-lg bg-white p-2 text-center">
                                    <Icon size={15} className="mx-auto text-red-600" aria-hidden="true" />
                                    <p className="mt-1 text-[11px] text-gray-500">{label}</p>
                                    <p className="text-sm font-semibold text-gray-900">{value}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
              <p className="mt-3 text-xs leading-5 text-gray-500">This is where your video and comments come from.</p>
            </section>

            <section aria-labelledby="demo-persona-heading" className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-center text-center">
                <h2 id="demo-persona-heading" className="text-lg font-extrabold text-gray-900">Set the AI persona</h2>
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
              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  disabled={!canContinue}
                  onClick={() => setShowWalkthrough(true)}
                  className="lh-primary-action inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Save and continue <ArrowRight size={16} aria-hidden="true" />
                </button>
              </div>
            </section>
          </div>

          <div className="mt-6 border-t border-gray-200 pt-5">
            <p className="text-xs text-gray-500">Demo only. Your entries stay in this page and are not saved.</p>
          </div>
        </main>
          ) : (
            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
              <header className="mb-6">
                <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                  Select a video to generate AI-powered replies to its comments.
                </h1>
              </header>

              <div className="grid items-start gap-5 lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.5fr)]">
                <section aria-labelledby="demo-videos-heading" className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h2 id="demo-videos-heading" className="text-lg font-bold text-gray-900">Select a video</h2>
                  <div className="mt-4 space-y-3">
                    {DEMO_VIDEOS.map(video => {
                      const isSelected = selectedVideoId === video.id
                      return (
                        <article key={video.id} className={`rounded-xl border-2 p-3 transition ${isSelected ? 'border-red-500 bg-red-50/60' : 'border-gray-200 bg-white'}`}>
                          <div className="grid grid-cols-[minmax(96px,0.8fr)_minmax(0,1.4fr)] items-center gap-3">
                            {video.id === 'BIek57Kj3ag' ? (
                              <img
                                src={`https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`}
                                alt=""
                                className="aspect-video w-full rounded-lg bg-gray-100 object-cover"
                              />
                            ) : (
                              <div
                                role="img"
                                aria-label={`${video.title} thumbnail`}
                                className="relative flex aspect-video w-full flex-col items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-slate-900 via-red-900 to-rose-700 text-white"
                              >
                                <span className="absolute -right-5 -top-8 h-28 w-28 rounded-full border-[14px] border-white/10" aria-hidden="true" />
                                <span className="absolute -bottom-12 -left-7 h-32 w-32 rounded-full bg-white/10" aria-hidden="true" />
                                <span className="relative mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-red-700 shadow-lg">
                                  <Play size={18} fill="currentColor" aria-hidden="true" />
                                </span>
                                <span className="relative px-2 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-white/90">NourDoc</span>
                                <span className="relative mt-1 px-2 text-center text-xs font-semibold leading-tight">Getting Started</span>
                              </div>
                            )}
                            <div className="min-w-0">
                              <h3 className="font-semibold leading-5 text-gray-900">{video.title}</h3>
                            </div>
                          </div>
                          <label className="mt-3 block">
                            <span className="mb-1 block text-xs font-medium text-gray-600">Video description</span>
                            <textarea
                              value={videoDescriptions[video.id]}
                              onChange={event => setVideoDescriptions(current => ({
                                ...current,
                                [video.id]: event.target.value,
                              }))}
                              disabled={isSelected}
                              maxLength={1000}
                              rows={3}
                              placeholder="Write a short description of this video"
                              className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm leading-5 text-gray-700 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
                            />
                          </label>
                          <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            <button
                              type="button"
                              aria-pressed={isSelected}
                              onClick={() => {
                                if (isSelected) {
                                  unselectVideo()
                                  setShowAnalytics(false)
                                } else {
                                  selectVideo(video.id)
                                  setShowAnalytics(true)
                                }
                              }}
                              className={`inline-flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold ${
                                isSelected ? 'border-red-200 bg-red-50 text-red-700' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {isSelected ? 'Unselect video' : 'Select this video'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (!isSelected) selectVideo(video.id)
                                setShowAnalytics(current => isSelected ? !current : true)
                              }}
                              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                            >
                              <BarChart3 size={16} aria-hidden="true" />
                              {isSelected && showAnalytics ? 'Hide analytics' : 'View analytics'}
                            </button>
                          </div>
                          {isSelected && showAnalytics && (
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
                      )
                    })}
                  </div>
                </section>

                <section aria-labelledby="demo-command-center-heading" className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
                  <div className="border-b border-gray-100 pb-4">
                    <h2 id="demo-command-center-heading" className="text-lg font-semibold text-gray-900">Comments &amp; AI replies</h2>
                  </div>
                  {videoSelected && (
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                        {demoCommentCount} comments
                      </span>
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                        {demoThreadReplyCount} thread replies
                      </span>
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                        {awaitingAiReplyCount} awaiting AI reply
                      </span>
                    </div>
                  )}
                  {videoSelected && !commentsLoading && (
                    <>
                      <div className={`mt-4 flex items-center justify-between gap-4 rounded-2xl border p-4 shadow-sm transition-all sm:p-5 ${
                        aiRepliesEnabled
                          ? 'border-red-300 bg-gradient-to-r from-red-50 via-white to-rose-50 shadow-red-100'
                          : 'border-red-100 bg-gradient-to-r from-red-50 via-white to-rose-50'
                      }`}>
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-100 bg-white shadow-sm">
                            <svg
                              width="24"
                              height="18"
                              viewBox="0 0 24 18"
                              role="img"
                              aria-label="YouTube"
                            >
                              <rect x="1" y="1" width="22" height="16" rx="5" fill="#ff0033" />
                              <path d="M10 5v8l6-4-6-4Z" fill="white" />
                            </svg>
                            <span
                              className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-cyan-500 text-white shadow-sm"
                              aria-label="AI"
                            >
                              <Sparkles size={10} strokeWidth={2.5} aria-hidden="true" />
                            </span>
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 sm:text-base">YouTube AI replies</p>
                            <p className="mt-0.5 text-xs leading-5 text-gray-600 sm:text-sm">
                              AI reads video comments and replies in your brand voice.
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
                  ) : !aiRepliesEnabled ? (
                    <div className="flex min-h-[220px] flex-col items-center justify-center px-4 text-center">
                      <MessageSquare size={34} className="text-gray-300" aria-hidden="true" />
                      <h3 className="mt-3 font-semibold text-gray-800">Comments are hidden</h3>
                      <p className="mt-1 max-w-sm text-sm text-gray-500">
                        Turn on AI-powered replies to view comments and try the interactive demo.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 space-y-3">
                      <form onSubmit={submitComment} className="rounded-xl border border-red-100 bg-gradient-to-br from-red-50/70 to-white p-4 shadow-sm">
                        <label
                          htmlFor="interactive-demo-2-comment"
                          className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800"
                        >
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100 text-red-700">
                            <MessageSquare size={14} aria-hidden="true" />
                          </span>
                          Try it yourself: write a comment
                        </label>
                        <textarea
                          id="interactive-demo-2-comment"
                          value={commentDraft}
                          onChange={event => setCommentDraft(event.target.value)}
                          maxLength={MAX_COMMENT_LENGTH}
                          rows={2}
                          placeholder="Ask a question or leave a comment..."
                          disabled={demoCommentLimitReached}
                          className="w-full resize-none rounded-lg border-2 border-red-100 bg-white p-3 text-sm shadow-sm outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
                        />
                        <p
                          role="note"
                          className="mt-3 flex gap-3 rounded-xl border-2 border-amber-400 bg-amber-100 px-4 py-3 text-sm text-amber-950 shadow-md ring-2 ring-amber-200"
                        >
                          <Info size={20} className="mt-0.5 shrink-0 text-amber-700" aria-hidden="true" />
                          <span className="leading-5">
                            <strong className="font-extrabold">Demo Limit:</strong> The demo version allows you to submit up to{' '}
                            <strong className="font-extrabold">2 comments</strong> to experience and evaluate how the AI analyzes
                            comments and generates replies.
                          </span>
                        </p>
                        <div className="mt-2 flex items-center justify-between gap-3">
                          <span className="text-xs text-gray-400">
                            {commentDraft.length}/{MAX_COMMENT_LENGTH}
                          </span>
                          <button
                            type="submit"
                            disabled={!commentDraft.trim() || sendingComment || demoCommentLimitReached}
                            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {sendingComment
                              ? <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                              : <Send size={14} aria-hidden="true" />}
                            Comment
                          </button>
                        </div>
                        <p className="mt-2 text-[11px] text-gray-500">
                          Demo only: your comment is not posted to YouTube.
                        </p>
                      </form>

                      {userComments.map(comment => (
                        <article key={comment.id} className="rounded-xl border border-gray-200 p-3 sm:p-4">
                          <div className="flex items-start gap-3">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-700">
                              YOU
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                <span className="text-sm font-semibold text-gray-900">You</span>
                                <time className="text-xs text-gray-400">
                                  {comment.time.toLocaleTimeString()}
                                </time>
                              </div>
                              <p className="mt-1 break-words text-sm text-gray-700">{comment.text}</p>
                              {comment.error ? (
                                <p role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                  {comment.error}
                                </p>
                              ) : (
                                <div className="mt-3 rounded-lg border border-red-100 bg-red-50/50 p-3">
                                  <div className="flex items-center gap-2 text-xs font-semibold text-red-700">
                                    <Bot size={14} aria-hidden="true" />
                                    {persona.businessName || 'AI'} assistant
                                    {comment.pending && (
                                      <span role="status" className="inline-flex items-center gap-1 font-normal">
                                        <Loader2 size={12} className="animate-spin" aria-hidden="true" />
                                        Generating reply...
                                      </span>
                                    )}
                                  </div>
                                  {comment.reply && (
                                    <p className="mt-1 break-words text-sm text-gray-700">{comment.reply}</p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </article>
                      ))}

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
                  )}
                </section>
              </div>

            </main>
          )}
    </div>
  )
}
