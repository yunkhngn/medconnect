import React from 'react'
import {AdminFrame, Grid} from '@/components/layouts/'

const Patient = () => {
  return (
    <AdminFrame title="Người dùng">
      <Grid
              leftChildren={<div>Left Side Content</div>}
              rightChildren={<div>Right Side Content</div>}
            />
    </AdminFrame>
  )
}

export default Patient