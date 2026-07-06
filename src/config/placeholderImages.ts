// TODO: swap these Unsplash placeholders for licensed real artist/campaign
// imagery once available — this file is the single place to update when that
// happens, so no component below should hardcode an image URL directly.

export const PLACEHOLDER_IMAGES = {
  fashion: [
    'https://images.unsplash.com/photo-1523381210434-271e8be1f52b',
    'https://images.unsplash.com/photo-1445205170230-053b83016050',
  ],
  concert: [
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3',
    'https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf',
  ],
  album: [
    'https://images.unsplash.com/photo-1526478806334-5fd488fcaabc',
    'https://images.unsplash.com/photo-1598387993441-a364f854c3e1',
  ],
} as const

export type PlaceholderCategory = keyof typeof PLACEHOLDER_IMAGES

// Appends Unsplash's own resizing query params so each caller gets the crop it needs.
export function getPlaceholderImage(
  category: PlaceholderCategory,
  index: number,
  width: number,
  height: number,
): string {
  const list = PLACEHOLDER_IMAGES[category]
  const base = list[index % list.length]
  return `${base}?w=${width}&h=${height}&fit=crop&q=80`
}
