import { RunHelpers } from 'rxjs/internal/testing/TestScheduler'

import type { ApiKeystore, ApiLang, ApiUrl, ApiHDWallet } from '../shared/api/types'

export type RunObservableCallback<T> = (helpers: RunHelpers) => T
export type RunObservable = <T>(callback: RunObservableCallback<T>) => T

declare global {
  interface Window {
    apiHDWallet: ApiHDWallet
    apiKeystore: ApiKeystore
    apiLang: ApiLang
    apiUrl: ApiUrl
  }

  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Chai {
    interface JestAssertions {
      toBeNone(): void
      toBeLeft(): void
    }
  }
}
