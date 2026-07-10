"use client"

import Image from 'next/image'

interface UserAvatarProps {
  imageUrl?: string | null
  firstName?: string | null
  lastName?: string | null
  fallbackLetter?: string
  size?: number
  className?: string
}

export default function UserAvatar({ 
  imageUrl, 
  firstName, 
  lastName, 
  fallbackLetter = 'S',
  size = 40,
  className = ''
}: UserAvatarProps) {
  const getInitials = () => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
    }
    if (firstName) {
      return firstName.charAt(0).toUpperCase()
    }
    if (lastName) {
      return lastName.charAt(0).toUpperCase()
    }
    return fallbackLetter.toUpperCase()
  }

  if (imageUrl) {
    return (
      <div className={`relative rounded-full overflow-hidden ${className}`} style={{ width: size, height: size }}>
        <Image
          src={imageUrl}
          alt="Profile"
          fill
          className="object-cover"
        />
      </div>
    )
  }

  return (
    <div 
      className={`rounded-full bg-[#8DC63F] text-white font-bold flex items-center justify-center ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {getInitials()}
    </div>
  )
}
