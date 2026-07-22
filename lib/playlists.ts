"use server"

import { createClient } from './supabase'
import { toPlainResponse } from '@/lib/utils/serverResponse'

// ─────────────────────────────────────────
// GET ALL PLAYLISTS
// ─────────────────────────────────────────
export async function getAllPlaylists() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('playlists')
    .select(`
      *,
      playlist_videos (*)
    `)
    .order('created_at', { ascending: false })
    .order('order_number', { referencedTable: 'playlist_videos', ascending: true })

  return toPlainResponse(data, error)
}

// ─────────────────────────────────────────
// GET SINGLE PLAYLIST WITH VIDEOS
// ─────────────────────────────────────────
export async function getPlaylistWithVideos(playlistId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('playlists')
    .select(`
      *,
      playlist_videos (*)
    `)
    .eq('id', playlistId)
    .order('order_number', { referencedTable: 'playlist_videos', ascending: true })
    .single()

  return toPlainResponse(data, error)
}

// ─────────────────────────────────────────
// CREATE PLAYLIST (admin only)
// ─────────────────────────────────────────
export async function createPlaylist(name: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('playlists')
    .insert({ name })
    .select()
    .single()

  return toPlainResponse(data, error)
}

// ─────────────────────────────────────────
// UPDATE PLAYLIST NAME (admin only)
// ─────────────────────────────────────────
export async function updatePlaylistName(playlistId: string, name: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('playlists')
    .update({ name })
    .eq('id', playlistId)

  return toPlainResponse(data, error)
}

// ─────────────────────────────────────────
// DELETE PLAYLIST (admin only)
// ─────────────────────────────────────────
export async function deletePlaylist(playlistId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('playlists')
    .delete()
    .eq('id', playlistId)

  return toPlainResponse(data, error)
}

// ─────────────────────────────────────────
// ADD VIDEO TO PLAYLIST (admin only)
// auto marks as latest, removes latest from others
// ─────────────────────────────────────────
export async function addVideoToPlaylist(
  playlistId: string,
  youtubeUrl: string,
  thumbnailUrl: string
) {
  const supabase = await createClient()

  // Remove is_latest from all existing videos in this playlist
  await supabase
    .from('playlist_videos')
    .update({ is_latest: false })
    .eq('playlist_id', playlistId)

  // Get current max order number
  const { data: existing } = await supabase
    .from('playlist_videos')
    .select('order_number')
    .eq('playlist_id', playlistId)
    .order('order_number', { ascending: false })
    .limit(1)

  const nextOrder = existing && existing.length > 0
    ? existing[0].order_number + 1
    : 1

  // Add new video as latest
  const { data, error } = await supabase
    .from('playlist_videos')
    .insert({
      playlist_id: playlistId,
      youtube_url: youtubeUrl,
      thumbnail_url: thumbnailUrl,
      order_number: nextOrder,
      is_latest: true
    })
    .select()
    .single()

  return toPlainResponse(data, error)
}

// ─────────────────────────────────────────
// DELETE VIDEO FROM PLAYLIST (admin only)
// ─────────────────────────────────────────
export async function deleteVideo(videoId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('playlist_videos')
    .delete()
    .eq('id', videoId)

  return toPlainResponse(data, error)
}

// ─────────────────────────────────────────
// REORDER VIDEOS (admin only)
// ─────────────────────────────────────────
export async function reorderVideos(
  videos: { id: string; order_number: number }[]
) {
  const supabase = await createClient()
  const updates = videos.map(video =>
    supabase
      .from('playlist_videos')
      .update({ order_number: video.order_number })
      .eq('id', video.id)
  )

  await Promise.all(updates)
  return toPlainResponse({ success: true }, null)
}