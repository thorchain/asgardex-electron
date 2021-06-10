import React, { useCallback, useMemo, useState } from 'react'

import { Address } from '@xchainjs/xchain-client'
import { Asset, AssetAmount, AssetRuneNative, assetToBase, assetToString, BaseAmount } from '@xchainjs/xchain-util'
import { Row, Col, Grid } from 'antd'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'

import { Network } from '../../../../shared/api/types'
import * as AssetHelper from '../../../helpers/assetHelper'
import { eqAsset, eqString } from '../../../helpers/fp/eq'
import { sequenceTOption } from '../../../helpers/fpHelpers'
import { getWalletAssetAmountFromBalances } from '../../../helpers/walletHelper'
import * as walletRoutes from '../../../routes/wallet'
import { GetExplorerTxUrl, TxsPageRD } from '../../../services/clients'
import { MAX_ITEMS_PER_PAGE } from '../../../services/const'
import { EMPTY_LOAD_TXS_HANDLER } from '../../../services/wallet/const'
import { LoadTxsHandler, NonEmptyWalletBalances } from '../../../services/wallet/types'
import { WalletBalances } from '../../../types/wallet'
import { AssetInfo } from '../../uielements/assets/assetInfo'
import { BackLink } from '../../uielements/backLink'
import { Button, RefreshButton } from '../../uielements/button'
import { TxsTable } from '../txs/table/TxsTable'
import * as Styled from './AssetDetails.style'

type Props = {
  txsPageRD: TxsPageRD
  balances: O.Option<NonEmptyWalletBalances>
  asset: Asset
  getExplorerTxUrl?: O.Option<GetExplorerTxUrl>
  getExplorerAddressUrl?: O.Option<GetExplorerTxUrl>
  reloadBalancesHandler?: FP.Lazy<void>
  loadTxsHandler?: LoadTxsHandler
  walletAddress?: O.Option<Address>
  network: Network
}

export const AssetDetails: React.FC<Props> = (props): JSX.Element => {
  const {
    txsPageRD,
    balances: oBalances,
    asset,
    reloadBalancesHandler = FP.constVoid,
    loadTxsHandler = EMPTY_LOAD_TXS_HANDLER,
    getExplorerTxUrl: oGetExplorerTxUrl = O.none,
    getExplorerAddressUrl: oGetExplorerAddressUrl = O.none,
    walletAddress: oWalletAddress = O.none,
    network
  } = props

  const [currentPage, setCurrentPage] = useState(1)

  const isDesktopView = Grid.useBreakpoint()?.lg ?? false
  const history = useHistory()
  const intl = useIntl()

  const walletActionSendClick = useCallback(() => {
    const routeParams = FP.pipe(
      oWalletAddress,
      O.map((walletAddress) => ({ asset: assetToString(asset), walletAddress })),
      O.getOrElse(() => ({ asset: assetToString(asset), walletAddress: '' }))
    )
    history.push(walletRoutes.send.path(routeParams))
  }, [asset, history, oWalletAddress])

  const walletActionDepositClick = useCallback(() => {
    FP.pipe(
      oWalletAddress,
      O.map((walletAddress) => walletRoutes.deposit.path({ walletAddress })),
      O.map(history.push)
    )
  }, [oWalletAddress, history])

  const isNonNativeRuneAsset: boolean = useMemo(() => AssetHelper.isNonNativeRuneAsset(asset), [asset])

  const walletActionUpgradeNonNativeRuneClick = useCallback(() => {
    FP.pipe(
      oWalletAddress,
      O.filter((_) => isNonNativeRuneAsset),
      O.map((walletAddress) => walletRoutes.upgradeRune.path({ asset: assetToString(asset), walletAddress })),
      O.map(history.push)
    )
  }, [oWalletAddress, history, isNonNativeRuneAsset, asset])

  const refreshHandler = useCallback(() => {
    loadTxsHandler({ limit: MAX_ITEMS_PER_PAGE, offset: (currentPage - 1) * MAX_ITEMS_PER_PAGE })
    reloadBalancesHandler()
  }, [currentPage, loadTxsHandler, reloadBalancesHandler])

  const clickTxLinkHandler = useCallback(
    (txHash: string) => {
      FP.pipe(oGetExplorerTxUrl, O.ap(O.some(txHash)), O.map(window.apiUrl.openExternal))
    },
    [oGetExplorerTxUrl]
  )

  const clickAddressLinkHandler = useCallback(
    (oAddress: O.Option<string>) => {
      FP.pipe(oGetExplorerAddressUrl, O.ap(oAddress), O.map(window.apiUrl.openExternal))
    },
    [oGetExplorerAddressUrl]
  )

  const onChangePagination = useCallback(
    (pageNo) => {
      loadTxsHandler({ limit: MAX_ITEMS_PER_PAGE, offset: (pageNo - 1) * MAX_ITEMS_PER_PAGE })
      setCurrentPage(pageNo)
    },
    [loadTxsHandler]
  )

  const oNoneNativeRuneAsset: O.Option<Asset> = useMemo(
    () => FP.pipe(asset, O.fromPredicate(AssetHelper.isNonNativeRuneAsset)),
    [asset]
  )

  const isRuneNativeAsset: boolean = useMemo(() => eqAsset.equals(asset, AssetRuneNative), [asset])

  const getNonNativeRuneBalance: O.Option<(balances: WalletBalances) => O.Option<AssetAmount>> = useMemo(
    () =>
      FP.pipe(
        sequenceTOption(oNoneNativeRuneAsset, oWalletAddress),
        O.map(([asset, walletAddress]) =>
          getWalletAssetAmountFromBalances(
            (balance) => eqString.equals(balance.walletAddress, walletAddress) && eqAsset.equals(balance.asset, asset)
          )
        )
      ),
    [oNoneNativeRuneAsset, oWalletAddress]
  )

  const oNonNativeRuneAmount: O.Option<BaseAmount> = useMemo(
    () => FP.pipe(getNonNativeRuneBalance, O.ap(oBalances), O.flatten, O.map(assetToBase)),
    [getNonNativeRuneBalance, oBalances]
  )

  const actionColSpanDesktop = 12
  const actionColSpanMobile = 24

  const runeUpgradeDisabled: boolean = useMemo(() => {
    return (
      isNonNativeRuneAsset &&
      FP.pipe(
        oNonNativeRuneAmount,
        O.map((amount) => amount.lt(0)),
        O.getOrElse<boolean>(() => true)
      )
    )
  }, [isNonNativeRuneAsset, oNonNativeRuneAmount])

  const walletInfo = useMemo(
    () =>
      FP.pipe(
        oWalletAddress,
        O.map((address) => ({
          address,
          network
        }))
      ),
    [oWalletAddress, network]
  )

  return (
    <>
      <Row justify="space-between">
        <Col>
          <BackLink path={walletRoutes.assets.path()} />
        </Col>
        <Col>
          <RefreshButton clickHandler={refreshHandler} />
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <AssetInfo walletInfo={walletInfo} asset={O.some(asset)} assetsWB={oBalances} network={network} />
        </Col>

        <Styled.Divider />

        <Styled.ActionRow>
          <Styled.ActionCol sm={{ span: actionColSpanMobile }} md={{ span: actionColSpanDesktop }}>
            <Styled.ActionWrapper>
              <Row justify="center">
                <Button type="primary" round="true" sizevalue="xnormal" onClick={walletActionSendClick}>
                  {intl.formatMessage({ id: 'wallet.action.send' })}
                </Button>
              </Row>
            </Styled.ActionWrapper>
          </Styled.ActionCol>
          {isNonNativeRuneAsset && (
            <Styled.ActionCol sm={{ span: actionColSpanMobile }} md={{ span: actionColSpanDesktop }}>
              <Styled.ActionWrapper>
                <Row justify="center">
                  <Button
                    type="primary"
                    round="true"
                    sizevalue="xnormal"
                    color="warning"
                    onClick={walletActionUpgradeNonNativeRuneClick}
                    disabled={runeUpgradeDisabled}>
                    {intl.formatMessage({ id: 'wallet.action.upgrade' })}
                  </Button>
                </Row>
              </Styled.ActionWrapper>
            </Styled.ActionCol>
          )}
          {isRuneNativeAsset && (
            <Styled.ActionCol sm={{ span: actionColSpanMobile }} md={{ span: actionColSpanDesktop }}>
              <Styled.ActionWrapper>
                <Row justify="center">
                  <Button typevalue="outline" round="true" sizevalue="xnormal" onClick={walletActionDepositClick}>
                    {intl.formatMessage({ id: 'wallet.action.deposit' })}
                  </Button>
                </Row>
              </Styled.ActionWrapper>
            </Styled.ActionCol>
          )}
        </Styled.ActionRow>
        <Styled.Divider />
      </Row>
      <Row>
        <Col span={24}>
          <Styled.TableHeadline isDesktop={isDesktopView}>
            {intl.formatMessage({ id: 'wallet.txs.history' })}{' '}
            <Styled.TableHeadlineLinkIcon onClick={() => clickAddressLinkHandler(oWalletAddress)} />
          </Styled.TableHeadline>
        </Col>
        <Col span={24}>
          <TxsTable
            txsPageRD={txsPageRD}
            clickTxLinkHandler={clickTxLinkHandler}
            changePaginationHandler={onChangePagination}
            chain={asset.chain}
            network={network}
            walletAddress={oWalletAddress}
          />
        </Col>
      </Row>
    </>
  )
}
