import styled from 'styled-components'
import { palette } from 'styled-theme'

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 9px;
`

export const Dot = styled.div`
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: ${palette('gray', 1)};
`

export const Line = styled.div<{ size: Number }>`
  width: 5px;
  ${({ size }) => `height: ${size}px;`};
  border-right: 1px solid ${palette('gray', 1)};
`
