import React, { useCallback, useMemo, useState } from 'react'

import { Address } from '@xchainjs/xchain-client'
import { Asset, assetToBase, assetToString, BaseAmount } from '@xchainjs/xchain-util'
import { Row, Col, Grid } from 'antd'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'

import { isRuneBnbAsset } from '../../../helpers/assetHelper'
import { sequenceTOption } from '../../../helpers/fpHelpers'
import { emptyFunc } from '../../../helpers/funcHelper'
import { getAssetAmountByAsset } from '../../../helpers/walletHelper'
import * as walletRoutes from '../../../routes/wallet'
import { SendTxParams } from '../../../services/binance/types'
import { GetExplorerTxUrl, TxsPageRD } from '../../../services/clients'
import { MAX_ITEMS_PER_PAGE } from '../../../services/const'
import { PoolAddress } from '../../../services/midgard/types'
import { EMPTY_LOAD_TXS_HANDLER } from '../../../services/wallet/const'
import { LoadTxsHandler, NonEmptyWalletBalances } from '../../../services/wallet/types'
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
  reloadBalancesHandler?: () => void
  loadTxsHandler?: LoadTxsHandler
  walletAddress?: Address
  poolAddress: O.Option<PoolAddress>
  runeAddress: O.Option<Address>
  upgradeRuneHandler: (_: SendTxParams) => void
}

export const AssetDetails: React.FC<Props> = (props): JSX.Element => {
  const {
    upgradeRuneHandler,
    txsPageRD,
    balances: oBalances,
    asset: oAsset,
    poolAddress: oPoolAddress,
    runeAddress: oRuneAddress,
    reloadBalancesHandler = emptyFunc,
    loadTxsHandler = EMPTY_LOAD_TXS_HANDLER,
    getExplorerTxUrl: oGetExplorerTxUrl = O.none,
    walletAddress = ''
  } = props

  const [currentPage, setCurrentPage] = useState(1)

  const assetAsString = useMemo(
    () =>
      FP.pipe(
        oAsset,
        O.map((asset) => assetToString(asset)),
        O.getOrElse(() => '')
      ),
    [oAsset]
  )

  const isDesktopView = Grid.useBreakpoint()?.lg ?? false
  const history = useHistory()
  const intl = useIntl()

  const walletActionSendClick = useCallback(() => {
    history.push(walletRoutes.send.path({ asset: assetAsString, walletAddress }))
  }, [assetAsString, history, walletAddress])

  const walletActionReceiveClick = useCallback(
    () => history.push(walletRoutes.receive.path({ asset: assetAsString, walletAddress })),
    [assetAsString, history, walletAddress]
  )

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

  const oRuneAsset: O.Option<Asset> = useMemo(() => FP.pipe(oAsset, O.filter(isRuneBnbAsset)), [oAsset])

  const isRuneAsset: boolean = useMemo(() => FP.pipe(oRuneAsset, O.isSome), [oRuneAsset])

  const oRuneAmount: O.Option<BaseAmount> = useMemo(
    () =>
      FP.pipe(
        sequenceTOption(oRuneAsset, oBalances),
        O.chain(([runeAsset, balances]) => getAssetAmountByAsset(balances, runeAsset)),
        O.map(assetToBase)
      ),
    [oRuneAsset, oBalances]
  )

  const runeUpgradeDisabled: boolean = useMemo(
    () =>
      isRuneAsset &&
      FP.pipe(
        oRuneAmount,
        O.map((amount) => amount.amount().isLessThanOrEqualTo(0)),
        O.getOrElse<boolean>(() => true)
      ),
    [isRuneAsset, oRuneAmount]
  )

  const actionColSpanDesktop = isRuneAsset ? 8 : 12
  const actionColSpanMobile = 24

  const upgradeRune = useCallback(
    (_) =>
      FP.pipe(
        sequenceTOption(oRuneAsset, oRuneAmount, oPoolAddress, oRuneAddress),
        O.map(([asset, amount, recipient, runeAddress]) => {
          console.log('upgradeRuneHandler', recipient, amount, asset, runeAddress)
          upgradeRuneHandler({ recipient, amount, asset, memo: `SWITCH:${runeAddress}` })
          return true
        }),
        O.getOrElse(() => {
          console.log("upgradeRuneHandler can't be called")
          return false
        })
      ),
    [oPoolAddress, oRuneAmount, oRuneAsset, oRuneAddress, upgradeRuneHandler]
  )

  return (
    <>
      <div>{JSON.stringify(isRuneAsset)}</div>
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
          <AssetInfo asset={oAsset} assetsWB={oBalances} />
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
          {isRuneAsset && (
            <Styled.ActionCol sm={{ span: actionColSpanMobile }} md={{ span: actionColSpanDesktop }}>
              <Styled.ActionWrapper>
                <Row justify="center">
                  <Button
                    type="primary"
                    round="true"
                    sizevalue="xnormal"
                    color="warning"
                    onClick={upgradeRune}
                    disabled={runeUpgradeDisabled}>
                    {intl.formatMessage({ id: 'wallet.action.upgrade' })}
                  </Button>
                </Row>
              </Styled.ActionWrapper>
            </Styled.ActionCol>
          )}
          <Styled.ActionCol sm={{ span: actionColSpanMobile }} md={{ span: actionColSpanDesktop }}>
            <Styled.ActionWrapper>
              <Row justify="center">
                <Button typevalue="outline" round="true" sizevalue="xnormal" onClick={walletActionReceiveClick}>
                  {intl.formatMessage({ id: 'wallet.action.receive' })}
                </Button>
              </Row>
            </Styled.ActionWrapper>
          </Styled.ActionCol>
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
          <TxsTable
            txsPageRD={txsPageRD}
            clickTxLinkHandler={clickTxLinkHandler}
            changePaginationHandler={onChangePagination}
          />
        </Col>
      </Row>
    </>
  )
}
