const enc = encodeURIComponent

function storageKey(scope) {
  return `leadhive.command-center.automation.${enc(scope)}`
}

export function isAutomationStored(scope) {
  if (!scope) return false
  try {
    return localStorage.getItem(storageKey(scope)) === 'enabled'
  } catch (error) {
    console.error('[Command Center] Could not restore automation state', error)
    return false
  }
}

export function storeAutomation(scope, enabled) {
  if (!scope) return
  try {
    if (enabled) localStorage.setItem(storageKey(scope), 'enabled')
    else localStorage.removeItem(storageKey(scope))
  } catch (error) {
    console.error('[Command Center] Could not save automation state', error)
  }
}

export function clearStoredAutomation(channelId, videoId) {
  if (!channelId || !videoId) return
  storeAutomation(`${channelId}:${videoId}`, false)
}
