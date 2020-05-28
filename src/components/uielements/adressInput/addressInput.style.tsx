import { Popover } from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { transition } from '../../../settings/style-util'

type AddressInputWrapperProps = {
  status: boolean
}

export const AddressInputWrapper = styled.div`
  display: flex;

  ${transition()}

  .ant-popover-arrow {
    border-top: none;
    border-right: none;
  }

  .addressInput-icon {
    margin-top: 12px;
    min-width: 21px;
    height: 21px;
    border: none;
    border-radius: 50%;
    color: ${palette('text', 3)};
    background: ${({ status }: AddressInputWrapperProps) => (status ? palette('error', 0) : palette('primary', 0))};
    cursor: pointer;

    svg {
      position: relative;
      left: 3px;
      color: ${palette('text', 3)};
      font-size: 15px;
      font-weight: bold;
    }
  }

  .ant-popover-inner-content {
    padding: 6px;
  }

  .address-input {
    margin-top: 8px;
    margin-left: 10px;
    border-color: ${palette('gray', 0)};
    background: ${palette('background', 1)};
    color: ${palette('text', 0)};
  }
`

export const PopoverContent = styled.div`
  font-size: 11px;
  color: ${palette('primary', 0)};
`

export const PopoverContainer = styled(Popover)`
  .ant-popover-arrow,
  .ant-popover-inner {
    background-color: ${palette('background', 4)} !important;
  }
`
