import { useCallback } from 'react'

import { Chain } from '@xchainjs/xchain-util'

import { truncateAddress } from '../../../helpers/addressHelper'

type Props = {
  chain: string
  network: string
}

export const AddressEllipsis: React.FC<Props> = (props): JSX.Element => {
  const { chain, network } = props
  const prepEllipse = useCallback(
    (node: HTMLElement) => {
      const parent = node.parentElement
      if (parent) {
        const txtToEllipse: HTMLElement | null = node.childNodes[0] as HTMLElement
        const copyIcon: HTMLElement | null = node.childNodes[1] as HTMLElement

        if (txtToEllipse !== null) {
          if (txtToEllipse.hasAttribute('data-original')) {
            txtToEllipse.textContent = txtToEllipse.getAttribute('data-original')
          }

          if (
            !isEllipse(node.offsetWidth > parent.offsetWidth ? parent : node, txtToEllipse, chain, network) &&
            copyIcon
          ) {
            copyIcon.hidden = true
          } else {
            copyIcon.hidden = false
          }
        }
      }
    },
    [chain, network]
  )

  const measuredParent = useCallback(
    (node) => {
      if (node !== null) {
        window.addEventListener('resize', () => {
          prepEllipse(node)
        })
        prepEllipse(node)
      }
    },
    [prepEllipse]
  )

  return (
    <div
      ref={measuredParent}
      style={{
        wordBreak: 'keep-all',
        overflowWrap: 'normal'
      }}>
      {props.children}
    </div>
  )
}

const isEllipse = (parentNode: HTMLElement, txtNode: HTMLElement, chain: string, network: string): boolean => {
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
        txtNode.textContent = truncateAddress(str, chain as Chain, network)
        return true
      }
    }
  }

  return false
}
