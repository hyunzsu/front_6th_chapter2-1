import { getTotalDisplayElement } from '../core/dom-refs.js';

// ==================== 주문 요약 렌더링 로직 ====================

/**
 * 주문 요약 렌더링
 * @param {Object} summaryData - 주문 요약 데이터
 */
export function renderOrderSummary(summaryData) {
  const totalDisplay = getTotalDisplayElement();
  if (!totalDisplay) return;

  const {
    subtotal = 0,
    finalAmount = 0,
    totalDiscountRate = 0,
    bonusPoints = 0,
    isTuesdayToday = false,
    individualDiscountInfo = [],
  } = summaryData;

  // 총액 표시 업데이트
  const totalDiv = totalDisplay.querySelector('.text-2xl');
  if (totalDiv) {
    totalDiv.textContent = `₩${Math.round(finalAmount).toLocaleString()}`;
  }

  // 할인 정보 렌더링
  renderDiscountInfo(individualDiscountInfo, totalDiscountRate);

  // 화요일 특별 할인 표시
  const tuesdaySpecial = document.getElementById('tuesday-special');
  if (tuesdaySpecial) {
    tuesdaySpecial.classList.toggle('hidden', !isTuesdayToday);
  }
}

/**
 * 할인 정보 렌더링
 * @param {Array} individualDiscountInfo - 개별 할인 정보
 * @param {number} totalDiscountRate - 총 할인율
 */
function renderDiscountInfo(individualDiscountInfo, totalDiscountRate) {
  const discountInfo = document.getElementById('discount-info');
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
 * 포인트 렌더링
 * @param {number} finalPoints - 최종 포인트
 * @param {Array} pointsDetails - 포인트 상세 정보
 */
export function renderLoyaltyPoints(finalPoints, pointsDetails) {
  const loyaltyPointsElement = document.getElementById('loyalty-points');

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