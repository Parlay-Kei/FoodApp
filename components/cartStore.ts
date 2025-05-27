import { create } from 'zustand'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'react-hot-toast'

export interface CartItem {
  name: string
  price: number
  quantity: number
  imageUrl?: string
  description?: string
}

interface CartState {
  items: CartItem[]
  isLoading: boolean
  error: string | null
  isInitialized: boolean
  retryCount: number
  isRetrying: boolean
  lastOperation: null | (() => Promise<void>)
  addItem: (item: Omit<CartItem, 'quantity'>) => Promise<void>
  removeItem: (name: string) => Promise<void>
  updateQuantity: (name: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  fetchCart: () => Promise<void>
  retryLastOperation: () => Promise<void>
  resetError: () => void
  subtotal: () => number
  itemCount: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,
  isInitialized: false,
  retryCount: 0,
  isRetrying: false,
  lastOperation: null,

  resetError: () => {
    set({ error: null })
  },

  retryLastOperation: async () => {
    const { lastOperation, retryCount } = get()
    if (!lastOperation) return

    if (retryCount >= 3) {
      toast.error('Maximum retry attempts reached. Please try again later.')
      set({ retryCount: 0, isRetrying: false })
      return
    }

    set({ isRetrying: true, retryCount: retryCount + 1 })
    try {
      await lastOperation()
      set({ isRetrying: false, error: null })
    } catch (error) {
      set({ 
        isRetrying: false,
        error: error instanceof Error ? error.message : 'Operation failed after retry'
      })
    }
  },

  fetchCart: async () => {
    console.log('fetchCart called in cartStore');
    const supabase = createClientComponentClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      console.log('No user found, setting empty cart');
      set({ items: [], isInitialized: true })
      return
    }
    console.log('User found, fetching cart for user:', user.id);

    const operation = async () => {
      set({ isLoading: true, error: null })
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
        
        console.log('Sending fetch request to /api/cart');
        const response = await fetch('/api/cart', {
          signal: controller.signal
        })
        clearTimeout(timeoutId)
        
        console.log('Received response from /api/cart:', response.status, response.statusText);
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('Error response from /api/cart:', errorText);
          throw new Error(`Failed to fetch cart: ${response.status} ${errorText || response.statusText}`)
        }
        
        const data = await response.json()
        console.log('Cart data from API:', data);
        
        // Store the items in the state
        set({ items: data.items, isLoading: false, isInitialized: true })
        console.log('Updated cart store state with items:', data.items);
      } catch (error) {
        let errorMessage = 'Failed to fetch cart'
        
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            errorMessage = 'Request timed out. Please check your connection.'
          } else if (error.message) {
            errorMessage = error.message
          }
        }
        
        set({ 
          error: errorMessage,
          isLoading: false,
          isInitialized: true
        })
        
        // Show toast for network errors
        toast.error(errorMessage)
      }
    }
    
    set({ lastOperation: operation })
    await operation()
  },

  addItem: async (item) => {
    const supabase = createClientComponentClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      const errorMsg = 'Please sign in to add items to cart'
      set({ error: errorMsg })
      toast.error(errorMsg)
      return
    }

    const operation = async () => {
      set({ isLoading: true, error: null })
      try {
        const currentItems = get().items
        const existing = currentItems.find(i => i.name === item.name)
        const newItems = existing
          ? currentItems.map(i => 
              i.name === item.name 
                ? { ...i, quantity: i.quantity + 1 }
                : i
            )
          : [...currentItems, { ...item, quantity: 1 }]

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout

        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: newItems }),
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Failed to update cart: ${response.status} ${errorText || response.statusText}`)
        }

        const data = await response.json()
        set({ items: data.items, isLoading: false })
        toast.success(`${item.name} added to cart`)
      } catch (error) {
        let errorMessage = 'Failed to add item to cart'
        
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            errorMessage = 'Request timed out. Please check your connection.'
          } else if (error.message) {
            errorMessage = error.message
          }
        }
        
        set({ 
          error: errorMessage,
          isLoading: false
        })
        
        toast.error(errorMessage)
      }
    }
    
    set({ lastOperation: operation })
    await operation()
  },

  removeItem: async (name) => {
    const supabase = createClientComponentClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      const errorMsg = 'Please sign in to modify cart'
      set({ error: errorMsg })
      toast.error(errorMsg)
      return
    }

    const operation = async () => {
      set({ isLoading: true, error: null })
      try {
        const currentItems = get().items
        const newItems = currentItems.filter(i => i.name !== name)

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout

        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: newItems }),
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Failed to update cart: ${response.status} ${errorText || response.statusText}`)
        }

        const data = await response.json()
        set({ items: data.items, isLoading: false })
        toast.success(`Item removed from cart`)
      } catch (error) {
        let errorMessage = 'Failed to remove item from cart'
        
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            errorMessage = 'Request timed out. Please check your connection.'
          } else if (error.message) {
            errorMessage = error.message
          }
        }
        
        set({ 
          error: errorMessage,
          isLoading: false
        })
        
        toast.error(errorMessage)
      }
    }
    
    set({ lastOperation: operation })
    await operation()
  },

  updateQuantity: async (name, quantity) => {
    const supabase = createClientComponentClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      const errorMsg = 'Please sign in to modify cart'
      set({ error: errorMsg })
      toast.error(errorMsg)
      return
    }

    if (quantity < 1) {
      await get().removeItem(name)
      return
    }

    const operation = async () => {
      set({ isLoading: true, error: null })
      try {
        const currentItems = get().items
        const newItems = currentItems.map(i => 
          i.name === name 
            ? { ...i, quantity }
            : i
        )

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout

        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: newItems }),
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Failed to update cart: ${response.status} ${errorText || response.statusText}`)
        }

        const data = await response.json()
        set({ items: data.items, isLoading: false })
      } catch (error) {
        let errorMessage = 'Failed to update item quantity'
        
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            errorMessage = 'Request timed out. Please check your connection.'
          } else if (error.message) {
            errorMessage = error.message
          }
        }
        
        set({ 
          error: errorMessage,
          isLoading: false
        })
        
        toast.error(errorMessage)
      }
    }
    
    set({ lastOperation: operation })
    await operation()
  },

  clearCart: async () => {
    const supabase = createClientComponentClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      const errorMsg = 'Please sign in to clear cart'
      set({ error: errorMsg })
      toast.error(errorMsg)
      return
    }

    const operation = async () => {
      set({ isLoading: true, error: null })
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout

        const response = await fetch('/api/cart', {
          method: 'DELETE',
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Failed to clear cart: ${response.status} ${errorText || response.statusText}`)
        }

        set({ items: [], isLoading: false })
        toast.success('Cart cleared successfully')
      } catch (error) {
        let errorMessage = 'Failed to clear cart'
        
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            errorMessage = 'Request timed out. Please check your connection.'
          } else if (error.message) {
            errorMessage = error.message
          }
        }
        
        set({ 
          error: errorMessage,
          isLoading: false
        })
        
        toast.error(errorMessage)
      }
    }
    
    set({ lastOperation: operation })
    await operation()
  },

  subtotal: () => {
    const { items } = get();
    return Array.isArray(items) ? items.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 0), 0) : 0;
  },
  itemCount: () => {
    const { items } = get();
    return Array.isArray(items) ? items.reduce((sum, i) => sum + (i.quantity || 0), 0) : 0;
  },
}))