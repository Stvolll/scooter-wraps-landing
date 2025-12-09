export default function StructuredData() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://txd.bike'

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: 'TXD — Premium Vinyl Wraps for Scooters',
    description: 'Premium vinyl wrap cover-sets for multiple scooter models',
    url: baseUrl,
    telephone: '+84123456789',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '123 Đường Trần Phú',
      addressLocality: 'Nha Trang',
      addressRegion: 'Khánh Hòa',
      addressCountry: 'VN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '12.2388',
      longitude: '109.1967',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '08:00',
        closes: '20:00',
      },
    ],
    priceRange: '$$',
    image: `${baseUrl}/og-image.jpg`,
    sameAs: ['https://facebook.com/txdbike', 'https://instagram.com/txdbike'],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '1000',
    },
  }

  const productStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Vinyl Wrap Decal for Scooters',
    description: 'Premium vinyl wraps and decals for scooters',
    brand: {
      '@type': 'Brand',
      name: 'TXD',
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'VND',
      lowPrice: '500000',
      highPrice: '800000',
      availability: 'https://schema.org/InStock',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productStructuredData) }}
      />
    </>
  )
}
