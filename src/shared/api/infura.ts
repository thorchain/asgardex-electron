import type { InfuraCreds } from '@xchainjs/xchain-ethereum'

import { envOrDefault } from '../utils/env'

const INFURA_PROJECT_ID = envOrDefault(process.env.REACT_APP_INFURA_PROJECT_ID, '')
const INFURA_PROJECT_SECRET = envOrDefault(process.env.REACT_APP_INFURA_PROJECT_SECRET, '')

export const getInfuraCreds = (): InfuraCreds | undefined =>
  INFURA_PROJECT_ID
    ? {
        projectId: INFURA_PROJECT_ID,
        projectSecret: INFURA_PROJECT_SECRET
      }
    : undefined
