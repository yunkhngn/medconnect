import React from 'react'
import {AdminFrame, Grid} from '@/components/layouts/'

const Dashboard = () => {
  return (
    <AdminFrame title="Trang chủ">
      <Grid
              leftChildren={<div>Left Side Content</div>}
              rightChildren={<div>Right Side Content</div>}
            />
    </AdminFrame>
  )
}

export default Dashboard