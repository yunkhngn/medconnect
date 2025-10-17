import React from 'react'
import Nav from './Nav'
import Meta from '../Meta'

const Frame = ({children, title}) => {
  return (
    <main className="min-h-screen bg-gray-50">
      <Meta title={title} />
      <Nav />
      <div className="relative px-5 pt-5 pb-10 overflow-y-auto max-h-[calc(100vh-80px)]">
        {children}
      </div>
    </main>
  )
}

export default Frame