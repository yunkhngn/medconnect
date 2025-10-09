import React from 'react'
import Nav from './Nav'
import Meta from '../Meta'

const Frame = ({children, title}) => {
  return (
    <main className="min-h-screen bg-gray-50">
      <Meta title={title} />
      <Nav />
      <div className="fixed left-35 top-5 right-5">
          {children}
      </div>
    </main>
  )
}

export default Frame