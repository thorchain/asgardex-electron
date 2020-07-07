import { CaretRightOutlined } from '@ant-design/icons'
import styled from 'styled-components'
import { palette } from 'styled-theme'

export const CoinPairWrapper = styled.div`
  display: flex;
  justify-content: center;
`

export const CoinWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-top: 3px;
`

export const PairIcon = styled(CaretRightOutlined)`
  margin: 15px 15px;
  color: ${palette('text', 2)};
`
