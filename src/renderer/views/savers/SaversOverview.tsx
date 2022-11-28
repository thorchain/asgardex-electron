import { Chain } from '@xchainjs/xchain-util'

import { BackLinkButton } from '../../components/uielements/button'
import { MimirHalt } from '../../services/thorchain/types'

export type Props = {
  haltedChains: Chain[]
  mimirHalt: MimirHalt
  walletLocked: boolean
}

export const SaversOverview: React.FC<Props> = (): JSX.Element => {
  return (
    <>
      <BackLinkButton />
      <h1>Savers Overview</h1>
    </>
  )
}
