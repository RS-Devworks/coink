import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Basic Component Tests', () => {
  it('renders button component', () => {
    render(<Button>Test Button</Button>)
    
    expect(screen.getByText('Test Button')).toBeInTheDocument()
  })

  it('applies className prop correctly', () => {
    render(<Button className="test-class">Styled Button</Button>)
    
    const button = screen.getByText('Styled Button')
    expect(button).toHaveClass('test-class')
  })

  it('handles disabled state', () => {
    render(<Button disabled>Disabled Button</Button>)
    
    const button = screen.getByText('Disabled Button')
    expect(button).toBeDisabled()
  })

  it('renders different button variants', () => {
    const { rerender } = render(<Button variant="default">Default</Button>)
    
    expect(screen.getByText('Default')).toBeInTheDocument()
    
    rerender(<Button variant="destructive">Destructive</Button>)
    expect(screen.getByText('Destructive')).toBeInTheDocument()
    
    rerender(<Button variant="outline">Outline</Button>)
    expect(screen.getByText('Outline')).toBeInTheDocument()
  })
})