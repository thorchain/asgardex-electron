import { Route } from './types'

export const base: Route<void> = {
  template: '/',
  path() {
    return this.template
  }
}
