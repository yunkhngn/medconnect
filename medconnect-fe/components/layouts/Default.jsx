import Nav from './Nav'
import Footer from './Footer'

const Default = ({children}) => {
  return (
    <main className="d-flex flex-column min-vh-100">
        <Nav />
        <div className="container mx-auto mb-5 px-5 align-middle">
        {children}
        </div>
        <Footer />
    </main>
  )
}

export default Default