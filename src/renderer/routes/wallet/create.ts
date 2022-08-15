import { Route } from '../types'

export const base: Route<void> = {
  template: '/wallet/create',
  path() {
    return this.template
  }
}

export const keystore: Route<void> = {
  template: `${base.template}/keystore`,
  path() {
    return this.template
  }
}

export const phrase: Route<void> = {
  template: `${base.template}/phrase`,
  path() {
    return this.template
  }
}
