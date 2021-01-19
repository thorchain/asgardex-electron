import React, { useCallback } from 'react'

import { AssetRuneNative } from '@xchainjs/xchain-util'
import { Col, Row } from 'antd'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import { useParams } from 'react-router'

import { DepositActions } from '../../../components/depositActions'
import { BackLink } from '../../../components/uielements/backLink'
import { useChainContext } from '../../../contexts/ChainContext'
import * as walletRoutes from '../../../routes/wallet'
import { BondView } from './BondView'
import * as Styled from './DepositActionsView.styles'
import { LeaveView } from './LeaveView'
import { UnbondView } from './UnbondView'

export const DepositActionView: React.FC = () => {
  const { walletAddress } = useParams<walletRoutes.DepositParams>()
  const { getExplorerUrlByAsset$ } = useChainContext()

  const [explorerUrl] = useObservableState(() => getExplorerUrlByAsset$(AssetRuneNative), O.none)

  const goToTransaction = useCallback(
    (txHash: string) => {
      FP.pipe(
        explorerUrl,
        O.map((getExplorerUrl) => window.apiUrl.openExternal(getExplorerUrl(txHash)))
      )
    },
    [explorerUrl]
  )

  return (
    <>
      <Row justify="space-between">
        <Col>
          <BackLink />
        </Col>
      </Row>
      <Styled.ContentContainer>
        <DepositActions
          bondContent={<BondView walletAddress={walletAddress} goToTransaction={goToTransaction} />}
          leaveContent={<LeaveView goToTransaction={goToTransaction} />}
          unbondContent={<UnbondView goToTransaction={goToTransaction} />}
        />
      </Styled.ContentContainer>
    </>
  )
}
