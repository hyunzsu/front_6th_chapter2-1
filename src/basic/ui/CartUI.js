import {
  getProducts,
  setBonusPoints,
  setItemCount,
  setTotalAmount,
  getTotalAmount,
  getItemCount,
  getProductById,
} from '../core/business-state.js';
import {
  getCartDisplayElement,
  getStockInfoElement,
  getTotalDisplayElement,
  getItemCountElement,
  getDiscountInfoElement,
  getLoyaltyPointsElement,
  getTuesdaySpecialElement,
} from '../core/dom-refs.js';
import {
  calculateCart,
  calculateTotalPoints,
  buildLowStockWarning,
} from '../services/index.js';
import { CartItem } from '../components/CartItem.js';
import { formatRoundedPrice } from '../utils/formatters.js';

// ==================== 장바구니 UI 관리 ====================

/**
 * 장바구니 아이템들을 DOM에 렌더링
 */
export function renderCartItems(cartData) {
  const cartDisplay = getCartDisplayElement();
  if (!cartDisplay) return;

  if (!cartData || cartData.length === 0) {
    cartDisplay.innerHTML = '';
    return;
  }

  cartDisplay.innerHTML = cartData
    .map((item) => {
      const product = getProductById(item.id);
      return CartItem(item, product);
    })
    .join('');
}

/**
 * 장바구니 수량 표시 업데이트
 */
export function renderCartCount(itemCount) {
  const itemCountElement = getItemCountElement();
  if (itemCountElement) {
    itemCountElement.textContent = `🛍️ ${itemCount} items in cart`;
  }
}

/**
 * 장바구니 전체 계산 및 UI 업데이트
 */
export function updateCartDisplay() {
  const cartItems = getCartDisplayElement().children;

  // 1. 상태 초기화
  setTotalAmount(0);
  setItemCount(0);

  // 2. 장바구니 전체 계산 (서비스 함수 사용)
  const cartResult = calculateCart(cartItems, getProductById);
  const {
    finalAmount,
    totalQuantity,
    totalDiscountRate,
    isTuesdayToday,
    individualDiscountInfo,
  } = cartResult;

  // 3. 상태 업데이트
  setTotalAmount(finalAmount);
  setItemCount(totalQuantity);

  // 4. UI 직접 업데이트
  updateOrderSummaryDisplay({
    finalAmount,
    totalDiscountRate,
    isTuesdayToday,
    individualDiscountInfo,
  });

  renderCartCount(totalQuantity);
  updateStockWarningDisplay();

  // 5. 포인트 계산 및 표시
  updateBonusPointsDisplay();
}

/**
 * 주문 요약 UI 업데이트
 */
function updateOrderSummaryDisplay(summaryData) {
  const {
    finalAmount = 0,
    totalDiscountRate = 0,
    isTuesdayToday = false,
    individualDiscountInfo = [],
  } = summaryData;

  // 총액 표시 업데이트
  const totalDisplay = getTotalDisplayElement();
  if (totalDisplay) {
    const totalDiv = totalDisplay.querySelector('.text-2xl');
    if (totalDiv) {
      totalDiv.textContent = formatRoundedPrice(finalAmount);
    }
  }

  // 할인 정보 렌더링
  updateDiscountInfoDisplay(individualDiscountInfo, totalDiscountRate);

  // 화요일 특별 할인 표시
  const tuesdaySpecial = getTuesdaySpecialElement();
  if (tuesdaySpecial) {
    tuesdaySpecial.classList.toggle('hidden', !isTuesdayToday);
  }
}

/**
 * 할인 정보 표시 업데이트
 */
function updateDiscountInfoDisplay(individualDiscountInfo, totalDiscountRate) {
  const discountInfo = getDiscountInfoElement();
  if (!discountInfo) return;

  if (totalDiscountRate === 0) {
    discountInfo.innerHTML = '';
    return;
  }

  let discountHTML = '';

  // 개별 상품 할인 정보
  if (individualDiscountInfo.length > 0) {
    discountHTML += '<div class="text-xs text-white/70 mb-2">개별 할인:</div>';
    individualDiscountInfo.forEach((info) => {
      discountHTML += `<div class="text-xs text-blue-400">• ${info.name}: ${info.discountPercent.toFixed(1)}%</div>`;
    });
  }

  // 총 할인율
  discountHTML += `
    <div class="text-xs text-white/70 mt-2 pt-2 border-t border-white/20">
      <div class="flex justify-between">
        <span>총 할인율</span>
        <span class="text-red-400 font-medium">${(totalDiscountRate * 100).toFixed(1)}%</span>
      </div>
    </div>
  `;

  discountInfo.innerHTML = discountHTML;
}

/**
 * 포인트 계산 및 표시 업데이트
 */
function updateBonusPointsDisplay() {
  const cartItems = getCartDisplayElement().children;

  // 빈 장바구니 체크
  if (cartItems.length === 0) {
    const loyaltyPointsElement = getLoyaltyPointsElement();
    if (loyaltyPointsElement) {
      loyaltyPointsElement.style.display = 'none';
    }
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
  updateLoyaltyPointsDisplay(finalPoints, pointsDetails);
}

/**
 * 포인트 표시 업데이트
 */
function updateLoyaltyPointsDisplay(finalPoints, pointsDetails) {
  const loyaltyPointsElement = getLoyaltyPointsElement();
  if (!loyaltyPointsElement) return;

  if (finalPoints > 0) {
    loyaltyPointsElement.innerHTML = `
      <div>적립 포인트: <span class="font-bold">${finalPoints}p</span></div>
      <div class="text-2xs opacity-70 mt-1">${pointsDetails.join(', ')}</div>
    `;
    loyaltyPointsElement.style.display = 'block';
  } else {
    loyaltyPointsElement.textContent = '적립 포인트: 0p';
    loyaltyPointsElement.style.display = 'block';
  }
}

/**
 * 재고 경고 메시지 표시 업데이트
 */
function updateStockWarningDisplay() {
  const warningMessage = buildLowStockWarning(getProducts());
  const stockInfoElement = getStockInfoElement();
  if (stockInfoElement) {
    stockInfoElement.textContent = warningMessage;
  }
}

/**
 * 장바구니 가격 업데이트 (세일 적용 시)
 */
export function updateCartPrices() {
  const cartItems = getCartDisplayElement().children;
  for (let i = 0; i < cartItems.length; i++) {
    const itemId = cartItems[i].id;
    const product = getProductById(itemId);
    if (!product) continue;

    const priceDiv = cartItems[i].querySelector('.text-lg');
    const nameDiv = cartItems[i].querySelector('h3');

    // 할인 상태별 가격 표시
    if (product.isOnSale && product.isSuggestedSale) {
      // 번개세일 + 추천할인
      priceDiv.innerHTML =
        '<span class="line-through text-gray-400">₩' +
        product.originalPrice.toLocaleString() +
        '</span> <span class="text-purple-600">₩' +
        product.price.toLocaleString() +
        '</span>';
      nameDiv.textContent = '⚡💝' + product.name;
    } else if (product.isOnSale) {
      // 번개세일만
      priceDiv.innerHTML =
        '<span class="line-through text-gray-400">₩' +
        product.originalPrice.toLocaleString() +
        '</span> <span class="text-red-500">₩' +
        product.price.toLocaleString() +
        '</span>';
      nameDiv.textContent = '⚡' + product.name;
    } else if (product.isSuggestedSale) {
      // 추천할인만
      priceDiv.innerHTML =
        '<span class="line-through text-gray-400">₩' +
        product.originalPrice.toLocaleString() +
        '</span> <span class="text-blue-500">₩' +
        product.price.toLocaleString() +
        '</span>';
      nameDiv.textContent = '💝' + product.name;
    } else {
      // 일반 가격
      priceDiv.textContent = '₩' + product.price.toLocaleString();
      nameDiv.textContent = product.name;
    }
  }

  // 계산 함수 재호출
  updateCartDisplay();
}
