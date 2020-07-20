import React, { useCallback, useMemo, useRef } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Address } from '@thorchain/asgardex-binance'
import { Asset, assetToString, formatAssetAmount } from '@thorchain/asgardex-util'
import { Row, Col, Grid } from 'antd'
import { sequenceT } from 'fp-ts/lib/Apply'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'

import { balanceByAsset } from '../../helpers/binanceHelper'
import * as walletRoutes from '../../routes/wallet'
import { TxsRD, BalancesRD } from '../../services/binance/types'
import { OpenExternalHandler } from '../../types/asgardex'
import AssetIcon from '../uielements/assets/assetIcon'
import BackLink from '../uielements/backLink'
import Button, { RefreshButton } from '../uielements/button'
import * as Styled from './AssetDetails.style'
import TransactionsTable from './TransactionsTable'

type Props = {
  txsRD: TxsRD
  balancesRD: BalancesRD
  asset: O.Option<Asset>
  address: O.Option<Address>
  explorerUrl?: O.Option<string>
  openExternal: OpenExternalHandler
  reloadBalancesHandler?: () => void
  reloadSelectedAssetTxsHandler?: () => void
}

const AssetDetails: React.FC<Props> = (props: Props): JSX.Element => {
  const {
    txsRD,
    address,
    balancesRD,
    asset: oAsset,
    reloadBalancesHandler = () => {},
    reloadSelectedAssetTxsHandler = () => {},
    explorerUrl = O.none,
    openExternal
  } = props

  const asset = O.toNullable(oAsset)
  const isDesktopView = Grid.useBreakpoint()?.lg ?? false
  const history = useHistory()
  const intl = useIntl()
  const ActionComponent = isDesktopView ? Styled.ActionWrapper : Styled.ActionMobileWrapper

  const walletActionSendClick = useCallback(() => history.push(walletRoutes.fundsSend.path()), [history])
  const walletActionReceiveClick = useCallback(() => history.push(walletRoutes.fundsReceive.path()), [history])

  // store previous balance to re-render it while reloading
  const previousBalance = useRef<string>('--')

  const renderAssetIcon = useMemo(() => asset && <AssetIcon asset={asset} size="large" />, [asset])

  const renderBalance = useMemo(() => {
    const oBalances = RD.toOption(balancesRD)
    return FP.pipe(
      sequenceT(O.option)(oBalances, oAsset),
      O.fold(
        () => previousBalance.current,
        ([balances, asset]) => {
          const amount = balanceByAsset(balances, asset)
          const balance = formatAssetAmount(amount, 3)
          previousBalance.current = balance
          return balance
        }
      )
    )
  }, [balancesRD, oAsset])

  const refreshHandler = useCallback(() => {
    reloadSelectedAssetTxsHandler()
    reloadBalancesHandler()
  }, [reloadBalancesHandler, reloadSelectedAssetTxsHandler])

  const clickTxLinkHandler = useCallback(
    (txHash: string) => {
      FP.pipe(
        explorerUrl,
        O.map((url) => openExternal(`${url}/tx/${txHash}`))
      )
    },
    [explorerUrl, openExternal]
  )

  return (
    <>
      <Row justify="space-between">
        <Col>
          <BackLink />
        </Col>
        <Col>
          <RefreshButton clickHandler={refreshHandler} />
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Styled.Card bordered={false} bodyStyle={{ display: 'flex', flexDirection: 'row' }}>
            {renderAssetIcon}
            <Styled.CoinInfoWrapper>
              <Styled.CoinTitle>{asset?.ticker ?? '--'}</Styled.CoinTitle>
              <Styled.CoinSubtitle>{asset ? assetToString(asset) : '--'}</Styled.CoinSubtitle>
              {!isDesktopView && <Styled.CoinMobilePrice>{renderBalance}</Styled.CoinMobilePrice>}
            </Styled.CoinInfoWrapper>
            {isDesktopView && <Styled.CoinPrice>{renderBalance}</Styled.CoinPrice>}
          </Styled.Card>
        </Col>

        <Styled.Divider />

        <Styled.Row>
          <Styled.Col sm={{ span: 24 }} md={{ span: 12 }}>
            <ActionComponent bordered={false}>
              <Button type="primary" round="true" sizevalue="xnormal" onClick={walletActionSendClick}>
                {intl.formatMessage({ id: 'wallet.action.send' })}
              </Button>
            </ActionComponent>
          </Styled.Col>
          <Styled.Col sm={{ span: 24 }} md={{ span: 12 }}>
            <ActionComponent bordered={false}>
              <Button typevalue="outline" round="true" sizevalue="xnormal" onClick={walletActionReceiveClick}>
                {intl.formatMessage({ id: 'wallet.action.receive' })}
              </Button>
            </ActionComponent>
          </Styled.Col>
        </Styled.Row>
        <Styled.Divider />
      </Row>
      <Row>
        <Col span={24}>
          <Styled.TableHeadline isDesktop={isDesktopView}>
            {intl.formatMessage({ id: 'wallet.txs.last90days' })}
          </Styled.TableHeadline>
        </Col>
        <Col span={24}>
          <TransactionsTable txsRD={txsRD} address={address} clickTxLinkHandler={clickTxLinkHandler} />
        </Col>
      </Row>
    </>
  )
}
export default AssetDetails
