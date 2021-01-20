import React from 'react'

import { Col, Row } from 'antd'
import { useParams } from 'react-router'

import { DepositActions } from '../../../components/depositActions'
import { BackLink } from '../../../components/uielements/backLink'
import * as walletRoutes from '../../../routes/wallet'
import { BondView } from './BondView'
import * as Styled from './DepositActionsView.styles'
import { LeaveView } from './LeaveView'
import { UnbondView } from './UnbondView'

export const DepositActionView: React.FC = () => {
  const { walletAddress } = useParams<walletRoutes.DepositParams>()

  return (
    <>
      <Row justify="space-between">
        <Col>
          <BackLink />
        </Col>
      </Row>
      <Styled.ContentContainer>
        <DepositActions
          bondContent={<BondView walletAddress={walletAddress} />}
          leaveContent={<LeaveView />}
          unbondContent={<UnbondView />}
        />
      </Styled.ContentContainer>
    </>
  )
}
