import React from 'react'

import { InboxIcon } from '@heroicons/react/24/outline'

type Props = {
  title?: string
  className?: string
}

export const EmptyResult: React.FC<Props> = ({ title = '', className = '' }): JSX.Element => {
  return (
    <div className={`flex flex-col items-center justify-center p-20px ${className}`}>
      <InboxIcon className="h-[40px] w-[40px] text-gray1 dark:text-gray1d lg:h-[60px] lg:w-[60px]" />
      {!!title && (
        <h3 className="font-mainFont pt-10px text-center text-14 uppercase text-gray2 dark:text-gray2d lg:text-16 ">
          {title}
        </h3>
      )}
    </div>
  )
}
