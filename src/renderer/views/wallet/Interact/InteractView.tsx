import React from 'react'

import { Col, Row } from 'antd'
import { useObservableState } from 'observable-hooks'
import { useParams } from 'react-router'

import { Network } from '../../../../shared/api/types'
import { Interact } from '../../../components/interact'
import { BackLink } from '../../../components/uielements/backLink'
import { useAppContext } from '../../../contexts/AppContext'
import * as walletRoutes from '../../../routes/wallet'
import { DEFAULT_NETWORK } from '../../../services/const'
import { BondView } from './BondView'
import { CustomView } from './CustomView'
import * as Styled from './InteractView.styles'
import { LeaveView } from './LeaveView'
import { UnbondView } from './UnbondView'

export const InteractView: React.FC = () => {
  const { walletAddress, walletType, walletIndex: walletIndexRoute } = useParams<walletRoutes.DepositParams>()

  const walletIndex = parseInt(walletIndexRoute)

  const { network$ } = useAppContext()
  const network = useObservableState<Network>(network$, DEFAULT_NETWORK)

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
          bondContent={<BondView walletType={walletType} walletIndex={walletIndex} walletAddress={walletAddress} />}
          leaveContent={<LeaveView walletType={walletType} walletIndex={walletIndex} />}
          unbondContent={<UnbondView walletType={walletType} walletIndex={walletIndex} />}
          customContent={<CustomView walletType={walletType} walletIndex={walletIndex} />}
          network={network}
        />
      </Styled.ContentContainer>
    </>
  )
}
