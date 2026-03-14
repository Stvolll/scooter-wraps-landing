// app/test-upload/page.tsx
'use client'

import { useState } from 'react'

export default function TestUploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string>('')
  const [endpoint, setEndpoint] = useState<string>('/api/uploads/simple')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setError('')
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      console.log(`📤 Uploading to ${endpoint}...`)
      console.log('File info:', {
        name: file.name,
        size: file.size,
        type: file.type
      })

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      setResult(data)
      console.log('Upload successful:', data)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Upload failed'
      setError(errorMsg)
      console.error('Upload error:', err)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Test Upload</h1>
      
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
          Select Endpoint:
        </label>
        <select 
          value={endpoint} 
          onChange={(e) => setEndpoint(e.target.value)}
          style={{ padding: '0.5rem', width: '100%', marginBottom: '1rem' }}
        >
          <option value="/api/uploads/simple">Simple Upload</option>
          <option value="/api/uploads/local">Local Upload</option>
          <option value="/api/admin/designs/upload">Admin Designs Upload</option>
        </select>
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <input 
          type="file" 
          onChange={handleFileChange}
          style={{ padding: '0.5rem', width: '100%' }}
        />
      </div>
      
      {file && (
        <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f0f0f0', borderRadius: '4px' }}>
          <p><strong>Selected file:</strong> {file.name}</p>
          <p><strong>Size:</strong> {Math.round(file.size / 1024)} KB</p>
          <p><strong>Type:</strong> {file.type || 'unknown'}</p>
          <button 
            onClick={handleUpload} 
            disabled={uploading}
            style={{ 
              padding: '0.5rem 1rem', 
              background: uploading ? '#ccc' : '#0070f3', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: uploading ? 'not-allowed' : 'pointer',
              marginTop: '0.5rem'
            }}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      )}

      {error && (
        <div style={{ color: 'red', marginTop: '1rem', padding: '1rem', background: '#ffe6e6', borderRadius: '4px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: '1rem', padding: '1rem', background: '#e6f7ff', borderRadius: '4px' }}>
          <h3>Result:</h3>
          <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
          {result.file?.url && (
            <div style={{ marginTop: '1rem' }}>
              <p><strong>File URL:</strong> {result.file.url}</p>
              {result.file.url.startsWith('/uploads/') && result.file.type?.startsWith('image/') && (
                <div style={{ marginTop: '1rem' }}>
                  <img 
                    src={result.file.url} 
                    alt="Uploaded" 
                    style={{ maxWidth: '300px', border: '1px solid #ccc', borderRadius: '4px' }}
                    onError={(e) => {
                      console.log('Image failed to load', e)
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>
          )}
          {result.files && Array.isArray(result.files) && result.files.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <p><strong>Uploaded {result.files.length} file(s):</strong></p>
              {result.files.map((f: any, idx: number) => (
                <div key={idx} style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#f5f5f5', borderRadius: '4px' }}>
                  <p><strong>File {idx + 1}:</strong> {f.originalName || f.name}</p>
                  <p><strong>URL:</strong> {f.url}</p>
                  {f.url && f.url.startsWith('/uploads/') && f.type?.startsWith('image/') && (
                    <img 
                      src={f.url} 
                      alt={`Uploaded ${idx + 1}`}
                      style={{ maxWidth: '200px', marginTop: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}




