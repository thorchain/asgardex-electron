import * as RD from '@devexperts/remote-data-ts'
import { ETHAddress } from '@xchainjs/xchain-ethereum'
import { baseAmount } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import { useObservableState } from 'observable-hooks'

import { Upgrade } from '../../../components/wallet/txs/upgrade'
import { useEthereumContext } from '../../../contexts/EthereumContext'
import { liveData } from '../../../helpers/rx/liveData'
import { CommonUpgradeProps } from './types'

export const UpgradeETH: React.FC<CommonUpgradeProps> = (props) => {
  const {
    assetData: { asset }
  } = props
  const { fees$, reloadFees } = useEthereumContext()

  const [upgradeFeeRD] = useObservableState(
    () =>
      FP.pipe(
        fees$({
          asset,
          amount: baseAmount(1),
          recipient: ETHAddress
        }),
        liveData.map((fees) => fees.fast)
      ),
    RD.initial
  )

  return <Upgrade fee={upgradeFeeRD} reloadFeeHandler={reloadFees} {...props} />
}
