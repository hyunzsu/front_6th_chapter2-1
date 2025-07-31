import {
  getProducts,
  setBonusPoints,
  setItemCount,
  setTotalAmount,
  getTotalAmount,
  getItemCount,
  getProductById,
} from '../core/business-state.js';
import { getCartDisplayElement } from '../core/dom-refs.js';
import {
  calculateCart,
  calculateTotalPoints,
} from '../services/index.js';
import {
  renderLoyaltyPoints,
  renderOrderSummary,
} from '../renderers/OrderRenderer.js';
import { renderCartCount } from '../renderers/CartRenderer.js';
import { renderProductSelector } from '../renderers/ProductRenderer.js';
import { 
  updateStockWarningDisplay, 
  updateSelectOptionsStyle,
  updatePricesInCart as updateCartPrices
} from '../renderers/UIRenderer.js';

// ==================== 장바구니 컨트롤러 (오케스트레이션) ====================

/**
 * 드롭다운 옵션 업데이트 오케스트레이션
 */
export function updateSelectOptions() {
  renderProductSelector();
  updateSelectOptionsStyle();
}

/**
 * 장바구니 계산 메인 오케스트레이션
 */
export function calculateCartStuff() {
  const cartItems = getCartDisplayElement().children;

  // 1. 상태 초기화
  setTotalAmount(0);
  setItemCount(0);

  // 2. 장바구니 전체 계산 (서비스 함수 사용)
  const cartResult = calculateCart(cartItems, getProductById);
  const {
    subtotal,
    finalAmount,
    totalQuantity,
    totalDiscountRate,
    isTuesdayToday,
    individualDiscountInfo,
  } = cartResult;

  // 3. 상태 업데이트
  setTotalAmount(finalAmount);
  setItemCount(totalQuantity);

  // 4. 렌더링 함수를 통한 UI 업데이트
  renderOrderSummary({
    subtotal,
    finalAmount,
    totalDiscountRate,
    bonusPoints: 0, // 포인트는 별도 함수에서 처리
    isTuesdayToday,
    individualDiscountInfo,
  });

  renderCartCount(totalQuantity);
  updateStockWarningDisplay();

  // 5. 포인트 상세 계산 및 표시
  renderBonusPoints();
}

/**
 * 포인트 계산 및 렌더링 오케스트레이션
 */
export function renderBonusPoints() {
  const cartItems = getCartDisplayElement().children;

  // 빈 장바구니 체크
  if (cartItems.length === 0) {
    document.getElementById('loyalty-points').style.display = 'none';
    return;
  }

  // 포인트 계산 (서비스 함수 사용)
  const pointsResult = calculateTotalPoints(
    getTotalAmount(),
    getItemCount(),
    cartItems,
    getProductById
  );
  const { finalPoints, pointsDetails } = pointsResult;

  // 상태 업데이트 및 UI 표시
  setBonusPoints(finalPoints);
  renderLoyaltyPoints(finalPoints, pointsDetails);
}

/**
 * 장바구니 가격 업데이트 오케스트레이션
 */
export function updatePricesInCart() {
  updateCartPrices();
  // 계산 함수 재호출
  calculateCartStuff();
}