import { getTotalDisplayElement } from '../core/dom-refs.js';

// ==================== 주문 요약 컴포넌트 ====================

// 주문 요약 렌더링
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

// 할인 정보 렌더링
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
