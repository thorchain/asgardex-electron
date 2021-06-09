import * as A from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { Label as LabelUI } from '../../uielements/label'

// TODO asgdx-team: Revert changes to use `network: Network` as props when we go live with mainnet
// type LabelProps = { network: Network }
type LabelProps = { network: 'chaosnet' | 'testnet' }

export const NetworkLabel = styled(LabelUI).attrs<LabelProps>(({ network }) => ({
  children: network,
  textTransform: 'uppercase'
}))<LabelProps>`
  padding: 0;
  line-height: 16px;
  // fix width as max of (mainnet | chaosnet | testnet) to avoid changing element's width
  width: 77px;

  color: ${({ network }) => {
    switch (network) {
      case 'chaosnet':
        // TODO @asgdx-team: Change it to (primary, '0') if we go live with mainnet
        return palette('warning', 0)
      case 'testnet':
        return palette('error', 0)
      default:
        return palette('text', 2)
    }
  }};
`

export const Row = styled(A.Row)`
  align-items: center;
  padding: 5px 3px 5px 10px;
  background: ${palette('gray', 0)};
  border-radius: 10px;
`
