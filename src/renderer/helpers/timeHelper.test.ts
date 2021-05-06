import { roundUnixTimestampToMinutes } from './timeHelper'

// minutes-basis multiplied by 60 seconds
const roundToThreeMinutes = roundUnixTimestampToMinutes(3)
const roundToFiveMinutes = roundUnixTimestampToMinutes(5)
const roundToTenMinutes = roundUnixTimestampToMinutes(10)

describe('helpers/timeHelper', () => {
  it('should not round in case of matching of basis', () => {
    expect(roundToThreeMinutes(180)).toEqual(180)
    expect(roundToThreeMinutes(360)).toEqual(360)
    expect(roundToFiveMinutes(300)).toEqual(300)
    expect(roundToFiveMinutes(600)).toEqual(600)
    expect(roundToTenMinutes(600)).toEqual(600)
    expect(roundToTenMinutes(1200)).toEqual(1200)
  })

  it('should round to zero in case value less then basis', () => {
    expect(roundToThreeMinutes(100)).toEqual(0)
    expect(roundToFiveMinutes(200)).toEqual(0)
    expect(roundToTenMinutes(500)).toEqual(0)
  })

  it('should round to the basis', () => {
    expect(roundToThreeMinutes(185)).toEqual(180)
    expect(roundToThreeMinutes(400)).toEqual(360)
    expect(roundToFiveMinutes(500)).toEqual(300)
    expect(roundToFiveMinutes(859)).toEqual(600)
    expect(roundToTenMinutes(623)).toEqual(600)
    expect(roundToTenMinutes(1235)).toEqual(1200)
  })
})
