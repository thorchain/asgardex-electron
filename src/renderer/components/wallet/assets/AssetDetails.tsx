import React, { useCallback, useEffect, useMemo, useState } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Address } from '@xchainjs/xchain-client'
import {
  Asset,
  AssetBNB,
  assetToString,
  BaseAmount,
  baseToAsset,
  formatAssetAmountCurrency
} from '@xchainjs/xchain-util'
import { Row, Col, Grid } from 'antd'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import * as Rx from 'rxjs'

import { ONE_ASSET_BASE_AMOUNT } from '../../../const'
import * as AssetHelper from '../../../helpers/assetHelper'
import { getChainAsset } from '../../../helpers/chainHelper'
import { sequenceTOption } from '../../../helpers/fpHelpers'
import { getWalletBalanceByAsset } from '../../../helpers/walletHelper'
import * as walletRoutes from '../../../routes/wallet'
import { SendTxParams } from '../../../services/binance/types'
import { FeeRD } from '../../../services/chain/types'
import { GetExplorerTxUrl, TxsPageRD } from '../../../services/clients'
import { MAX_ITEMS_PER_PAGE } from '../../../services/const'
import { PoolAddress } from '../../../services/midgard/types'
import { EMPTY_LOAD_TXS_HANDLER } from '../../../services/wallet/const'
import { LoadTxsHandler, NonEmptyWalletBalances, TxLD, TxRD } from '../../../services/wallet/types'
import { WalletBalance } from '../../../types/wallet'
import { TxModal } from '../../modal/tx'
import { AssetInfo } from '../../uielements/assets/assetInfo'
import { BackLink } from '../../uielements/backLink'
import { Button, RefreshButton } from '../../uielements/button'
import { ConfirmationModalProps } from '../../uielements/common/Common.types'
import { UIFeesRD, Fees } from '../../uielements/fees'
import { TxsTable } from '../txs/table/TxsTable'
import * as Styled from './AssetDetails.style'

type UpgradeTxState = {
  startTime: O.Option<number>
  txRD: TxRD
}

const INITIAL_TX_UPGRADE_STATE: UpgradeTxState = { startTime: O.none, txRD: RD.initial }

type Props = {
  txsPageRD: TxsPageRD
  balances: O.Option<NonEmptyWalletBalances>
  asset: O.Option<Asset>
  getExplorerTxUrl?: O.Option<GetExplorerTxUrl>
  reloadBalancesHandler?: FP.Lazy<void>
  loadTxsHandler?: LoadTxsHandler
  walletAddress?: O.Option<Address>
  runeNativeAddress?: O.Option<Address>
  poolAddress: O.Option<PoolAddress>
  sendUpgradeTx: (_: SendTxParams) => TxLD
  reloadUpgradeFeeHandler: FP.Lazy<void>
  upgradeFee: FeeRD
  UpgradeConfirmationModal: React.FC<ConfirmationModalProps>
}

export const AssetDetails: React.FC<Props> = (props): JSX.Element => {
  const {
    sendUpgradeTx,
    txsPageRD,
    balances: oBalances,
    asset: oAsset,
    poolAddress: oPoolAddress,
    reloadBalancesHandler = FP.constVoid,
    loadTxsHandler = EMPTY_LOAD_TXS_HANDLER,
    getExplorerTxUrl: oGetExplorerTxUrl = O.none,
    walletAddress: oWalletAddress = O.none,
    runeNativeAddress: oRuneNativeAddress = O.none,
    upgradeFee,
    reloadUpgradeFeeHandler,
    UpgradeConfirmationModal
  } = props

  const [currentPage, setCurrentPage] = useState(1)

  // State for visibility of Modal to confirm upgrade
  const [showConfirmUpgradeModal, setShowConfirmUpgradeModal] = useState(false)
  // (Possible) subscription of upgrade tx
  const [upgradeTxSub, setUpgradeTxSub] = useState<O.Option<Rx.Subscription>>(O.none)
  // State of upgrade tx
  const [upgradeTxState, setUpgradeTxState] = useState<UpgradeTxState>(INITIAL_TX_UPGRADE_STATE)

  // unsubscribe of (possible) previous subscription of upgrade tx
  // It will be called whenever state of `bnbTxSub` changed
  useEffect(() => {
    return () => {
      FP.pipe(
        upgradeTxSub,
        O.map((sub) => sub.unsubscribe())
      )
    }
  }, [upgradeTxSub])

  const oAssetAsString: O.Option<string> = useMemo(() => FP.pipe(oAsset, O.map(assetToString)), [oAsset])

  const isDesktopView = Grid.useBreakpoint()?.lg ?? false
  const history = useHistory()
  const intl = useIntl()

  const walletActionSendClick = useCallback(() => {
    const routeParams = FP.pipe(
      sequenceTOption(oWalletAddress, oAssetAsString),
      O.map(([walletAddress, asset]) => ({ asset, walletAddress })),
      O.getOrElse(() => ({ asset: '', walletAddress: '' }))
    )
    history.push(walletRoutes.send.path(routeParams))
  }, [oAssetAsString, history, oWalletAddress])

  const walletActionReceiveClick = useCallback(() => {
    const routeParams = FP.pipe(
      sequenceTOption(oWalletAddress, oAssetAsString),
      O.map(([walletAddress, asset]) => ({ asset, walletAddress })),
      O.getOrElse(() => ({ asset: '', walletAddress: '' }))
    )
    history.push(walletRoutes.receive.path(routeParams))
  }, [oAssetAsString, history, oWalletAddress])

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

  const actionColSpanDesktop = isRuneBnbAsset ? 8 : 12
  const actionColSpanMobile = 24

  const upgradeRune = useCallback(() => {
    FP.pipe(
      sequenceTOption(oRuneBnbAsset, oRuneBnbAmount, oPoolAddress, oRuneNativeAddress),
      O.map(([asset, _amount, recipient, runeAddress]) => {
        // TODO (@Veado): Remove it if we have everything set up for upgrade feature - just for testing
        const amount = ONE_ASSET_BASE_AMOUNT
        const startTime = Date.now()
        const subscription = sendUpgradeTx({ recipient, amount, asset, memo: `SWITCH:${runeAddress}` }).subscribe(
          (txRD) => {
            setUpgradeTxState({ startTime: O.some(startTime), txRD })
          }
        )
        // store subscription
        setUpgradeTxSub(O.some(subscription))

        return true
      }),
      O.getOrElse(() => {
        console.error("upgradeRuneHandler can't be called")
        return false
      })
    )
  }, [oPoolAddress, oRuneBnbAmount, oRuneBnbAsset, oRuneNativeAddress, sendUpgradeTx])

  const closeUpgradeTxModal = useCallback(() => {
    // reset subscription
    setUpgradeTxSub(O.none)
    // reset tx state
    setUpgradeTxState(INITIAL_TX_UPGRADE_STATE)
    // reload balances
    refreshHandler()
  }, [refreshHandler])

  const upgradeTxModalTitle = useMemo(
    () =>
      FP.pipe(
        upgradeTxState.txRD,
        RD.fold(
          () => 'wallet.upgrade.pending',
          () => 'wallet.upgrade.pending',
          () => 'wallet.upgrade.error',
          () => 'wallet.upgrade.success'
        ),
        (id) => intl.formatMessage({ id })
      ),
    [intl, upgradeTxState]
  )

  const renderUpgradeTxModal = useMemo(
    () =>
      FP.pipe(
        sequenceTOption(upgradeTxSub, upgradeTxState.startTime),
        O.fold(
          () => <></>,
          ([_, startTime]) => (
            <TxModal
              title={upgradeTxModalTitle}
              onClose={closeUpgradeTxModal}
              txRD={upgradeTxState.txRD}
              startTime={startTime}
              onViewTxClick={clickTxLinkHandler}
            />
          )
        )
      ),
    [
      upgradeTxSub,
      upgradeTxState.startTime,
      upgradeTxState.txRD,
      upgradeTxModalTitle,
      closeUpgradeTxModal,
      clickTxLinkHandler
    ]
  )

  const upgradeConfirmationHandler = useCallback(() => {
    // close confirmation modal
    setShowConfirmUpgradeModal(false)
    upgradeRune()
  }, [upgradeRune])

  const renderConfirmUpgradeModal = useMemo(
    () =>
      showConfirmUpgradeModal ? (
        <UpgradeConfirmationModal
          onSuccess={upgradeConfirmationHandler}
          onClose={() => setShowConfirmUpgradeModal(false)}
        />
      ) : (
        <></>
      ),
    [UpgradeConfirmationModal, showConfirmUpgradeModal, upgradeConfirmationHandler]
  )

  const uiFeesRD: UIFeesRD = useMemo(
    () =>
      FP.pipe(
        oRuneBnbAsset,
        O.fold(
          () => RD.initial,
          (runeBnbAsset) =>
            FP.pipe(
              upgradeFee,
              RD.map((fee) => [{ asset: getChainAsset(runeBnbAsset.chain), amount: fee }])
            )
        )
      ),
    [oRuneBnbAsset, upgradeFee]
  )

  const oBnbBalance: O.Option<BaseAmount> = useMemo(
    () =>
      FP.pipe(
        // we do care about bnb balance if RuneBNB is selected only
        oRuneBnbAsset,
        O.chain((_) => getWalletBalanceByAsset(oBalances, O.some(AssetBNB))),
        O.map(({ amount }) => amount)
      ),
    [oRuneBnbAsset, oBalances]
  )

  const oUpgradeFee: O.Option<BaseAmount> = useMemo(() => FP.pipe(upgradeFee, RD.toOption), [upgradeFee])

  const isUpgradeFeeError = useMemo(
    () =>
      FP.pipe(
        sequenceTOption(oUpgradeFee, oBnbBalance),
        O.fold(
          // Missing (or loading) fees does not mean we can't sent something. No error then.
          () => !O.isNone(oUpgradeFee),
          ([fee, bnbAmount]) => bnbAmount.amount().isLessThan(fee.amount())
        )
      ),
    [oBnbBalance, oUpgradeFee]
  )

  const renderUpgradeFeeError = useMemo(() => {
    if (!isUpgradeFeeError) return <></>

    return FP.pipe(
      sequenceTOption(oUpgradeFee, oBnbBalance),
      O.map(([fee, bnbAmount]) => {
        const msg = intl.formatMessage(
          { id: 'wallet.upgrade.feeError' },
          {
            fee: formatAssetAmountCurrency({
              amount: baseToAsset(fee),
              asset: AssetBNB,
              trimZeros: true
            }),
            balance: formatAssetAmountCurrency({
              amount: baseToAsset(bnbAmount),
              asset: AssetBNB,
              trimZeros: true
            })
          }
        )
        // `key`  has to be set to avoid "Missing "key" prop for element in iterator"
        return <Styled.UpgradeFeeErrorLabel key="upgrade-fee-error">{msg}</Styled.UpgradeFeeErrorLabel>
      }),
      O.getOrElse(() => <></>)
    )
  }, [intl, isUpgradeFeeError, oBnbBalance, oUpgradeFee])

  const runeUpgradeDisabled: boolean = useMemo(
    () =>
      isRuneBnbAsset &&
      (isUpgradeFeeError ||
        FP.pipe(
          oRuneBnbAmount,
          O.map((amount) => amount.amount().isLessThanOrEqualTo(0) || RD.isPending(upgradeTxState.txRD)),
          O.getOrElse<boolean>(() => true)
        )),
    [upgradeTxState, isRuneBnbAsset, oRuneBnbAmount, isUpgradeFeeError]
  )

  return (
    <>
      {renderConfirmUpgradeModal}
      {renderUpgradeTxModal}
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
          {isRuneBnbAsset && (
            <Styled.ActionCol sm={{ span: actionColSpanMobile }} md={{ span: actionColSpanDesktop }}>
              <Styled.ActionWrapper>
                <Row justify="center">
                  <Button
                    type="primary"
                    round="true"
                    sizevalue="xnormal"
                    color="warning"
                    onClick={() => setShowConfirmUpgradeModal(true)}
                    disabled={runeUpgradeDisabled}
                    loading={RD.isPending(upgradeTxState.txRD)}>
                    {intl.formatMessage({ id: 'wallet.action.upgrade' })}
                  </Button>
                </Row>
                <Styled.FeeRow>
                  <Fees fees={uiFeesRD} reloadFees={reloadUpgradeFeeHandler} />
                </Styled.FeeRow>
                {renderUpgradeFeeError}
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
