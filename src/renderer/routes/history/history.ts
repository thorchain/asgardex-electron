import { Route } from '../types'

export const base: Route<void> = {
  template: '/history',
  path() {
    return this.template
  }
}
