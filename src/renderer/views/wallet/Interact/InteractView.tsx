import React from 'react'

import { Col, Row } from 'antd'
import { useParams } from 'react-router'

import { Interact } from '../../../components/interact'
import { BackLink } from '../../../components/uielements/backLink'
import * as walletRoutes from '../../../routes/wallet'
import { BondView } from './BondView'
import * as Styled from './InteractView.styles'
import { LeaveView } from './LeaveView'
import { UnbondView } from './UnbondView'

export const InteractView: React.FC = () => {
  const { walletAddress } = useParams<walletRoutes.DepositParams>()

  return (
    <>
      <Row justify="space-between">
        <Col>
          <BackLink />
        </Col>
      </Row>
      <Styled.ContentContainer>
        <Interact
          bondContent={<BondView walletAddress={walletAddress} />}
          leaveContent={<LeaveView />}
          unbondContent={<UnbondView />}
        />
      </Styled.ContentContainer>
    </>
  )
}
