import { getProducts } from '../core/business-state.js';
import {
  getProductSelectElement,
  getStockInfoElement,
} from '../core/dom-refs.js';
import { ProductOption } from '../components/ProductSelector.js';

// ==================== 상품 선택 렌더링 로직 ====================

/**
 * 상품 선택 드롭다운 렌더링
 */
export function renderProductSelector() {
  const productSelect = getProductSelectElement();
  if (!productSelect) return;

  // 기존 옵션들 제거
  productSelect.innerHTML = '';

  // 상품 옵션들 추가
  getProducts().forEach((product) => {
    const option = ProductOption(product);
    productSelect.appendChild(option);
  });
}

/**
 * 재고 상태 렌더링
 * @param {string} productId - 상품 ID
 */
export function renderStockStatus(productId) {
  const stockInfo = getStockInfoElement();
  if (!stockInfo) return;

  if (!productId) {
    stockInfo.textContent = '';
    return;
  }

  const product = getProducts().find((p) => p.id === productId);
  if (!product) return;

  if (product.stock === 0) {
    stockInfo.textContent = '재고가 부족합니다.';
    stockInfo.className = 'text-xs text-red-500 mt-3 whitespace-pre-line';
  } else if (product.stock < 5) {
    stockInfo.textContent = `재고 부족: ${product.stock}개 남음`;
    stockInfo.className = 'text-xs text-orange-500 mt-3 whitespace-pre-line';
  } else {
    stockInfo.textContent = `재고: ${product.stock}개`;
    stockInfo.className = 'text-xs text-green-500 mt-3 whitespace-pre-line';
  }
}