import React, { useCallback, useMemo, useState } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { ArrowPathIcon, MagnifyingGlassMinusIcon, MagnifyingGlassPlusIcon } from '@heroicons/react/24/outline'
import {
  Address,
  Asset,
  assetAmount,
  BaseAmount,
  baseAmount,
  baseToAsset,
  formatAssetAmountCurrency
} from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'

import { Network } from '../../../shared/api/types'
import { max1e8BaseAmount } from '../../helpers/assetHelper'
import { loadingString, noDataString } from '../../helpers/stringHelper'
import { BaseAmountRD } from '../../types'
import { AssetWithAmount, AssetWithDecimal } from '../../types/asgardex'
import { PricePool } from '../../views/pools/Pools.types'
import { AssetInput } from '../uielements/assets/assetInput'
import { BaseButton, FlatButton } from '../uielements/button'
import { MaxBalanceButton } from '../uielements/button/MaxBalanceButton'
import { TooltipAddress } from '../uielements/common/Common.styles'

export const ASSET_SELECT_BUTTON_WIDTH = 'w-[180px]'

export type Props = {
  asset: AssetWithDecimal
  address: Address
  network: Network
  pricePool: PricePool
  fees: BaseAmountRD
}

export const AddSavers: React.FC<Props> = (props): JSX.Element => {
  const {
    asset: { asset, decimal: assetDecimal },
    network,
    pricePool,
    fees: feesRD
  } = props

  const intl = useIntl()

  const amountToSendMax1e8: BaseAmount = baseAmount(0)
  const maxAmountToSendMax1e8: BaseAmount = baseAmount(0)
  const priceAmountToSendMax1e8: AssetWithAmount = { asset, amount: baseAmount(0) }
  const selectableAssets: Asset[] = []
  const setAsset = (_: Asset) => {}
  const setAmountToSendMax1e8 = (_: BaseAmount) => {}
  const reloadFeesHandler = () => {}

  const minAmountError = false

  const zeroBaseAmountMax = useMemo(() => baseAmount(0, assetDecimal), [assetDecimal])

  const zeroBaseAmountMax1e8 = useMemo(() => max1e8BaseAmount(zeroBaseAmountMax), [zeroBaseAmountMax])
  const maxBalanceInfoTxt = 'max balance info text'
  const renderMinAmount = <div>min amount TBD</div>

  const hasLedger = false
  const useLedger = false
  const onClickUseLedger = useCallback(() => {}, [])

  const onSubmit = () => {}
  const disableSubmit = false

  const priceFeesLabel = 'price-fee-label'
  const priceInFeeLabel = 'price-in-fee-label'

  const oWalletAddress = O.some('wallel-address')
  const oEarnParams = O.some({ poolAddress: { address: 'wallel-address' } })

  const reloadBalances = () => {}
  const walletBalancesLoading = false

  const memoTitle = 'Memo-title'
  const memoLabel = 'Memo-label'

  const [showDetails, setShowDetails] = useState<boolean>(false)

  return (
    <div className="flex w-full max-w-[500px] flex-col justify-between py-[60px]">
      <div>
        <div className="flex flex-col">
          <AssetInput
            className="w-full"
            amount={{ amount: amountToSendMax1e8, asset }}
            priceAmount={priceAmountToSendMax1e8}
            assets={selectableAssets}
            network={network}
            onChangeAsset={setAsset}
            onChange={setAmountToSendMax1e8}
            onBlur={reloadFeesHandler}
            showError={minAmountError}
            hasLedger={hasLedger}
            useLedger={useLedger}
            useLedgerHandler={onClickUseLedger}
            extraContent={
              <div className="flex flex-col">
                <MaxBalanceButton
                  className="ml-10px mt-5px"
                  classNameButton="!text-gray2 dark:!text-gray2d"
                  classNameIcon={
                    // show warn icon if maxAmountToSwapMax <= 0
                    maxAmountToSendMax1e8.gt(zeroBaseAmountMax1e8)
                      ? `text-gray2 dark:text-gray2d`
                      : 'text-warning0 dark:text-warning0d'
                  }
                  size="medium"
                  balance={{ amount: maxAmountToSendMax1e8, asset }}
                  onClick={() => setAmountToSendMax1e8(maxAmountToSendMax1e8)}
                  maxInfoText={maxBalanceInfoTxt}
                />
                {minAmountError && renderMinAmount}
              </div>
            }
          />

          <div className="flex flex-col items-center justify-center">
            <FlatButton
              className="my-30px min-w-[200px]"
              size="large"
              color="primary"
              onClick={onSubmit}
              disabled={disableSubmit}>
              {intl.formatMessage({ id: 'common.earn' })}
            </FlatButton>
          </div>

          <div className="w-full px-10px font-main text-[12px] uppercase dark:border-gray1d">
            <BaseButton
              className="goup flex w-full justify-between !p-0 font-mainSemiBold text-[16px] text-text2 hover:text-turquoise dark:text-text2d dark:hover:text-turquoise"
              onClick={() => setShowDetails((current) => !current)}>
              {intl.formatMessage({ id: 'common.details' })}
              {showDetails ? (
                <MagnifyingGlassMinusIcon className="ease h-[20px] w-[20px] text-inherit group-hover:scale-125" />
              ) : (
                <MagnifyingGlassPlusIcon className="ease h-[20px] w-[20px] text-inherit group-hover:scale-125 " />
              )}
            </BaseButton>

            <div className="pt-10px font-main text-[14px] text-gray2 dark:text-gray2d">
              {/* fees */}
              <div className="flex w-full items-center justify-between font-mainBold">
                <BaseButton
                  disabled={RD.isPending(feesRD) || RD.isInitial(feesRD)}
                  className="group !p-0 !font-mainBold !text-gray2 dark:!text-gray2d"
                  onClick={reloadFeesHandler}>
                  {intl.formatMessage({ id: 'common.fees.estimated' })}
                  <ArrowPathIcon className="ease ml-5px h-[15px] w-[15px] group-hover:rotate-180" />
                </BaseButton>
                <div>{priceFeesLabel}</div>
              </div>

              {showDetails && (
                <>
                  <div className="flex w-full justify-between pl-10px text-[12px]">
                    <div>{intl.formatMessage({ id: 'common.fee.inbound' })}</div>
                    <div>{priceInFeeLabel}</div>
                  </div>
                  <div className="flex w-full justify-between pl-10px text-[12px]">
                    <div>{intl.formatMessage({ id: 'common.fee.affiliate' })}</div>
                    <div>
                      {formatAssetAmountCurrency({
                        amount: assetAmount(0),
                        asset: pricePool.asset,
                        decimal: 0
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* addresses */}
              {showDetails && (
                <>
                  <div className={`w-full pt-10px font-mainBold text-[14px]`}>
                    {intl.formatMessage({ id: 'common.addresses' })}
                  </div>
                  {/* sender address */}
                  <div className="flex w-full items-center justify-between pl-10px text-[12px]">
                    <div>{intl.formatMessage({ id: 'common.sender' })}</div>
                    <div className="truncate pl-20px text-[13px] normal-case leading-normal">
                      {FP.pipe(
                        oWalletAddress,
                        O.map((address) => (
                          <TooltipAddress title={address} key="tooltip-sender-addr">
                            {address}
                          </TooltipAddress>
                        )),
                        O.getOrElse(() => <>{noDataString}</>)
                      )}
                    </div>
                  </div>
                  {/* inbound address */}
                  {FP.pipe(
                    oEarnParams,
                    O.map(({ poolAddress: { address } }) =>
                      address ? (
                        <div className="flex w-full items-center justify-between pl-10px text-[12px]" key="pool-addr">
                          <div>{intl.formatMessage({ id: 'common.pool.inbound' })}</div>
                          <TooltipAddress title={address}>
                            <div className="truncate pl-20px text-[13px] normal-case leading-normal">{address}</div>
                          </TooltipAddress>
                        </div>
                      ) : null
                    ),
                    O.toNullable
                  )}
                </>
              )}

              {/* balances */}
              {showDetails && (
                <>
                  <div className={`w-full pt-10px text-[14px]`}>
                    <BaseButton
                      disabled={walletBalancesLoading}
                      className="group !p-0 !font-mainBold !text-gray2 dark:!text-gray2d"
                      onClick={reloadBalances}>
                      {intl.formatMessage({ id: 'common.balances' })}
                      <ArrowPathIcon className="ease ml-5px h-[15px] w-[15px] group-hover:rotate-180" />
                    </BaseButton>
                  </div>
                  {/* sender balance */}
                  <div className="flex w-full items-center justify-between pl-10px text-[12px]">
                    <div>{intl.formatMessage({ id: 'common.sender' })}</div>
                    <div className="truncate pl-20px text-[13px] normal-case leading-normal">
                      {walletBalancesLoading
                        ? loadingString
                        : formatAssetAmountCurrency({
                            amount: baseToAsset(amountToSendMax1e8),
                            asset,
                            decimal: 8,
                            trimZeros: true
                          })}
                    </div>
                  </div>
                </>
              )}
              {/* memo */}
              {showDetails && (
                <>
                  <div className="ml-[-2px] flex w-full items-start pt-10px font-mainBold text-[14px]">{memoTitle}</div>
                  <div className="truncate pl-10px font-main text-[12px]">{memoLabel}</div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
