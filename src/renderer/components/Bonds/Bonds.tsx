import React, { useCallback } from 'react'

import { Address } from '@xchainjs/xchain-client'
import { Form } from 'antd'
import { useIntl } from 'react-intl'

import { Network } from '../../../shared/api/types'
import {} from '../../services/thorchain/types'
import { AddressValidation } from '../../services/clients'
import * as Styled from './Bonds.styles'
import { Node } from './types'

type Props = {
  nodes: Node[]
  removeNode: (node: Address) => void
  goToNode: (node: Address) => void
  network: Network
  addNode: (node: Address, network: Network) => void
  addressValidation: AddressValidation
  className?: string
}

export const Bonds: React.FC<Props> = ({
  addressValidation,
  nodes,
  removeNode,
  goToNode,
  network,
  addNode,
  className
}) => {
  const intl = useIntl()
  const [form] = Form.useForm()
  const addressValidator = useCallback(
    async (_: unknown, value: string) => {
      if (!value) {
        return Promise.reject(intl.formatMessage({ id: 'wallet.errors.address.empty' }))
      }

      const loweredCaseValue = value.toLowerCase()

      if (!addressValidation(loweredCaseValue)) {
        return Promise.reject(intl.formatMessage({ id: 'wallet.errors.address.invalid' }))
      }

      if (nodes.findIndex(({ nodeAddress }) => nodeAddress.toLowerCase() === loweredCaseValue) > -1) {
        return Promise.reject(intl.formatMessage({ id: 'bonds.validations.nodeAlreadyAdded' }))
      }
    },
    [addressValidation, intl, nodes]
  )

  const onSubmit = useCallback(
    ({ address }: { address: string }) => {
      addNode(address, network)
      form.resetFields()
    },
    [addNode, form, network]
  )
  return (
    <Styled.Container className={className}>
      <Styled.BondsTable nodes={nodes} removeNode={removeNode} goToNode={goToNode} network={network} />
      <Styled.Form onFinish={onSubmit} form={form}>
        <Styled.InputContainer>
          <Styled.InputLabel>{intl.formatMessage({ id: 'bonds.node.enterMessage' })}</Styled.InputLabel>
          <Form.Item name={'address'} rules={[{ required: true, validator: addressValidator }]}>
            <Styled.Input type={'text'} />
          </Form.Item>
        </Styled.InputContainer>
        <Styled.SubmitButton htmlType={'submit'}>
          <Styled.AddIcon /> {intl.formatMessage({ id: 'bonds.node.add' })}
        </Styled.SubmitButton>
      </Styled.Form>
    </Styled.Container>
  )
}
