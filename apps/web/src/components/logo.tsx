import { PiggyBank } from 'lucide-react'
import React from 'react'

const Logo = () => {
  return (
    <div className='flex items-center space-x-2'>
      <PiggyBank className="size-8 text-pink-400" />
      <span className="text-2xl font-bold">Coink</span>
    </div>
  )
}

export default Logo