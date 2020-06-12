import { FixmeType } from '../types/asgardex.d'

export function clickedInsideNode(ref: FixmeType, e: MouseEvent) {
  return ref.current.contains(e.target)
}

export function clickedOutsideNode(ref: FixmeType, e: MouseEvent) {
  return !ref.current.contains(e.target)
}
