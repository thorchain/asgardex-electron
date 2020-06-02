import { renderHook, act } from '@testing-library/react-hooks'
import { bn } from '@thorchain/asgardex-util'

import { useCoinCardInputBehaviour, isBroadcastable } from './coinInputAdvanced'

// Unit testing is really required to ensure a complex component
// like this actually works as expected.

test('isBroadcastable', () => {
  expect(isBroadcastable('123.45')).toBe(true)
  expect(isBroadcastable('123.')).toBe(false)
  expect(isBroadcastable('123.foo')).toBe(false)
  expect(isBroadcastable('.123')).toBe(true)
  expect(isBroadcastable('123.123.123')).toBe(false)
  expect(isBroadcastable('123,123.123')).toBe(true)
  expect(isBroadcastable('.1')).toBeTruthy()
})

function getLastCallValue(mockFn) {
  const lastCall = mockFn.mock.calls.slice(-1)[0]
  return lastCall && lastCall[0]
}

const simulateControlledBlur = ({ hook, mockEvent, onChangeValue }) => () => {
  const value = hook.result.current.value
  act(() => {
    hook.result.current.onBlur({
      ...mockEvent,
      target: {
        ...mockEvent.target,
        value
      }
    })
    // need to rerender so blur useEffects get broadcast
  })
  hook.rerender({ value, onChangeValue })
}

const simulateControlledFocus = ({ hook, mockEvent }) => () => {
  const value = hook.result.current.value
  act(() => {
    hook.result.current.onFocus({
      ...mockEvent,
      target: {
        ...mockEvent.target,
        value
      }
    })
  })
}

// This function simulates a controlled component.
const simulateControlledChange = ({ onChangeValue, hook }) => (value) => {
  const oldCallCount = onChangeValue.mock.calls.length

  // hook.onChange is sent to the raw input so calling it like
  // this is similar to typing in the input
  act(() => {
    hook.result.current.onChange({ target: { value } })
  })

  const newCallCount = onChangeValue.mock.calls.length

  const handlerHasBeenCalled = newCallCount === oldCallCount + 1

  if (handlerHasBeenCalled && getLastCallValue(onChangeValue) === bn(value)) {
    // pass in a new value from outslide the component
    // as if the component was a controlled one
    hook.rerender({ value, onChangeValue })
  }
}

function setup(initValue) {
  const onChangeValue = jest.fn()
  const eventSelect = jest.fn()
  const eventBlur = jest.fn()
  const mockEvent = {
    target: {
      select: eventSelect,
      blur: eventBlur
    }
  }

  const hook = renderHook(
    ({ value, onChangeValue }) => {
      return useCoinCardInputBehaviour({
        amount: bn(value),
        onChangeValue
      })
    },
    {
      initialProps: { value: bn(initValue), onChangeValue }
    }
  )

  const simulateTypingInInput = simulateControlledChange({
    hook,
    onChangeValue
  })
  const simulateBlur = simulateControlledBlur({
    hook,
    mockEvent,
    onChangeValue
  })
  const simulateFocus = simulateControlledFocus({ hook, mockEvent })
  return {
    hook,
    onChangeValue,
    mockEvent,
    simulateBlur,
    simulateFocus,
    simulateTypingInInput
  }
}

describe('useCoinCardInputBehaviour', () => {
  it('should render values passed in with formatting', () => {
    const { hook, onChangeValue } = setup(0)
    expect(hook.result.current.value).toBe('0.00')
    hook.rerender({ value: bn('1234.56'), onChangeValue })
    expect(hook.result.current.value).toBe('1,234.56')
    hook.rerender({ value: bn('12345678'), onChangeValue })
    expect(hook.result.current.value).toBe('12,345,678.00')
  })

  it('should display legal trailing periods', () => {
    const { hook, simulateFocus, simulateTypingInInput } = setup(0)
    simulateFocus()
    simulateTypingInInput('0.')
    expect(hook.result.current.value).toBe('0.')
  })

  it('should format external input after blur', () => {
    const { hook, simulateFocus, simulateTypingInInput, simulateBlur } = setup(0)
    simulateFocus()
    simulateTypingInInput('1234.56')
    expect(hook.result.current.value).toBe('1234.56')
    simulateBlur()
    expect(hook.result.current.value).toBe('1,234.56')
  })

  it('should not while editing display non numeric content', () => {
    const {
      hook: { result },
      simulateFocus,
      simulateTypingInInput
    } = setup(0)
    simulateFocus()
    simulateTypingInInput('1')
    expect(result.current.value).toBe('1')
    simulateTypingInInput('12')
    expect(result.current.value).toBe('12')
    simulateTypingInInput('123')
    expect(result.current.value).toBe('123')
    simulateTypingInInput('123.')
    expect(result.current.value).toBe('123.')
    simulateTypingInInput('123.1')
    expect(result.current.value).toBe('123.1')
    simulateTypingInInput('123.1.')
    expect(result.current.value).toBe('123.1')
    simulateTypingInInput('123.12')
    expect(result.current.value).toBe('123.12')
    simulateTypingInInput('123.12$')
    expect(result.current.value).toBe('123.12')
  })

  it('should default to 0', () => {
    expect(setup(undefined).hook.result.current.value).toBe('0.00')
    expect(setup(false).hook.result.current.value).toBe('0.00')
    expect(setup(null).hook.result.current.value).toBe('0.00')
    expect(setup(NaN).hook.result.current.value).toBe('0.00')
  })

  it('should broadcast numeric values only', () => {
    const {
      hook: { result },
      onChangeValue,
      simulateFocus,
      simulateBlur,
      simulateTypingInInput
    } = setup(1234.56)

    expect(result.current.value).toBe('1,234.56')
    simulateFocus()
    simulateTypingInInput('12345678.90')
    expect(onChangeValue).toHaveBeenCalledTimes(2)
    expect(result.current.value).toBe('12345678.90')
    simulateBlur()
    /* simulateBlur seems to broadcast twice */
    expect(onChangeValue).toHaveBeenCalledTimes(4)
    expect(result.current.value).toBe('12,345,678.90')
  })

  it('should broadcast when its internal representation is broadcastable', () => {
    const { hook, onChangeValue, simulateBlur, simulateFocus, simulateTypingInInput } = setup(0)
    expect(hook.result.current.value).toBe('0.00')

    simulateFocus()
    // just focus, no broadcast
    expect(onChangeValue.mock.calls.length).toBe(0)
    simulateTypingInInput('.')
    expect(hook.result.current.value).toBe('0.')
    // ignore any typing of '.', no broadcast
    expect(onChangeValue.mock.calls.length).toBe(0)
    simulateTypingInInput('1.0')
    expect(hook.result.current.value).toBe('1.0')
    expect(onChangeValue.mock.calls.length).toBe(1)

    simulateBlur()
    // simulateBlur seems to call `onChangeValue` twice
    expect(onChangeValue.mock.calls.length).toBe(3)
    expect(hook.result.current.value).toBe('1.00')
    hook.rerender({ value: bn(123), onChangeValue })
    expect(hook.result.current.value).toBe('123.00')
    expect(onChangeValue.mock.calls.length).toBe(4)
  })

  it('should be able to send an empty string', () => {
    const { simulateFocus, hook, simulateBlur, simulateTypingInInput } = setup(0)
    simulateFocus()
    simulateTypingInInput('1.00')
    simulateBlur()
    simulateFocus()
    simulateTypingInInput('')
    expect(hook.result.current.value).toBe('')
  })

  it('should be able to broadcast very large numbers', () => {
    const { simulateFocus, hook, onChangeValue, simulateBlur, simulateTypingInInput } = setup(1000)
    simulateFocus()
    simulateTypingInInput('12345678912345678')
    simulateBlur()
    expect(hook.result.current.value).toBe('12,345,678,912,345,678.00')
    hook.rerender({ value: bn(40000), onChangeValue })
    expect(hook.result.current.value).toBe('40,000.00')
  })
})
