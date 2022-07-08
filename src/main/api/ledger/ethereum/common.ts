import { DEFAULT_STORAGES } from '../../../../shared/const'
import { EthDerivationMode } from '../../../../shared/ethereum/types'
import { getFileContent as getFileStore } from '../../fileStore'

export const getDerivationMode = async (): Promise<EthDerivationMode> => {
  // get `EthDerivationMode` from file storage
  const { ethDerivationMode } = await getFileStore('common', DEFAULT_STORAGES.common)
  return ethDerivationMode
}
