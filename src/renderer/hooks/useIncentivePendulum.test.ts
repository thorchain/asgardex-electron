import { getIncentivePendulum } from './useIncentivePendulum'

describe('hooks/useProtocolLimit', () => {
  it('all values', () => {
    const { incentivePendulum, incentivePendulumLight, totalActiveBondAmount, totalPooledRuneAmount } =
      getIncentivePendulum('50', '100')
    expect(incentivePendulum).toEqual(100)
    expect(incentivePendulumLight).toEqual('green')
    expect(totalPooledRuneAmount.amount().toNumber()).toEqual(50)
    expect(totalActiveBondAmount.amount().toNumber()).toEqual(100)
  })

  it('red (LP too high)', () => {
    const { incentivePendulum, incentivePendulumLight } = getIncentivePendulum('200', '100')
    expect(incentivePendulum).toEqual(400)
    expect(incentivePendulumLight).toEqual('red')
  })

  it('red (no bonds)', () => {
    const { incentivePendulum, incentivePendulumLight } = getIncentivePendulum('20', '')
    expect(incentivePendulum).toEqual(0)
    expect(incentivePendulumLight).toEqual('red')
  })

  it('yellow', () => {
    const { incentivePendulum, incentivePendulumLight } = getIncentivePendulum('75', '100')
    expect(incentivePendulum).toEqual(150)
    expect(incentivePendulumLight).toEqual('yellow')
  })

  it('green', () => {
    const { incentivePendulum, incentivePendulumLight } = getIncentivePendulum('55', '100')
    expect(incentivePendulum).toEqual(110)
    expect(incentivePendulumLight).toEqual('green')
  })

  it('green (no LP)', () => {
    const { incentivePendulum, incentivePendulumLight } = getIncentivePendulum('', '100')
    expect(incentivePendulum).toEqual(0)
    expect(incentivePendulumLight).toEqual('green')
  })

  it('green (very low LP)', () => {
    const { incentivePendulum, incentivePendulumLight } = getIncentivePendulum('1', '100')
    expect(incentivePendulum).toEqual(2)
    expect(incentivePendulumLight).toEqual('green')
  })
})
