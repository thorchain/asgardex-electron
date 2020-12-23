import { CheckOutlined } from '@ant-design/icons/lib'
import styled from 'styled-components'
import { palette } from 'styled-theme'

export const TxTimerWrapper = styled.div`
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  color: ${palette('gray', 0)};

  .timerchart-circular-progressbar {
    position: absolute;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;

    &.hide {
      visibility: hidden;
    }
  }
`
export const IconWrapper = styled.div`
  position: absolute;
  top: 0px;
  left: 0px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: ${palette('gradient', 0)};

  width: 100%;
  height: 100%;

  .confirm-icon {
    line-height: 1em;
  }

  &:empty {
    display: none;
  }
`

export const SuccessIcon = styled(CheckOutlined)`
  svg {
    width: 35px;
    height: 35px;
  }
`
