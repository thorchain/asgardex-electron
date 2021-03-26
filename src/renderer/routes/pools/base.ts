import { Route } from '../types'

export const base: Route<void> = {
  template: `/pools`,
  path() {
    return this.template
  }
}
