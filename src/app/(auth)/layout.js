import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

export default function AuthLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  )
}