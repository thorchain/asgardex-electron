import { cosmosclient } from '@cosmos-client/core'
import axios from 'axios'

import { ASGARDEX_IDENTIFIER, NINE_REALMS_CLIENT_HEADER } from '../const'

const {
  config: { globalAxios }
} = cosmosclient

/**
 * Middleware to add custom header to requests (9R endpoints only)
 *
 * @param request RequestArgs (rxjs/ajax) | AxiosRequestConfig (axios)
 * @returns RequestArgs (rxjs/ajax) | AxiosRequestConfig (axios)
 */
export const add9Rheader = <T extends { url?: string; headers?: Object }>(request: T) => {
  try {
    // URL throws an `TypeError` if `url` is not available and 'unknown-url' is set
    // [TypeError: Invalid URL] input: 'unknown-url', code: 'ERR_INVALID_URL' }
    const url = new URL(request?.url ?? 'unknown-url')
    if (url.host.includes('ninerealms')) {
      const headers = request?.headers ?? {}
      // Add custom header to request before returning it
      return { ...request, headers: { ...headers, [`${NINE_REALMS_CLIENT_HEADER}`]: `${ASGARDEX_IDENTIFIER}` } }
    }
  } catch (error) {
    console.error(`Failed to add custom ${NINE_REALMS_CLIENT_HEADER} header`, error)
  }

  // If it errors, just return same request and keep it untouched (no change)
  return request
}

/**
 * Adds custom header to axios requests (9R endpoints only)
 */
export const register9Rheader = () => {
  axios.interceptors.request.use(add9Rheader, (error) => Promise.reject(error))
  globalAxios.interceptors.request.use(add9Rheader, (error) => Promise.reject(error))
}
