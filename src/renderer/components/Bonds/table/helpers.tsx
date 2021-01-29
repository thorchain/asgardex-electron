import React from 'react'

import { StopOutlined } from '@ant-design/icons'
import * as RD from '@devexperts/remote-data-ts'
import { Address } from '@xchainjs/xchain-client'
import { AssetRuneNative, baseToAsset, formatAssetAmountCurrency, THORChain } from '@xchainjs/xchain-util'
import { Col } from 'antd'
import * as FP from 'fp-ts/function'

import { Network } from '../../../../shared/api/types'
import { NodeDataRD } from '../types'
import * as Styled from './BondsTable.styles'

export const NodeAddress: React.FC<{ address: Address; network: Network }> = ({ address, network }) => (
  <Col xs={18} lg={20} xl={24}>
    <Styled.AddressEllipsis address={address} chain={THORChain} network={network} />
  </Col>
)

export const BondValue: React.FC<{ data: NodeDataRD }> = ({ data }) => (
  <Styled.BondCol>
    {FP.pipe(
      data,
      RD.map(({ bond }) =>
        formatAssetAmountCurrency({ asset: AssetRuneNative, amount: baseToAsset(bond), trimZeros: true })
      ),
      RD.fold(
        () => <Styled.TextLabel>-</Styled.TextLabel>,
        () => <Styled.TextLabel loading={true} />,
        () => <Styled.TextLabel>-</Styled.TextLabel>,
        (value) => <Styled.TextLabel>{value}</Styled.TextLabel>
      )
    )}
  </Styled.BondCol>
)

export const AwardValue: React.FC<{ data: NodeDataRD }> = ({ data }) => (
  <Styled.AwardCol>
    {FP.pipe(
      data,
      RD.map(({ award }) =>
        formatAssetAmountCurrency({ asset: AssetRuneNative, amount: baseToAsset(award), trimZeros: true })
      ),
      RD.fold(
        () => <Styled.TextLabel>-</Styled.TextLabel>,
        () => <Styled.TextLabel loading={true} />,
        () => <Styled.TextLabel>-</Styled.TextLabel>,
        (value) => <Styled.TextLabel>{value}</Styled.TextLabel>
      )
    )}
  </Styled.AwardCol>
)

export const Status: React.FC<{ data: NodeDataRD }> = ({ data }) =>
  FP.pipe(
    data,
    RD.map(({ status }) => status),
    RD.fold(
      () => <Styled.TextLabel>-</Styled.TextLabel>,
      () => <Styled.TextLabel loading={true} />,
      () => <Styled.TextLabel>-</Styled.TextLabel>,
      (value) => <Styled.TextLabel>{value}</Styled.TextLabel>
    )
  )

export const Info: React.FC<{ goToNode: () => void }> = ({ goToNode }) => (
  <Styled.InfoButton onClick={goToNode}>
    <Styled.TextLabel>info</Styled.TextLabel> <Styled.InfoArrow />
  </Styled.InfoButton>
)

export const Delete: React.FC<{ deleteNode: () => void }> = ({ deleteNode }) => (
  <Styled.DeleteButton onClick={deleteNode}>
    <StopOutlined />
  </Styled.DeleteButton>
)
