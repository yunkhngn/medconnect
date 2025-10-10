import React from 'react'
import {AdminFrame, Grid} from '@/components/layouts/'

const Setting = () => {
  return (
    <AdminFrame title="Admin">
      <Grid
        leftChildren={<div>Left Side Content</div>}
        rightChildren={<div>Right Side Content</div>}
      />
    </AdminFrame>
  )
}

export default Setting