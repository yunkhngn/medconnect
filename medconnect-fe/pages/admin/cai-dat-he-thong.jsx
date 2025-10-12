import React from 'react'
import {AdminFrame, Grid} from '@/components/layouts/'

const SystemConfig = () => {
  return (
    <AdminFrame title="Cài đặt hệ thống">
      <Grid
              leftChildren={<div>Left Side Content</div>}
              rightChildren={<div>Right Side Content</div>}
            />
    </AdminFrame>
  )
}

export default SystemConfig