import styled from 'styled-components'

type QRWrapperProps = {
  smallView: boolean
}

export const QRWrapper = styled.div<QRWrapperProps>`
  height: ${({ smallView }) => (smallView ? '280px' : '320px')};
  display: flex;
  justify-content: center;
  align-items: center;
`
