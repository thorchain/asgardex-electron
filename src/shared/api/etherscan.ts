import { envOrDefault } from '../utils/env'

export const getEtherscanApiKey = () => envOrDefault(process.env.REACT_APP_ETHERSCAN_API_KEY, '')
