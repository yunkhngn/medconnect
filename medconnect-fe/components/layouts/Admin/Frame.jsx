import React from 'react'
import Nav from './Nav'
import Meta from '../Meta'

const Frame = ({children, title}) => {
  return (
    <main className="min-h-screen bg-gray-50">
      <Meta title={title} />
      <Nav />
      <div className="ml-30 min-h-screen">
        <div className="p-6 md:p-8 lg:p-10">
          {children}
        </div>
      </div>
    </main>
  )
}

export default Frame