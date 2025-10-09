import React from 'react'
import {PatientFrame, Grid} from '@/components/layouts/'

const Setting = () => {
  return (
    <PatientFrame title="Cài đặt">
      <Grid
        leftChildren={<div>Left Side Content</div>}
        rightChildren={<div>Right Side Content</div>}
      />
    </PatientFrame>
  )
}

export default Setting