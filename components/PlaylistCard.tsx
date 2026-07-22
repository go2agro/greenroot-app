"use client"

import Image from 'next/image'
import Link from 'next/link'
import { Clock, ListVideo, User } from 'lucide-react'

type PlaylistVideo = {
  id: string
  thumbnail_url?: string
  is_latest?: boolean
}

export type PlaylistCardData = {
  id: string
  name: string
  playlist_videos?: PlaylistVideo[]
}

const LANGUAGE_COUNTRY_CODES: Record<string, string> = {
  dutch: 'nl',
  singlish: 'sg',
  vietnamese: 'vn',
  kiswahili: 'ke',
  swahili: 'ke',
  german: 'de',
  english: 'au',
  french: 'fr',
  spanish: 'es',
  italian: 'it',
  portuguese: 'pt',
  japanese: 'jp',
  chinese: 'cn',
  korean: 'kr',
  hindi: 'in',
  arabic: 'ae',
  thai: 'th',
  indonesian: 'id',
  malay: 'my',
  tagalog: 'ph',
  filipino: 'ph',
}

const LEVELS = ['beginner', 'intermediate', 'advanced'] as const

export function getPlaylistLevel(name: string) {
  const lower = name.toLowerCase()
  const level = LEVELS.find((item) => lower.includes(item))
  if (!level) return 'Beginner'
  return level.charAt(0).toUpperCase() + level.slice(1)
}

export function getPlaylistCountryCode(name: string) {
  const lower = name.toLowerCase()
  const language = Object.keys(LANGUAGE_COUNTRY_CODES).find((item) => lower.includes(item))
  return language ? LANGUAGE_COUNTRY_CODES[language] : 'un'
}

export function getPlaylistThumbnail(videos?: PlaylistVideo[]) {
  if (!videos?.length) return null
  const latest = videos.find((video) => video.is_latest)
  return latest?.thumbnail_url || videos[0]?.thumbnail_url || null
}

export function formatPlaylistDuration(videoCount: number) {
  if (videoCount === 0) return '0m'
  const totalMinutes = videoCount * 15
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours === 0) return `${minutes}m`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}

interface PlaylistCardProps {
  playlist: PlaylistCardData
  index?: number
}

export default function PlaylistCard({ playlist, index = 0 }: PlaylistCardProps) {
  const videoCount = playlist.playlist_videos?.length ?? 0
  const thumbnail =
    getPlaylistThumbnail(playlist.playlist_videos) ||
    `https://picsum.photos/seed/${playlist.id}/640/360`
  const countryCode = getPlaylistCountryCode(playlist.name)
  const level = getPlaylistLevel(playlist.name)
  const duration = formatPlaylistDuration(videoCount)

  return (
    <div className="bg-white rounded-2xl border border-[#EEEEEE] overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <div className="relative h-44 w-full">
        <Image
          src={thumbnail}
          alt={playlist.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={index < 3}
        />

        <div className="absolute top-3 left-3 w-8 h-5 rounded-sm overflow-hidden border border-white/80 shadow-sm">
          <Image
            src={`https://flagcdn.com/w40/${countryCode}.png`}
            alt=""
            width={32}
            height={20}
            className="object-cover w-full h-full"
          />
        </div>

        <div className="absolute bottom-3 right-3 bg-black/50 rounded-lg p-1.5">
          <ListVideo className="w-4 h-4 text-white" />
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-base mb-3 line-clamp-2">{playlist.name}</h3>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <ListVideo className="w-4 h-4 text-[#3B82F6] flex-shrink-0" />
            <span>{videoCount} {videoCount === 1 ? 'Video' : 'Videos'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="w-4 h-4 text-[#3B82F6] flex-shrink-0" />
            <span>{level}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4 text-[#3B82F6] flex-shrink-0" />
            <span>{duration}</span>
          </div>
        </div>

        <Link
          href={`/student/library/${playlist.id}`}
          className="block w-full bg-[#8DC63F] text-white rounded-lg py-2.5 font-semibold text-sm text-center hover:bg-[#7DB62F] transition-colors"
        >
          Start Learning
        </Link>
      </div>
    </div>
  )
}
