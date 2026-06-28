"use client"

import Image from 'next/image'
import Link from 'next/link'

interface InternshipCardProps {
  id: string
  title: string
  location: string
  imageUrl: string
  badge?: string
  flag?: string
}

export default function InternshipCard({ 
  id, 
  title, 
  location, 
  imageUrl,
  badge,
  flag
}: InternshipCardProps) {
  // Use dummy images as requested
  const displayImage = imageUrl || `https://picsum.photos/seed/${id}/400/300`

  return (
    <Link 
      href={`/student/internships/${id}`}
      className="block relative aspect-[4/3] rounded-xl overflow-hidden group w-full"
    >
      {/* Image */}
      <Image
        src={displayImage}
        alt={title}
        fill
        className="object-cover group-hover:scale-110 transition-transform duration-500"
        onError={(e) => {
          const target = e.target as HTMLImageElement
          target.src = 'https://picsum.photos/400/300?grayscale'
        }}
      />
      
      {/* Overlay - Darker at bottom for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
      
      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-1 group-hover:translate-y-0 transition-transform">
        <h3 className="text-white font-bold text-base sm:text-lg mb-0.5 line-clamp-1">
          {title}
        </h3>
        <p className="text-white/80 text-xs sm:text-sm line-clamp-1 flex items-center gap-1">
          {flag && <span className="mr-1">{flag}</span>}
          {location}
        </p>
      </div>

      {/* Badge - Optional, can be shown if needed */}
      {badge && (
        <div className="absolute top-3 left-3 bg-[#8DC63F] text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
          {badge}
        </div>
      )}
    </Link>
  )
}
