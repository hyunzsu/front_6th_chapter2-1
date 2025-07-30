import { appState, getProductById } from '../core/state.js';

// ==================== 장바구니 표시 컴포넌트 ====================

// 장바구니 아이템 렌더링
export function renderCartItems(cartData) {
  const cartDisplay = appState.elements.cartDisplay;
  if (!cartDisplay) return;

  if (!cartData || cartData.length === 0) {
    cartDisplay.innerHTML = '';
    return;
  }

  cartDisplay.innerHTML = cartData
    .map((item, index, array) => createCartItemHTML(item, index, array.length))
    .join('');

  // 이벤트 리스너 재설정
  setupCartEventListeners();
}

// 개별 장바구니 아이템 HTML 생성
function createCartItemHTML(item, index, totalLength) {
  const product = getProductById(item.id);
  if (!product) return '';

  const isFirst = index === 0;
  const isLast = index === totalLength - 1;

  return `
    <div class="flex justify-between items-center py-2 ${!isFirst ? 'mt-2' : ''} ${!isLast ? 'border-b border-gray-200' : ''}">
      <div class="flex-1">
        <div class="font-medium text-sm">${product.name}</div>
        <div class="text-xs text-gray-500 mt-1">₩${product.price.toLocaleString()} × ${item.quantity}</div>
      </div>
      <div class="flex items-center gap-2">
        <button class="quantity-change bg-gray-100 text-gray-600 px-2 py-1 text-xs rounded hover:bg-gray-200" 
                data-product-id="${item.id}" data-change="-1">-</button>
        <span class="quantity-number text-sm font-medium w-8 text-center">${item.quantity}</span>
        <button class="quantity-change bg-gray-100 text-gray-600 px-2 py-1 text-xs rounded hover:bg-gray-200" 
                data-product-id="${item.id}" data-change="1">+</button>
        <button class="remove-item bg-red-100 text-red-600 px-3 py-1 text-xs rounded hover:bg-red-200 ml-2" 
                data-product-id="${item.id}">Remove</button>
      </div>
    </div>
  `;
}

// 장바구니 이벤트 리스너 설정
function setupCartEventListeners() {
  const cartDisplay = appState.elements.cartDisplay;
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

// 장바구니 수량 표시 렌더링
export function renderCartCount(itemCount) {
  const itemCountElement = document.getElementById('item-count');
  if (itemCountElement) {
    itemCountElement.textContent = `🛍️ ${itemCount} items in cart`;
  }
}
