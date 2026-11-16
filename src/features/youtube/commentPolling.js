export const DEFAULT_COMMENT_FETCH_INTERVAL = { amount: 5, unit: 'minutes' }

export function normalizeCommentFetchInterval(value) {
  const interval = typeof value === 'number'
    ? { amount: value, unit: 'minutes' }
    : value
  const unit = interval?.unit === 'hours' ? 'hours' : 'minutes'
  const amount = Number(interval?.amount)
  const max = unit === 'hours' ? 24 : 1440

  if (!Number.isInteger(amount) || amount < 1 || amount > max) {
    return DEFAULT_COMMENT_FETCH_INTERVAL
  }

  return { amount, unit }
}

export function toCommentFetchIntervalMinutes(value) {
  const interval = normalizeCommentFetchInterval(value)
  return interval.amount * (interval.unit === 'hours' ? 60 : 1)
}

export function fromCommentFetchIntervalMinutes(minutes) {
  const interval = normalizeCommentFetchInterval(minutes)
  return interval.amount >= 60 && interval.amount % 60 === 0
    ? { amount: interval.amount / 60, unit: 'hours' }
    : interval
}

export function getCommentFetchIntervalMs(value) {
  return toCommentFetchIntervalMinutes(value) * 60 * 1000
}
