import type { InfuraCreds } from '@xchainjs/xchain-ethereum'

import { envOrDefault } from '../utils/env'

// expose env (needed to access ENVs by `envOrDefault`) in `main` thread)
require('dotenv').config()

const INFURA_PROJECT_ID = envOrDefault(process.env.REACT_APP_INFURA_PROJECT_ID, '')
const INFURA_PROJECT_SECRET = envOrDefault(process.env.REACT_APP_INFURA_PROJECT_SECRET, '')

export const getInfuraCreds = (): InfuraCreds | undefined =>
  // Infura provider needs `projectId` OR `projectId` and `projectSecret`
  // That's why `INFURA_PROJECT_ID` is needed at least
  INFURA_PROJECT_ID
    ? {
        projectId: INFURA_PROJECT_ID,
        projectSecret: INFURA_PROJECT_SECRET
      }
    : undefined
