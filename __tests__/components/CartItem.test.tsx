import { render, screen, fireEvent } from '@testing-library/react'
import CartItem, { CartItemType } from '@/components/CartItem'

describe('CartItem', () => {
  const item: CartItemType = {
    id: '1',
    name: 'Burger',
    price: 5.99,
    quantity: 2,
    max_quantity: 5,
    image: '',
  }

  it('renders item details', () => {
    render(
      <CartItem item={item} onUpdateQuantity={jest.fn()} onRemove={jest.fn()} />
    )
    expect(screen.getByText('Burger')).toBeInTheDocument()
    expect(screen.getByText('$11.98')).toBeInTheDocument()
    expect(screen.getByText('$5.99 each')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('calls onUpdateQuantity when + or - is clicked', () => {
    const onUpdateQuantity = jest.fn()
    render(
      <CartItem item={item} onUpdateQuantity={onUpdateQuantity} onRemove={jest.fn()} />
    )
    const plus = screen.getAllByRole('button', { name: '+' })[0]
    const minus = screen.getAllByRole('button', { name: '-' })[0]
    fireEvent.click(plus)
    expect(onUpdateQuantity).toHaveBeenCalledWith('1', 3)
    fireEvent.click(minus)
    expect(onUpdateQuantity).toHaveBeenCalledWith('1', 1)
  })

  it('calls onRemove when Remove is clicked', () => {
    const onRemove = jest.fn()
    render(
      <CartItem item={item} onUpdateQuantity={jest.fn()} onRemove={onRemove} />
    )
    fireEvent.click(screen.getByText('Remove'))
    expect(onRemove).toHaveBeenCalledWith('1')
  })

  it('disables - button when quantity is 1', () => {
    render(
      <CartItem item={{ ...item, quantity: 1 }} onUpdateQuantity={jest.fn()} onRemove={jest.fn()} />
    )
    expect(screen.getAllByRole('button', { name: '-' })[0]).toBeDisabled()
  })

  it('disables + button when quantity is at max_quantity', () => {
    render(
      <CartItem item={{ ...item, quantity: 5 }} onUpdateQuantity={jest.fn()} onRemove={jest.fn()} />
    )
    expect(screen.getAllByRole('button', { name: '+' })[0]).toBeDisabled()
  })
}) 