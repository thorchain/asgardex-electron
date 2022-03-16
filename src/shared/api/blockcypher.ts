import { envOrDefault } from '../utils/env'

export const getBlockcypherUrl = (): string =>
  envOrDefault(process.env.REACT_APP_BLOCKCYPHER_URL, 'https://api.blockcypher.com/v1')
