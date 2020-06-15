import React from 'react'

import { CaretDownOutlined } from '@ant-design/icons'
import { Divider } from 'antd'
import { DividerProps } from 'antd/lib/divider'
import styled, { css } from 'styled-components'
import { palette } from 'styled-theme'

import Label from '../../label'
import AssetIcon from '../assetIcon'

export const AssetCardWrapper = styled.div`
  .title-label {
    font-style: italic;
  }

  .selection-wrapper {
    width: auto;
    margin-top: 10px;

    .btn-wrapper {
      width: 20%;
    }
  }
`

export const CardBorderWrapper = styled.div`
  display: flex;
  flex-direction: column;

  border: 1px solid ${palette('gray', 0)};
  border-radius: 3px;
  background-color: ${palette('background', 1)};
`

export const CardTopRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  min-width: 250px;
`

export const AssetCardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

export const DropdownIcon = styled(CaretDownOutlined)`
  transition: transform 0.2s ease-in-out;
  ${({ open }) => (open ? 'transform: rotate(180deg);' : 'transform: rotate(0);')}
  font-size: 18px;

  svg {
    font-size: 22px;
    color: ${palette('gray', 1)};
  }
`

export const DropdownIconHolder = styled.div`
  transition: transform 0.2s ease-in-out;
  padding-top: 5px;
`

export const AssetNameLabel = styled(Label).attrs({
  size: 'normal',
  weight: 'bold'
})`
  font-size: 14px;
  letter-spacing: 0.75px;
  transition: transform 0.2s ease-in-out;
  text-transform: uppercase;
  padding: 8px 16px 6px 16px;
`

export const AssetDropdownAsset = styled(AssetIcon)`
  width: 45px;
  height: 45px;
  transition: opacity 0.2s ease-in-out, transform 0.2s ease-in-out;
`

export const AssetDropdownButton = styled.button`
  ${({ disabled }) => css`
    display: flex;
    flex-direction: row;
    align-items: center;
    background: transparent;
    border: none;
    cursor: pointer;
    &:focus {
      outline: none;
    }
    > * {
      margin-right: 10px;
    }

    ${!disabled
      ? css`
          &:hover {
            ${AssetDropdownAsset} {
              opacity: 0.8;
            }
            ${AssetNameLabel} {
              transform: translateY(1px);
            }
            ${DropdownIconHolder} {
              transform: translateY(-1px);
            }
          }
        `
      : ''};
  `}
`

export const AssetDropdownVerticalColumn = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  width: 32px;
`

export const AssetData = styled.div.attrs({ className: 'asset-data' })`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding: 12px 16px;

  .asset-amount-label {
    height: 24px;
  }
`

export const VerticalDivider = styled(Divider).attrs({
  type: 'vertical'
})`
  &.ant-divider {
    margin: 0 10px 0 0;
    height: 20px;
  }
`

type HorizontalDividerProps = {
  color?: string
}

export const HorizontalDivider = styled<React.SFC<DividerProps & HorizontalDividerProps>>(Divider)`
  &.ant-divider {
    margin: ${(props) => (props?.color === 'primary' ? '4px 0' : '2px 0')};

    background: ${(props) => (props?.color === 'primary' ? palette('success', 0) : palette('gray', 0))};
  }
`

export const FooterLabel = styled(Label).attrs({
  size: 'normal',
  color: 'light',
  weight: 'normal'
})`
  letter-spacing: 0.4px;
  padding: 0;
`
