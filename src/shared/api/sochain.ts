import { envOrDefault } from '../utils/env'

export const getSochainUrl = (): string => envOrDefault(process.env.REACT_APP_SOCHAIN_URL, 'https://sochain.com/api/v2')
