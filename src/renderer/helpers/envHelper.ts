export type ENV = string

/**
 * Type guard to check wether a value is an ENV
 **/
export const isEnv = (env: ENV | undefined): env is ENV => env !== undefined && env.length > 0

/**
 * Returns a given ENV if it's valid only or returns a default value
 * @param env {string} ENV
 * @param defaultValue {string} Default value
 */
export const envOrDefault = (env: ENV | undefined, defaultValue: string) => (isEnv(env) ? env : defaultValue)
