import { useReducer, useCallback, useEffect, useRef } from 'react';
import { shoppingReducer } from '../shared/core/reducer';
import { initialState } from '../shared/core/initialState';
import * as actions from '../shared/core/actions';
import { createLightningSaleManager } from '../features/promotion/services/LightningSaleService';
import { createSuggestedSaleManager } from '../features/promotion/services/SuggestedSaleService';
import type { Product } from '../shared/types';

export function useShoppingCart() {
  const [state, dispatch] = useReducer(shoppingReducer, initialState);

  // 프로모션 매니저 참조
  const lightningSaleManager = useRef<{
    start: () => void;
    stop: () => void;
  } | null>(null);
  const suggestedSaleManager = useRef<{
    start: () => void;
    stop: () => void;
  } | null>(null);

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

  // 프로모션 시스템 초기화 및 정리
  useEffect(() => {
    // 번개세일 매니저 초기화
    lightningSaleManager.current = createLightningSaleManager(
      () => state.products,
      (productId) => dispatch(actions.applyLightningSale(productId)),
      (productId) => dispatch(actions.resetPromotions(productId)),
      () => dispatch(actions.calculateTotals())
    );

    // 추천세일 매니저 초기화
    suggestedSaleManager.current = createSuggestedSaleManager(
      () => state.products,
      () => state.lastSelectedProductId,
      (productId) => dispatch(actions.applySuggestedSale(productId)),
      (productId) => dispatch(actions.resetPromotions(productId)),
      () => dispatch(actions.calculateTotals())
    );

    // 프로모션 시작
    lightningSaleManager.current.start();
    suggestedSaleManager.current.start();

    // 정리 함수
    return () => {
      lightningSaleManager.current?.stop();
      suggestedSaleManager.current?.stop();
    };
  }, []); // 빈 의존성 배열로 한 번만 실행

  return {
    state,
    actions: shopActions,
    getProductById,
  };
}
