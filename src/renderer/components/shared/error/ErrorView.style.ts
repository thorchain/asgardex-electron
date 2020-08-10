import Title from 'antd/lib/typography/Title'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { media } from '../../../helpers/styleHelper'

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 150px 20px;
  ${media.lg`
    padding: 50px 10px;
  `}
  background-color: ${palette('background', 1)};


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

export const Message = styled(Title).attrs({ level: 4 })`
  color: ${palette('text', 2)};
`

export const ActionButtonWrapper = styled.div`
  margin-top: 10px;
`
