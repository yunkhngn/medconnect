import React from 'react'
import {AdminFrame, Grid} from '@/components/layouts/'

const Appointment = () => {
  return (
    <AdminFrame title="Lịch hẹn">
      <Grid
              leftChildren={<div>Left Side Content</div>}
              rightChildren={<div>Right Side Content</div>}
            />
    </AdminFrame>
  )
}

export default Appointment