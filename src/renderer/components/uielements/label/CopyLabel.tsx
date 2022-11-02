import React from 'react'

import { DocumentDuplicateIcon, CheckIcon } from '@heroicons/react/24/outline'
import * as A from 'antd'
import { TextProps } from 'antd/lib/typography/Text'

type Props = {
  label?: string
  textToCopy: string
  className?: string
  iconClassName?: string
} & TextProps

export const CopyLabel: React.FC<Props> = ({ label, textToCopy, className = '' }): JSX.Element => {
  const Label = () => <span className={`mr-5px font-main uppercase text-inherit ${className}`}>{label}</span>
  return (
    <A.Typography.Text
      className={`flex items-center text-turquoise ${className}`}
      copyable={{
        text: textToCopy,
        icon: [
          <div key={1} className={`group flex items-center ${className}`}>
            {label && <Label />}
            <DocumentDuplicateIcon className={`h-20px w-20px group-hover:text-inherit ${className}`} />
          </div>,
          <div key={2} className={`group flex items-center  ${className}`}>
            {label && <Label />}
            <CheckIcon className={`h-20px w-20px`} />
          </div>
        ]
      }}
    />
  )
}
