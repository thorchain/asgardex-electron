import React, { useCallback, useEffect, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Address, Asset, assetToString } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { Network } from '../../../../shared/api/types'
import { BNBChain, Chain, ETHChain, THORChain, unsafeChain, unsafeChainFromAsset } from '../../../../shared/utils/chain'
import { ErrorView } from '../../../components/shared/error'
import { LoadingView } from '../../../components/shared/loading'
import { BackLinkButton } from '../../../components/uielements/button'
import { useAppContext } from '../../../contexts/AppContext'
import { useChainContext } from '../../../contexts/ChainContext'
import { useMidgardContext } from '../../../contexts/MidgardContext'
import { useThorchainContext } from '../../../contexts/ThorchainContext'
import { useWalletContext } from '../../../contexts/WalletContext'
import { isNonNativeRuneAsset } from '../../../helpers/assetHelper'
import { eqOAsset } from '../../../helpers/fp/eq'
import { sequenceTRD } from '../../../helpers/fpHelpers'
import { liveData } from '../../../helpers/rx/liveData'
import { addressFromOptionalWalletAddress } from '../../../helpers/walletHelper'
import { useOpenExplorerTxUrl } from '../../../hooks/useOpenExplorerTxUrl'
import { useValidateAddress } from '../../../hooks/useValidateAddress'
import { AssetWithDecimalLD } from '../../../services/chain/types'
import { DEFAULT_NETWORK } from '../../../services/const'
import { PoolAddressRD } from '../../../services/midgard/types'
import { DEFAULT_BALANCES_FILTER, INITIAL_BALANCES_STATE } from '../../../services/wallet/const'
import { SelectedWalletAssetRD } from '../../../services/wallet/types'
import { ledgerAddressToWalletAddress } from '../../../services/wallet/util'
import { CommonUpgradeProps } from './types'
import { UpgradeBNB } from './UpgradeViewBNB'
import { UpgradeETH } from './UpgradeViewETH'

type Props = {}

export const UpgradeView: React.FC<Props> = (): JSX.Element => {
  const intl = useIntl()

  const { network$ } = useAppContext()
  const network = useObservableState<Network>(network$, DEFAULT_NETWORK)

  const { validateAddress } = useValidateAddress(THORChain)

  const { addressByChain$, upgradeRuneToNative$, assetWithDecimal$ } = useChainContext()

  const { selectedAsset$ } = useWalletContext()

  const runeToUpgradeAssetRD$ = useMemo(
    () =>
      FP.pipe(
        Rx.combineLatest([selectedAsset$, network$]),
        RxOp.map(([oSelectedAsset, network]) =>
          FP.pipe(
            oSelectedAsset,
            O.fold(
              () => RD.failure(Error('No selected asset to upgrade')),
              (selectedAsset) =>
                isNonNativeRuneAsset(selectedAsset.asset, network)
                  ? RD.success(selectedAsset)
                  : RD.failure(Error(`Invalid asset to upgrade ${assetToString(selectedAsset.asset)}`))
            )
          )
        ),
        RxOp.startWith(RD.pending)
      ),
    [network$, selectedAsset$]
  )

  const runeToUpgradeAssetRD = useObservableState<SelectedWalletAssetRD>(runeToUpgradeAssetRD$, RD.initial)
  const oRuneToUpgradeAsset: O.Option<Asset> = useMemo(
    () =>
      FP.pipe(
        RD.toOption(runeToUpgradeAssetRD),
        O.map(({ asset }) => asset)
      ),
    [runeToUpgradeAssetRD]
  )

  const [runeToDecimalRD] = useObservableState<RD.RemoteData<Error, number>>(
    () =>
      FP.pipe(
        // Note: network$ is needed to get latest network changes
        // using `network` from `useObservableState` above  has no effect here
        Rx.combineLatest([runeToUpgradeAssetRD$, network$]),
        RxOp.switchMap(([assetRD, network]) =>
          FP.pipe(
            RD.toOption(assetRD),
            O.map(({ asset }) => assetWithDecimal$(asset, network)),
            O.getOrElse((): AssetWithDecimalLD => Rx.of(RD.initial))
          )
        ),
        liveData.map(({ decimal }) => decimal),
        RxOp.startWith(RD.pending)
      ),
    RD.initial
  )

  const {
    balancesState$,
    keystoreService: { validatePassword$ },
    getLedgerAddress$,
    reloadBalancesByChain
  } = useWalletContext()

  const [{ balances: oBalances }] = useObservableState(
    () => balancesState$(DEFAULT_BALANCES_FILTER),
    INITIAL_BALANCES_STATE
  )

  const {
    service: {
      pools: { poolAddressesByChain$ }
    }
  } = useMidgardContext()

  const { reloadInboundAddresses } = useThorchainContext()

  // reload inbound addresses at `onMount` to get always latest `pool address`
  useEffect(() => {
    reloadInboundAddresses()
  }, [reloadInboundAddresses])

  const [oRuneNativeAddress] = useObservableState<O.Option<Address>>(
    () => FP.pipe(addressByChain$(THORChain), RxOp.map(addressFromOptionalWalletAddress)),
    O.none
  )

  const runeNativeLedgerAddress$ = useMemo(
    () =>
      FP.pipe(
        getLedgerAddress$(THORChain),
        RxOp.map(O.map(ledgerAddressToWalletAddress)),
        RxOp.map(addressFromOptionalWalletAddress)
      ),

    [getLedgerAddress$]
  )
  const oRuneNativeLedgerAddress = useObservableState(runeNativeLedgerAddress$, O.none)

  const [targetPoolAddressRD, updateTargetPoolAddressRD] = useObservableState<PoolAddressRD, O.Option<Asset>>(
    (oRuneNonNativeAsset$) =>
      FP.pipe(
        oRuneNonNativeAsset$,
        RxOp.distinctUntilChanged(eqOAsset.equals),
        RxOp.switchMap(
          FP.flow(
            O.fold(
              // No subscription of `poolAddresses$` needed for other assets than [CHAIN].RUNE
              () => Rx.of(RD.initial),
              (asset) => {
                const chain = unsafeChain(asset.chain)
                return poolAddressesByChain$(chain)
              }
            )
          )
        )
      ),
    RD.initial
  )

  /** Effect to re-trigger calculations of useObservableState */
  useEffect(() => {
    updateTargetPoolAddressRD(oRuneToUpgradeAsset)
  }, [oRuneToUpgradeAsset, updateTargetPoolAddressRD])

  const renderDataError = useCallback(
    (error: Error) => {
      return (
        <ErrorView
          title={intl.formatMessage({ id: 'wallet.upgrade.error' })}
          subTitle={error?.message ?? error.toString()}
        />
      )
    },
    [intl]
  )

  const renderUpgradeComponent = useCallback((chain: Chain, props: CommonUpgradeProps) => {
    switch (chain) {
      case BNBChain: {
        return <UpgradeBNB {...props} />
      }
      case ETHChain: {
        return <UpgradeETH {...props} />
      }
      default:
        return null
    }
  }, [])

  const { openExplorerTxUrl, getExplorerTxUrl } = useOpenExplorerTxUrl(
    FP.pipe(oRuneToUpgradeAsset, O.map(unsafeChainFromAsset))
  )

  return (
    <div>
      <BackLinkButton />
      {FP.pipe(
        sequenceTRD(runeToUpgradeAssetRD, runeToDecimalRD, targetPoolAddressRD),
        RD.fold(
          () => <LoadingView size="large" />,
          () => <LoadingView size="large" />,
          renderDataError,
          ([{ asset, walletType, walletAddress, walletIndex, hdMode }, decimal, targetPoolAddress]) => {
            const runeToUpgradeChain = unsafeChain(asset.chain)
            return FP.pipe(
              // Show an error by invalid address
              // All other values should be immediately available by entering the `UpgradeView`
              oRuneNativeAddress,
              O.fold(
                () => renderDataError(Error('Could not get address from asset')),
                (runeNativeAddress) => {
                  return renderUpgradeComponent(runeToUpgradeChain, {
                    addressValidation: validateAddress,
                    assetData: {
                      asset,
                      walletAddress,
                      walletType,
                      walletIndex,
                      hdMode,
                      decimal
                    },
                    runeNativeAddress,
                    runeNativeLedgerAddress: oRuneNativeLedgerAddress,
                    targetPoolAddress,
                    validatePassword$,
                    upgrade$: upgradeRuneToNative$,
                    balances: oBalances,
                    openExplorerTxUrl,
                    getExplorerTxUrl,
                    reloadBalancesHandler: reloadBalancesByChain(runeToUpgradeChain),
                    network
                  })
                }
              )
            )
          }
        )
      )}
    </div>
  )
}
