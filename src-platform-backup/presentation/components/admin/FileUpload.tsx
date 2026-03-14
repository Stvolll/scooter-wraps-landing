import { useRef } from 'react'

interface FileUploadProps {
  id: string
  accept?: string
  onFileSelect: (file: File) => void
  required?: boolean
  multiple?: boolean
}

export default function FileUpload({
  id,
  accept,
  onFileSelect,
  required = false,
  multiple = false,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      onFileSelect(files[0])
    }
  }

  return (
    <div className="file-upload">
      <input
        ref={fileInputRef}
        id={id}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        required={required}
        multiple={multiple}
        className="file-upload-input"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="file-upload-button"
      >
        Choose File
      </button>
    </div>
  )
}

