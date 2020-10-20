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

export const DragContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  min-width: 244px;
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
    min-width: 32px;
    max-width: 32px;
    min-height: 32px;
    max-height: 32px;
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
    z-index: 300;

    ${(props) => props.success && 'box-shadow: 0px 0px 4px 1px #50E3C2'};
  }
`

export const AssetIcon = styled(BaseAssetIcon)`
  cursor: pointer;
`

export const TitleLabel = styled(Label)`
  width: 240px;
  text-align: center;
  font-size: 12px;
  text-transform: uppercase;
  color: inherit;
`
