import React from 'react'

import { CheckOutlined } from '@ant-design/icons'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { AssetIcon as BaseAssetIcon } from '../assets/assetIcon'
import { Label } from '../label'

type DragWrapperProps = {
  dragging: boolean
  missed: boolean
  overlap: boolean
  success: boolean
  disabled: boolean
}

const ICON_SIZE = '32px'

export const DragContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 244px;
  height: 40px;
  border: 1px solid ${palette('primary', 0)};
  padding: 0 4px;
  ${(props: DragWrapperProps) => props.success && `border: 1px solid ${palette('success', 0)}`};

  border-radius: 20px;
  ${(props) => props.dragging && 'box-shadow: 0px 0px 4px 1px #50E3C2'};
  ${(props) => props.success && 'box-shadow: 0px 0px 4px 1px #50E3C2'};
  ${(props) => props.disabled && 'opacity: .5'};
  ${(props) => props.disabled && 'cursor: not-allowed'};

  overflow: hidden;

  .coinIcon-wrapper {
    min-width: ${ICON_SIZE};
    max-width: ${ICON_SIZE};
    min-height: ${ICON_SIZE};
    max-height: ${ICON_SIZE};
    border-radius: 50%;
    cursor: pointer;

    img,
    div {
      width: 100%;
      height: 100%;
    }
    div {
      svg {
        font-size: 18px;
      }
    }
  }

  .source-asset {
    position: absolute;
    z-index: 500;
    border-radius: 50%;
    overflow: hidden;
    ${(props) => props.missed && 'transition: all .8s'};

    &:hover {
      box-shadow: '0px 0px 4px 1px #50E3C2';
      ${(props) => props.success && 'box-shadow: 0px 0px 4px 1px #50E3C2'};
    }

    ${(props) => props.success && 'box-shadow: 0px 0px 4px 1px #50E3C2'};
  }

  .target-asset {
    position: absolute;
    right: 4px;
    opacity: ${(props) => (props.overlap || props.success ? '1' : '0.5')};
    border-radius: 50%;
    overflow: hidden;
    z-index: 300;

    ${(props) => props.success && 'box-shadow: 0px 0px 4px 1px #50E3C2'};
  }
`

export const AssetIcon = styled(BaseAssetIcon)`
  cursor: pointer;
`

export const BlueIconPlaceholder = styled('div')`
  cursor: pointer;
  background: ${palette('secondary', 0)};
  width: ${ICON_SIZE};
  height: ${ICON_SIZE};
`

export const ConfirmIconPlaceholder = styled('div').attrs({
  className: 'target-asset',
  children: <CheckOutlined />
})`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${ICON_SIZE};
  height: ${ICON_SIZE};
  background: ${palette('primary', 0)};
  color: ${palette('background', 0)};
`

export const TitleLabel = styled(Label).attrs({
  align: 'center'
})`
  width: 200px;
  font-size: 12px;
  margin: 0 0 0 ${ICON_SIZE}; /* icon size */
  text-transform: uppercase;
  color: ${palette('text', 2)};
`
