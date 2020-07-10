import { sortedSelected } from './sortSelectedHelper'

describe('helper/sortedSelected', () => {
  it('should sort selected values correctly', () => {
    const mock = [
      {
        selected: true,
        value: 9
      },
      {
        selected: true,
        value: 8
      },
      {
        value: 7
      },
      {
        selected: true,
        value: 6
      },
      {
        selected: true,
        value: 5
      },
      {
        value: 4
      },
      {
        selected: true,
        value: 3
      },
      {
        selected: true,
        value: 2
      },
      {
        value: 1
      }
    ]

    expect(sortedSelected(mock, 'value')).toEqual([
      {
        selected: true,
        value: 2
      },
      {
        selected: true,
        value: 3
      },
      {
        selected: true,
        value: 5
      },
      {
        selected: true,
        value: 6
      },
      {
        selected: true,
        value: 8
      },
      {
        selected: true,
        value: 9
      }
    ])
  })
})
