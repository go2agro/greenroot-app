"use client"

import Image from 'next/image'
import { ChevronRight } from 'lucide-react'

interface ApplicationCardProps {
  id: string
  title: string
  location: string
  imageUrl: string
  status: string
  onClick?: () => void
}

export default function ApplicationCard({ 
  id, 
  title, 
  location, 
  imageUrl, 
  status,
  onClick 
}: ApplicationCardProps) {
  const getStatusStyle = (status: string) => {
    const styles: Record<string, string> = {
      'draft': 'bg-gray-100 text-gray-700',
      'submitted': 'bg-blue-100 text-blue-700',
      'under_review': 'bg-yellow-100 text-yellow-700',
      'approved': 'bg-green-100 text-green-700',
      'rejected': 'bg-red-100 text-red-700',
      'accepted': 'bg-purple-100 text-purple-700',
      'withdrawn': 'bg-gray-100 text-gray-700',
      'closed': 'bg-gray-100 text-gray-700',
    }
    return styles[status] || 'bg-gray-100 text-gray-700'
  }

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-center gap-4">
        {/* Image */}
        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
          <Image
            src={imageUrl || '/images/placeholder.jpg'}
            alt={title}
            fill
            className="object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = '/images/placeholder.jpg'
            }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900 truncate">
            {title}
          </h3>
          <p className="text-sm text-gray-500 truncate">{location}</p>
          <div className="mt-2">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(status)}`}>
              {formatStatus(status)}
            </span>
          </div>
        </div>

        {/* Arrow */}
        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
      </div>
    </div>
  )
}
