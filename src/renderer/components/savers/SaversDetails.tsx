import React from 'react'

import { Asset, assetToString } from '@xchainjs/xchain-util'
import { useIntl } from 'react-intl'

type Props = {
  asset: Asset
}

export const SaversDetails: React.FC<Props> = (props): JSX.Element => {
  const { asset } = props
  const intl = useIntl()

  return (
    <div className="flex w-full flex-col items-center p-20px">
      <h1 className="pb-20px text-center font-mainSemiBold text-16 uppercase">
        {intl.formatMessage({ id: 'common.details' })}
      </h1>
      {assetToString(asset)}
    </div>
  )
}
