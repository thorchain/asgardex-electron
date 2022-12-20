import { Provider } from '@ethersproject/abstract-provider'

/**
 * Helper to get current block time (current === pending block)
 * https://docs.ethers.io/ethers.js/v3.0/html/api-providers.html?highlight=timestamp#block-tag
 */
export const getBlocktime = async (provider: Provider): Promise<number> => (await provider.getBlock('latest')).timestamp
