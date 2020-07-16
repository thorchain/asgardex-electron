import React, { useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Address } from '@thorchain/asgardex-binance'
import { Asset, formatAssetAmountCurrency, assetToString } from '@thorchain/asgardex-util'
import { Row, Col, Grid } from 'antd'
import { sequenceT } from 'fp-ts/lib/Apply'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'

import { balanceByAsset } from '../../helpers/binanceHelper'
import * as walletRoutes from '../../routes/wallet'
import { TxsRD, BalancesRD } from '../../services/binance/types'
import AssetIcon from '../uielements/assets/assetIcon'
import BackLink from '../uielements/backLink'
import Button from '../uielements/button'
import {
  StyledCard,
  StyledMobileCard,
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
  balancesRD: BalancesRD
  asset: O.Option<Asset>
  address: O.Option<Address>
}

const AssetDetails: React.FC<Props> = (props: Props): JSX.Element => {
  const { txsRD, address, balancesRD, asset: oAsset } = props

  const asset = O.toNullable(oAsset)
  const isDesktopView = Grid.useBreakpoint()?.lg ?? false
  const history = useHistory()
  const intl = useIntl()
  const ActionComponent = isDesktopView ? ActionWrapper : ActionMobileWrapper

  const walletActionSendClick = useCallback(() => history.push(walletRoutes.fundsSend.path()), [history])
  const walletActionReceiveClick = useCallback(() => history.push(walletRoutes.fundsReceive.path()), [history])

  const renderAssetIcon = useMemo(() => asset && <AssetIcon asset={asset} size="large" />, [asset])

  const renderPrice = useMemo(() => {
    const oBalances = RD.toOption(balancesRD)
    return FP.pipe(
      sequenceT(O.option)(oBalances, oAsset),
      O.fold(
        () => '--',
        ([balances, asset]) => {
          const amount = balanceByAsset(balances, asset)
          return formatAssetAmountCurrency(amount, assetToString(asset), 3)
        }
      )
    )
  }, [balancesRD, oAsset])

  return (
    <>
      <Row>
        <Col span={24}>
          <BackLink />
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          {isDesktopView && (
            <StyledCard bordered={false} bodyStyle={{ display: 'flex', flexDirection: 'row' }}>
              <div>{renderAssetIcon}</div>
              <CoinInfoWrapper>
                <CoinTitle>{asset?.ticker ?? '--'}</CoinTitle>
                <CoinSubtitle>{asset?.symbol ?? '--'}</CoinSubtitle>
              </CoinInfoWrapper>
              <CoinPrice>{renderPrice}</CoinPrice>
            </StyledCard>
          )}
          {!isDesktopView && (
            <>
              <StyledMobileCard bordered={false} bodyStyle={{ display: 'flex', flexDirection: 'row' }}>
                <div>{renderAssetIcon}</div>
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
          <TransactionsTable txsRD={txsRD} address={address} />
        </Col>
      </Row>
    </>
  )
}
export default AssetDetails
