// Controls the 2-step LeadHive flow: Channel & Persona -> Video, Replies & Analytics.
// The current step lives in the URL (/flow?step=2) so refresh and the browser Back button work.
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { ArrowUpRight } from "lucide-react";
import { ChannelSelection } from "../components/ChannelSelection";
import { VideoSelection } from "../components/VideoSelection";
import { ReplySection } from "../components/ReplySection";
import { logoutUser } from "../api";
import { useYoutubeResource } from "../hooks";
import {
  DEFAULT_COMMENT_FETCH_INTERVAL,
  normalizeCommentFetchInterval,
} from "../commentPolling";

function VideoWorkspace({
  channel,
  video,
  onVideoSaved,
  commentFetchInterval,
  onCommentFetchIntervalChange,
}) {
  const [previewVideo, setPreviewVideo] = useState(video);

  return (
    <VideoSelection
      channel={channel}
      video={video}
      onVideoSaved={onVideoSaved}
      onVideoPreview={setPreviewVideo}
      commentsPanel={
        video && previewVideo?.id === video.id
          ? (
            <ReplySection
              key={video.id}
              channel={channel}
              video={video}
              isVideoSaved
              commentFetchInterval={commentFetchInterval}
              onCommentFetchIntervalChange={onCommentFetchIntervalChange}
            />
          )
          : (
            <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
              <p className="font-semibold text-gray-800">
                Select a video and add its description to view comments and replies.
              </p>
            </div>
          )
      }
    />
  );
}

// Single source of truth: the two user-facing steps and their navigation labels.
const FLOW_STEPS = [
  { key: "ChannelSelection", label: "Channel & Persona", Component: ChannelSelection },
  { key: "VideoWorkspace", label: "Videos, Replies & Analytics", Component: VideoWorkspace },
];

const LAST_STEP = FLOW_STEPS.length - 1;

// Same as useState, but the value is saved in localStorage and restored on refresh
function useStoredState(key) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // storage unavailable (private mode, quota): the flow still works, it just won't survive a refresh
    }
  }, [key, value]);

  return [value, setValue];
}

export const FlowWidget = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const personaFormRef = useRef(null);

  // Channel picked in step 1: { id, name, subscribers, views }. Later steps read channel.id.
  const [channel, setChannel] = useStoredState("leadhive.flow.channel");
  const [channelRefresh, setChannelRefresh] = useState(0);
  // Persona saved in step 1: { business_name, brand_tone, services, ai_rules }, or null when unsaved
  const [profile, setProfile] = useStoredState("leadhive.flow.profile");
  // Video saved in step 2: { id, title, description }, or null when unsaved
  const [video, setVideo] = useStoredState("leadhive.flow.video");
  const [commentFetchInterval, setCommentFetchInterval] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("leadhive.flow.comment-fetch-interval"));
      return saved === null ? DEFAULT_COMMENT_FETCH_INTERVAL : normalizeCommentFetchInterval(saved);
    } catch {
      return DEFAULT_COMMENT_FETCH_INTERVAL;
    }
  });
  const updateCommentFetchInterval = useCallback(value => {
    const next = normalizeCommentFetchInterval(value);
    setCommentFetchInterval(current => (
      current.amount === next.amount && current.unit === next.unit
        ? current
        : next
    ));
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(
        "leadhive.flow.comment-fetch-interval",
        JSON.stringify(commentFetchInterval),
      );
    } catch {
      // The selected interval still applies until the page is closed.
    }
  }, [commentFetchInterval]);
  const {
    data: connectedChannels,
    loading: checkingChannels,
    status: channelsStatus,
    error: channelsError,
  } = useYoutubeResource("/auth/channels", channelRefresh);

  const noConnectedChannels =
    !checkingChannels &&
    (channelsStatus === 401 ||
      (!channelsError &&
        (!Array.isArray(connectedChannels) || connectedChannels.length === 0)));
  const hasVerifiedChannel = Boolean(
    !checkingChannels &&
    channel?.id &&
    Array.isArray(connectedChannels) &&
    connectedChannels.some(item => item.youtube_channel_id === channel.id),
  );

  // Exit demo state
  const [exiting, setExiting] = useState(false);
  const [exitError, setExitError] = useState("");
  // Bumped on exit so the active step remounts and refetches (otherwise step 1 keeps showing old channels)
  const [sessionKey, setSessionKey] = useState(0);

  // The workspace is reachable after channel/persona setup; video selection unlocks its tools inline.
  const personaComplete = Boolean(
    profile?.business_name?.trim() &&
    profile?.brand_tone &&
    profile?.services?.trim() &&
    profile?.ai_rules?.trim(),
  );
  const stepReady = [hasVerifiedChannel && personaComplete, Boolean(video)];

  // Furthest step the user may be on: the first unfinished step (or the last step if all are done)
  const firstBlocked = stepReady.findIndex(ready => !ready);
  const isRestoringChannel = checkingChannels && Boolean(channel?.id);
  const maxStep = isRestoringChannel || firstBlocked === -1 ? LAST_STEP : firstBlocked;

  // Step from the URL (1-based). Legacy URLs for steps 3/4 resolve to the second workspace step.
  const rawStep = searchParams.get("step");
  const requested = Number.isInteger(Number(rawStep)) && Number(rawStep) >= 1 ? Number(rawStep) - 1 : 0;
  const currentStep = Math.min(requested, LAST_STEP, maxStep);

  // If the URL asks for a step that isn't reachable yet (typed by hand, or state was cleared),
  // correct it in place, replacing the history entry so Back doesn't loop
  useEffect(() => {
    if (isRestoringChannel) return;
    if (rawStep !== null && rawStep !== String(currentStep + 1)) {
      setSearchParams({ step: String(currentStep + 1) }, { replace: true });
    }
  }, [isRestoringChannel, rawStep, currentStep, setSearchParams]);

  // Scroll to the top whenever the step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [currentStep]);

  const isFirst = currentStep === 0;
  const isLast = currentStep === LAST_STEP;
  const canGoNext = !isLast && (currentStep === 0 ? hasVerifiedChannel : stepReady[currentStep]);

  // Each step change adds a history entry, so the browser Back button returns to the previous step
  const goToStep = index => setSearchParams({ step: String(index + 1) });

  const nextStep = () => {
    if (currentStep === 0 && !personaComplete) {
      personaFormRef.current?.requestSubmit();
      return;
    }
    if (canGoNext) goToStep(currentStep + 1);
  };

  const previousStep = () => {
    if (!isFirst) goToStep(currentStep - 1);
  };

  // Picking a different channel clears the persona and video, since they belonged to the previous channel.
  // Re-picking the same channel keeps them.
  const selectChannel = next => {
    if (next?.id !== channel?.id) {
      setProfile(null);
      setVideo(null);
    }
    setChannel(next);
  };

  const clearFlowState = () => {
    setChannel(null);
    setProfile(null);
    setVideo(null);
    setChannelRefresh(value => value + 1);
  };

  useEffect(() => {
    if (
      checkingChannels ||
      !Array.isArray(connectedChannels) ||
      !channel?.id ||
      connectedChannels.some(item => item.youtube_channel_id === channel.id)
    ) {
      return;
    }

    setChannel(null);
    setProfile(null);
    setVideo(null);
  }, [checkingChannels, connectedChannels, channel?.id, setChannel, setProfile, setVideo]);

  const accountDeleted = () => {
    clearFlowState();
    try {
      localStorage.removeItem("leadhive.flow.channel");
      localStorage.removeItem("leadhive.flow.profile");
      localStorage.removeItem("leadhive.flow.video");
      sessionStorage.removeItem("leadhive.youtube.auth-return");
    } catch {
      // Storage can be unavailable in restricted/private browser contexts.
    }
    navigate("/", { replace: true });
  };

  // Exit demo: log out on the backend (clears the auth cookie), reset the flow, go back to step 1
  const exitDemo = async () => {
    setExiting(true);
    setExitError("");
    try {
      await logoutUser();
    } catch (err) {
      // 401 means the session was already gone, which is fine. Anything else: stay put and show the error.
      if (err?.status !== 401) {
        setExitError(err?.message || "Could not log out. Please try again.");
        setExiting(false);
        return;
      }
    }
    // Setting these to null also clears their localStorage entries (useStoredState does that)
    setChannel(null);
    setProfile(null);
    setVideo(null);
    setSessionKey(k => k + 1);
    setSearchParams({ step: "1" }, { replace: true });
    setExiting(false);
  };

  // Component for the active step
  const { Component: ActiveStep } = FLOW_STEPS[currentStep];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header: brand, module label, step navigation, demo + exit */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-3">
          <Link
            to="/"
            aria-label="LeadHive AI home"
            className="shrink-0 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2"
          >
            <img src="/leadhive-logo.png" alt="LeadHive AI" className="h-8 w-auto" />
          </Link>
          <span className="hidden h-6 w-px bg-gray-300 sm:block" aria-hidden="true" />
          <Link
            to="/flow?step=1"
            className="hidden items-center gap-2 whitespace-nowrap text-sm font-semibold text-[#ff0033] transition hover:text-[#cc0029] focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 md:inline-flex"
          >
            <svg width="18" height="14" viewBox="0 0 20 15" aria-hidden="true">
              <rect width="20" height="15" rx="4" fill="#ff0033" />
              <path d="M8 3.5v8l6-4-6-4Z" fill="white" />
            </svg>
            <span>YouTube Intelligence</span>
          </Link>

          {hasVerifiedChannel && (
            <nav aria-label="YouTube Intelligence steps" className="flex min-w-0 flex-1 items-center justify-center gap-1 overflow-x-auto">
              {FLOW_STEPS.map((step, index) => {
                const isActive = index === currentStep;
                const reachable = index <= maxStep;
                return (
                  <button
                    key={step.key}
                    type="button"
                    onClick={() => reachable && !isActive && goToStep(index)}
                    disabled={!reachable}
                    aria-current={isActive ? "step" : undefined}
                    className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-[#e5f9fc] text-[#168ca1]"
                        : reachable
                        ? "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        : "cursor-not-allowed text-gray-400"
                    }`}
                  >
                    {step.label}
                  </button>
                );
              })}
            </nav>
          )}

          <div className="ml-auto flex shrink-0 items-center gap-2">
            {noConnectedChannels && (
              <Link
                to="/interactive-demo-2"
                className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-[#ff0033] transition hover:text-[#cc0029] focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2"
              >
                <svg width="18" height="14" viewBox="0 0 20 15" aria-hidden="true">
                  <rect width="20" height="15" rx="4" fill="currentColor" />
                  <path d="M8 3.5v8l6-4-6-4Z" fill="white" />
                </svg>
                <span>Interactive Demo</span>
              </Link>
            )}
            <button
              type="button"
              onClick={exitDemo}
              disabled={exiting}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <span>{exiting ? "Exiting..." : "Exit Demo"}</span>
              <ArrowUpRight size={15} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl p-6">
        {exitError && (
          <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {exitError}
          </p>
        )}

        <div>
          <ActiveStep
            key={sessionKey}
            channel={channel}
            onSelectChannel={selectChannel}
            onDisconnected={clearFlowState}
            onAccountDeleted={accountDeleted}
            profile={profile}
            onProfileSaved={setProfile}
            personaFormRef={personaFormRef}
            onPersonaSavedAndContinue={() => goToStep(currentStep + 1)}
            onPersonaNext={nextStep}
            commentFetchInterval={commentFetchInterval}
            onCommentFetchIntervalChange={updateCommentFetchInterval}
            video={video}
            onVideoSaved={setVideo}
          />
        </div>

        {/* Navigation */}
        <div className="mt-6 flex justify-between">
          {!isFirst && (
            <button
              onClick={previousStep}
              className="rounded bg-gray-200 px-4 py-2"
            >
              Back
            </button>
          )}

          {!isLast && !isFirst && (
            <button
              onClick={nextStep}
              disabled={!canGoNext}
              className="lh-primary-action rounded px-4 py-2 disabled:opacity-50"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
