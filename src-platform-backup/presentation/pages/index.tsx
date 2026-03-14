import { DesignQueryService } from '@/application/services/DesignQueryService'
import type { Design } from '@/domain'
import Link from 'next/link'

interface HomeProps {
  designs: Design[]
}

export default function Home({ designs }: HomeProps) {
  return (
    <div className="container">
      <h1>Scooter Wraps Platform</h1>
      {designs.length === 0 ? (
        <p>No designs available. Run the seed script to import designs.</p>
      ) : (
        <div className="designs-grid">
          {designs.map((design) => (
            <Link key={design.id} href={`/designs/${design.id}`}>
              <div className="design-card">
                <img src={design.previewImageUrl} alt={design.name} />
                <h3>{design.name}</h3>
                <p>Version: {design.version.toString()}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export async function getStaticProps() {
  const designQueryService = new DesignQueryService()
  const designs = await designQueryService.getPublished()

  return {
    props: {
      designs,
    },
    revalidate: 60,
  }
}

