import {
  getCartDisplayElement,
  getItemCountElement,
  getTotalDisplayElement,
  getDiscountInfoElement,
  getLoyaltyPointsElement,
  getTuesdaySpecialElement,
} from '../../shared/core/dom-refs.js';
import { CartItem } from './components/CartItem.js';
import { formatRoundedPrice } from '../../shared/utils/formatters.js';

/**
 * 장바구니 아이템들을 DOM에 렌더링
 */
export function renderCartItems(cartData, getProductById) {
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
 * 주문 요약 UI 업데이트
 */
export function renderOrderSummary(summaryData) {
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
  renderDiscountInfo(individualDiscountInfo, totalDiscountRate);

  // 화요일 특별 할인 표시
  const tuesdaySpecial = getTuesdaySpecialElement();
  if (tuesdaySpecial) {
    tuesdaySpecial.classList.toggle('hidden', !isTuesdayToday);
  }
}

/**
 * 할인 정보 표시 업데이트
 */
function renderDiscountInfo(individualDiscountInfo, totalDiscountRate) {
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
 * 포인트 표시 업데이트
 */
export function renderLoyaltyPoints(finalPoints, pointsDetails) {
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
 * 빈 장바구니 시 포인트 숨기기
 */
export function hideLoyaltyPoints() {
  const loyaltyPointsElement = getLoyaltyPointsElement();
  if (loyaltyPointsElement) {
    loyaltyPointsElement.style.display = 'none';
  }
}
