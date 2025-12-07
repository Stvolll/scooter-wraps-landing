'use client'

import { SKU } from '@/types/sku'

interface SKUPreviewProps {
  sku: SKU
}

export default function SKUPreview({ sku }: SKUPreviewProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">{sku.title}</h1>
            <p className="text-blue-100">
              <code className="text-sm">{sku.code}</code>
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded text-sm font-medium ${
              sku.status === 'active'
                ? 'bg-green-500'
                : sku.status === 'draft'
                ? 'bg-yellow-500'
                : 'bg-gray-500'
            }`}
          >
            {sku.status}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Price */}
        <div className="text-center border-b pb-4">
          <div className="text-4xl font-bold text-gray-900">
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(sku.price)}
          </div>
        </div>

        {/* Thumbnail/Images */}
        {sku.media.thumbnail && (
          <div className="w-full">
            <img
              src={sku.media.thumbnail.url}
              alt={sku.title}
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
        )}

        {sku.media.images.length > 0 && !sku.media.thumbnail && (
          <div className="w-full">
            <img
              src={sku.media.images[0].url}
              alt={sku.title}
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Description */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Description</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{sku.description}</p>
        </div>

        {/* Images Gallery */}
        {sku.media.images.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Images</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {sku.media.images.map((img, idx) => (
                <div key={idx} className="relative aspect-square">
                  <img
                    src={img.url}
                    alt={`${sku.title} - Image ${idx + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Videos */}
        {sku.media.videos.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Videos</h2>
            <div className="space-y-4">
              {sku.media.videos.map((vid, idx) => (
                <div key={idx} className="w-full">
                  <video
                    src={vid.url}
                    controls
                    className="w-full rounded-lg"
                  >
                    Your browser does not support the video tag.
                  </video>
                  <p className="text-sm text-gray-500 mt-2">{vid.filename}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description File */}
        {sku.media.description_file && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Description File</h2>
            <a
              href={sku.media.description_file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Download {sku.media.description_file.filename}
            </a>
          </div>
        )}

        {/* Metadata */}
        {Object.keys(sku.metadata).length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Metadata</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="text-sm text-gray-700 overflow-x-auto">
                {JSON.stringify(sku.metadata, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <p className="text-sm text-gray-500">Created</p>
            <p className="text-gray-900">
              {new Date(sku.created_at).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Last Updated</p>
            <p className="text-gray-900">
              {new Date(sku.updated_at).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}


