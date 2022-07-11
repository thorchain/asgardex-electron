// Transition
export function transition(timing = 0.1, property = 'all') {
  return `transition: ${property} ${timing}s cubic-bezier(0.215, 0.61, 0.355, 1);`
}
