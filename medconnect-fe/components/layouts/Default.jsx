import Meta from './Meta'
import Nav from './Nav'
import Footer from './Footer'

const Default = ({children, title}) => {
  return (
    <main className="flex min-h-screen flex-col justify-between bg-gray-100">
        <Meta title={title} />
        <Nav />
        <div className="container mx-auto mb-5 px-5 align-middle">
        {children}
        </div>
        <Footer />
    </main>
  )
}

export default Default