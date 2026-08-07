import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F9F9F9] flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <Link
            href="/"
            className="text-sm text-[#8DC63F] hover:underline mb-6 inline-block"
          >
            ← Back to Home
          </Link>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Terms & Conditions
          </h1>
          <p className="text-sm text-gray-500 mb-10">GreenRoot Student Internship Portal</p>

          <div className="bg-white border border-[#EEEEEE] rounded-2xl p-8 sm:p-10">
            <p className="text-gray-500 text-sm leading-relaxed">
              Content coming soon.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
