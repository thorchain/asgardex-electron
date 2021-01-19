import React from 'react'

import { AssetRuneNative } from '@xchainjs/xchain-util'
import { Col, Row } from 'antd'
import { useObservableState } from 'observable-hooks'
import { useParams } from 'react-router'

import { DepositActions } from '../../../components/depositActions'
import { BackLink } from '../../../components/uielements/backLink'
import { useMidgardContext } from '../../../contexts/MidgardContext'
import * as walletRoutes from '../../../routes/wallet'
import { BondView } from './BondView'
import * as Styled from './DepositActionsView.styles'

export const DepositActionView: React.FC = () => {
  const { walletAddress } = useParams<walletRoutes.DepositParams>()
  const {
    service: { pools }
    // service
  } = useMidgardContext()

  const _runePoolAddress = useObservableState(() => pools.poolAddressByAsset$(AssetRuneNative))

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
          leaveContent={<></>}
          unbondContent={<></>}
        />
      </Styled.ContentContainer>
    </>
  )
}
