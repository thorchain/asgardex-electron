import React, { useCallback } from 'react'

import { LeftOutlined } from '@ant-design/icons'
import { Row, Col, Grid } from 'antd'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'

import { ASSETS_TESTNET } from '../../../shared/mock/assets'
import * as walletRoutes from '../../routes/wallet'
import { UserTransactionType } from '../../types/wallet'
import AssetIcon from '../uielements/assets/assetIcon'
import Button from '../uielements/button'
import {
  StyledCard,
  StyledMobileCard,
  StyledLabel,
  CoinInfoWrapper,
  CoinTitle,
  CoinSubtitle,
  CoinPrice,
  CoinMobilePrice,
  StyledDivider,
  ActionWrapper,
  ActionMobileWrapper,
  StyledRow,
  StyledCol
} from './AssetDetails.style'
import TransactionsTable from './UserTransactionsTable'

// Dummy data
const txs: UserTransactionType[] = [
  {
    _id: 0,
    blockHeight: 74645396,
    code: 0,
    confirmBlocks: 0,
    data: null,
    fromAddr: 'tbnb1vxutrxadm0utajduxfr6wd9kqfalv0dg2wnx5y',
    memo: '',
    orderId: null,
    proposalId: null,
    sequence: 29,
    source: 0,
    timeStamp: '2020-04-01T03:46:55.786Z',
    toAddr: null,
    txAge: 1578666,
    txAsset: 'RUNE-A1F',
    txFee: '0.00500000',
    txHash: '320C31E9B5E5D21B4912BBC09C4A6F04EC4666698D6EAEBBBA3DBFAA7B9D17B3',
    txType: 'FREEZE_TOKEN',
    value: '12.00000000'
  }
]

const AssetDetails: React.FC = (): JSX.Element => {
  const isDesktopView = Grid.useBreakpoint()?.lg ?? false
  const history = useHistory()
  const intl = useIntl()
  const ActionComponent = isDesktopView ? ActionWrapper : ActionMobileWrapper

  // dummy data - temporary workaround as long as we have not any logic for real data
  const asset = ASSETS_TESTNET.RUNE

  const onBack = useCallback(() => {
    history.goBack()
  }, [history])

  const walletActionSendClick = useCallback(() => history.push(walletRoutes.fundsSend.path()), [history])
  const walletActionReceiveClick = useCallback(() => history.push(walletRoutes.fundsReceive.path()), [history])

  return (
    <>
      <Row>
        <Col span={24}>
          <StyledLabel size="large" color="primary" weight="bold" onClick={onBack}>
            <LeftOutlined />
            <span>Back</span>
          </StyledLabel>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          {isDesktopView && (
            <StyledCard bordered={false} bodyStyle={{ display: 'flex', flexDirection: 'row' }}>
              <div>
                <AssetIcon asset={asset} size="large" />
              </div>
              <CoinInfoWrapper>
                <CoinTitle>{asset?.ticker ?? 'unknown'}</CoinTitle>
                <CoinSubtitle>{asset?.symbol ?? 'unknown'}</CoinSubtitle>
              </CoinInfoWrapper>
              <CoinPrice>$ 4.01</CoinPrice>
            </StyledCard>
          )}
          {!isDesktopView && (
            <>
              <StyledMobileCard bordered={false} bodyStyle={{ display: 'flex', flexDirection: 'row' }}>
                <div>
                  <AssetIcon asset={asset} size="large" />
                </div>
                <CoinInfoWrapper>
                  <CoinTitle>{asset?.ticker ?? 'unknown'}</CoinTitle>
                  <CoinSubtitle>{asset?.symbol ?? 'unknown'}</CoinSubtitle>
                  <CoinMobilePrice>$ 4.01</CoinMobilePrice>
                </CoinInfoWrapper>
              </StyledMobileCard>
            </>
          )}
        </Col>
        www
        <StyledDivider />
        <StyledRow>
          <StyledCol sm={{ span: 24 }} md={{ span: 12 }}>
            <ActionComponent bordered={false}>
              <Button type="primary" round="true" sizevalue="xnormal" onClick={walletActionSendClick}>
                {intl.formatMessage({ id: 'wallet.action.send' })}
              </Button>
            </ActionComponent>
          </StyledCol>
          <StyledCol sm={{ span: 24 }} md={{ span: 12 }}>
            <ActionComponent bordered={false}>
              <Button typevalue="outline" round="true" sizevalue="xnormal" onClick={walletActionReceiveClick}>
                {intl.formatMessage({ id: 'wallet.action.receive' })}
              </Button>
            </ActionComponent>
          </StyledCol>
        </StyledRow>
        <StyledDivider />
        <Col span={24}>
          <TransactionsTable transactions={txs} />
        </Col>
      </Row>
    </>
  )
}
export default AssetDetails
