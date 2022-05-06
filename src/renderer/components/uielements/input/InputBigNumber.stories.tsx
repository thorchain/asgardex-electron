import React, { useCallback } from 'react'

import { storiesOf } from '@storybook/react'
import { bn } from '@xchainjs/xchain-util'
import { Form, Row } from 'antd'
import { Rule } from 'antd/lib/form'
import BigNumber from 'bignumber.js'

import { Button } from '../button'
import { InputBigNumber } from './InputBigNumber'

type FormValues = {
  amount: BigNumber
}

storiesOf('Components/input/InputBigNumber', module)
  .add('default', () => {
    const [value, setValue] = React.useState<BigNumber>(bn('0.000001'))
    const handleChange = useCallback((v: BigNumber) => {
      console.log('onChange:', v.toString())
      setValue(v)
    }, [])
    return (
      <div style={{ padding: '20px' }}>
        <InputBigNumber value={value} onChange={handleChange} />
        <Row>
          <Button onClick={() => setValue(bn(40000))}>Set 40k</Button>
          <Button onClick={() => setValue(bn(2000))}>Set 2k</Button>
        </Row>
      </div>
    )
  })
  .add('1e8', () => {
    const [value, setValue] = React.useState<BigNumber>(bn('0.00000001'))
    const handleChange = useCallback((v: BigNumber) => {
      setValue(v)
    }, [])
    return (
      <div style={{ padding: '20px' }}>
        <InputBigNumber value={value} onChange={handleChange} decimal={8} />
      </div>
    )
  })
  .add('1e18', () => {
    const [value, setValue] = React.useState<BigNumber>(bn('0.000000000000000001'))
    const handleChange = useCallback((v: BigNumber) => {
      setValue(v)
    }, [])
    return (
      <div style={{ padding: '20px' }}>
        <InputBigNumber value={value} onChange={handleChange} decimal={18} />
      </div>
    )
  })
  .add('no default value', () => {
    return (
      <div style={{ padding: '20px' }}>
        <InputBigNumber
          onChange={(value) => {
            console.log('value ', value.toString())
          }}
        />
      </div>
    )
  })
  .add('form validation', () => {
    const [form] = Form.useForm<FormValues>()
    const checkValue = (_: Rule, value?: BigNumber) => {
      console.log('checkValue ', value?.toString() ?? 'undefined value')
      if (value && value.isGreaterThan(bn(10))) {
        return Promise.resolve()
      }
      return Promise.reject('Value must be greater than 10!')
    }
    const onFinish = (values: {}) => {
      console.log('onFinish: ', values)
    }

    return (
      <Form
        form={form}
        onFinish={onFinish}
        initialValues={{
          // initial value for amount
          amount: bn('1')
        }}>
        <Form.Item name="amount" label="Amount" rules={[{ validator: checkValue }]}>
          <InputBigNumber
            onChange={(value) => {
              console.log('onChange ', value?.toString() ?? 'undefined value')
            }}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    )
  })
