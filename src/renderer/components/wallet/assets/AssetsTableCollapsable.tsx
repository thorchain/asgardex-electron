import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import {
  Address,
  Asset,
  assetFromString,
  assetToString,
  baseAmount,
  baseToAsset,
  formatAssetAmountCurrency,
  isSynthAsset
} from '@xchainjs/xchain-util'
import { Col, Collapse, Grid, Row } from 'antd'
import { ScreenMap } from 'antd/lib/_util/responsiveObserve'
import { ColumnType } from 'antd/lib/table'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router'

import { Network } from '../../../../shared/api/types'
import { AssetRuneNative } from '../../../../shared/utils/asset'
import { chainToString } from '../../../../shared/utils/chain'
import { isKeystoreWallet } from '../../../../shared/utils/guard'
import { DEFAULT_WALLET_TYPE } from '../../../const'
import { disableRuneUpgrade, isNonNativeRuneAsset, isRuneNativeAsset, isUSDAsset } from '../../../helpers/assetHelper'
import { getChainAsset } from '../../../helpers/chainHelper'
import { getDeepestPool, getPoolPriceValue } from '../../../helpers/poolHelper'
import { hiddenString, noDataString } from '../../../helpers/stringHelper'
import * as poolsRoutes from '../../../routes/pools'
import { WalletBalancesRD } from '../../../services/clients'
import { PoolDetails, PoolsDataMap } from '../../../services/midgard/types'
import { MimirHaltRD } from '../../../services/thorchain/types'
import {
  ApiError,
  ChainBalance,
  ChainBalances,
  SelectedWalletAsset,
  WalletBalance,
  WalletBalances
} from '../../../services/wallet/types'
import { walletTypeToI18n } from '../../../services/wallet/util'
import { PricePool } from '../../../views/pools/Pools.types'
import { ErrorView } from '../../shared/error/'
import { AssetIcon } from '../../uielements/assets/assetIcon'
import { Action as ActionButtonAction, ActionButton } from '../../uielements/button/ActionButton'
import { QRCodeModal } from '../../uielements/qrCodeModal/QRCodeModal'
import * as Styled from './AssetsTableCollapsable.styles'

const { Panel } = Collapse

export type AssetAction = 'send' | 'upgrade' | 'deposit'

type Props = {
  chainBalances: ChainBalances
  pricePool: PricePool
  poolDetails: PoolDetails
  poolsData: PoolsDataMap
  selectAssetHandler: (asset: SelectedWalletAsset) => void
  assetHandler: (asset: SelectedWalletAsset, action: AssetAction) => void
  network: Network
  mimirHalt: MimirHaltRD
  hidePrivateData: boolean
}

export const AssetsTableCollapsable: React.FC<Props> = (props): JSX.Element => {
  const {
    chainBalances = [],
    pricePool,
    poolDetails,
    poolsData,
    selectAssetHandler,
    assetHandler,
    mimirHalt: mimirHaltRD,
    network,
    hidePrivateData
  } = props

  const intl = useIntl()
  const navigate = useNavigate()
  const screenMap: ScreenMap = Grid.useBreakpoint()

  const [showQRModal, setShowQRModal] = useState<O.Option<{ asset: Asset; address: Address }>>(O.none)

  // State to store open panel keys
  const [openPanelKeys, setOpenPanelKeys] = useState<string[]>()
  // State track that user has changed collpase state
  const [collapseChangedByUser, setCollapseChangedByUser] = useState(false)

  // store previous data of asset data to render these while reloading
  const previousAssetsTableData = useRef<WalletBalances[]>([])

  // get halt status from Mimir
  const { haltThorChain, haltEthChain, haltBnbChain } = useMemo(
    () =>
      FP.pipe(
        mimirHaltRD,
        RD.getOrElse(() => ({ haltThorChain: true, haltEthChain: true, haltBnbChain: true }))
      ),
    [mimirHaltRD]
  )

  const onRowHandler = useCallback(
    ({ asset, walletAddress, walletType, walletIndex, hdMode }: WalletBalance) => ({
      // Disable click for NativeRUNE if Thorchain is halted
      onClick: () => selectAssetHandler({ asset, walletAddress, walletType, walletIndex, hdMode })
    }),
    [selectAssetHandler]
  )

  const iconColumn: ColumnType<WalletBalance> = useMemo(
    () => ({
      title: '',
      width: 120,
      render: ({ asset }: WalletBalance) => (
        <Row justify="center" align="middle">
          <AssetIcon asset={asset} size="normal" network={network} />
        </Row>
      )
    }),
    [network]
  )

  const tickerColumn: ColumnType<WalletBalance> = useMemo(
    () => ({
      width: 80,
      render: ({ asset }: WalletBalance) => (
        <Styled.AssetTickerWrapper>
          <Styled.Label nowrap>
            <Styled.TickerLabel>{asset.ticker}</Styled.TickerLabel>
            <Styled.ChainLabelWrapper>
              {!isSynthAsset(asset) && <Styled.ChainLabel>{asset.chain}</Styled.ChainLabel>}
              {isSynthAsset(asset) && <Styled.AssetSynthLabel>synth</Styled.AssetSynthLabel>}
            </Styled.ChainLabelWrapper>
          </Styled.Label>
        </Styled.AssetTickerWrapper>
      )
    }),
    []
  )

  const balanceColumn: ColumnType<WalletBalance> = useMemo(
    () => ({
      render: ({ asset, amount }: WalletBalance) => {
        const balance = formatAssetAmountCurrency({ amount: baseToAsset(amount), asset, decimal: 3 })
        const price = FP.pipe(
          getPoolPriceValue({ balance: { asset, amount }, poolDetails, pricePool, network }),
          O.map((price) => {
            const priceAmount = baseAmount(price.amount(), amount.decimal)
            return formatAssetAmountCurrency({
              amount: baseToAsset(priceAmount),
              asset: pricePool.asset,
              decimal: isUSDAsset(pricePool.asset) ? 2 : 4
            })
          }),
          // "empty" label if we don't get a price value
          O.getOrElse(() => noDataString)
        )
        return (
          <div className="flex flex-col items-end justify-center font-main">
            <div className="text-16 text-text0 dark:text-text0d">{hidePrivateData ? hiddenString : balance}</div>
            <div className="text-14 text-gray2 dark:text-gray2d">{hidePrivateData ? hiddenString : price}</div>
          </div>
        )
      }
    }),
    [hidePrivateData, network, poolDetails, pricePool]
  )

  const renderActionColumn = useCallback(
    ({ asset, walletAddress, walletIndex, walletType, hdMode }: WalletBalance) => {
      const { chain } = asset
      const walletAsset: SelectedWalletAsset = { asset, walletAddress, walletIndex, walletType, hdMode }
      const hasActivePool: boolean = FP.pipe(O.fromNullable(poolsData[assetToString(asset)]), O.isSome)
      const deepestPoolAsset = FP.pipe(
        getDeepestPool(poolDetails),
        O.chain(({ asset }) => O.fromNullable(assetFromString(asset))),
        O.toNullable
      )

      const actions: ActionButtonAction[] = FP.pipe(
        // 'swap' for RUNE
        isRuneNativeAsset(asset) && deepestPoolAsset !== null
          ? [
              {
                label: intl.formatMessage({ id: 'common.swap' }),
                callback: () => {
                  navigate(
                    poolsRoutes.swap.path({
                      source: assetToString(asset),
                      target: assetToString(deepestPoolAsset),
                      sourceWalletType: walletType,
                      targetWalletType: DEFAULT_WALLET_TYPE
                    })
                  )
                }
              }
            ]
          : [],
        // 'add' LP RUNE
        A.concatW<ActionButtonAction>(
          isRuneNativeAsset(asset) && deepestPoolAsset !== null
            ? [
                {
                  label: intl.formatMessage({ id: 'common.add' }),
                  callback: () => {
                    navigate(
                      poolsRoutes.deposit.path({
                        asset: assetToString(deepestPoolAsset),
                        assetWalletType: DEFAULT_WALLET_TYPE,
                        runeWalletType: walletType
                      })
                    )
                  }
                }
              ]
            : []
        ),
        // 'swap' for assets of active pools only
        A.concatW<ActionButtonAction>(
          hasActivePool
            ? [
                {
                  label: intl.formatMessage({ id: 'common.swap' }),
                  callback: () => {
                    navigate(
                      poolsRoutes.swap.path({
                        source: assetToString(asset),
                        target: assetToString(AssetRuneNative),
                        sourceWalletType: walletType,
                        targetWalletType: DEFAULT_WALLET_TYPE
                      })
                    )
                  }
                }
              ]
            : []
        ),
        // 'add' LP for assets of active pools only
        A.concatW<ActionButtonAction>(
          hasActivePool
            ? [
                {
                  label: intl.formatMessage({ id: 'common.add' }),
                  callback: () => {
                    navigate(
                      poolsRoutes.deposit.path({
                        asset: assetToString(asset),
                        assetWalletType: walletType,
                        runeWalletType: DEFAULT_WALLET_TYPE
                      })
                    )
                  }
                }
              ]
            : []
        ),
        A.concat([
          {
            label: intl.formatMessage({ id: 'wallet.action.send' }),
            callback: () => {
              assetHandler(walletAsset, 'send')
            }
          },
          {
            label: intl.formatMessage({ id: 'wallet.action.receive' }),
            callback: () => {
              setShowQRModal(O.some({ asset: getChainAsset(chain), address: walletAddress }))
            }
          }
        ]),
        // 'deposit'  for RuneNativeAsset only
        A.concatW<ActionButtonAction>(
          isRuneNativeAsset(asset)
            ? [
                {
                  label: intl.formatMessage({ id: 'wallet.action.deposit' }),
                  callback: () => {
                    assetHandler(walletAsset, 'deposit')
                  }
                }
              ]
            : []
        ),
        // 'upgrade' for non-RuneNativeAsset only
        A.concatW<ActionButtonAction>(
          isNonNativeRuneAsset(asset, network)
            ? [
                {
                  label: intl.formatMessage({ id: 'wallet.action.upgrade' }),
                  // Disable UPGRADE button if needed
                  disabled: disableRuneUpgrade({ asset, haltThorChain, haltEthChain, haltBnbChain, network }),
                  callback: () => {
                    assetHandler(walletAsset, 'upgrade')
                  }
                }
              ]
            : []
        )
      )

      return (
        <div className="flex justify-center">
          <ActionButton size="normal" actions={actions} />
        </div>
      )
    },
    [assetHandler, haltBnbChain, haltEthChain, haltThorChain, intl, navigate, network, poolDetails, poolsData]
  )

  const actionColumn: ColumnType<WalletBalance> = useMemo(
    () => ({
      width: 150,
      render: renderActionColumn
    }),
    [renderActionColumn]
  )

  const columns = useMemo(() => {
    // desktop
    if (screenMap?.lg ?? false) {
      return [iconColumn, tickerColumn, balanceColumn, actionColumn]
    }
    // tablet
    if (screenMap?.sm ?? false) {
      return [iconColumn, tickerColumn, balanceColumn, actionColumn]
    }
    // mobile
    if (screenMap?.xs ?? false) {
      return [iconColumn, balanceColumn, actionColumn]
    }

    return []
  }, [actionColumn, balanceColumn, iconColumn, screenMap?.lg, screenMap?.sm, screenMap?.xs, tickerColumn])

  const renderAssetsTable = useCallback(
    ({ tableData, loading = false }: { tableData: WalletBalances; loading?: boolean }) => {
      return (
        <Styled.Table
          showHeader={false}
          dataSource={tableData}
          loading={loading}
          rowKey={({ asset }) => asset.symbol}
          onRow={onRowHandler}
          columns={columns}
        />
      )
    },
    [columns, onRowHandler]
  )

  const renderBalances = useCallback(
    ({ balancesRD, index }: { balancesRD: WalletBalancesRD; index: number }) => {
      return FP.pipe(
        balancesRD,
        RD.fold(
          // initial state
          () => renderAssetsTable({ tableData: [], loading: false }),
          // loading state
          () => {
            const data = previousAssetsTableData.current[index] ?? []
            return renderAssetsTable({
              tableData: data,
              loading: true
            })
          },
          // error state
          ({ msg }: ApiError) => {
            return <ErrorView title={msg} />
          },
          // success state
          (balances) => {
            const prev = previousAssetsTableData.current
            prev[index] = balances
            return renderAssetsTable({
              tableData: balances,
              loading: false
            })
          }
        )
      )
    },
    [renderAssetsTable]
  )

  // Panel
  const renderPanel = useCallback(
    ({ chain, walletType, walletAddress: oWalletAddress, balances: balancesRD }: ChainBalance, key: number) => {
      /**
       * We need to push initial value to the ledger-based streams
       * 'cuz chainBalances$ stream is created by 'combineLatest'
       * which will not emit anything if some of stream has
       * not emitted at least once
       * @see btcLedgerChainBalance$'s getOrElse branch at src/renderer/services/wallet/balances.ts
       */
      if (O.isNone(oWalletAddress) && RD.isInitial(balancesRD)) {
        return null
      }

      const walletAddress = FP.pipe(
        oWalletAddress,
        O.getOrElse(() => intl.formatMessage({ id: 'wallet.errors.address.invalid' }))
      )

      const assetsTxt = FP.pipe(
        balancesRD,
        RD.fold(
          () => '',
          () => intl.formatMessage({ id: 'common.loading' }),
          (_: ApiError) => intl.formatMessage({ id: 'common.error' }),
          (balances) => {
            const length = balances.length
            const i18nKey = length <= 1 ? 'common.asset' : 'common.assets'
            return `(${length} ${intl.formatMessage({ id: i18nKey })})`
          }
        )
      )

      const header = (
        <Styled.HeaderRow>
          <Col xs={14} md={6} lg={4}>
            <Styled.HeaderChainContainer>
              <Styled.HeaderLabel>{chainToString(chain)}</Styled.HeaderLabel>
              {
                // show tag for NON keystore wallets only (e.g. Ledger)
                !isKeystoreWallet(walletType) && (
                  <Styled.WalletTypeLabel>{walletTypeToI18n(walletType, intl)}</Styled.WalletTypeLabel>
                )
              }
            </Styled.HeaderChainContainer>
          </Col>
          <Col xs={0} md={12} lg={10}>
            <Styled.HeaderAddress>
              {hidePrivateData ? hiddenString : walletAddress}
              <Styled.CopyLabelContainer
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                }}>
                <Styled.CopyLabel copyable={{ text: walletAddress }} />
              </Styled.CopyLabelContainer>
            </Styled.HeaderAddress>
          </Col>
          <Col xs={10} md={6} lg={10}>
            <Styled.HeaderLabel
              color={RD.isFailure(balancesRD) ? 'error' : 'gray'}>{`${assetsTxt}`}</Styled.HeaderLabel>
          </Col>
        </Styled.HeaderRow>
      )
      return (
        <Panel header={header} key={key}>
          {renderBalances({
            balancesRD,
            index: key
          })}
        </Panel>
      )
    },
    [hidePrivateData, intl, renderBalances]
  )

  // open all panels by default
  useEffect(() => {
    // don't change openPanelKeys if user has already changed panel state
    if (!collapseChangedByUser) {
      // filter out empty list of balances
      const keys = FP.pipe(
        chainBalances,
        A.map(({ balances }) => balances),
        A.map(RD.getOrElse((): WalletBalances => [])),
        A.filterMapWithIndex((i, balances) =>
          balances.length > 0 || (previousAssetsTableData.current[i] && previousAssetsTableData.current[i].length !== 0)
            ? O.some(i.toString())
            : O.none
        )
      )
      setOpenPanelKeys(keys)
    }
  }, [chainBalances, collapseChangedByUser])

  const onChangeCollapseHandler = useCallback((key: string | string[]) => {
    if (Array.isArray(key)) {
      setOpenPanelKeys(key)
    } else {
      setOpenPanelKeys([key])
    }
    // user has changed collpase state
    setCollapseChangedByUser(true)
  }, [])

  const closeQrModal = useCallback(() => setShowQRModal(O.none), [setShowQRModal])

  const renderQRCodeModal = useMemo(() => {
    return FP.pipe(
      showQRModal,
      O.map(({ asset, address }) => (
        <QRCodeModal
          key="qr-modal"
          asset={asset}
          address={address}
          network={network}
          visible={true}
          onCancel={closeQrModal}
          onOk={closeQrModal}
        />
      )),
      O.getOrElse(() => <></>)
    )
  }, [showQRModal, network, closeQrModal])

  return (
    <Styled.Collapse
      expandIcon={({ isActive }) => <Styled.ExpandIcon rotate={isActive ? 90 : 0} />}
      defaultActiveKey={openPanelKeys}
      activeKey={openPanelKeys}
      expandIconPosition="end"
      onChange={onChangeCollapseHandler}
      ghost>
      {chainBalances.map(renderPanel)}
      {renderQRCodeModal}
    </Styled.Collapse>
  )
}
