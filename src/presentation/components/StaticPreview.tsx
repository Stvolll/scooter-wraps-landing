import Image from 'next/image'

interface StaticPreviewProps {
  src: string
  alt?: string
}

export function StaticPreview({ src, alt = 'Design preview' }: StaticPreviewProps) {
  return (
    <div className="static-preview">
      <Image src={src} alt={alt} width={800} height={600} />
    </div>
  )
}


