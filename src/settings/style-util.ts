// Transition
export function transition(timing = 0.1) {
  return `transition: all ${timing}s cubic-bezier(0.215, 0.61, 0.355, 1);`
}

// Border Radius
export function borderRadius(radius = 0) {
  return `border-radius: ${radius};`
}

// Box Shadow
export function boxShadow(shadow = 'none') {
  return `box-shadow: ${shadow};`
}
