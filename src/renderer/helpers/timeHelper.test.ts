import * as O from 'fp-ts/Option'

import { roundUnixTimestampToMinutes } from './timeHelper'

// minutes-basis multiplied by 60 seconds
const roundToThreeMinutes = roundUnixTimestampToMinutes(3)
const roundToFiveMinutes = roundUnixTimestampToMinutes(5)
const roundToTenMinutes = roundUnixTimestampToMinutes(10)

describe('helpers/timeHelper', () => {
  it('should not round in case of matching of basis', () => {
    expect(roundToThreeMinutes(180)).toEqual(O.some(180))
    expect(roundToThreeMinutes(360)).toEqual(O.some(360))
    expect(roundToFiveMinutes(300)).toEqual(O.some(300))
    expect(roundToFiveMinutes(600)).toEqual(O.some(600))
    expect(roundToTenMinutes(600)).toEqual(O.some(600))
    expect(roundToTenMinutes(1200)).toEqual(O.some(1200))
  })

  it('should round to zero in case value less then basis', () => {
    expect(roundToThreeMinutes(100)).toEqual(O.some(0))
    expect(roundToFiveMinutes(200)).toEqual(O.some(0))
    expect(roundToTenMinutes(500)).toEqual(O.some(0))
  })

  it('should round to the basis', () => {
    expect(roundToThreeMinutes(185)).toEqual(O.some(180))
    expect(roundToThreeMinutes(400)).toEqual(O.some(360))
    expect(roundToFiveMinutes(500)).toEqual(O.some(300))
    expect(roundToFiveMinutes(859)).toEqual(O.some(600))
    expect(roundToTenMinutes(623)).toEqual(O.some(600))
    expect(roundToTenMinutes(1235)).toEqual(O.some(1200))
  })

  it('should return none for undefined value', () => {
    expect(roundToThreeMinutes()).toBeNone()
  })
})
