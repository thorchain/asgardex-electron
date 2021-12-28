import React from 'react'

import { THORChain } from '@xchainjs/xchain-util'
import { Col, Row } from 'antd'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useParams } from 'react-router-dom'

import { Network } from '../../../../shared/api/types'
import { Interact } from '../../../components/interact'
import { BackLink } from '../../../components/uielements/backLink'
import { useAppContext } from '../../../contexts/AppContext'
import { useOpenExplorerTxUrl } from '../../../hooks/useOpenExplorerTxUrl'
import type { DepositParams } from '../../../routes/wallet'
import { DEFAULT_NETWORK } from '../../../services/const'
import { BondView } from './BondView'
import { CustomView } from './CustomView'
import * as Styled from './InteractView.styles'
import { LeaveView } from './LeaveView'
import { UnbondView } from './UnbondView'

export const InteractView: React.FC = () => {
  const { walletAddress, walletType, walletIndex: walletIndexRoute } = useParams<DepositParams>()

  const walletIndex = parseInt(walletIndexRoute)

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
          walletType={walletType}
          bondContent={
            <BondView
              walletType={walletType}
              walletIndex={walletIndex}
              walletAddress={walletAddress}
              goToTransaction={openExplorerTxUrl}
            />
          }
          leaveContent={
            <LeaveView walletType={walletType} walletIndex={walletIndex} openExplorerTxUrl={openExplorerTxUrl} />
          }
          unbondContent={
            <UnbondView walletType={walletType} walletIndex={walletIndex} openExplorerTxUrl={openExplorerTxUrl} />
          }
          customContent={
            <CustomView walletType={walletType} walletIndex={walletIndex} openExplorerTxUrl={openExplorerTxUrl} />
          }
          network={network}
        />
      </Styled.ContentContainer>
    </>
  )
}
