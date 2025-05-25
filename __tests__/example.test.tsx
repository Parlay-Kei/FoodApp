import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

describe('Example Test Suite', () => {
  it('should pass a basic test', () => {
    expect(true).toBe(true)
  })

  it('should render a component', () => {
    render(<div data-testid="test-element">Hello World</div>)
    expect(screen.getByTestId('test-element')).toBeInTheDocument()
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })
}) 