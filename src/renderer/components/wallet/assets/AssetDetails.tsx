import React, { useCallback, useMemo, useState } from 'react'

import { Address } from '@xchainjs/xchain-client'
import { Asset, AssetRuneNative, assetToString, BaseAmount } from '@xchainjs/xchain-util'
import { Row, Col, Grid } from 'antd'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'

import { Network } from '../../../../shared/api/types'
import * as AssetHelper from '../../../helpers/assetHelper'
import { eqOAsset } from '../../../helpers/fp/eq'
import { sequenceTOption } from '../../../helpers/fpHelpers'
import { getWalletBalanceByAsset } from '../../../helpers/walletHelper'
import * as walletRoutes from '../../../routes/wallet'
import { GetExplorerTxUrl, TxsPageRD } from '../../../services/clients'
import { MAX_ITEMS_PER_PAGE } from '../../../services/const'
import { EMPTY_LOAD_TXS_HANDLER } from '../../../services/wallet/const'
import { LoadTxsHandler, NonEmptyWalletBalances } from '../../../services/wallet/types'
import { WalletBalance } from '../../../types/wallet'
import { AssetInfo } from '../../uielements/assets/assetInfo'
import { BackLink } from '../../uielements/backLink'
import { Button, RefreshButton } from '../../uielements/button'
import { TxsTable } from '../txs/table/TxsTable'
import * as Styled from './AssetDetails.style'

type Props = {
  txsPageRD: TxsPageRD
  balances: O.Option<NonEmptyWalletBalances>
  asset: O.Option<Asset>
  getExplorerTxUrl?: O.Option<GetExplorerTxUrl>
  reloadBalancesHandler?: FP.Lazy<void>
  loadTxsHandler?: LoadTxsHandler
  walletAddress?: O.Option<Address>
  network: Network
}

export const AssetDetails: React.FC<Props> = (props): JSX.Element => {
  const {
    txsPageRD,
    balances: oBalances,
    asset: oAsset,
    reloadBalancesHandler = FP.constVoid,
    loadTxsHandler = EMPTY_LOAD_TXS_HANDLER,
    getExplorerTxUrl: oGetExplorerTxUrl = O.none,
    walletAddress: oWalletAddress = O.none,
    network
  } = props

  const [currentPage, setCurrentPage] = useState(1)

  const isDesktopView = Grid.useBreakpoint()?.lg ?? false
  const history = useHistory()
  const intl = useIntl()

  const walletActionSendClick = useCallback(() => {
    const routeParams = FP.pipe(
      sequenceTOption(oWalletAddress, oAsset),
      O.map(([walletAddress, asset]) => ({ asset: assetToString(asset), walletAddress })),
      O.getOrElse(() => ({ asset: '', walletAddress: '' }))
    )
    history.push(walletRoutes.send.path(routeParams))
  }, [oAsset, history, oWalletAddress])

  const walletActionDepositClick = useCallback(() => {
    FP.pipe(
      oWalletAddress,
      O.map((walletAddress) => walletRoutes.deposit.path({ walletAddress })),
      O.map(history.push)
    )
  }, [oWalletAddress, history])

  const walletActionUpgradeRuneBnbClick = useCallback(() => {
    FP.pipe(
      sequenceTOption(oWalletAddress, oAsset),
      O.filter(([_, asset]) => AssetHelper.isRuneBnbAsset(asset)),
      O.map(([walletAddress, asset]) =>
        walletRoutes.upgradeBnbRune.path({ asset: assetToString(asset), walletAddress })
      ),
      O.map(history.push)
    )
  }, [oWalletAddress, history, oAsset])

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

  const onChangePagination = useCallback(
    (pageNo) => {
      loadTxsHandler({ limit: MAX_ITEMS_PER_PAGE, offset: (pageNo - 1) * MAX_ITEMS_PER_PAGE })
      setCurrentPage(pageNo)
    },
    [loadTxsHandler]
  )

  const oRuneBnbAsset: O.Option<Asset> = useMemo(() => FP.pipe(oAsset, O.filter(AssetHelper.isRuneBnbAsset)), [oAsset])

  const isRuneBnbAsset: boolean = useMemo(() => FP.pipe(oRuneBnbAsset, O.isSome), [oRuneBnbAsset])

  const isRuneNativeAsset: boolean = useMemo(() => eqOAsset.equals(oAsset, O.some(AssetRuneNative)), [oAsset])

  const oRuneBnbBalance: O.Option<WalletBalance> = useMemo(() => getWalletBalanceByAsset(oBalances, oRuneBnbAsset), [
    oRuneBnbAsset,
    oBalances
  ])

  const oRuneBnbAmount: O.Option<BaseAmount> = useMemo(
    () =>
      FP.pipe(
        oRuneBnbBalance,
        O.map(({ amount }) => amount)
      ),
    [oRuneBnbBalance]
  )

  const actionColSpanDesktop = 12
  const actionColSpanMobile = 24

  const runeUpgradeDisabled: boolean = useMemo(
    () =>
      isRuneBnbAsset &&
      FP.pipe(
        oRuneBnbAmount,
        O.map((amount) => amount.amount().isLessThan(0)),
        O.getOrElse<boolean>(() => true)
      ),
    [isRuneBnbAsset, oRuneBnbAmount]
  )

  const chain = O.isSome(oAsset) ? oAsset.value.chain : ''

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
          <AssetInfo walletInfo={walletInfo} asset={oAsset} assetsWB={oBalances} />
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
          {isRuneBnbAsset && (
            <Styled.ActionCol sm={{ span: actionColSpanMobile }} md={{ span: actionColSpanDesktop }}>
              <Styled.ActionWrapper>
                <Row justify="center">
                  <Button
                    type="primary"
                    round="true"
                    sizevalue="xnormal"
                    color="warning"
                    onClick={walletActionUpgradeRuneBnbClick}
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
            {intl.formatMessage({ id: 'wallet.txs.last90days' })}
          </Styled.TableHeadline>
        </Col>
        <Col span={24}>
          {chain && (
            <TxsTable
              txsPageRD={txsPageRD}
              clickTxLinkHandler={clickTxLinkHandler}
              changePaginationHandler={onChangePagination}
              chain={chain}
              network={network}
            />
          )}
        </Col>
      </Row>
    </>
  )
}
