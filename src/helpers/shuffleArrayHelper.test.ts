import { shuffleArray } from './shuffleArrayHelper'

const mockMath = Object.create(global.Math)
mockMath.random = () => 0.5
global.Math = mockMath

describe('helpres/shuffleArrayHelper', () => {
  it('should change order but not content', () => {
    const testArray = [1, 2, 3, 4, 5, 6, 7, 8, 9]

    const shuffledArray = shuffleArray(testArray)

    expect(shuffledArray).toEqual([1, 6, 2, 8, 3, 7, 4, 9, 5])
  })
})
