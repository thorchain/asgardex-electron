import React, { useCallback, useMemo } from 'react'

import { AssetRuneNative } from '@xchainjs/xchain-util'
import { Col, Row } from 'antd'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import { useParams } from 'react-router'

import { Network } from '../../../../shared/api/types'
import { Interact } from '../../../components/interact'
import { BackLink } from '../../../components/uielements/backLink'
import { useAppContext } from '../../../contexts/AppContext'
import { useChainContext } from '../../../contexts/ChainContext'
import * as walletRoutes from '../../../routes/wallet'
import { DEFAULT_NETWORK } from '../../../services/const'
import { BondView } from './BondView'
import { CustomView } from './CustomView'
import * as Styled from './InteractView.styles'
import { LeaveView } from './LeaveView'
import { UnbondView } from './UnbondView'

export const InteractView: React.FC = () => {
  const { walletAddress } = useParams<walletRoutes.DepositParams>()

  const { network$ } = useAppContext()
  const network = useObservableState<Network>(network$, DEFAULT_NETWORK)

  const { getExplorerUrlByAsset$ } = useChainContext()

  const getRuneExplorerUrl$ = useMemo(() => getExplorerUrlByAsset$(AssetRuneNative), [getExplorerUrlByAsset$])
  const runeExplorerUrl = useObservableState(getRuneExplorerUrl$, O.none)
  const goToTransaction = useCallback(
    (txHash: string) => {
      FP.pipe(
        runeExplorerUrl,
        O.map((getExplorerUrl) => window.apiUrl.openExternal(getExplorerUrl(txHash)))
      )
    },
    [runeExplorerUrl]
  )

  return (
    <>
      <Row justify="space-between">
        <Col>
          <BackLink />
        </Col>
      </Row>
      <Styled.ContentContainer>
        <Interact
          bondContent={<BondView walletAddress={walletAddress} goToTransaction={goToTransaction} />}
          leaveContent={<LeaveView goToTransaction={goToTransaction} />}
          unbondContent={<UnbondView goToTransaction={goToTransaction} />}
          customContent={<CustomView goToTransaction={goToTransaction} />}
          network={network}
        />
      </Styled.ContentContainer>
    </>
  )
}
