import { STOCK_THRESHOLDS, QUANTITY_THRESHOLDS, DISCOUNT_RATES } from '../constants/index.js';
import {
  renderProductSelector,
  renderOrderSummary,
  renderCartCount,
  renderLoyaltyPoints,
} from './index.js';
import {
  getProducts,
  getBonusPoints,
  setBonusPoints,
  getItemCount,
  setItemCount,
  getTotalAmount,
  setTotalAmount,
  getProductById,
} from '../core/business-state.js';
import {
  getStockInfoElement,
  getProductSelectElement,
  getCartDisplayElement,
  getTotalDisplayElement,
} from '../core/dom-refs.js';
import {
  calculateCart,
  calculateTotalPoints,
  buildLowStockWarning,
  calculateTotalStock,
} from '../services/index.js';
import { formatPrice, formatRoundedPrice } from '../utils/formatters.js';

// ==================== 드롭다운 옵션 업데이트 함수 ====================
export function onUpdateSelectOptions() {
  renderProductSelector();

  // 전체 재고 계산 및 시각적 피드백
  const totalStock = calculateTotalStock(getProducts());

  // 재고 부족 시 시각적 피드백
  getProductSelectElement().style.borderColor =
    totalStock < STOCK_THRESHOLDS.WARNING ? 'orange' : '';
}

// ==================== 장바구니 계산 메인 함수 (오케스트레이터) ====================
export function handleCalculateCartStuff() {
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
  doRenderBonusPoints();
}

// ==================== UI 업데이트: 장바구니 아이템 할인 스타일 적용 ====================
export function updateCartItemDiscountStyles(cartItems) {
  for (let i = 0; i < cartItems.length; i++) {
    const quantityElement = cartItems[i].querySelector('.quantity-number');
    const quantity = parseInt(quantityElement.textContent);

    const cartItemElement = cartItems[i];
    const priceElements =
      cartItemElement.querySelectorAll('.text-lg, .text-xs');

    priceElements.forEach(function (priceElement) {
      if (priceElement.classList.contains('text-lg')) {
        const hasIndividualDiscount =
          quantity >= QUANTITY_THRESHOLDS.INDIVIDUAL_DISCOUNT;
        priceElement.style.fontWeight = hasIndividualDiscount
          ? 'bold'
          : 'normal';
      }
    });
  }
}

// ==================== UI 업데이트: 주문 요약 섹션 렌더링 ====================
export function renderOrderSummarySection(
  cartItems,
  subtotal,
  individualDiscountInfo,
  totalDiscountRate,
  isTuesdayToday
) {
  const summaryDetailsElement = document.getElementById('summary-details');
  summaryDetailsElement.innerHTML = '';

  if (subtotal === 0) {
    return; // 빈 장바구니일 때는 요약 정보 없음
  }

  // 장바구니 아이템별 요약 추가
  addCartItemsSummaryToDisplay(cartItems, summaryDetailsElement);

  // 소계 추가
  addSubtotalToDisplay(subtotal, summaryDetailsElement);

  // 할인 정보 추가
  addDiscountInfoToDisplay(
    individualDiscountInfo,
    isTuesdayToday,
    summaryDetailsElement
  );

  // 배송비 정보 추가
  addShippingInfoToDisplay(summaryDetailsElement);

  // 총 할인율 박스 업데이트
  updateTotalDiscountInfoBox(totalDiscountRate, subtotal);

  // 화요일 특별 배너 업데이트
  updateTuesdaySpecialBanner(isTuesdayToday);
}

// ==================== UI 업데이트: 장바구니 아이템 요약 추가 ====================
export function addCartItemsSummaryToDisplay(cartItems, summaryElement) {
  for (let i = 0; i < cartItems.length; i++) {
    const product = getProductById(cartItems[i].id);
    if (!product) continue;

    const quantityElement = cartItems[i].querySelector('.quantity-number');
    const quantity = parseInt(quantityElement.textContent);
    const itemTotal = product.price * quantity;

    summaryElement.innerHTML += `
      <div class="flex justify-between text-xs tracking-wide text-gray-400">
        <span>${product.name} x ${quantity}</span>
        <span>₩${formatPrice(itemTotal)}</span>
      </div>
    `;
  }
}

// ==================== UI 업데이트: 소계 정보 추가 ====================
export function addSubtotalToDisplay(subtotal, summaryElement) {
  summaryElement.innerHTML += `
    <div class="border-t border-white/10 my-3"></div>
    <div class="flex justify-between text-sm tracking-wide">
      <span>Subtotal</span>
      <span>₩${formatPrice(subtotal)}</span>
    </div>
  `;
}

// ==================== UI 업데이트: 할인 정보 추가 ====================
export function addDiscountInfoToDisplay(
  individualDiscountInfo,
  isTuesdayToday,
  summaryElement
) {
  // 대량구매 할인 (30개 이상)
  if (getItemCount() >= QUANTITY_THRESHOLDS.BONUS_LARGE) {
    summaryElement.innerHTML += `
      <div class="flex justify-between text-sm tracking-wide text-green-400">
        <span class="text-xs">🎉 대량구매 할인 (30개 이상)</span>
        <span class="text-xs">-${(DISCOUNT_RATES.BULK * 100).toFixed(0)}%</span>
      </div>
    `;
  } else {
    // 개별 상품 할인
    individualDiscountInfo.forEach(function (discountItem) {
      summaryElement.innerHTML += `
        <div class="flex justify-between text-sm tracking-wide text-green-400">
          <span class="text-xs">${discountItem.name} (${QUANTITY_THRESHOLDS.INDIVIDUAL_DISCOUNT}개↑)</span>
          <span class="text-xs">-${discountItem.discountPercent}%</span>
        </div>
      `;
    });
  }

  // 화요일 할인
  if (isTuesdayToday && getTotalAmount() > 0) {
    summaryElement.innerHTML += `
      <div class="flex justify-between text-sm tracking-wide text-purple-400">
        <span class="text-xs">🌟 화요일 추가 할인</span>
        <span class="text-xs">-${(DISCOUNT_RATES.TUESDAY * 100).toFixed(0)}%</span>
      </div>
    `;
  }
}

// ==================== UI 업데이트: 배송비 정보 추가 ====================
export function addShippingInfoToDisplay(summaryElement) {
  summaryElement.innerHTML += `
    <div class="flex justify-between text-sm tracking-wide text-gray-400">
      <span>Shipping</span>
      <span>Free</span>
    </div>
  `;
}

// ==================== UI 업데이트: 총액 표시 업데이트 ====================
export function updateCartTotalDisplay(finalAmount) {
  const totalDisplayElement =
    getTotalDisplayElement().querySelector('.text-2xl');
  if (totalDisplayElement) {
    totalDisplayElement.textContent = formatRoundedPrice(finalAmount);
  }
}

// ==================== UI 업데이트: 장바구니 아이템 수 표시 ====================
export function updateItemCountDisplay(totalQuantity) {
  const itemCountElement = document.getElementById('item-count');
  if (itemCountElement) {
    itemCountElement.textContent = `🛍️ ${totalQuantity} items in cart`;
  }
}

// ==================== UI 업데이트: 재고 경고 메시지 표시 ====================
export function updateStockWarningDisplay() {
  const warningMessage = buildLowStockWarning(getProducts());
  getStockInfoElement().textContent = warningMessage;
}

// ==================== UI 업데이트: 총 할인율 정보 박스 ====================
export function updateTotalDiscountInfoBox(totalDiscountRate, subtotal) {
  const discountInfoElement = document.getElementById('discount-info');
  discountInfoElement.innerHTML = '';

  if (totalDiscountRate > 0 && getTotalAmount() > 0) {
    const savedAmount = subtotal - getTotalAmount();
    discountInfoElement.innerHTML = `
      <div class="bg-green-500/20 rounded-lg p-3">
        <div class="flex justify-between items-center mb-1">
          <span class="text-xs uppercase tracking-wide text-green-400">총 할인율</span>
          <span class="text-sm font-medium text-green-400">${(totalDiscountRate * 100).toFixed(1)}%</span>
        </div>
        <div class="text-2xs text-gray-300">${formatRoundedPrice(savedAmount)} 할인되었습니다</div>
      </div>
    `;
  }
}

// ==================== UI 업데이트: 화요일 특별 배너 ====================
export function updateTuesdaySpecialBanner(isTuesdayToday) {
  const tuesdaySpecialElement = document.getElementById('tuesday-special');

  if (isTuesdayToday && getTotalAmount() > 0) {
    tuesdaySpecialElement.classList.remove('hidden');
  } else {
    tuesdaySpecialElement.classList.add('hidden');
  }
}

// ==================== 포인트 계산 메인 함수 (오케스트레이터) ====================
export function doRenderBonusPoints() {
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

// ==================== 장바구니 가격 업데이트 함수 ====================
export function doUpdatePricesInCart() {
  const cartItems = getCartDisplayElement().children;
  for (let i = 0; i < cartItems.length; i++) {
    const itemId = cartItems[i].id;
    const product = getProductById(itemId);
    if (!product) continue;

    const priceDiv = cartItems[i].querySelector('.text-lg');
    const nameDiv = cartItems[i].querySelector('h3');

    // ---------------- 할인 상태별 가격 표시 (중복 로직) ----------------
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
  handleCalculateCartStuff();
}