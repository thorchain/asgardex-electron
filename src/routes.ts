/**
 * Generic type for any routes
 * `P` can be anything to define parameter(s)
 *
 *
 */
type Route<P> = {
  template: string
  path: (p: P) => string
}

export const homeRoute: Route<void> = {
  template: '/',
  path() {
    return this.template
  }
}

export const swapHomeRoute: Route<void> = {
  template: '/swap/',
  path() {
    return this.template
  }
}

export type SwapRouteParams = { source: string; target: string }
export const swapRoute: Route<SwapRouteParams> = {
  template: '/swap/:source-:target',
  path: ({ source, target }) => `/swap/${source}-${target}`
}

export const stakeHomeRoute: Route<void> = {
  template: '/stake/',
  path() {
    return this.template
  }
}

export type StakeRouteParams = { asset: string }
export const stakeRoute: Route<StakeRouteParams> = {
  template: '/stake/:asset',
  path: ({ asset }) => `/stake/${asset}`
}


export const walletBaseRoute: Route<void> = {
  template: '/wallet',
  path() {
    return this.template
  }
}
export const walletHomeRoute: Route<void> = {
  template: `${walletBaseRoute.template}/home`,
  path() {
    return this.template
  }
}
export const walletAssetsRoute: Route<void> = {
  template: `${walletBaseRoute.template}/assets`,
  path() {
    return this.template
  }
}
