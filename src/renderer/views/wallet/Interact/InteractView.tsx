import React from 'react'

import { THORChain } from '@xchainjs/xchain-util'
import { Col, Row } from 'antd'
import * as O from 'fp-ts/lib/Option'
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
  const { walletAddress, walletType } = useParams<walletRoutes.DepositParams>()

  const { network$ } = useAppContext()
  const network = useObservableState<Network>(network$, DEFAULT_NETWORK)

  const openExplorerTxUrl = useOpenExplorerTxUrl(O.some(THORChain))

  return (
    <>
      <Row justify="space-between">
        <Col>
          <BackLink />
        </Col>
      </Row>
      <Styled.ContentContainer>
        <Interact
          bondContent={
            <BondView walletType={walletType} walletAddress={walletAddress} goToTransaction={openExplorerTxUrl} />
          }
          leaveContent={<LeaveView walletType={walletType} openExplorerTxUrl={openExplorerTxUrl} />}
          unbondContent={<UnbondView walletType={walletType} openExplorerTxUrl={openExplorerTxUrl} />}
          customContent={<CustomView walletType={walletType} openExplorerTxUrl={openExplorerTxUrl} />}
          network={network}
        />
      </Styled.ContentContainer>
    </>
  )
}
