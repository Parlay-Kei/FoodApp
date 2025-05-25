import { render, screen, fireEvent } from '@testing-library/react'
import FoodItemCard, { FoodItem } from '@/components/FoodItemCard'

describe('FoodItemCard', () => {
  const item: FoodItem = {
    id: '1',
    name: 'Pizza',
    description: 'Delicious cheese pizza',
    price: 10.5,
    image_url: '',
    is_vegan: false,
    is_vegetarian: true,
    is_spicy: false,
    is_gluten_free: false,
    quantity_available: 3,
  }

  it('renders item details', () => {
    render(<FoodItemCard item={item} onAddToCart={jest.fn()} />)
    expect(screen.getByText('Pizza')).toBeInTheDocument()
    expect(screen.getByText('Delicious cheese pizza')).toBeInTheDocument()
    expect(screen.getByText('$10.50')).toBeInTheDocument()
    expect(screen.getByText('3 available')).toBeInTheDocument()
    expect(screen.getByText('Veg')).toBeInTheDocument()
  })

  it('calls onAddToCart when button is clicked', () => {
    const onAddToCart = jest.fn()
    render(<FoodItemCard item={item} onAddToCart={onAddToCart} />)
    fireEvent.click(screen.getByRole('button', { name: 'Add to Cart' }))
    expect(onAddToCart).toHaveBeenCalledWith(item)
  })

  it('disables button and shows Sold out when quantity is 0', () => {
    render(<FoodItemCard item={{ ...item, quantity_available: 0 }} onAddToCart={jest.fn()} />)
    expect(screen.getByText('Sold out')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add to Cart' })).toBeDisabled()
  })
}) 