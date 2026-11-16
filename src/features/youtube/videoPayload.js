export function getVideoItems(payload) {
  if (Array.isArray(payload)) return payload
  if (!payload || typeof payload !== 'object') return []

  const candidates = [
    payload.videos,
    payload.items,
    payload.results,
    payload.data,
    payload.data?.videos,
    payload.data?.items,
    payload.data?.results,
  ]
  return candidates.find(Array.isArray) || []
}
