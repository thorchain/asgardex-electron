import React, { useCallback } from 'react'

import { storiesOf } from '@storybook/react'
import { bn } from '@thorchain/asgardex-util'
import { Form } from 'antd'
import { Rule } from 'antd/lib/form'
import BigNumber from 'bignumber.js'

import Button from '../../button'
import AssetAmountInput from './AssetAmountInput'

type FormValues = {
  amount: BigNumber
}

storiesOf('Components/Assets/AssetAmountInput', module)
  .add('default', () => {
    const [value, setValue] = React.useState<BigNumber>(bn('1002.34'))

    const handleChange = useCallback((v) => {
      console.log('value ', v.toString())
      setValue(v)
    }, [])

    return (
      <div style={{ padding: '20px' }}>
        <AssetAmountInput value={value} onChange={handleChange} />
      </div>
    )
  })
  .add('no value', () => {
    return (
      <div style={{ padding: '20px' }}>
        <AssetAmountInput
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
          amount: bn('1')
        }}>
        <Form.Item name="amount" label="Amount" rules={[{ validator: checkValue }]}>
          <AssetAmountInput
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
