import { useRouter } from 'next/router'
import { DesignQueryService } from '@/application/services/DesignQueryService'
import type { Design } from '@/domain'
import { Viewer3D } from '@/presentation/components/Viewer3D'
import dynamic from 'next/dynamic'

// Lazy load 3D viewer (no SSR)
const Viewer3DDynamic = dynamic(
  () => import('@/presentation/components/Viewer3D').then((mod) => mod.Viewer3D),
  {
    ssr: false,
    loading: () => (
      <div className="viewer-loading">
        <img src="/images/loading.gif" alt="Loading..." />
      </div>
    ),
  }
)

interface DesignPageProps {
  design: Design
  previewUrl: string
}

export default function DesignPage({ design, previewUrl }: DesignPageProps) {
  const router = useRouter()

  if (router.isFallback) {
    return <div>Loading...</div>
  }

  return (
    <div className="design-page">
      <h1>{design.name}</h1>
      <div className="design-content">
        <div className="viewer-container">
          <Viewer3DDynamic designId={design.id} />
        </div>
        <div className="design-info">
          <p>Model ID: {design.modelId}</p>
          <p>Version: {design.version.toString()}</p>
          <p>Status: {design.status}</p>
          {design.supportMaterials.photos.length > 0 && (
            <div className="photos-gallery">
              <h2>Photos</h2>
              {design.supportMaterials.photos.map((photo) => (
                <img
                  key={photo.id}
                  src={photo.payload.thumbnailUrl}
                  alt={photo.payload.caption || 'Photo'}
                />
              ))}
            </div>
          )}
          {design.supportMaterials.videos.length > 0 && (
            <div className="videos-gallery">
              <h2>Videos</h2>
              {design.supportMaterials.videos.map((video) => (
                <video key={video.id} controls>
                  <source src={video.payload.url} type={`video/${video.payload.format}`} />
                </video>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export async function getStaticPaths() {
  const designQueryService = new DesignQueryService()
  const designs = await designQueryService.getPublished()

  return {
    paths: designs.map((design) => ({
      params: { id: design.id },
    })),
    fallback: true,
  }
}

export async function getStaticProps({ params }: { params: { id: string } }) {
  const designQueryService = new DesignQueryService()
  const design = await designQueryService.getById(params.id)

  if (!design) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      design,
      previewUrl: design.previewImageUrl,
    },
    revalidate: 60,
  }
}

