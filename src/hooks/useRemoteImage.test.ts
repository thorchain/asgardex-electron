import * as RD from '@devexperts/remote-data-ts'

import { useRemoteImage } from './useRemoteImage'

const mockSetValue = jest.fn()

jest.mock('react', () => ({
  useState: (value: unknown) => [value, mockSetValue]
}))

describe('hooks/useRemoteImage', () => {
  const LOAD_FAILURE_SRC = 'fail'
  const LOAD_SUCCESS_SRC = 'success'

  beforeEach(() => {
    // Mocking Image.prototype.src to call the onload or onerror
    Object.defineProperty(global.Image.prototype, 'src', {
      set(src: string) {
        if (src === LOAD_FAILURE_SRC) {
          this.onerror()
        } else if (src === LOAD_SUCCESS_SRC) {
          this.onload()
        }
      }
    })
  })

  it('should has initial pending state', () => {
    expect(useRemoteImage('')).toEqual(RD.pending)
  })

  it('should set failure if load failed', () => {
    useRemoteImage(LOAD_FAILURE_SRC)
    expect(mockSetValue).toBeCalledWith(RD.failure(LOAD_FAILURE_SRC))
  })

  it('should set success if load succeed', () => {
    useRemoteImage(LOAD_SUCCESS_SRC)
    expect(mockSetValue).toBeCalledWith(RD.success(LOAD_SUCCESS_SRC))
  })
})
