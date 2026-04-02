import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

// Initial State from Local Storage or Default
const initialState = {
  cartItems: localStorage.getItem('cartItems') ? JSON.parse(localStorage.getItem('cartItems')) : [],
  shippingAddress: localStorage.getItem('shippingAddress') ? JSON.parse(localStorage.getItem('shippingAddress')) : {},
  paymentMethod: 'PayPal', // Default for now
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'CART_ADD_ITEM':
      const item = action.payload;
      const existItem = state.cartItems.find((x) => x.product === item.product);

      if (existItem) {
        return {
          ...state,
          cartItems: state.cartItems.map((x) =>
            x.product === existItem.product ? item : x
          ),
        };
      } else {
        return {
          ...state,
          cartItems: [...state.cartItems, item],
        };
      }
    case 'CART_REMOVE_ITEM':
      return {
        ...state,
        cartItems: state.cartItems.filter((x) => x.product !== action.payload),
      };
    case 'CART_SAVE_SHIPPING_ADDRESS':
      return {
        ...state,
        shippingAddress: action.payload,
      };
    case 'CART_SAVE_PAYMENT_METHOD':
      return {
        ...state,
        paymentMethod: action.payload,
      };
    case 'CART_CLEAR_ITEMS':
      return {
        ...state,
        cartItems: [],
      };
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Sync to local storage whenever state changes
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
  }, [state.cartItems]);

  useEffect(() => {
    localStorage.setItem('shippingAddress', JSON.stringify(state.shippingAddress));
  }, [state.shippingAddress]);

  const addToCart = (product, qty) => {
    const productId = product?._id || product?.product;
    const name = product?.name;
    const image = product?.image;
    const price = Number(product?.price || 0);
    const countInStock = Number(product?.countInStock || 0);

    if (!productId || !name || !image || price <= 0 || countInStock <= 0) {
      return;
    }

    const parsedQty = Number(qty);
    const safeQty = Number.isFinite(parsedQty) ? parsedQty : 0;
    const normalizedQty = Math.min(Math.max(safeQty, 0.1), countInStock);

    dispatch({
      type: 'CART_ADD_ITEM',
      payload: {
        product: productId,
        name,
        image,
        price,
        countInStock,
        qty: Number(normalizedQty.toFixed(2)),
      },
    });
  };

  const removeFromCart = (id) => {
    dispatch({ type: 'CART_REMOVE_ITEM', payload: id });
  };

  const saveShippingAddress = (data) => {
    dispatch({ type: 'CART_SAVE_SHIPPING_ADDRESS', payload: data });
  };

  const savePaymentMethod = (data) => {
    dispatch({ type: 'CART_SAVE_PAYMENT_METHOD', payload: data });
  };

  const clearCart = () => {
    dispatch({ type: 'CART_CLEAR_ITEMS' });
  };

  return (
    <CartContext.Provider
      value={{
        cart: state,
        addToCart,
        removeFromCart,
        saveShippingAddress,
        savePaymentMethod,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
