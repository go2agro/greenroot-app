"use client"

import Image from 'next/image'
import Link from 'next/link'

interface InternshipCardProps {
  id: string
  title: string
  location: string
  imageUrl: string
  badge?: string
}

export default function InternshipCard({ 
  id, 
  title, 
  location, 
  imageUrl,
  badge 
}: InternshipCardProps) {
  return (
    <Link 
      href={`/student/internships/${id}`}
      className="block relative w-64 h-48 rounded-lg overflow-hidden flex-shrink-0 group"
    >
      {/* Image */}
      <Image
        src={imageUrl || '/images/placeholder.jpg'}
        alt={title}
        fill
        className="object-cover group-hover:scale-105 transition-transform duration-300"
        onError={(e) => {
          const target = e.target as HTMLImageElement
          target.src = '/images/placeholder.jpg'
        }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      
      {/* Badge */}
      {badge && (
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
          <span className="text-xs font-semibold text-gray-900">{badge}</span>
        </div>
      )}

      {/* Content */}
      <div className="absolute bottom-3 left-3 right-3">
        <h3 className="text-white font-bold text-base mb-1 line-clamp-1">
          {title}
        </h3>
        <p className="text-white/90 text-sm line-clamp-1">{location}</p>
      </div>
    </Link>
  )
}
