import { Route } from './types'

export const base: Route<void> = {
  template: '/playground',
  path() {
    return this.template
  }
}
