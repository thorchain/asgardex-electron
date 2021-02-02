export type ENV = string

/**
 * Type guard to check whether a value is an ENV
 **/
export const isEnv = (env: ENV | undefined): env is ENV => !!env

/**
 * Returns a given ENV if it's valid only or returns a default value
 * @param env {string} ENV
 * @param defaultValue {string} Default value
 */
export const envOrDefault = (env: ENV | undefined, defaultValue: string) => (isEnv(env) ? env : defaultValue)

/**
 * Read enabled chains from a given ENV.
 * @param env {string} ENV
 */
export const loadEnabledChains = (env: ENV | undefined) => {
  return envOrDefault(env, 'THOR,BNB,BTC,ETH').split(',')
}
