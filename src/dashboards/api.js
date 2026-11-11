async function platformRequest(platform, endpoint, options = {}) {
  let response;
  let data;
  const endpointPath = platform === 'real-estate' ? `estate/${endpoint}` : endpoint;
  const baseUrls = {
    facebook: import.meta.env.DEV
      ? '/facebook-api'
      : import.meta.env.VITE_FACEBOOK_API_URL || '/api/facebook',
    'real-estate': import.meta.env.DEV
      ? '/real-estate-api'
      : import.meta.env.VITE_REAL_ESTATE_API_URL || '/api/real-estate',
    whatsapp: import.meta.env.DEV
      ? '/whatsapp-api'
      : import.meta.env.VITE_WHATSAPP_API_URL || '/api/whatsapp',
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
