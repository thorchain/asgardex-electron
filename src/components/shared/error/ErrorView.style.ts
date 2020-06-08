import styled from 'styled-components'
import { palette } from 'styled-theme'

import { media } from '../../../helpers/styleHelper'

export const ErrorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 150px 20px;
  ${media.lg`
    padding: 50px 10px;
  `}
  background-color: ${palette('background', 1)};

  .message {
    color: ${palette('text', 2)};
  }

  .icon {
    display: flex;
    justify-content: center;
    align-items: center;

    width: 100px;
    height: 100px;
    margin-bottom: 20px;
    border-radius: 50%;
    background: ${palette('background', 2)};
    svg {
      width: 60px;
      height: 60px;
      fill: ${palette('error', 0)};
    }
  }
`
