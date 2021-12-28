import { useCallback, useEffect } from 'react'

import { Address } from '@xchainjs/xchain-client'
import { Chain } from '@xchainjs/xchain-util'

import { Network } from '../../../../shared/api/types'
import { truncateAddress } from '../../../helpers/addressHelper'
import * as Styled from './AddressEllipsis.styles'

/**
 * Custome address ellipsis component
 * Based on https://github.com/bluepeter/react-middle-ellipsis/
 */

const ellipse = ({
  parentNode,
  txtNode,
  chain,
  network
}: {
  parentNode: HTMLElement
  txtNode: HTMLElement
  chain: Chain
  network: Network
}): boolean => {
  const containerWidth = parentNode.offsetWidth
  const txtWidth = txtNode.offsetWidth

  if (txtWidth > containerWidth) {
    const str = txtNode.textContent
    if (str) {
      const txtChars = str.length
      const avgLetterSize = txtWidth / txtChars
      const canFit = containerWidth / avgLetterSize
      const delEachSide = (txtChars - canFit + 5) / 2

      if (txtNode.textContent) {
        txtNode.setAttribute('data-original', txtNode.textContent)
      }

      if (delEachSide) {
        txtNode.textContent = truncateAddress(str, chain, network)
        return true
      }
    }
  }

  return false
}

export type Props = {
  address: Address
  chain: Chain
  network: Network
  className?: string
  enableCopy?: boolean
  linkIcon?: React.ReactElement
}

export const AddressEllipsis: React.FC<Props> = (props): JSX.Element => {
  const { address, chain, network, className, enableCopy = false, linkIcon } = props
  const prepEllipse = useCallback(
    (node: HTMLElement, txtToEllipse: HTMLElement, copyIcon: HTMLElement) => {
      const parent = node.parentElement
      if (parent) {
        if (txtToEllipse) {
          if (txtToEllipse.hasAttribute('data-original')) {
            txtToEllipse.textContent = txtToEllipse.getAttribute('data-original')
          }

          if (
            !(
              ellipse({
                parentNode: node.offsetWidth > parent.offsetWidth ? parent : node,
                txtNode: txtToEllipse,
                chain,
                network
              }) || enableCopy
            ) &&
            copyIcon
          ) {
            copyIcon.hidden = true
          } else {
            copyIcon.hidden = false
          }
        }
      }
    },
    [chain, network, enableCopy]
  )

  const prepareEllipse = () => {}

  const measuredParent = useCallback(
    (node) => {
      if (node !== null) {
        const prepareEllipse = () => prepEllipse(node, node.childNodes[0], node.childNodes[1])
        window.addEventListener('resize', prepareEllipse)
        prepareEllipse()
      }
    },
    [prepEllipse]
  )

  useEffect(() => {
    return () => window.removeEventListener('resize', prepareEllipse)
  }, [])

  return (
    <Styled.Container className={className}>
      <Styled.AddressContainer ref={measuredParent}>
        <Styled.Address>{address}</Styled.Address>
        {linkIcon}
        <Styled.CopyLabel copyable={{ text: address }} />
      </Styled.AddressContainer>
    </Styled.Container>
  )
}
