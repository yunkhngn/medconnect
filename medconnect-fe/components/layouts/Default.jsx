import Meta from './Meta'
import Nav from './Nav'
import Footer from './Footer'

const Default = ({children}) => {
  return (
    <main>
        <Meta />
        <Nav />
        {children}
        <Footer />
    </main>
  )
}

export default Default