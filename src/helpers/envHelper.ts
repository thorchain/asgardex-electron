/**
 * Returns a given ENV if it's valid only or returns a default value
 * @param env {string} ENV
 * @param defaultValue {string} Default value
 */
export const envOrDefault = (env: string | undefined, defaultValue: string) =>
  env && env.length > 0 ? env : defaultValue
