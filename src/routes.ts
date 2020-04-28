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

/**
 * Example for a route w/o parameter
 * template === path
 */
export const contentARoute: Route<void> = {
  template: '/',
  path() {
    return this.template
  }
}

/**
 * Example of a route w/ parameter
 */
type ContentBParams = { slug: string }
export const contentBRoute: Route<ContentBParams> = {
  template: '/content-b/:slug',
  path: ({ slug }) => `/content-b/${slug}`
}
