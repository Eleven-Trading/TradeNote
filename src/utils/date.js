// src/utils/date.js

// Get today's date in Unix timestamp (start of the day)
export function getTodayUnix() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.floor(today.getTime() / 1000)
}

// Return start of the current week (Monday) in Unix seconds
export function getWeekStartUnix() {
  const today = new Date()
  const day = today.getDay() || 7 // Sunday=0, we treat as 7
  today.setDate(today.getDate() - day + 1) // Go back to Monday
  today.setHours(0, 0, 0, 0)
  return Math.floor(today.getTime() / 1000)
}

// Return start of the current month in Unix seconds
export function getMonthStartUnix() {
  const today = new Date()
  today.setDate(1) // first day of month
  today.setHours(0, 0, 0, 0)
  return Math.floor(today.getTime() / 1000)
}


// Optionally, a few other helpers for future use
export function formatDate(unixTimestamp) {
  const date = new Date(unixTimestamp * 1000)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function getWeekRangeUnix() {
  const today = new Date()
  const dayOfWeek = today.getDay() // 0 (Sun) → 6 (Sat)
  const start = new Date(today)
  start.setDate(today.getDate() - dayOfWeek)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(start.getDate() + 7)
  return {
    startUnix: Math.floor(start.getTime() / 1000),
    endUnix: Math.floor(end.getTime() / 1000)
  }
}
