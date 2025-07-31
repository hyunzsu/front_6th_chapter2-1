import { useReducer, useCallback } from 'react';
import { shoppingReducer } from '../shared/core/reducer';
import { initialState } from '../shared/core/initialState';
import * as actions from '../shared/core/actions';
import type { Product } from '../shared/types';

export function useShoppingCart() {
  const [state, dispatch] = useReducer(shoppingReducer, initialState);

  const shopActions = {
    selectProduct: useCallback((productId: string) => {
      dispatch(actions.selectProduct(productId));
    }, []),

    addToCart: useCallback((productId: string) => {
      dispatch(actions.addToCart(productId));
    }, []),

    updateQuantity: useCallback((id: string, quantity: number) => {
      dispatch(actions.updateQuantity(id, quantity));
    }, []),

    removeFromCart: useCallback((productId: string) => {
      dispatch(actions.removeFromCart(productId));
    }, []),

    applyLightningSale: useCallback((productId: string) => {
      dispatch(actions.applyLightningSale(productId));
    }, []),

    applySuggestedSale: useCallback((productId: string) => {
      dispatch(actions.applySuggestedSale(productId));
    }, []),

    resetPromotions: useCallback((productId: string) => {
      dispatch(actions.resetPromotions(productId));
    }, []),

    calculateTotals: useCallback(() => {
      dispatch(actions.calculateTotals());
    }, []),
  };

  const getProductById = useCallback(
    (id: string): Product | undefined => {
      return state.products.find((product) => product.id === id);
    },
    [state.products]
  );

  return {
    state,
    actions: shopActions,
    getProductById,
  };
}
