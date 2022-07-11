import { envOrDefault } from '../utils/env'

// expose env (needed to access ENVs by `envOrDefault`) in `main` thread)
require('dotenv').config()

export const getBlockcypherUrl = (): string =>
  envOrDefault(process.env.REACT_APP_BLOCKCYPHER_URL, 'https://api.blockcypher.com/v1')
