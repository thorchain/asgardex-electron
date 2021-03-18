import styled from 'styled-components'
import { palette } from 'styled-theme'

const SIDE_MARGIN = 10

export const ContainerWithDelimeter = styled.div`
  display: inline-block;
  position: relative;
  margin: 0 ${SIDE_MARGIN * 2}px 0 0;

  &:after {
    content: ' ';
    height: 100%;
    border-right: ${palette('gray', 2)} 1px solid;
    position: absolute;
    top: 0;
    right: -${SIDE_MARGIN}px;
  }

  &:first-child {
    margin-left: 0;
  }

  &:last-of-type {
    margin-right: 0;
    &:after {
      content: none;
      display: none;
    }
  }
`
