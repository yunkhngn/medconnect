import Nav from './Nav'
import Footer from './Footer'
import ScrollUp from "@/components/ui/ScrollUp";

const Default = ({children}) => {
  return (
    <main className="d-flex flex-column min-vh-100">
        <Nav />
        <div className="">
        {children}
        </div>
        <Footer />
        <ScrollUp />
    </main> 
  )
}

export default Default