import { Row, Col } from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

type PoolShareAccent = 'primary' | 'secondary'
type DetailsWrapperProps = { accent: PoolShareAccent }
type BorderWrapperProps = { showTopBorder?: boolean }

export const PoolShareWrapper = styled.div`
  padding: 0px 12px 12px 16px;
  background: ${palette('background', 1)};
`

export const DetailsWrapper = styled(Row)<DetailsWrapperProps>`
  border-bottom: 3px solid ${(props) => palette(props.accent, 0)};
  justify-content: space-around;
`

export const BorderWrapper = styled.div`
  border: 1px solid ${palette('background', 2)};
  border-top: '1px solid ' + ${palette('background', 2)};
`

export const BorderShareWrapper = styled.div`
  border: 1px solid ${palette('background', 2)};
  border-top: 'none';
  padding-top: 15px;
  padding-bottom: 15px;
  .label-wrapper {
    padding-top: 2px;
    padding-bottom: 2px;
  }
`

export const ValuesWrapper = styled(Col)`
  padding-top: 20px;
  padding-bottom: 20px;
  .label-wrapper {
    padding-top: 2px;
    padding-bottom: 2px;
  }
`
