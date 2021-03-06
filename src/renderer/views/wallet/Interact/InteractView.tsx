import React from 'react'

import { THORChain } from '@xchainjs/xchain-util'
import { Col, Row } from 'antd'
import { useObservableState } from 'observable-hooks'
import { useParams } from 'react-router'

import { Network } from '../../../../shared/api/types'
import { Interact } from '../../../components/interact'
import { BackLink } from '../../../components/uielements/backLink'
import { useAppContext } from '../../../contexts/AppContext'
import { useOpenExplorerTxUrl } from '../../../hooks/useOpenExplorerTxUrl'
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

  const openExplorerTxUrl = useOpenExplorerTxUrl(THORChain)

  return (
    <>
      <Row justify="space-between">
        <Col>
          <BackLink />
        </Col>
      </Row>
      <Styled.ContentContainer>
        <Interact
          bondContent={<BondView walletAddress={walletAddress} goToTransaction={openExplorerTxUrl} />}
          leaveContent={<LeaveView openExplorerTxUrl={openExplorerTxUrl} />}
          unbondContent={<UnbondView openExplorerTxUrl={openExplorerTxUrl} />}
          customContent={<CustomView openExplorerTxUrl={openExplorerTxUrl} />}
          network={network}
        />
      </Styled.ContentContainer>
    </>
  )
}
