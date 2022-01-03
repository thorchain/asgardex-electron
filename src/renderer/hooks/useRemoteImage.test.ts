/**
 * @vitest-environment happy-dom
 */
import * as RD from '@devexperts/remote-data-ts'

import { useRemoteImage } from './useRemoteImage'

const mockSetValue = vi.fn()

vi.mock('react', () => ({
  useState: (value: unknown) => [value, mockSetValue],
  useEffect: (fn: () => void) => fn()
}))

// TODO(@veado) Fix reference error "Image of 'undefined'""
describe.skip('hooks/useRemoteImage', () => {
  const LOAD_FAILURE_SRC = 'fail'
  const LOAD_SUCCESS_SRC = 'success'

  beforeAll(() => {
    // Mocking Image.prototype.src to call the onload or onerror
    Object.defineProperty(global.window.Image, 'src', {
      set(src: string) {
        if (src === LOAD_FAILURE_SRC) {
          this.dispatchEvent(new Event('error'))
        } else if (src === LOAD_SUCCESS_SRC) {
          this.dispatchEvent(new Event('load'))
        }
      }
    })
  })

  afterAll(() => {
    delete global.window.Image.prototype.src
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
