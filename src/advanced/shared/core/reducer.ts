import type { AppState, AppAction } from '../types';
import { calculateCart } from '../../features/cart/services/CartService';
import { calculateTotalPoints } from '../../features/order/services/PointService';
import { DISCOUNT_RATES } from '../constants';

export function shoppingReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SELECT_PRODUCT': {
      return {
        ...state,
        selectedProductId: action.payload,
        lastSelectedProductId: action.payload,
      };
    }

    case 'ADD_TO_CART': {
      const productId = action.payload;
      const product = state.products.find((p) => p.id === productId);

      if (!product || product.stock === 0) {
        alert('재고가 부족합니다.');
        return state;
      }

      // 기존 장바구니에 있는지 확인
      const existingItemIndex = state.cartItems.findIndex(
        (item) => item.id === productId
      );

      let newCartItems;
      if (existingItemIndex >= 0) {
        // 기존 아이템 수량 증가 시 재고 확인
        const currentItem = state.cartItems[existingItemIndex];
        if (product.stock < 1) {
          alert('재고가 부족합니다.');
          return state;
        }

        newCartItems = state.cartItems.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // 새 아이템 추가
        newCartItems = [...state.cartItems, { id: productId, quantity: 1 }];
      }

      // 재고 감소
      const newProducts = state.products.map((p) =>
        p.id === productId ? { ...p, stock: Math.max(0, p.stock - 1) } : p
      );

      return recalculateState({
        ...state,
        cartItems: newCartItems,
        products: newProducts,
      });
    }

    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload;

      if (quantity <= 0) {
        // 수량이 0 이하면 제거
        return shoppingReducer(state, {
          type: 'REMOVE_FROM_CART',
          payload: id,
        });
      }

      const currentItem = state.cartItems.find((item) => item.id === id);
      if (!currentItem) return state;

      const quantityDiff = quantity - currentItem.quantity;
      const product = state.products.find((p) => p.id === id);
      if (!product) return state;

      // 재고 체크
      if (quantityDiff > 0 && product.stock < quantityDiff) {
        alert('재고가 부족합니다.');
        return state;
      }

      const newCartItems = state.cartItems.map((item) =>
        item.id === id ? { ...item, quantity } : item
      );

      const newProducts = state.products.map((p) =>
        p.id === id ? { ...p, stock: p.stock - quantityDiff } : p
      );

      return recalculateState({
        ...state,
        cartItems: newCartItems,
        products: newProducts,
      });
    }

    case 'REMOVE_FROM_CART': {
      const productId = action.payload;
      const itemToRemove = state.cartItems.find(
        (item) => item.id === productId
      );

      if (!itemToRemove) return state;

      const newCartItems = state.cartItems.filter(
        (item) => item.id !== productId
      );

      // 재고 복원
      const newProducts = state.products.map((p) =>
        p.id === productId
          ? { ...p, stock: p.stock + itemToRemove.quantity }
          : p
      );

      return recalculateState({
        ...state,
        cartItems: newCartItems,
        products: newProducts,
      });
    }

    case 'APPLY_LIGHTNING_SALE': {
      const productId = action.payload;
      const newProducts = state.products.map((product) =>
        product.id === productId
          ? {
              ...product,
              isOnSale: true,
              price: Math.floor(
                product.originalPrice * (1 - DISCOUNT_RATES.LIGHTNING)
              ),
            }
          : product
      );

      return recalculateState({
        ...state,
        products: newProducts,
      });
    }

    case 'APPLY_SUGGESTED_SALE': {
      const productId = action.payload;
      const newProducts = state.products.map((product) =>
        product.id === productId
          ? {
              ...product,
              isSuggestedSale: true,
              price: Math.floor(
                product.originalPrice * (1 - DISCOUNT_RATES.SUGGEST)
              ),
            }
          : product
      );

      return recalculateState({
        ...state,
        products: newProducts,
      });
    }

    case 'RESET_PROMOTIONS': {
      const productId = action.payload;
      const newProducts = state.products.map((product) =>
        product.id === productId
          ? {
              ...product,
              isOnSale: false,
              isSuggestedSale: false,
              price: product.originalPrice,
            }
          : product
      );

      return recalculateState({
        ...state,
        products: newProducts,
      });
    }

    case 'CALCULATE_TOTALS': {
      return recalculateState(state);
    }

    default:
      return state;
  }
}

// 장바구니 계산 및 상태 업데이트 헬퍼 함수
function recalculateState(state: AppState): AppState {
  const getProductById = (id: string) =>
    state.products.find((p) => p.id === id);

  if (state.cartItems.length === 0) {
    return {
      ...state,
      itemCount: 0,
      totalAmount: 0,
      subtotal: 0,
      bonusPoints: 0,
      discountInfo: [],
      isTuesdaySpecial: false,
      pointsDetails: [],
    };
  }

  const cartResult = calculateCart(state.cartItems, getProductById);

  // 포인트 계산
  const pointsResult = calculateTotalPoints(
    cartResult.finalAmount,
    cartResult.totalQuantity,
    state.cartItems,
    getProductById
  );

  return {
    ...state,
    itemCount: cartResult.totalQuantity,
    totalAmount: cartResult.finalAmount,
    subtotal: cartResult.subtotal,
    discountInfo: cartResult.individualDiscountInfo,
    isTuesdaySpecial: cartResult.isTuesdayToday,
    bonusPoints: pointsResult.finalPoints,
    pointsDetails: pointsResult.pointsDetails || [],
  };
}
