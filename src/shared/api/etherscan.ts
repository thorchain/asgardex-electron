import { envOrDefault } from '../utils/env'

// expose env (needed to access ENVs by `envOrDefault`) in `main` thread)
require('dotenv').config()

export const getEtherscanApiKey = () => envOrDefault(process.env.REACT_APP_ETHERSCAN_API_KEY, '')
