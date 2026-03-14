import { useRef } from 'react'

interface DesignMaterialUploadProps {
  label: string
  accept?: string
  files: File[]
  onFilesChange: (files: File[]) => void
  multiple?: boolean
  required?: boolean
}

export default function DesignMaterialUpload({
  label,
  accept,
  files,
  onFilesChange,
  multiple = false,
  required = false,
}: DesignMaterialUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (selectedFiles) {
      const fileArray = Array.from(selectedFiles)
      if (multiple) {
        onFilesChange([...files, ...fileArray])
      } else {
        onFilesChange(fileArray)
      }
    }
  }

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    onFilesChange(newFiles)
  }

  return (
    <div className="form-group">
      <label>{label}</label>
      <div className="file-upload-multiple">
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          multiple={multiple}
          required={required && files.length === 0}
          className="file-upload-input"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="file-upload-button"
        >
          + Add {multiple ? 'Files' : 'File'}
        </button>
      </div>
      {files.length > 0 && (
        <div className="file-list">
          {files.map((file, index) => (
            <div key={index} className="file-item">
              <span>{file.name}</span>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="file-remove"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

