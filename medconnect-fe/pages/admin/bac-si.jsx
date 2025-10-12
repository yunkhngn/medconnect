import React from 'react'
import {AdminFrame, Grid} from '@/components/layouts/'

const Doctor = () => {
  return (
    <AdminFrame title="Bác sĩ">
      <Grid
              leftChildren={<div>Left Side Content</div>}
              rightChildren={<div>Right Side Content</div>}
            />
    </AdminFrame>
  )
}

export default Doctor