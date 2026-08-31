const REPO = 'mostdesign01-sudo/AIGC-'

export function releasePageUrl(tag: string): string {
  return `https://github.com/${REPO}/releases/tag/${tag}`
}

export function releaseAssetUrl(tag: string, filename: string): string {
  return `https://github.com/${REPO}/releases/download/${encodeURIComponent(tag)}/${encodeURIComponent(filename)}`
}

export function gifPairFilenames(slug: string): [string, string] {
  return [`${slug}-a.gif`, `${slug}-b.gif`]
}

export function sourceVideoFilename(slug: string): string {
  return `${slug}-src.mp4`
}
