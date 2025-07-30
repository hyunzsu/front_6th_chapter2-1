import {
  QUANTITY_THRESHOLDS,
  DISCOUNT_RATES,
  TUESDAY,
  KEYBOARD_ID,
  MOUSE_ID,
  MONITOR_ID,
  HEADPHONE_ID,
  SPEAKER_ID,
} from '../constants/index.js';

// ==================== 할인 계산 서비스 ====================

/**
 * 개별 상품 할인율 조회
 * @param {string} productId - 상품 ID
 * @param {number} quantity - 수량
 * @returns {number} 할인율 (0~1)
 */
export function getProductDiscount(productId, quantity) {
  if (quantity < QUANTITY_THRESHOLDS.INDIVIDUAL_DISCOUNT) {
    return 0;
  }

  const discountRates = {
    [KEYBOARD_ID]: DISCOUNT_RATES.PRODUCT.KEYBOARD,
    [MOUSE_ID]: DISCOUNT_RATES.PRODUCT.MOUSE,
    [MONITOR_ID]: DISCOUNT_RATES.PRODUCT.MONITOR_ARM,
    [HEADPHONE_ID]: DISCOUNT_RATES.PRODUCT.LAPTOP_POUCH,
    [SPEAKER_ID]: DISCOUNT_RATES.PRODUCT.SPEAKER,
  };

  return discountRates[productId] || 0;
}

/**
 * 대량구매 및 화요일 할인 적용
 * @param {number} subtotal - 개별 할인 적용 전 소계
 * @param {number} discountedTotal - 개별 할인 적용 후 금액
 * @param {number} totalQuantity - 총 수량
 * @returns {Object} { finalAmount, totalDiscountRate, isTuesdayToday }
 */
export function applyBulkDiscounts(subtotal, discountedTotal, totalQuantity) {
  let finalAmount = discountedTotal;
  let totalDiscountRate = 0;

  // 대량구매 할인 (30개 이상) - 개별 할인보다 유리할 때 적용
  if (totalQuantity >= QUANTITY_THRESHOLDS.BONUS_LARGE) {
    const bulkDiscountAmount = subtotal * (1 - DISCOUNT_RATES.BULK);
    if (bulkDiscountAmount < discountedTotal) {
      finalAmount = bulkDiscountAmount;
    }
  }

  // 할인율 계산
  totalDiscountRate = (subtotal - finalAmount) / subtotal;

  // 화요일 추가 할인
  const today = new Date();
  const isTuesdayToday = today.getDay() === TUESDAY;

  if (isTuesdayToday && finalAmount > 0) {
    finalAmount = finalAmount * (1 - DISCOUNT_RATES.TUESDAY);
    totalDiscountRate = 1 - finalAmount / subtotal;
  }

  return {
    finalAmount,
    totalDiscountRate,
    isTuesdayToday,
  };
}

/**
 * 화요일 여부 확인
 * @param {Date} date - 확인할 날짜 (기본값: 현재 날짜)
 * @returns {boolean} 화요일 여부
 */
export function isTuesday(date = new Date()) {
  return date.getDay() === TUESDAY;
}

/**
 * 개별 할인 정보 계산
 * @param {Array} cartItems - 장바구니 아이템들
 * @param {Function} getProductById - 상품 조회 함수
 * @returns {Array} 개별 할인 정보 배열
 */
export function getDiscountInfo(cartItems, getProductById) {
  const discountInfo = [];

  for (let i = 0; i < cartItems.length; i++) {
    const quantityElement = cartItems[i].querySelector('.quantity-number');
    const quantity = parseInt(quantityElement.textContent);
    const productId = cartItems[i].id;
    
    const discountRate = getProductDiscount(productId, quantity);
    if (discountRate > 0) {
      const product = getProductById(productId);
      discountInfo.push({
        name: product.name,
        discountPercent: discountRate * 100,
      });
    }
  }

  return discountInfo;
}