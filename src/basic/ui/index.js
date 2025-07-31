// ==================== UI 레이어 통합 export ====================

// 장바구니 UI 관리
export {
  renderCartItems,
  renderCartCount,
  updateCartDisplay,
  updateCartPrices,
} from './CartUI.js';

// 상품 UI 관리
export {
  renderProductSelector,
  renderStockStatus,
  updateSelectOptions,
} from './ProductUI.js';

// 이벤트 UI 관리
export { setupCartEventListeners } from './EventUI.js';
