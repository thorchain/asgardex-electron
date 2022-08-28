import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Address, Balance } from '@xchainjs/xchain-client'
import { Asset, baseToAsset, chainToString, formatAssetAmountCurrency, isSynthAsset } from '@xchainjs/xchain-util'
import { Col, Collapse, Grid, Row } from 'antd'
import { ScreenMap } from 'antd/lib/_util/responsiveObserve'
import { ColumnType } from 'antd/lib/table'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'

import { Network } from '../../../../shared/api/types'
import { isKeystoreWallet } from '../../../../shared/utils/guard'
import { disableRuneUpgrade, isNonNativeRuneAsset, isUSDAsset } from '../../../helpers/assetHelper'
import { getChainAsset } from '../../../helpers/chainHelper'
import { getPoolPriceValue } from '../../../helpers/poolHelper'
import { WalletBalancesRD } from '../../../services/clients'
import { PoolDetails } from '../../../services/midgard/types'
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
import { FlatButton } from '../../uielements/button'
import { QRCodeModal } from '../../uielements/qrCodeModal/QRCodeModal'
import * as Styled from './AssetsTableCollapsable.styles'

const { Panel } = Collapse

type Props = {
  chainBalances: ChainBalances
  pricePool: PricePool
  poolDetails: PoolDetails
  selectAssetHandler: (asset: SelectedWalletAsset) => void
  upgradeAssetHandler: (asset: SelectedWalletAsset) => void
  network: Network
  mimirHalt: MimirHaltRD
}

export const AssetsTableCollapsable: React.FC<Props> = (props): JSX.Element => {
  const {
    chainBalances = [],
    pricePool,
    poolDetails,
    selectAssetHandler,
    upgradeAssetHandler,
    mimirHalt: mimirHaltRD,
    network
  } = props

  const intl = useIntl()
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

  // Hide column of "show/hide" icon temporary
  // const hideAssetHandler = useCallback((_asset: Asset) => {
  //   // TODO (@Veado) Add logic as part of
  //   // https://github.com/thorchain/asgardex-electron/issues/476
  // }, [])

  const iconColumn: ColumnType<Balance> = useMemo(
    () => ({
      title: '',
      width: 120,
      render: ({ asset }: Balance) => (
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
      render: ({ asset, walletAddress, walletType, walletIndex, hdMode }: WalletBalance) => {
        // Disable UPGRADE button if needed
        const disableUpgradeButton = disableRuneUpgrade({ asset, haltThorChain, haltEthChain, haltBnbChain, network })

        const onClickUpgradeButtonHandler = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
          e.preventDefault()
          e.stopPropagation()
          upgradeAssetHandler({ asset, walletAddress, walletIndex, walletType, hdMode })
        }

        return (
          <Styled.AssetTickerWrapper>
            <Styled.Label nowrap>
              <Styled.TickerLabel>{asset.ticker}</Styled.TickerLabel>
              <Styled.ChainLabelWrapper>
                {!isSynthAsset(asset) && <Styled.ChainLabel>{asset.chain}</Styled.ChainLabel>}
                {isSynthAsset(asset) && <Styled.AssetSynthLabel>synth</Styled.AssetSynthLabel>}
              </Styled.ChainLabelWrapper>
            </Styled.Label>
            {isNonNativeRuneAsset(asset, network) && (
              <FlatButton
                className="ml-20px"
                size="normal"
                color="warning"
                onClick={disableUpgradeButton ? undefined : onClickUpgradeButtonHandler}
                disabled={disableUpgradeButton}>
                {intl.formatMessage({ id: 'wallet.action.upgrade' })}
              </FlatButton>
            )}
          </Styled.AssetTickerWrapper>
        )
      }
    }),
    [haltThorChain, haltEthChain, haltBnbChain, network, intl, upgradeAssetHandler]
  )

  const renderBalanceColumn = ({ asset, amount }: Balance) => {
    const balance = formatAssetAmountCurrency({ amount: baseToAsset(amount), asset, decimal: 3 })
    return (
      <Styled.Label nowrap align="right">
        {balance}
      </Styled.Label>
    )
  }

  const balanceColumn: ColumnType<Balance> = useMemo(
    () => ({
      render: renderBalanceColumn
    }),
    []
  )

  const renderPriceColumn = useCallback(
    (balance: Balance) => {
      const oPrice = getPoolPriceValue({ balance, poolDetails, pricePoolData: pricePool.poolData, network })
      const label = FP.pipe(
        oPrice,
        O.map((price) => {
          price.decimal = balance.amount.decimal
          return formatAssetAmountCurrency({
            amount: baseToAsset(price),
            asset: pricePool.asset,
            decimal: isUSDAsset(pricePool.asset) ? 2 : 4
          })
        }),
        // "empty" label if we don't get a price value
        O.getOrElse(() => '--')
      )
      return (
        <Styled.Label nowrap align="right">
          {label}
        </Styled.Label>
      )
    },
    [network, poolDetails, pricePool.asset, pricePool.poolData]
  )

  const priceColumn: ColumnType<Balance> = useMemo(
    () => ({
      width: 300,
      render: renderPriceColumn
    }),
    [renderPriceColumn]
  )

  // Hide column of "show/hide" icon temporary
  // const hideColumn: ColumnType<Balance> = useMemo(
  //   () => ({
  //     width: 20,
  //     render: ({ asset }: Balance) => (
  //       <Row
  //         justify="center"
  //         align="middle"
  //         onClick={(event) => {
  //           event.preventDefault()
  //           event.stopPropagation()
  //           hideAssetHandler(asset)
  //         }}>
  //         <Styled.HideIcon />
  //       </Row>
  //     )
  //   }),
  //   [hideAssetHandler]
  // )

  const columns = useMemo(() => {
    // desktop
    if (screenMap?.lg ?? false) {
      return [iconColumn, tickerColumn, balanceColumn, priceColumn]
    }
    // tablet
    if (screenMap?.sm ?? false) {
      return [iconColumn, tickerColumn, balanceColumn]
    }
    // mobile
    if (screenMap?.xs ?? false) {
      return [iconColumn, balanceColumn]
    }

    return []
  }, [balanceColumn, iconColumn, priceColumn, screenMap, tickerColumn])

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
            const i18nKey = length === 1 ? 'common.asset' : 'common.assets'
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
              {walletAddress}
              <Styled.CopyLabelContainer
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                }}>
                <Styled.CopyLabel copyable={{ text: walletAddress }} />
                <Styled.QRCodeIcon
                  onClick={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    setShowQRModal(O.some({ asset: getChainAsset(chain), address: walletAddress }))
                  }}
                />
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
    [intl, renderBalances]
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
