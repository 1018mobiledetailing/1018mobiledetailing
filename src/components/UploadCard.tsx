'use client'

import { FileText, Image, Video, File, ExternalLink } from 'lucide-react'
import type { Upload } from '@/types/database'
import { CategoryBadge } from './CategoryBadge'

interface UploadCardProps {
  upload: Upload
  onView: (upload: Upload) => void
}

function FileIcon({ fileType }: { fileType: string | null }) {
  if (!fileType) return <File size={24} className="text-gray-400" />
  if (fileType.startsWith('image/'))
    return <Image size={24} className="text-blue-500" />
  if (fileType.startsWith('video/'))
    return <Video size={24} className="text-purple-500" />
  if (fileType === 'application/pdf')
    return <FileText size={24} className="text-red-500" />
  return <File size={24} className="text-gray-400" />
}

export function UploadCard({ upload, onView }: UploadCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-start gap-3">
      <div className="bg-gray-50 rounded-lg p-2.5 flex-shrink-0">
        <FileIcon fileType={upload.file_type} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900 text-sm truncate">
          {upload.title}
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-1">
          <CategoryBadge category={upload.category} />
          <span className="text-xs text-gray-400">
            {new Date(upload.created_at).toLocaleDateString()}
          </span>
        </div>
        {upload.notes && (
          <p className="text-xs text-gray-400 mt-1 line-clamp-2">
            {upload.notes}
          </p>
        )}
      </div>
      <button
        onClick={() => onView(upload)}
        className="flex-shrink-0 p-2 text-gray-400 hover:text-blue-600"
        aria-label="View file"
      >
        <ExternalLink size={18} />
      </button>
    </div>
  )
}
