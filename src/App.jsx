import { Suspense, lazy, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router";
import MarketingApp from "@/features/marketing/MarketingApp";
import { FlowWidget } from "./features/youtube/screens/FlowWidget";
import { getAuthChannels, youtubeRequest } from "./features/youtube/api";
import { FlowLoader } from "./features/youtube/components/FlowLoader";
import { getVideoItems } from "./features/youtube/videoPayload";

const AUTH_RETURN_KEY = "leadhive.youtube.auth-return";
const FLOW_CHANNEL_KEY = "leadhive.flow.channel";
const FLOW_PROFILE_KEY = "leadhive.flow.profile";
const FLOW_VIDEO_KEY = "leadhive.flow.video";

function readStoredChannelId() {
  try {
    return JSON.parse(localStorage.getItem(FLOW_CHANNEL_KEY))?.id || "";
  } catch {
    return "";
  }
}

function getSavedPersona(payload) {
  const profile = payload?.profile || payload || {};
  const complete = Boolean(
    typeof profile.business_name === "string" &&
    profile.business_name.trim() &&
    typeof profile.brand_tone === "string" &&
    profile.brand_tone &&
    typeof profile.services === "string" &&
    profile.services.trim() &&
    typeof profile.ai_rules === "string" &&
    profile.ai_rules.trim(),
  );
  return complete ? profile : null;
}

async function restoreSavedWorkspace(channels) {
  const storedChannelId = readStoredChannelId();
  const candidates = [...channels].sort((a, b) => (
    Number(b.youtube_channel_id === storedChannelId) -
    Number(a.youtube_channel_id === storedChannelId)
  ));

  for (const rawChannel of candidates) {
    const channelId = rawChannel.youtube_channel_id;
    if (!channelId) continue;

    try {
      const profileResponse = await youtubeRequest(
        `/business-profile/${encodeURIComponent(channelId)}`,
      );
      const profile = getSavedPersona(profileResponse);
      if (!profile) continue;

      const videosResponse = await youtubeRequest(
        `/selection-videos/${encodeURIComponent(channelId)}?limit=5`,
      );
      const selectedVideo = getVideoItems(videosResponse).find(video => (
        video.selected && video.youtube_video_id
      ));
      if (!selectedVideo) continue;

      const channel = {
        id: channelId,
        name: rawChannel.channel_name || channelId,
        thumbnail: rawChannel.channel_thumbnail_url || "",
        subscribers: rawChannel.channel_subscribers,
        views: rawChannel.channel_views,
      };
      const video = {
        id: selectedVideo.youtube_video_id,
        title: selectedVideo.title || "Untitled video",
        description: selectedVideo.description || "",
      };
      localStorage.setItem(FLOW_CHANNEL_KEY, JSON.stringify(channel));
      localStorage.setItem(FLOW_PROFILE_KEY, JSON.stringify(profile));
      localStorage.setItem(FLOW_VIDEO_KEY, JSON.stringify(video));
      return true;
    } catch (error) {
      if (error?.status === 404) continue;
      console.error(`[Auth] Could not restore saved YouTube workspace for channel ${channelId}`, error);
    }
  }

  return false;
}

const InteractiveDemo2 = lazy(() =>
  import("./features/youtube/components/InteractiveDemo2").then((m) => ({
    default: m.InteractiveDemo2,
  })),
);
const LegalPage = lazy(() =>
  import("@/features/legal/LegalPage").then((m) => ({ default: m.LegalPage })),
);
const NotFound = lazy(() => import("@/NotFound"));

function HomeRoute() {
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(
    () => sessionStorage.getItem(AUTH_RETURN_KEY) === "pending",
  );

  useEffect(() => {
    if (!checkingAuth) return;

    let active = true;
    getAuthChannels()
      .then(async (channels) => {
        if (!active) return;
        const hasSavedWorkspace = Array.isArray(channels) &&
          await restoreSavedWorkspace(channels);
        if (!active) return;
        sessionStorage.removeItem(AUTH_RETURN_KEY);
        navigate(`/flow?step=${hasSavedWorkspace ? "2" : "1"}`, { replace: true });
      })
      .catch((error) => {
        if (!active) return;
        sessionStorage.removeItem(AUTH_RETURN_KEY);
        if (error?.status !== 401) {
          console.error("[Auth] Could not verify YouTube connection after sign-in", error);
        }
        setCheckingAuth(false);
      });

    return () => {
      active = false;
    };
  }, [checkingAuth, navigate]);

  if (checkingAuth) return <FlowLoader message="Opening your YouTube channels..." />;
  return <MarketingApp />;
}

function CpanelRedirect() {
  useEffect(() => {
    window.location.replace("https://core47.hostingmadeeasy.com:2083/");
  }, []);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<HomeRoute />} />
          <Route path="/contact" element={<MarketingApp />} />
          <Route path="/test-demo" element={<Navigate to="/flow?step=1" replace />} />
          <Route path="/flow" element={<FlowWidget />} />
          <Route path="/interactive-demo-2" element={<InteractiveDemo2 />} />
          <Route path="/privacy" element={<LegalPage type="privacy" />} />
          <Route path="/terms" element={<LegalPage type="terms" />} />
          <Route path="/cpanel" element={<CpanelRedirect />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}