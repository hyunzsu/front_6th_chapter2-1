import { getProducts } from '../core/state.js';
import { getProductSelectElement, getStockInfoElement } from '../core/dom-refs.js';

// ==================== 상품 선택 컴포넌트 ====================

// 상품 선택 드롭다운 렌더링
export function renderProductSelector() {
  const productSelect = getProductSelectElement();
  if (!productSelect) return;

  // 기존 옵션들 제거
  productSelect.innerHTML = '';

  // 상품 옵션들 추가
  getProducts().forEach((product) => {
    const option = createProductOption(product);
    productSelect.appendChild(option);
  });
}

// 개별 상품 옵션 생성
function createProductOption(item) {
  const opt = document.createElement('option');
  opt.value = item.id;

  let discountText = '';
  if (item.isOnSale) discountText += ' ⚡SALE';
  if (item.isSuggestedSale) discountText += ' 💝추천';

  // Guard clause: 품절 상품
  if (item.stock === 0) {
    opt.textContent =
      item.name + ' - ' + item.price + '원 (품절)' + discountText;
    opt.disabled = true;
    opt.className = 'text-gray-400';
    return opt;
  }

  // 번개세일 + 추천할인
  if (item.isOnSale && item.isSuggestedSale) {
    opt.textContent =
      '⚡💝' +
      item.name +
      ' - ' +
      item.originalPrice +
      '원 → ' +
      item.price +
      '원' +
      discountText;
    opt.className = 'text-red-600 font-bold';
    return opt;
  }

  // 번개세일만
  if (item.isOnSale) {
    opt.textContent =
      '⚡' +
      item.name +
      ' - ' +
      item.originalPrice +
      '원 → ' +
      item.price +
      '원' +
      discountText;
    opt.className = 'text-red-600 font-bold';
    return opt;
  }

  // 추천할인만
  if (item.isSuggestedSale) {
    opt.textContent =
      '💝' +
      item.name +
      ' - ' +
      item.originalPrice +
      '원 → ' +
      item.price +
      '원' +
      discountText;
    opt.className = 'text-blue-600 font-bold';
    return opt;
  }

  // 일반 상품
  opt.textContent = item.name + ' - ' + item.price + '원' + discountText;
  return opt;
}

// 재고 상태 렌더링
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
