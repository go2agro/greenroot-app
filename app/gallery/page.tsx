import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import GalleryExperience from '@/components/GalleryExperience'
import { getGalleryContent } from '@/lib/gallery'

export default async function GalleryPage() {
  const content = await getGalleryContent()

  return (
    <div className="min-h-screen bg-[#F7FAF2]">
      <Navbar activeLink="gallery" />
      <main>
        <GalleryExperience content={content} />
      </main>
      <Footer />
    </div>
  )
}
