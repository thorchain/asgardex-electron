import styled from 'styled-components'
import { palette } from 'styled-theme'

export const InfoLabel = styled.div`
  width: 18px;
  height: 18px;
  margin: 3px;
  border-radius: 9px;
  font-size: 11px;
  text-transform: lowercase;
  border: 1.5px solid ${palette('text', 0)};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${palette('text', 0)};
`
