import React, { useCallback } from 'react'

import { LeftOutlined } from '@ant-design/icons'
import { Row, Col, Grid } from 'antd'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'

import { ASSETS_TESTNET } from '../../../shared/mock/assets'
import * as walletRoutes from '../../routes/wallet'
import { TxsRD } from '../../services/binance/types'
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

type Props = {
  txsRD: TxsRD
}

const AssetDetails: React.FC<Props> = (props: Props): JSX.Element => {
  const { txsRD } = props
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
          <TransactionsTable txsRD={txsRD} />
        </Col>
      </Row>
    </>
  )
}
export default AssetDetails
