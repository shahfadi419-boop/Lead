import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  Bot,
  Check,
  CheckCircle2,
  Eye,
  ImageIcon,
  Info,
  Loader2,
  Link2,
  MessageSquare,
  Play,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  ThumbsUp,
  Users,
} from 'lucide-react'

const MAX_COMMENT_LENGTH = 400
const MAX_DESCRIPTION_LENGTH = 800

const INITIAL_PERSONA = {
  business_name: 'LeadHive AI',
  brand_tone: 'Professional & Helpful',
  services: 'AI-powered YouTube comment management and audience engagement.',
  ai_rules: 'Be helpful, concise, and never make unsupported promises.',
}

const CHANNELS = [
  { id: 'demo-channel-1', name: 'LeadHive AI', subscribers: 12400, views: 845200 },
  { id: 'demo-channel-2', name: 'LeadHive Tutorials', subscribers: 5800, views: 231900 },
]

const VIDEO_TEMPLATES = [
  { title: 'How AI Is Transforming Customer Engagement', views: 18400, likes: 920, comments: 38 },
  { title: 'Build Better Conversations With LeadHive', views: 12600, likes: 684, comments: 24 },
  { title: 'A Complete Guide to Smart Comment Replies', views: 8900, likes: 517, comments: 17 },
]

const DEMO_COMMENTS = [
  { author: 'Maya R.', text: 'Can this help our team respond to comments faster?' },
  { author: 'Jordan Lee', text: 'I like how the replies can match a brand voice.' },
  { author: 'Chris M.', text: 'Does it work for a small channel too?' },
]

const DEMO_PERSONA = {
  business_name: 'LeadHive AI',
  tone: 'Professional & Helpful',
  offers: 'AI-powered comment management and audience engagement.',
  reply_rules: 'Be helpful, concise, and never make unsupported promises.',
}

const DEMO_VIDEO = {
  title: 'How AI Is Transforming Customer Engagement',
  description: 'See how AI helps brands respond to YouTube comments in their own voice.',
  embed_video_id: '',
}

function simulatedReply(comment) {
  const text = comment.toLowerCase()
  if (text.includes('small') || text.includes('team')) {
    return 'Absolutely! LeadHive is designed to help teams of different sizes save time and keep conversations moving.'
  }
  if (text.includes('brand') || text.includes('voice') || text.includes('tone')) {
    return 'Thanks for noticing! You can configure a brand persona so suggested replies stay consistent with your voice.'
  }
  if (text.includes('price') || text.includes('cost')) {
    return 'Thanks for asking! Please visit our website for the latest plan and pricing information.'
  }
  return 'Thanks for your comment! LeadHive helps you stay on top of conversations with replies tailored to your brand.'
}

const FLOW_SECTIONS = [
  ['demo-channel', 'Channel'],
  ['demo-persona', 'AI Persona'],
  ['demo-videos', 'Video Library'],
  ['demo-command-center', 'Command Center'],
  ['demo-analytics', 'Analytics'],
]

const STEP_TASKS = [
  'Select a sample channel to continue.',
  'Edit any persona detail, then save your changes.',
  'Choose a video and save your selection.',
  'Turn automatic replies on and watch the AI reply to sample comments.',
  'Refresh the sample analytics to finish the walkthrough.',
]

function MetricCard({ label, value, description, Icon, iconStyle }) {
  const [displayValue, setDisplayValue] = useState(typeof value === 'number' ? 0 : value)

  useEffect(() => {
    if (typeof value !== 'number') return

    let frame
    const startedAt = performance.now()
    function animate(now) {
      const progress = Math.min((now - startedAt) / 700, 1)
      setDisplayValue(Math.round(value * progress))
      if (progress < 1) frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [value])

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <strong className="mt-2 block text-3xl font-bold tracking-tight text-gray-900">
            {typeof value === 'number' ? displayValue.toLocaleString() : value}
          </strong>
        </div>
        <span className={`rounded-xl p-2.5 ${iconStyle}`} aria-hidden="true"><Icon size={19} /></span>
      </div>
      <p className="mt-3 text-xs text-gray-400">{description}</p>
    </article>
  )
}

export function InteractiveDemo2() {
  const [activeStep, setActiveStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState([])
  const [selectedChannelId, setSelectedChannelId] = useState(CHANNELS[0].id)
  const [persona, setPersona] = useState(INITIAL_PERSONA)
  const [personaSaved, setPersonaSaved] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedVideo, setSelectedVideo] = useState(0)
  const [videoSelectionTouched, setVideoSelectionTouched] = useState(false)
  const [videoDescription, setVideoDescription] = useState(
    'See how AI helps brands respond to YouTube comments in their own voice.',
  )
  const [videoSaved, setVideoSaved] = useState(false)
  const [draft, setDraft] = useState('')
  const [userComments, setUserComments] = useState([])
  const [replies, setReplies] = useState({})
  const [pending, setPending] = useState({})
  const [automaticReplies, setAutomaticReplies] = useState(false)
  const [processingAll, setProcessingAll] = useState(false)
  const [replyProgress, setReplyProgress] = useState({ current: 0, total: 0 })
  const [analyticsMessage, setAnalyticsMessage] = useState('')
  const [analyticsUpdated, setAnalyticsUpdated] = useState('Just now')

  const sampleVideo = DEMO_VIDEO
  const sampleComments = DEMO_COMMENTS
  const samplePersona = DEMO_PERSONA
  const channel = CHANNELS.find(item => item.id === selectedChannelId) || CHANNELS[0]
  const embedId = sampleVideo.embed_video_id || ''
  const validVideoId = /^[A-Za-z0-9_-]{11}$/.test(embedId)
  const videos = VIDEO_TEMPLATES.map((item, index) => ({
      ...item,
      id: index === 0 && validVideoId ? embedId : `demo-video-${index + 1}`,
      title: index === 0 && sampleVideo.title ? sampleVideo.title : item.title,
      description: index === 0 ? videoDescription : '',
      thumbnail: index === 0 && validVideoId ? `https://i.ytimg.com/vi/${embedId}/mqdefault.jpg` : '',
    }))
  const filteredVideos = videos.filter(item =>
    `${item.title} ${item.description}`.toLowerCase().includes(search.trim().toLowerCase()),
  )
  const currentVideo = videos[selectedVideo]
  const stepComplete = completedSteps.includes(activeStep)
  const furthestAvailableStep = completedSteps.length
  const comments = [
    ...userComments,
    ...sampleComments.map((comment, index) => ({
      id: `sample-${index}`,
      author: comment.author || 'Viewer',
      text: comment.text || '',
    })),
  ]
  const awaitingCount = comments.filter(comment => !replies[comment.id]).length
  const replyCount = Object.keys(replies).length
  const suggestions = sampleComments.slice(0, 3).map(comment => comment.text).filter(Boolean)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [activeStep])

  function completeStep(step) {
    setCompletedSteps(current => current.includes(step) ? current : [...current, step].sort())
  }

  function goToStep(step) {
    if (step <= furthestAvailableStep) setActiveStep(step)
  }

  function updatePersona(field, value) {
    setPersona(current => ({ ...current, [field]: value }))
    setPersonaSaved(false)
  }

  function selectVideo(index) {
    setSelectedVideo(index)
    setVideoSelectionTouched(true)
    if (index === 0) setVideoDescription(videos[0].description)
    setVideoSaved(false)
  }

  function restartDemo() {
    setActiveStep(0)
    setCompletedSteps([])
    setSelectedChannelId(CHANNELS[0].id)
    setPersona(INITIAL_PERSONA)
    setPersonaSaved(true)
    setSearch('')
    setSelectedVideo(0)
    setVideoSelectionTouched(false)
    setVideoDescription('See how AI helps brands respond to YouTube comments in their own voice.')
    setVideoSaved(false)
    setDraft('')
    setUserComments([])
    setReplies({})
    setPending({})
    setAutomaticReplies(false)
    setProcessingAll(false)
    setReplyProgress({ current: 0, total: 0 })
    setAnalyticsMessage('')
    setAnalyticsUpdated('Just now')
  }

  async function generateReply(id, text) {
    setPending(current => ({ ...current, [id]: true }))
    await new Promise(resolve => window.setTimeout(resolve, 700))
    setReplies(current => ({ ...current, [id]: simulatedReply(text) }))
    setPending(current => ({ ...current, [id]: false }))
  }

  async function toggleAutomaticReplies() {
    if (processingAll) return
    const enabled = !automaticReplies
    setAutomaticReplies(enabled)
    if (!enabled) return

    const unreplied = comments.filter(comment => !replies[comment.id] && !pending[comment.id])
    setProcessingAll(true)
    setReplyProgress({ current: 0, total: unreplied.length })
    for (const [index, comment] of unreplied.entries()) {
      await generateReply(comment.id, comment.text)
      setReplyProgress({ current: index + 1, total: unreplied.length })
    }
    setProcessingAll(false)
    completeStep(3)
  }

  function submitComment(event) {
    event.preventDefault()
    const text = draft.trim()
    if (!text) return
    const id = `visitor-${Date.now()}`
    setUserComments(current => [{ id, author: 'You', text }, ...current])
    setDraft('')
    if (automaticReplies) generateReply(id, text)
  }

  function refreshAnalytics() {
    setAnalyticsUpdated(new Date().toLocaleTimeString())
    setAnalyticsMessage('Demo analytics refreshed.')
    completeStep(4)
    window.setTimeout(() => setAnalyticsMessage(''), 2500)
  }

  const channelStats = [
    { label: 'Subscribers', value: channel.subscribers, description: 'Channel audience', Icon: Users, iconStyle: 'bg-blue-50 text-blue-600' },
    { label: 'Channel views', value: channel.views, description: 'Lifetime channel views', Icon: BarChart3, iconStyle: 'bg-indigo-50 text-indigo-600' },
  ]
  const videoStats = [
    { label: 'Views', value: currentVideo.views, description: 'Views on this video', Icon: Eye, iconStyle: 'bg-cyan-50 text-cyan-700' },
    { label: 'Likes', value: currentVideo.likes, description: 'Likes on this video', Icon: ThumbsUp, iconStyle: 'bg-rose-50 text-rose-600' },
    { label: 'Comments', value: currentVideo.comments, description: 'Sample comments and simulated replies', Icon: MessageSquare, iconStyle: 'bg-violet-50 text-violet-600' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6">
          <img src="/leadhive-logo.png" alt="LeadHive AI" className="h-8 w-auto shrink-0" />
          <span className="hidden h-6 w-px bg-gray-300 sm:block" aria-hidden="true" />
          <span className="hidden whitespace-nowrap text-sm font-semibold text-gray-700 sm:block">YouTube Intelligence</span>
          <div className="flex-1" />
          <span className="hidden items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 sm:inline-flex">
            <ShieldCheck size={14} aria-hidden="true" /> Demo mode
          </span>
          <Link to="/flow?step=1" className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900">
            <ArrowLeft size={15} aria-hidden="true" /> <span className="hidden sm:inline">Back to workspace</span><span className="sm:hidden">Back</span>
          </Link>
        </div>
        <nav aria-label="Interactive Demo 2 steps" className="border-t border-gray-100">
          <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-3 py-2 sm:justify-center sm:px-6 [&::-webkit-scrollbar]:hidden">
            {FLOW_SECTIONS.map(([id, label], index) => {
              const isActive = activeStep === index
              const isComplete = completedSteps.includes(index)
              const isAvailable = index <= furthestAvailableStep
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => goToStep(index)}
                  aria-current={isActive ? 'step' : undefined}
                  disabled={!isAvailable}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 disabled:cursor-not-allowed disabled:opacity-40 ${
                    isActive
                      ? 'bg-[#e5f9fc] text-[#168ca1]'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${
                    isActive || isComplete ? 'bg-[#2cc1df] text-[#07101d]' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {isComplete ? <Check size={12} aria-hidden="true" /> : index + 1}
                  </span>
                  {label}
                </button>
              )
            })}
          </div>
        </nav>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-137px)] w-full max-w-6xl flex-col px-4 py-5 sm:px-6 sm:py-7">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Interactive Demo 2</p>
            <h1 className="mt-1 text-lg font-bold text-gray-900">YouTube Intelligence workspace</h1>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
            <ShieldCheck size={14} aria-hidden="true" /> Demo mode · no YouTube actions
          </span>
        </div>

        <div className="flex flex-1 flex-col justify-center">
        <div className="mb-5">
          <div className="mb-2 flex items-center justify-between gap-3 text-xs font-medium text-gray-500">
            <span>{FLOW_SECTIONS[activeStep][1]}</span>
            <span>Step {activeStep + 1} of {FLOW_SECTIONS.length}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-200" role="progressbar" aria-label="Demo progress" aria-valuemin={0} aria-valuemax={FLOW_SECTIONS.length} aria-valuenow={completedSteps.length}>
            <div className="h-full rounded-full bg-[#2cc1df] transition-[width] duration-500" style={{ width: `${(completedSteps.length / FLOW_SECTIONS.length) * 100}%` }} />
          </div>
        </div>
        <aside className={`mb-6 flex items-start gap-3 rounded-xl border p-4 transition-colors ${
          stepComplete ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'
        }`}>
          <span className={`mt-0.5 ${stepComplete ? 'text-green-600' : 'text-blue-600'}`} aria-hidden="true">
            {stepComplete ? <CheckCircle2 size={18} /> : <Sparkles size={18} />}
          </span>
          <div className="min-w-0 flex-1">
            <p className={`text-sm font-semibold ${stepComplete ? 'text-green-800' : 'text-gray-900'}`}>
              {stepComplete ? 'Step complete' : 'Your task'}
            </p>
            <p className={`mt-0.5 text-sm ${stepComplete ? 'text-green-700' : 'text-gray-600'}`}>
              {stepComplete ? 'Nice work! Continue to the next step when you are ready.' : STEP_TASKS[activeStep]}
            </p>
          </div>
        </aside>

        {activeStep === 0 && <section id="demo-channel" aria-labelledby="demo-channel-heading" className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Channel Setup</p>
            <h2 id="demo-channel-heading" className="mt-1 text-2xl font-bold text-gray-900">Connect your YouTube workspace</h2>
            <p className="mt-2 max-w-2xl text-sm text-gray-600">Choose a sample channel to see how channel setup works. This demo does not connect to Google or YouTube.</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <aside aria-label="YouTube connection onboarding" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"><Link2 size={14} /> Demo channel connection</span>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">Bring your channel into the LeadHive command layer.</h3>
              <p className="mt-2 text-sm text-gray-600">LeadHive uses the connected channel to read uploads, load performance metrics, and prepare AI engagement from your configured brand persona.</p>
              <p className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600"><ShieldCheck size={16} /> Sign-in simulated for this demo</p>
              <ol className="mt-6 space-y-4">
                {[
                  ['Authorize YouTube', 'Use the verified OAuth flow to grant LeadHive channel access.'],
                  ['Select the operating channel', 'Pick the account LeadHive should analyze and manage.'],
                  ['Configure AI engagement', 'Move into persona setup with channel context already attached.'],
                ].map(([title, text], index) => (
                  <li key={title} className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">{index + 1}</span>
                    <div><strong className="block text-sm text-gray-900">{title}</strong><small className="text-gray-500">{text}</small></div>
                  </li>
                ))}
              </ol>
            </aside>
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">Connected channels</h3>
              <p className="text-sm text-gray-500">{CHANNELS.length} sample channels available</p>
              <div className="mt-4 space-y-3">
                {CHANNELS.map(item => {
                  const selected = selectedChannelId === item.id
                  return (
                    <article key={item.id} className={`rounded-2xl border-2 p-4 shadow-sm transition ${selected ? 'border-[#2cc1df] bg-[#f4fcfd]' : 'border-gray-200 bg-white hover:border-[#b7eaf3]'}`}>
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#dff7fb] font-semibold text-[#168ca1]">{item.name.charAt(0)}</div>
                        <div className="min-w-0 flex-1">
                          <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${selected ? 'bg-[#dff7fb] text-[#168ca1]' : 'bg-green-100 text-green-700'}`}>{selected ? 'Selected channel' : 'Connected'}</span>
                          <h4 className="mt-1 truncate font-semibold text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-500">{item.subscribers.toLocaleString()} subscribers · {item.views.toLocaleString()} views</p>
                        </div>
                        {selected && <Check size={18} className="text-[#168ca1]" aria-label="Selected" />}
                        <button type="button" onClick={() => { setSelectedChannelId(item.id); completeStep(0) }} className={`inline-flex items-center gap-1 rounded-xl border px-3 py-2 text-sm font-semibold ${selected ? 'border-[#2cc1df] bg-[#e5f9fc] text-[#168ca1]' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}>
                          {selected ? 'Use this channel' : 'Select channel'}
                        </button>
                      </div>
                    </article>
                  )
                })}
              </div>
              <div className="mt-6 border-t border-slate-200 pt-5">
                <h4 className="text-sm font-semibold text-slate-900">Account and connection</h4>
                <div className="mt-3 divide-y divide-slate-200 border-y border-slate-200">
                  <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div><p className="text-sm font-medium text-slate-800">YouTube connection</p><p className="mt-0.5 text-xs leading-5 text-slate-500">Sample connection for this interactive demo.</p></div>
                    <button type="button" onClick={() => setSelectedChannelId(CHANNELS[0].id)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">Reset demo channel</button>
                  </div>
                  <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div><p className="text-sm font-medium text-slate-800">LeadHive account</p><p className="mt-0.5 text-xs leading-5 text-slate-500">Account actions are disabled in demo mode.</p></div>
                    <button type="button" disabled className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-400">Demo account</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>}

        {activeStep === 1 && <section id="demo-persona" aria-labelledby="demo-persona-heading" className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">AI Persona</p>
            <h2 id="demo-persona-heading" className="mt-1 text-2xl font-bold text-gray-900">Configure your AI persona</h2>
            <p className="mt-2 text-sm text-gray-600">Define how LeadHive should represent your business in YouTube comment replies.</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div><h3 className="text-lg font-semibold text-gray-900">Persona identity &amp; directives</h3><p className="text-sm text-gray-500">Set the communication style, core offerings, and behavioral guardrails for AI engagement.</p></div>
                <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">{channel.name}</span>
              </div>
              <div className="mt-5 space-y-5">
                <label className="block"><span className="mb-1 block text-sm font-medium text-gray-700">Business / Brand Name</span><input maxLength={255} value={persona.business_name} onChange={event => updatePersona('business_name', event.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500" /></label>
                <label className="block"><span className="mb-1 block text-sm font-medium text-gray-700">Brand Tone</span><select value={persona.brand_tone} onChange={event => updatePersona('brand_tone', event.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"><option>Professional &amp; Helpful</option><option>Casual &amp; Friendly</option><option>Witty &amp; Humorous</option></select></label>
                <label className="block"><span className="mb-1 block text-sm font-medium text-gray-700">Core Services &amp; Offerings</span><textarea rows={4} maxLength={800} value={persona.services} onChange={event => updatePersona('services', event.target.value)} className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500" /><small className="mt-1 block text-xs text-gray-500">{persona.services.length} / 800</small></label>
                <label className="block"><span className="mb-1 block text-sm font-medium text-gray-700">Rules &amp; Response Directives</span><textarea rows={4} maxLength={300} value={persona.ai_rules} onChange={event => updatePersona('ai_rules', event.target.value)} className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500" /><small className="mt-1 block text-xs text-gray-500">{persona.ai_rules.length} / 300</small></label>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button type="button" onClick={() => { setPersonaSaved(true); completeStep(1) }} disabled={personaSaved || !persona.business_name.trim()} className="lh-primary-action rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50">{personaSaved ? 'Persona saved' : 'Save persona'}</button>
                {personaSaved && <span className="inline-flex items-center gap-1 text-sm text-green-700"><CheckCircle2 size={16} /> Persona saved. You can continue.</span>}
              </div>
            </div>
            <aside aria-label="AI persona live preview" className="h-fit rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between"><div><span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Live Preview</span><h3 className="text-lg font-semibold text-gray-900">Persona snapshot</h3></div><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${personaSaved ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{personaSaved ? 'Saved' : 'Draft'}</span></div>
              <div className="mt-5 flex flex-col items-center rounded-xl bg-gray-50 p-5 text-center"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600"><Sparkles size={20} /></span><strong className="mt-3 text-gray-900">{persona.business_name || 'Your Brand'}</strong><small className="text-gray-500">{persona.brand_tone || 'Voice not selected'}</small></div>
              <dl className="mt-5 space-y-4 text-sm">
                <div><dt className="font-medium text-gray-500">Channel</dt><dd className="text-gray-900">{channel.name}</dd></div>
                <div><dt className="font-medium text-gray-500">Core Services</dt><dd className="break-words text-gray-900">{persona.services || 'Describe what LeadHive represents.'}</dd></div>
                <div><dt className="font-medium text-gray-500">Directives</dt><dd className="break-words text-gray-900">{persona.ai_rules || 'No communication constraints specified.'}</dd></div>
                {samplePersona.tone && <div><dt className="font-medium text-gray-500">Demo persona voice</dt><dd className="break-words text-gray-900">{samplePersona.tone}</dd></div>}
              </dl>
            </aside>
          </div>
        </section>}

        {activeStep === 2 && <section id="demo-videos" aria-labelledby="demo-videos-heading" className="space-y-6">
          <header>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Video Library</p>
            <h2 id="demo-videos-heading" className="mt-1 text-2xl font-bold text-gray-900">Choose <span className="text-blue-600">one video</span> to monitor</h2>
            <p className="mt-2 text-sm text-gray-600">Select a sample YouTube video that LeadHive should track, analyze, and reply to.</p>
          </header>
          <aside className="flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
            <Info size={18} className="shrink-0 text-blue-600" aria-hidden="true" />
            <div><strong className="text-sm text-gray-900">Only one video can be selected</strong><p className="text-sm text-gray-600">You can monitor one video at a time. Choose the video that best represents your engagement goal.</p></div>
          </aside>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex min-w-[240px] flex-1 items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 focus-within:border-blue-500">
              <Search size={17} className="text-gray-400" aria-hidden="true" /><span className="sr-only">Search videos</span>
              <input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search videos by title or description..." className="w-full bg-transparent text-sm outline-none" />
            </label>
            <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">1 video selected</span>
          </div>
          {filteredVideos.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredVideos.map(item => {
                const index = videos.indexOf(item)
                const selected = selectedVideo === index
                const description = index === 0 ? videoDescription : item.description
                return (
                  <article key={item.id} onClick={() => selectVideo(index)} className={`cursor-pointer overflow-hidden rounded-2xl border-2 bg-white shadow-sm ${selected ? 'border-blue-500' : 'border-gray-200'}`}>
                    <div className="relative flex h-40 items-center justify-center bg-gray-100">
                      {item.thumbnail ? <img src={item.thumbnail} alt="" onError={event => { event.currentTarget.style.display = 'none' }} className="absolute inset-0 h-full w-full object-cover" /> : <span className="text-gray-400"><ImageIcon size={30} /></span>}
                      <label onClick={event => event.stopPropagation()} className="absolute left-3 top-3 z-10 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-white shadow">
                        <input type="radio" name="demo-monitored-video" checked={selected} onChange={() => selectVideo(index)} aria-label={`Select ${item.title}`} className="peer sr-only" />
                        <span className="flex h-full w-full items-center justify-center rounded-full text-transparent peer-checked:bg-[#2cc1df] peer-checked:text-[#07101d]"><Check size={14} /></span>
                      </label>
                      <span className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-xs font-medium text-white"><Play size={12} fill="currentColor" /> YouTube</span>
                      {selected && <span className="absolute bottom-3 left-3 z-10 inline-flex items-center gap-1 rounded-full bg-[#2cc1df] px-2 py-0.5 text-xs font-medium text-[#07101d]"><Check size={13} /> Selected</span>}
                    </div>
                    <div className="space-y-3 p-4">
                      <div><h3 className="font-semibold text-gray-900">{item.title}</h3><p className="mt-1 text-xs text-gray-500">{item.views.toLocaleString()} views · {item.likes.toLocaleString()} likes · {item.comments.toLocaleString()} comments</p></div>
                      <div onClick={event => event.stopPropagation()}>
                        <label htmlFor={`demo-video-description-${index}`} className="block text-sm font-medium text-gray-700">Video description <span className="font-normal text-gray-400">(optional)</span></label>
                        <textarea id={`demo-video-description-${index}`} rows={3} maxLength={MAX_DESCRIPTION_LENGTH} value={description} disabled={!selected} onChange={event => { setVideoDescription(event.target.value); setVideoSaved(false) }} placeholder="Describe what this video is about..." className="mt-1 w-full resize-none rounded-lg border border-gray-300 p-2 text-sm outline-none focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-400" />
                        <div className="mt-1 flex items-start justify-between gap-3 text-xs text-gray-500"><small>The description helps LeadHive understand the video context for AI-generated engagement.</small><span className="shrink-0">{description.length} / {MAX_DESCRIPTION_LENGTH}</span></div>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : <p className="text-sm text-gray-500">No videos match your search.</p>}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-blue-100 bg-blue-50/50 p-4 shadow-sm">
            <div><strong className="text-sm text-gray-900">{currentVideo.title}</strong><p className="text-sm text-gray-500">LeadHive will monitor this video for comments, analyze them, and help you reply.</p></div>
            <div className="flex items-center gap-3">{videoSaved && <span className="inline-flex items-center gap-1 text-sm text-green-700"><Check size={16} /> Saved. You can continue.</span>}<button type="button" onClick={() => { setVideoSaved(true); completeStep(2) }} disabled={videoSaved || !videoSelectionTouched} className="lh-primary-action rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50">{videoSaved ? 'Saved' : 'Save selection'}</button></div>
          </div>
        </section>}

        {activeStep === 3 && <section id="demo-command-center" aria-labelledby="demo-command-center-heading" className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Operations Console</p>
            <h2 id="demo-command-center-heading" className="mt-1 text-2xl font-bold text-gray-900">AI Command Center</h2>
            <p className="mt-2 text-sm text-gray-600">Review sample comments and watch prepared demo replies appear. No backend or YouTube account is needed.</p>
          </div>
          <section aria-labelledby="demo-monitored-video-title" className="flex flex-wrap items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            {validVideoId ? <img src={`https://i.ytimg.com/vi/${embedId}/mqdefault.jpg`} alt="" className="h-20 w-36 rounded-lg bg-gray-100 object-cover" /> : <div className="flex h-20 w-36 items-center justify-center rounded-lg bg-gray-100 text-gray-400"><ImageIcon size={24} /></div>}
            <div className="min-w-0 flex-1"><span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Monitored video</span><h3 id="demo-monitored-video-title" className="truncate text-lg font-semibold text-gray-900">{currentVideo.title}</h3><span className="text-xs text-gray-500">Demo video selection</span></div>
            <span className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-500"><ArrowUpRight size={15} /> Demo preview</span>
          </section>
          <section aria-labelledby="demo-video-context-title" className="flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
            <Info size={18} className="shrink-0 text-blue-600" aria-hidden="true" />
            <div><h3 id="demo-video-context-title" className="text-sm font-semibold text-gray-900">About this video</h3><p className="text-sm text-gray-600">{videoDescription || 'No video context provided.'}</p></div>
          </section>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <header className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3"><MessageSquare size={20} className="text-blue-600" aria-hidden="true" /><div><h3 className="text-lg font-semibold text-gray-900">Comments</h3><p className="text-sm text-gray-500">{automaticReplies ? 'Demo monitoring is on. Sample comments will receive simulated replies.' : 'Demo monitoring is off. Sample comments remain visible; use the toggle or reply buttons to simulate responses.'}</p></div></div>
              <div className="flex flex-wrap items-center gap-3">
                <div aria-label="Comment and reply counts" className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">{comments.length} {comments.length === 1 ? 'comment' : 'comments'}</span>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">{replyCount} {replyCount === 1 ? 'sample reply' : 'sample replies'}</span>
                  <span className={`rounded-full px-3 py-1 text-sm font-medium ${awaitingCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-700'}`}>{awaitingCount} awaiting AI reply</span>
                </div>
                <button type="button" role="switch" aria-label="Automatic demo replies" aria-checked={automaticReplies} disabled={processingAll} onClick={toggleAutomaticReplies} className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60 ${automaticReplies ? 'bg-green-600' : 'bg-gray-300'}`}><span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${automaticReplies ? 'translate-x-7' : 'translate-x-1'}`} /></button>
                <span className="text-sm font-semibold text-gray-700">{processingAll ? 'Processing' : automaticReplies ? 'On' : 'Off'}</span>
              </div>
            </header>
            <form onSubmit={submitComment} className="mt-5 rounded-2xl border border-gray-200 bg-gray-50/60 p-4">
              <div className="flex items-start gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2cc1df] text-[10px] font-bold text-[#07101d]">YOU</div><div className="min-w-0 flex-1">
                <label htmlFor="demo-2-comment" className="sr-only">Your comment</label>
                <textarea id="demo-2-comment" value={draft} onChange={event => setDraft(event.target.value)} maxLength={MAX_COMMENT_LENGTH} rows={2} placeholder="Ask a question or leave a comment..." className="w-full resize-none border-b border-gray-300 bg-transparent pb-2 text-sm outline-none focus:border-blue-600" />
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3"><div className="flex min-w-0 flex-wrap items-center gap-2 text-xs text-gray-500">{suggestions.length > 0 && <span className="hidden sm:inline">Try:</span>}{suggestions.map((suggestion, index) => <button key={`${suggestion}-${index}`} type="button" onClick={() => setDraft(suggestion)} title={suggestion} className="max-w-[16rem] truncate rounded-full border border-gray-200 bg-white px-3 py-1 font-medium text-gray-600 hover:bg-gray-50">{suggestion}</button>)}</div><div className="flex items-center gap-3"><span className="text-xs text-gray-400">{draft.length}/{MAX_COMMENT_LENGTH}</span><button type="submit" disabled={!draft.trim()} className="lh-primary-action inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"><Send size={14} /> Comment</button></div></div>
              </div></div>
            </form>
            <div className="mt-5 space-y-4">
              {processingAll && (
                <div role="status" className="rounded-lg border border-cyan-200 bg-cyan-50 p-3">
                  <div className="flex items-center justify-between gap-3 text-sm font-medium text-cyan-900">
                    <span className="inline-flex items-center gap-2"><Loader2 size={15} className="animate-spin" /> AI is replying to sample comments</span>
                    <span>{replyProgress.current} / {replyProgress.total}</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-cyan-100">
                    <div className="h-full rounded-full bg-cyan-600 transition-[width] duration-300" style={{ width: `${replyProgress.total ? (replyProgress.current / replyProgress.total) * 100 : 100}%` }} />
                  </div>
                </div>
              )}
              {comments.map(comment => (
                <article key={comment.id} className={`rounded-xl border p-4 ${replies[comment.id] ? 'border-green-200 bg-green-50/40' : 'border-gray-200 bg-white'}`}>
                  <div className="flex gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-600">{comment.author.charAt(0).toUpperCase() || '?'}</div><div className="min-w-0 flex-1">
                    <header className="flex items-center justify-between gap-2"><strong className="text-sm text-gray-900">{comment.author}</strong>{replies[comment.id] && <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Sample reply generated</span>}</header>
                    <p className="mt-1 break-words text-sm text-gray-700">{comment.text}</p>
                    {replies[comment.id] && <aside aria-label="Final simulated reply" className="ml-12 mt-3 rounded-lg bg-white p-3 text-sm"><span className="inline-flex items-center gap-1 text-xs font-medium text-green-700"><Bot size={14} /> Sample AI reply</span><p className="mt-1 break-words text-gray-700">{replies[comment.id]}</p></aside>}
                    {pending[comment.id] && <p role="status" className="mt-2 flex items-center gap-2 text-xs text-blue-600"><Loader2 size={13} className="animate-spin" /> Generating reply...</p>}
                    {!replies[comment.id] && !pending[comment.id] && <button type="button" onClick={() => generateReply(comment.id, comment.text)} className="mt-2 text-xs font-semibold text-blue-700 hover:underline">Generate sample reply</button>}
                  </div></div>
                </article>
              ))}
            </div>
            <p className="mt-5 flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-xs text-green-800"><ShieldCheck size={15} className="mt-0.5 shrink-0" /> Simulation only. Prepared sample replies are shown locally; nothing is sent to YouTube.</p>
          </div>
        </section>}

        {activeStep === 4 && <section id="demo-analytics" aria-labelledby="demo-analytics-heading" className="space-y-7">
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div><p className="text-xs font-semibold uppercase tracking-wider text-blue-600">YouTube analytics</p><h2 id="demo-analytics-heading" className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Performance overview</h2><p className="mt-2 text-sm text-gray-600">Sample channel and selected-video metrics in one place.</p></div>
            <div className="flex items-center gap-3">
              {analyticsMessage && <span role="status" className="text-sm text-green-700">{analyticsMessage}</span>}
              <button type="button" onClick={refreshAnalytics} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"><BarChart3 size={16} aria-hidden="true" /> Refresh demo metrics</button>
            </div>
          </header>
          <section className="flex flex-wrap items-center gap-4 rounded-2xl border border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/70 p-5 shadow-sm">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-lg font-bold text-white shadow-sm">{channel.name.charAt(0).toUpperCase()}</span>
            <div className="min-w-0 flex-1"><span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Connected YouTube channel</span><h3 className="mt-0.5 truncate text-lg font-semibold text-gray-900">{channel.name}</h3><p className="mt-0.5 truncate text-xs text-gray-500">Demo channel · metrics are sample data</p></div>
          </section>
          <section aria-labelledby="demo-channel-overview-title" className="space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2"><div><h3 id="demo-channel-overview-title" className="text-lg font-semibold text-gray-900">Channel metrics</h3><p className="mt-1 text-sm text-gray-500">Audience and lifetime channel reach.</p></div><span className="text-xs text-gray-400">Updated {analyticsUpdated}</span></div>
            <div className="grid gap-4 sm:grid-cols-2">{channelStats.map(stat => <MetricCard key={stat.label} {...stat} />)}</div>
          </section>
          <section aria-labelledby="demo-video-overview-title" className="space-y-3">
            <div><h3 id="demo-video-overview-title" className="text-lg font-semibold text-gray-900">Video metrics</h3><p className="mt-1 text-sm text-gray-500">Engagement for the video selected above.</p></div>
            <article className="flex flex-wrap items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
              {currentVideo.thumbnail ? <img src={currentVideo.thumbnail} alt="" className="h-16 w-28 shrink-0 rounded-lg bg-gray-100 object-cover" /> : <div className="flex h-16 w-28 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400"><ImageIcon size={22} /></div>}
              <div className="min-w-0 flex-1"><span className="text-xs font-semibold uppercase tracking-wider text-gray-400">{channel.name}</span><h4 className="mt-1 truncate text-lg font-semibold text-gray-900">{currentVideo.title}</h4><p className="mt-1 text-xs text-gray-500">Sample monitored video</p></div>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-500"><ArrowUpRight size={15} /> Demo preview</span>
            </article>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{videoStats.map(stat => <MetricCard key={stat.label} {...stat} />)}</div>
          </section>
        </section>}

        </div>

        <nav aria-label="Demo step controls" className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
          <button
            type="button"
            onClick={() => setActiveStep(step => Math.max(0, step - 1))}
            disabled={activeStep === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowLeft size={16} aria-hidden="true" /> Back
          </button>
          <span className="text-sm text-gray-500">Step {activeStep + 1} of {FLOW_SECTIONS.length}</span>
          {activeStep < FLOW_SECTIONS.length - 1 ? (
            <button
              type="button"
              onClick={() => setActiveStep(step => Math.min(FLOW_SECTIONS.length - 1, step + 1))}
              disabled={!stepComplete}
              className="lh-primary-action inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next <ArrowUpRight size={16} aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              onClick={restartDemo}
              className="lh-primary-action inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium"
            >
              Start again <Sparkles size={16} aria-hidden="true" />
            </button>
          )}
        </nav>
      </main>
    </div>
  )
}
