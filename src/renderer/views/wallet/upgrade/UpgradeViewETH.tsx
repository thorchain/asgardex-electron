import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/function'
import { useObservableState } from 'observable-hooks'

import { Upgrade } from '../../../components/wallet/txs/upgrade'
import { useEthereumContext } from '../../../contexts/EthereumContext'
import { liveData } from '../../../helpers/rx/liveData'
import { CommonUpgradeProps } from './types'

export const UpgradeETH: React.FC<CommonUpgradeProps> = (props) => {
  const { fees$, reloadFees } = useEthereumContext()

  const [upgradeFeeRD] = useObservableState(
    () =>
      FP.pipe(
        fees$(),
        liveData.map((fees) => fees.fast)
      ),
    RD.initial
  )

  return <Upgrade fee={upgradeFeeRD} reloadFeeHandler={reloadFees} {...props} />
}
