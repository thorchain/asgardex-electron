import React, { useCallback, useMemo } from 'react'

import { Address } from '@thorchain/asgardex-binance'
import { Asset, assetToString } from '@thorchain/asgardex-util'
import { Row, Col, Grid } from 'antd'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'

import * as walletRoutes from '../../routes/wallet'
import { TxsRD, BalancesRD } from '../../services/binance/types'
import AssetInfo from '../uielements/assets/AssetInfo'
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
  reloadBalancesHandler?: () => void
  reloadSelectedAssetTxsHandler?: () => void
}

const AssetDetails: React.FC<Props> = (props: Props): JSX.Element => {
  const {
    txsRD,
    address,
    balancesRD,
    asset,
    reloadBalancesHandler = () => {},
    reloadSelectedAssetTxsHandler = () => {},
    explorerUrl = O.none
  } = props

  const assetAsString = useMemo(
    () =>
      FP.pipe(
        asset,
        O.map((a) => assetToString(a)),
        O.getOrElse(() => '')
      ),
    [asset]
  )
  const isDesktopView = Grid.useBreakpoint()?.lg ?? false
  const history = useHistory()
  const intl = useIntl()
  const ActionComponent = isDesktopView ? Styled.ActionWrapper : Styled.ActionMobileWrapper

  const walletActionSendClick = useCallback(() => history.push(walletRoutes.send.path({ asset: assetAsString })), [
    assetAsString,
    history
  ])

  const walletActionReceiveClick = useCallback(
    () => history.push(walletRoutes.receive.path({ asset: assetAsString })),
    [assetAsString, history]
  )

  const refreshHandler = useCallback(() => {
    reloadSelectedAssetTxsHandler()
    reloadBalancesHandler()
  }, [reloadBalancesHandler, reloadSelectedAssetTxsHandler])

  const clickTxLinkHandler = useCallback(
    (txHash: string) => {
      FP.pipe(
        explorerUrl,
        O.map((url) => window.apiUrl.openExternal(`${url}/tx/${txHash}`))
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
        <Col>
          <RefreshButton clickHandler={refreshHandler} />
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <AssetInfo asset={asset} balancesRD={balancesRD} />
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
