import React, { useCallback } from 'react'

import { storiesOf } from '@storybook/react'
import { assetAmount, AssetAmount, bn } from '@thorchain/asgardex-util'
import { Form } from 'antd'
import { Rule } from 'antd/lib/form'

import Button from '../../button'
import AssetAmountInput from './AssetAmountInput'

type FormValues = {
  amount: AssetAmount
}

storiesOf('Components/Assets/AssetAmountInput', module)
  .add('default', () => {
    const [value, setValue] = React.useState<AssetAmount>(assetAmount('1002.34'))

    const handleChange = useCallback((v) => {
      console.log('value ', v.amount().toString())
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
            console.log('value ', value.amount().toString())
          }}
        />
      </div>
    )
  })
  .add('form validation', () => {
    const [form] = Form.useForm<FormValues>()

    const checkAmount = (_: Rule, value: AssetAmount) => {
      console.log('checkAmount ', value?.amount().toString() ?? 'undefined value')
      if (value && value.amount().isGreaterThan(bn(10))) {
        return Promise.resolve()
      }
      return Promise.reject('Asset amount must be greater than 10!')
    }

    const onFinish = (values: {}) => {
      console.log('onFinish: ', values)
    }

    return (
      <Form
        form={form}
        onFinish={onFinish}
        initialValues={{
          amount: assetAmount('1')
        }}>
        <Form.Item name="amount" label="AssetAmount" rules={[{ validator: checkAmount }]}>
          <AssetAmountInput
            onChange={(value) => {
              console.log('onChange ', value?.amount().toString() ?? 'undefined value')
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
