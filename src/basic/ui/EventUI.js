import { getCartDisplayElement } from '../core/dom-refs.js';

// ==================== 이벤트 UI 관리 ====================

/**
 * 장바구니 이벤트 리스너 설정
 */
export function setupCartEventListeners() {
  const cartDisplay = getCartDisplayElement();
  if (!cartDisplay) return;

  // 수량 변경 버튼들
  cartDisplay.querySelectorAll('.quantity-change').forEach((button) => {
    button.addEventListener('click', (e) => {
      const productId = e.target.dataset.productId;
      const change = parseInt(e.target.dataset.change);
      // 전역 함수 호출 (main.basic.js에 정의된 함수들)
      if (window.handleQuantityChange) {
        window.handleQuantityChange(productId, change);
      }
    });
  });

  // 제거 버튼들
  cartDisplay.querySelectorAll('.remove-item').forEach((button) => {
    button.addEventListener('click', (e) => {
      const productId = e.target.dataset.productId;
      if (window.handleRemoveItem) {
        window.handleRemoveItem(productId);
      }
    });
  });
}
