import { envOrDefault } from '../utils/env'

// expose env (needed to access ENVs by `envOrDefault`) in `main` thread)
require('dotenv').config()

export const getSochainUrl = (): string => envOrDefault(process.env.REACT_APP_SOCHAIN_URL, 'https://sochain.com/api/v2')
