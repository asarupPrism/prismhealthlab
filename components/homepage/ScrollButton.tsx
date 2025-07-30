'use client'

interface ScrollButtonProps {
  targetId: string
  children: React.ReactNode
  className?: string
}

export default function ScrollButton({ targetId, children, className = '' }: ScrollButtonProps) {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <button 
      onClick={() => scrollToSection(targetId)}
      className={className}
      aria-label={`Scroll to ${targetId} section`}
    >
      {children}
    </button>
  )
}