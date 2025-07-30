// import { WebSite, MedicalOrganization, Service } from 'schema-dts'

interface StructuredDataProps {
  type: 'homepage' | 'service' | 'organization'
  data?: Record<string, unknown>
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  const getStructuredData = () => {
    try {
    const baseUrl = 'https://prismhealthlab.com'
    
    switch (type) {
      case 'homepage':
        const websiteData = {
          '@type': 'WebSite',
          '@id': `${baseUrl}/#website`,
          url: baseUrl,
          name: 'Prism Health Lab',
          description: 'Lab-grade diagnostics simplified. Get actionable health insights faster, easier, and more affordably than ever.',
          publisher: {
            '@type': 'Organization',
            '@id': `${baseUrl}/#organization`,
          },
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${baseUrl}/products?search={search_term_string}`,
            },
          },
        }
        
        const organizationData = {
          '@type': 'MedicalOrganization',
          '@id': `${baseUrl}/#organization`,
          name: 'Prism Health Lab',
          url: baseUrl,
          logo: {
            '@type': 'ImageObject',
            url: `${baseUrl}/logo.png`,
            width: 512,
            height: 512,
          },
          description: 'CLIA-certified diagnostic testing lab providing affordable, accessible health insights.',
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Schaumburg',
            addressRegion: 'IL',
            addressCountry: 'US',
          },
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            areaServed: 'US',
            availableLanguage: 'English',
          },
          sameAs: [
            'https://www.linkedin.com/company/prismhealthlab',
            'https://www.instagram.com/prismhealthlab',
            'https://www.facebook.com/prismhealthlab',
          ],
          medicalSpecialty: [
            'Diagnostic Laboratory',
            'Preventive Medicine',
            'Clinical Laboratory',
          ],
        }
        
        return {
          '@context': 'https://schema.org',
          '@graph': [websiteData, organizationData],
        }
        
      case 'service':
        const serviceData = {
          '@type': 'MedicalTest',
          name: data?.name as string || 'Diagnostic Testing Services',
          description: data?.description as string || 'Comprehensive diagnostic testing services',
          provider: {
            '@type': 'MedicalOrganization',
            name: 'Prism Health Lab',
            url: baseUrl,
          },
          areaServed: {
            '@type': 'Country',
            name: 'United States',
          },
          serviceType: 'Medical Laboratory Services',
          category: 'Diagnostic Testing',
        }
        
        return {
          '@context': 'https://schema.org',
          ...serviceData,
        }
        
      case 'organization':
        return {
          '@context': 'https://schema.org',
          '@type': 'MedicalOrganization',
          name: 'Prism Health Lab',
          url: baseUrl,
          logo: `${baseUrl}/logo.png`,
          description: 'CLIA-certified diagnostic testing laboratory',
          medicalSpecialty: ['Clinical Laboratory', 'Preventive Medicine'],
        }
        
      default:
        return null
    }
    } catch (error) {
      console.error('StructuredData error:', error)
      return null
    }
  }
  
  const structuredData = getStructuredData()
  
  if (!structuredData) return null
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2),
      }}
    />
  )
}