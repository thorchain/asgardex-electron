import React, { useMemo } from 'react'
import { Button } from 'antd'
import { useHistory } from 'react-router-dom'
import { stakeRoute } from '../../routes'
import * as RD from '@devexperts/remote-data-ts'
import View from '../View'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'

type Props = {}

const StakeHomeView: React.FC<Props> = (_): JSX.Element => {
  const history = useHistory()

  const intl = useIntl()

  const { pools$, reloadPools } = useMidgardContext()
  const pools = useObservableState(pools$, RD.initial)

  const clickHandler = (asset: string) => {
    history.push(stakeRoute.path({ asset }))
  }

  const renderPools = useMemo(
    () => (
      <>
        <h3>Pools</h3>
        {RD.fold(
          // initial state
          () => <div />,
          // loading state
          () => <h3>Loading...</h3>,
          // error state
          (error: Error) => <h3>`Loading of pools failed ${error?.message ?? ''}`</h3>,
          // success state
          (pools: string[]): JSX.Element => {
            const hasPools = pools.length > 0
            return (
              <>
                {!hasPools && <h3>No pools available.</h3>}
                {hasPools && (
                  <ul>
                    {pools.map((pool: string, index: number) => (
                      <li key={index}>{pool}</li>
                    ))}
                  </ul>
                )}
              </>
            )
          }
        )(pools)}
      </>
    ),
    [pools]
  )

  return (
    <View>
      <h1>{intl.formatMessage({ id: 'common.greeting' }, { name: 'ASGARDEX' })}</h1>
      <h1>Stake Home</h1>
      {renderPools}
      <Button onClick={() => reloadPools()}>Reload pools</Button>
      <Button onClick={() => clickHandler('BNB')}>BNB</Button>
      <Button onClick={() => clickHandler('TUSDB-000')}>TUSDB</Button>
    </View>
  )
}

export default StakeHomeView
