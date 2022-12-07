import { cosmosclient } from '@cosmos-client/core'
import axios, { AxiosRequestConfig } from 'axios'

import { ASGARDEX_IDENTIFIER } from '../const'

const {
  config: { globalAxios }
} = cosmosclient

export const register9R = () => {
  const interceptor = <T>(config: AxiosRequestConfig<T>) => {
    try {
      // Creating an URL will throw an `TypeError` if `url` is not available and 'unknown-url' is set
      // [TypeError: Invalid URL] input: 'unknown-url', code: 'ERR_INVALID_URL' }
      const url = new URL(config?.url ?? 'unknown-url')
      if (url.host.includes('ninerealms')) {
        // headers might be undefined/empty by definition
        if (!config.headers) config.headers = {}
        config.headers['x-client-id'] = `${ASGARDEX_IDENTIFIER}`
      }
    } catch (error) {
      console.error(`Failed to add custom 'x-client-id' header`, error)
    }

    return config
  }

  axios.interceptors.request.use(interceptor, (error) => Promise.reject(error))
  globalAxios.interceptors.request.use(interceptor, (error) => Promise.reject(error))
}
