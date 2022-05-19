import { envOrDefault } from '../utils/env'

const ETHPLORER_API_KEY = envOrDefault(process.env.REACT_APP_ETHPLORER_API_KEY, 'freekey')
const ETHPLORER_API_URL = envOrDefault(process.env.REACT_APP_ETHPLORER_API_URL, 'https://api.ethplorer.io')

export const getEthplorerCreds = (): { ethplorerApiKey: string; ethplorerUrl: string } => ({
  ethplorerApiKey: ETHPLORER_API_KEY,
  ethplorerUrl: ETHPLORER_API_URL
})
