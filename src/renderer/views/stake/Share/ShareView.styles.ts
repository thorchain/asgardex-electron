import * as A from 'antd'
import styled from 'styled-components'

export const EmptyData = styled(A.Empty).attrs({
  image: A.Empty.PRESENTED_IMAGE_SIMPLE
})`
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  text-transform: uppercase;
`
