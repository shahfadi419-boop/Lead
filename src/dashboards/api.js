async function platformRequest(platform, endpoint, options = {}) {
  let response;
  let data;
  const endpointPath = platform === 'real-estate' ? `estate/${endpoint}` : endpoint;
  const baseUrls = {
    facebook: import.meta.env.DEV
      ? '/facebook-api'
      : '/api/facebook',
    'real-estate': import.meta.env.DEV
      ? '/real-estate-api'
      : '/api/real-estate',
    whatsapp: import.meta.env.DEV
      ? '/whatsapp-api'
      : '/api/whatsapp',
  };
  const baseUrl = baseUrls[platform];

  try {
    const isRemoteUrl = /^https?:\/\//i.test(baseUrl);
    const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');
    const requestUrl = isRemoteUrl || import.meta.env.DEV &&
      (platform === 'facebook' || platform === 'real-estate' || platform === 'whatsapp')
      ? `${normalizedBaseUrl}/${endpointPath}?${new URLSearchParams(options.query)}`
      : `${normalizedBaseUrl}?${new URLSearchParams({ endpoint, ...options.query })}`;
    response = await fetch(requestUrl, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
      signal: options.signal,
    });

    const text = await response.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }
  } catch (error) {
    if (options.signal?.aborted) throw error;
    throw new Error(`Could not reach the ${platform} backend for ${endpoint}.`, { cause: error });
  }

  if (!response.ok) {
    const detail = data && typeof data === 'object' && typeof data.detail === 'string'
      ? `: ${data.detail}`
      : '';
    throw new Error(`${platform} backend request failed (${response.status})${detail}`);
  }

  if (!data || typeof data !== 'object') {
    throw new Error(`${platform} backend returned an invalid response for ${endpoint}.`);
  }

  return data;
}

async function youtubeRequest(path, options = {}) {
  let response;
  let data;
  const baseUrl = import.meta.env.DEV
    ? '/youtube-api'
    : '/api/youtube';
  const query = new URLSearchParams(options.query);

  try {
    response = await fetch(`${baseUrl}/${path}${query.size ? `?${query}` : ''}`, {
      cache: 'no-store',
      credentials: 'include',
      headers: { Accept: 'application/json' },
      signal: options.signal,
    });

    const text = await response.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }
  } catch (error) {
    if (options.signal?.aborted) throw error;
    throw new Error(`Could not reach the YouTube backend for ${path}.`, { cause: error });
  }

  if (!response.ok) {
    const detail = data && typeof data === 'object' && typeof data.detail === 'string'
      ? `: ${data.detail}`
      : '';
    throw new Error(`YouTube backend request failed (${response.status})${detail}`);
  }

  return data;
}

export function getYouTubePinnedAnalytics(options) {
  return youtubeRequest('analytics/pinned', {
    ...options,
    query: { max_comments: '100', max_replies: '50', ...options?.query },
  });
}

export function getPlatformStats(platform, options) {
  return platformRequest(platform, 'stats', options);
}

export function getPlatformLeads(platform, options) {
  return platformRequest(platform, 'leads', {
    ...options,
    query: { ...options?.query, limit: '200' },
  });
}

export function getPlatformEngagement(platform, options) {
  return platformRequest(platform, 'engagement', options);
}

export function getPlatformPageInfo(platform, options) {
  return platformRequest(platform, 'page-info', options);
}
