import type { AppAction } from '../types';

export const selectProduct = (productId: string): AppAction => ({
  type: 'SELECT_PRODUCT',
  payload: productId,
});

export const addToCart = (productId: string): AppAction => ({
  type: 'ADD_TO_CART',
  payload: productId,
});

export const updateQuantity = (id: string, quantity: number): AppAction => ({
  type: 'UPDATE_QUANTITY',
  payload: { id, quantity },
});

export const removeFromCart = (productId: string): AppAction => ({
  type: 'REMOVE_FROM_CART',
  payload: productId,
});

export const applyLightningSale = (productId: string): AppAction => ({
  type: 'APPLY_LIGHTNING_SALE',
  payload: productId,
});

export const applySuggestedSale = (productId: string): AppAction => ({
  type: 'APPLY_SUGGESTED_SALE',
  payload: productId,
});

export const resetPromotions = (productId: string): AppAction => ({
  type: 'RESET_PROMOTIONS',
  payload: productId,
});

export const calculateTotals = (): AppAction => ({
  type: 'CALCULATE_TOTALS',
});
