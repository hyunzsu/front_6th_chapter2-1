// ==================== 렌더러 레이어 통합 export ====================

// 장바구니 렌더러 - 장바구니 DOM 조작
export {
  renderCartItems,
  renderCartCount,
} from './CartRenderer.js';

// 상품 렌더러 - 상품 선택 DOM 조작
export {
  renderProductSelector,
  renderStockStatus,
} from './ProductRenderer.js';

// 주문 렌더러 - 주문 요약 DOM 조작
export {
  renderOrderSummary,
  renderLoyaltyPoints,
} from './OrderRenderer.js';

// UI 렌더러 - 일반 UI 업데이트
export {
  updateSelectOptionsStyle,
  updateCartItemDiscountStyles,
  renderOrderSummarySection,
  addCartItemsSummaryToDisplay,
  addSubtotalToDisplay,
  addDiscountInfoToDisplay,
  addShippingInfoToDisplay,
  updateCartTotalDisplay,
  updateItemCountDisplay,
  updateStockWarningDisplay,
  updateTotalDiscountInfoBox,
  updateTuesdaySpecialBanner,
  updatePricesInCart,
} from './UIRenderer.js';