import React from 'react'
import Nav from './Nav'
import Meta from '../Meta'

const Frame = ({children, title}) => {
  return (
    <main className="min-h-screen bg-gray-200">
      <Meta title={title} />
      <Nav />
      <div className="fixed left-35 top-5 right-5 bottom-5 h-[calc(100vh-2.5rem)] overflow-hidden">
          {children}
      </div>
    </main>
  )
}

export default Frame