// ==================== 장바구니 아이템 HTML 구조 ====================

/**
 * 개별 장바구니 아이템 HTML 구조 생성
 * @param {Object} item - 장바구니 아이템 데이터 {id, quantity}
 * @param {Object} product - 상품 데이터
 * @param {number} index - 아이템 인덱스
 * @param {number} totalLength - 전체 아이템 수
 * @returns {string} HTML 문자열
 */
export function CartItem(item, product, index, totalLength) {
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
