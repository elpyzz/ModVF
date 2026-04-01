export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} Ko`
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} Mo`
  return `${(bytes / 1073741824).toFixed(1)} Go`
}
