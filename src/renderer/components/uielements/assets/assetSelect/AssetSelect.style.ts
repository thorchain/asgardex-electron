import { CaretDownOutlined } from '@ant-design/icons'
import styled, { css } from 'styled-components'
import { palette } from 'styled-theme'

import { transition } from '../../../../settings/style-util'

export const AssetSelectWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  width: 216px;
  height: 60px;
  border-radius: 2px;
  text-transform: uppercase;
  ${transition()};
`

export const AssetSelectMenuWrapper = styled.div<{ minWidth?: number }>`
  margin-top: 10px;
  min-width: ${({ minWidth }) => minWidth || 216}px;
`

export const DropdownIcon = styled(CaretDownOutlined)`
  cursor: ${({ disabled = false }) => (disabled ? 'not-allowed' : 'pointer')};
  transition: transform 0.2s ease-in-out;
  ${({ open }) => (open ? 'transform: rotate(180deg);' : 'transform: rotate(0);')}
  font-size: 18px;

  svg {
    font-size: 22px;
    color: ${palette('primary', 0)};
    opacity: ${({ disabled = false }) => (disabled ? 0.5 : 1)};
  }
`

export const DropdownIconHolder = styled.div`
  transition: transform 0.2s ease-in-out;
  padding-top: 5px;
`

export const AssetDropdownButton = styled.button`
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  ${({ disabled }) => css`
    display: flex;
    flex-direction: row;
    align-items: center;
    background: transparent;
    border: none;
    padding: 0;
    &:focus {
      outline: none;
    }
    > * {
      margin-right: 10px;

      &:last-child {
        margin: 0;
      }
    }

    ${!disabled
      ? css`
          &:hover {
            ${DropdownIconHolder} {
              transform: translateY(-1px);
            }
          }
        `
      : ''};
  `}
`
