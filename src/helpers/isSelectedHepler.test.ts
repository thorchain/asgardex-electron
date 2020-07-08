import { isSelectedFactory } from './isSelectedHelper'

describe('helpers/isSelectedHelper', () => {
  it('should find selected item', () => {
    const checkSelected = isSelectedFactory<{ id: string; selected?: boolean }>(
      [{ id: 'some1' }, { id: 'some2', selected: true }, { id: 'some3', selected: true }, { id: 'some4' }],
      'id'
    )

    expect(checkSelected('some1')).toBeFalsy()
    expect(checkSelected('some2')).toBeTruthy()
    expect(checkSelected('some3')).toBeTruthy()
    expect(checkSelected('some4')).toBeFalsy()
  })
})
