import Nav from './Nav'
import Footer from './Footer'

const Default = ({children}) => {
  return (
    <main className="d-flex flex-column min-vh-100">
        <Nav />
        <div className="">
        {children}
        </div>
        <Footer />
    </main>
  )
}

export default Default