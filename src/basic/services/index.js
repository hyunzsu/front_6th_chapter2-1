// ==================== 서비스 레이어 통합 export ====================

// 할인 계산 서비스
export {
  getProductDiscount,
  applyBulkDiscounts,
  isTuesday,
  getDiscountInfo,
} from './discountService.js';

// 포인트 계산 서비스
export {
  calculateBasePoints,
  applyTuesdayBonus,
  checkProductTypes,
  calculateSetBonus,
  calculateQuantityBonus,
  calculateTotalPoints,
} from './pointService.js';

// 장바구니 계산 서비스
export {
  calculateCartSummary,
  calculateCart,
  isCartEmpty,
} from './cartService.js';

// 세일 시스템 서비스
export {
  findLightningSaleTarget,
  applyLightningSale,
  findSuggestSaleTarget,
  applySuggestSale,
  startLightningSaleSystem,
  startSuggestSaleSystem,
} from './saleService.js';

// 재고 관리 서비스
export {
  buildLowStockWarning,
  calculateTotalStock,
  getLowStockProducts,
  getOutOfStockProducts,
  getStockStatus,
  canReduceStock,
  reduceStock,
  restoreStock,
} from './stockService.js';
