import { getProductById } from '../core/business-state.js';
import { getCartDisplayElement } from '../core/dom-refs.js';
import { CartItem } from '../components/CartDisplay.js';

// ==================== 장바구니 렌더링 로직 ====================

/**
 * 장바구니 아이템들을 DOM에 렌더링
 * @param {Array} cartData - 장바구니 데이터
 */
export function renderCartItems(cartData) {
  const cartDisplay = getCartDisplayElement();
  if (!cartDisplay) return;

  if (!cartData || cartData.length === 0) {
    cartDisplay.innerHTML = '';
    return;
  }

  cartDisplay.innerHTML = cartData
    .map((item, index, array) => {
      const product = getProductById(item.id);
      return CartItem(item, product, index, array.length);
    })
    .join('');
}

/**
 * 장바구니 수량 표시 렌더링
 * @param {number} itemCount - 아이템 수량
 */
export function renderCartCount(itemCount) {
  const itemCountElement = document.getElementById('item-count');
  if (itemCountElement) {
    itemCountElement.textContent = `🛍️ ${itemCount} items in cart`;
  }
}