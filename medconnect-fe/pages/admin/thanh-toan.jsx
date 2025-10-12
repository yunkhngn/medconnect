import React from 'react'
import {AdminFrame, Grid} from '@/components/layouts/'

const Payment = () => {
  return (
    <AdminFrame title="Thanh toán">
      <Grid
              leftChildren={<div>Left Side Content</div>}
              rightChildren={<div>Right Side Content</div>}
            />
    </AdminFrame>
  )
}

export default Payment