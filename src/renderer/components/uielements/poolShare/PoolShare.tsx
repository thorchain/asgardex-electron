import React from 'react'

import { formatBN, BaseAmount } from '@thorchain/asgardex-util'
import BigNumber from 'bignumber.js'
import { useIntl } from 'react-intl'

import Label from '../label'
import { PoolCard } from './PoolCard'
import * as Styled from './PoolShare.style'

type Props = {
  source: string
  target: string
  runeStakedShare: BaseAmount
  runeStakedPrice: BaseAmount
  loading?: boolean
  basePriceSymbol: string
  assetStakedShare: BaseAmount
  assetStakedPrice: BaseAmount
  poolShare: BigNumber
}

const PoolShare: React.FC<Props> = (props): JSX.Element => {
  const {
    source,
    runeStakedShare,
    runeStakedPrice,
    loading,
    basePriceSymbol,
    target,
    assetStakedShare,
    assetStakedPrice,
    poolShare
  } = props

  const intl = useIntl()

  return (
    <Styled.PoolShareWrapper>
      <PoolCard
        title={intl.formatMessage({ id: 'stake.totalShare' })}
        loading={loading}
        source={source}
        target={target}
        runeAmount={runeStakedShare}
        runePrice={runeStakedPrice}
        assetAmount={assetStakedShare}
        assetPrice={assetStakedPrice}
        gradient={2}
        basePriceSymbol={basePriceSymbol}>
        <div>
          <Label textTransform="uppercase" size="big" align="center" loading={loading}>
            {intl.formatMessage({ id: 'stake.poolShare' })}
          </Label>
          <Styled.SharePercent loading={loading}>{poolShare ? `${formatBN(poolShare)}%` : '...'}</Styled.SharePercent>
        </div>
      </PoolCard>
    </Styled.PoolShareWrapper>
  )
}

export default PoolShare
