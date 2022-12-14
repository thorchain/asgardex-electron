import React, { useCallback, useMemo } from 'react'

import { Asset, BaseAmount, baseAmount } from '@xchainjs/xchain-util'
import { useIntl } from 'react-intl'

import { Network } from '../../../shared/api/types'
import { max1e8BaseAmount } from '../../helpers/assetHelper'
import { AssetWithAmount, AssetWithDecimal } from '../../types/asgardex'
import { AssetInput } from '../uielements/assets/assetInput'
import { CheckButton } from '../uielements/button/CheckButton'
import { MaxBalanceButton } from '../uielements/button/MaxBalanceButton'

export const ASSET_SELECT_BUTTON_WIDTH = 'w-[180px]'

export type Props = {
  asset: AssetWithDecimal
  network: Network
}

export const WithdrawSavers: React.FC<Props> = (props): JSX.Element => {
  const {
    asset: { asset, decimal: assetDecimal },
    network
  } = props

  const intl = useIntl()

  const amountToSendMax1e8: BaseAmount = baseAmount(0)
  const maxAmountToSendMax1e8: BaseAmount = baseAmount(0)
  const priceAmountToSendMax1e8: AssetWithAmount = { asset, amount: baseAmount(0) }
  const selectableAssets: Asset[] = []
  const setAsset = (_: Asset) => {}
  const setAmountToSendMax1e8 = (_: BaseAmount) => {}
  const reloadFeesHandler = () => {}
  const minAmountError = true

  // ZERO `BaseAmount` for target Asset - original decimal
  const zeroBaseAmountMax = useMemo(() => baseAmount(0, assetDecimal), [assetDecimal])

  // ZERO `BaseAmount` for target Asset <= 1e8
  const zeroBaseAmountMax1e8 = useMemo(() => max1e8BaseAmount(zeroBaseAmountMax), [zeroBaseAmountMax])
  const maxBalanceInfoTxt = 'max balance info text'
  const renderMinAmount = <div>min amount TBD</div>

  const hasLedger = false
  const useLedger = false
  const onClickUseLedger = useCallback(() => {}, [])

  return (
    <div className="flex w-full max-w-[500px] flex-col justify-between py-[60px]">
      WITHDRAW
      <div>
        <div className="flex flex-col">
          <AssetInput
            className="w-full"
            title={intl.formatMessage({ id: 'swap.input' })}
            amount={{ amount: amountToSendMax1e8, asset }}
            priceAmount={priceAmountToSendMax1e8}
            assets={selectableAssets}
            network={network}
            onChangeAsset={setAsset}
            onChange={setAmountToSendMax1e8}
            onBlur={reloadFeesHandler}
            showError={minAmountError}
          />

          <div className="flex flex-row">
            <div className="flex w-full flex-col">
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
            {/* Note: 'items-start' needed to avoid stretch button in height of parent container */}
            <div className="flex w-full items-start justify-end">
              <CheckButton
                size="medium"
                color="neutral"
                className={`${ASSET_SELECT_BUTTON_WIDTH} rounded-b-lg bg-gray0 py-5px dark:bg-gray0d ${
                  !hasLedger ? 'hidden' : ''
                }`}
                checked={useLedger}
                clickHandler={onClickUseLedger}>
                {intl.formatMessage({ id: 'ledger.title' })}
              </CheckButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
