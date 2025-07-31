import {
  getProductDiscount,
  applyBulkDiscounts,
  getDiscountInfo,
} from './discountService.js';

// ==================== 장바구니 계산 서비스 ====================

/**
 * 장바구니 아이템별 소계 및 수량 계산
 * @param {Array} cartItems - 장바구니 아이템들
 * @param {Function} getProductById - 상품 조회 함수
 * @returns {Object} { subtotal, totalQuantity, discountedTotal, individualDiscountInfo }
 */
export function calculateCartSummary(cartItems, getProductById) {
  let subtotal = 0;
  let totalQuantity = 0;
  let discountedTotal = 0;
  const individualDiscountInfo = [];

  for (let i = 0; i < cartItems.length; i++) {
    const product = getProductById(cartItems[i].id);
    if (!product) continue;

    const quantityElement = cartItems[i].querySelector('.quantity-number');
    const quantity = parseInt(quantityElement.textContent);
    const itemSubtotal = product.price * quantity;

    totalQuantity += quantity;
    subtotal += itemSubtotal;

    // 개별 상품 할인 계산
    const discountRate = getProductDiscount(product.id, quantity);
    if (discountRate > 0) {
      individualDiscountInfo.push({
        name: product.name,
        discountPercent: discountRate * 100,
      });
    }

    // 할인 적용된 금액 누적
    discountedTotal += itemSubtotal * (1 - discountRate);
  }

  return {
    subtotal,
    totalQuantity,
    discountedTotal,
    individualDiscountInfo,
  };
}

/**
 * 장바구니 전체 계산 (메인 오케스트레이터)
 * @param {Array} cartItems - 장바구니 아이템들
 * @param {Function} getProductById - 상품 조회 함수
 * @returns {Object} 계산 결과 객체
 */
export function calculateCart(cartItems, getProductById) {
  // 1. 장바구니 아이템별 계산
  const cartSummary = calculateCartSummary(cartItems, getProductById);
  const { subtotal, totalQuantity, discountedTotal, individualDiscountInfo } =
    cartSummary;

  // 2. 대량구매 및 특별 할인 적용
  const bulkDiscounts = applyBulkDiscounts(
    subtotal,
    discountedTotal,
    totalQuantity
  );
  const { finalAmount, totalDiscountRate, isTuesdayToday } = bulkDiscounts;

  return {
    subtotal,
    finalAmount,
    totalQuantity,
    totalDiscountRate,
    isTuesdayToday,
    individualDiscountInfo,
  };
}

/**
 * 장바구니가 비어있는지 확인
 * @param {Array} cartItems - 장바구니 아이템들
 * @returns {boolean} 비어있으면 true
 */
export function isCartEmpty(cartItems) {
  return !cartItems || cartItems.length === 0;
}
