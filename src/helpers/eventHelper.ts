export function clickedInsideNode<T extends Element>(ref: T, e: MouseEvent) {
  return ref.contains(e.target as T)
}

export function clickedOutsideNode<T extends Element>(ref: T, e: MouseEvent) {
  return !ref.contains(e.target as T)
}
