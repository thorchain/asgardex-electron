import styled from 'styled-components'
import { palette } from 'styled-theme'

type TrendWrapperProps = {
  trend: boolean
}

export const TrendWrapper = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${(props: TrendWrapperProps) => (props.trend ? palette('primary', 0) : palette('error', 0))};
  .label-wrapper {
    padding: 0 3px;
    color: ${(props: TrendWrapperProps) => (props.trend ? palette('primary', 0) : palette('error', 0))};
  }
`
