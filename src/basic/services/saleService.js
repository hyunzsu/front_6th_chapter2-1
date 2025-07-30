import { DISCOUNT_RATES, TIMER_DELAYS } from '../constants/index.js';

// ==================== 세일 시스템 서비스 ====================

/**
 * 번개세일 적용 가능한 상품 찾기
 * @param {Array} products - 상품 목록
 * @returns {Object|null} 세일 대상 상품 또는 null
 */
export function findLightningSaleTarget(products) {
  const availableProducts = products.filter(
    product => product.stock > 0 && !product.isOnSale
  );
  
  if (availableProducts.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * availableProducts.length);
  return availableProducts[randomIndex];
}

/**
 * 번개세일 적용
 * @param {Object} product - 대상 상품
 * @returns {Object} 세일 정보 { product, message }
 */
export function applyLightningSale(product) {
  product.price = Math.round(product.originalPrice * (1 - DISCOUNT_RATES.LIGHTNING));
  product.isOnSale = true;
  
  return {
    product,
    message: `⚡번개세일! ${product.name}이(가) 20% 할인 중입니다!`
  };
}

/**
 * 추천할인 대상 상품 찾기
 * @param {Array} products - 상품 목록
 * @param {string} lastSelectedProductId - 마지막 선택 상품 ID
 * @returns {Object|null} 추천 대상 상품 또는 null
 */
export function findSuggestSaleTarget(products, lastSelectedProductId) {
  if (!lastSelectedProductId) return null;
  
  for (const product of products) {
    const isDifferentProduct = product.id !== lastSelectedProductId;
    const hasStock = product.stock > 0;
    const notAlreadySuggested = !product.isSuggestedSale;
    
    if (isDifferentProduct && hasStock && notAlreadySuggested) {
      return product;
    }
  }
  
  return null;
}

/**
 * 추천할인 적용
 * @param {Object} product - 대상 상품
 * @returns {Object} 추천할인 정보 { product, message }
 */
export function applySuggestSale(product) {
  product.price = Math.round(product.price * (1 - DISCOUNT_RATES.SUGGEST));
  product.isSuggestedSale = true;
  
  return {
    product,
    message: `💝 ${product.name}은(는) 어떠세요? 지금 구매하시면 5% 추가 할인!`
  };
}

/**
 * 번개세일 시스템 시작
 * @param {Function} getProducts - 상품 목록 조회 함수
 * @param {Function} onSaleApplied - 세일 적용 시 콜백
 */
export function startLightningSaleSystem(getProducts, onSaleApplied) {
  const lightningDelay = Math.random() * TIMER_DELAYS.LIGHTNING.DELAY_MAX;
  
  setTimeout(() => {
    setInterval(() => {
      const products = getProducts();
      const target = findLightningSaleTarget(products);
      
      if (target) {
        const saleInfo = applyLightningSale(target);
        onSaleApplied(saleInfo);
      }
    }, TIMER_DELAYS.LIGHTNING.INTERVAL);
  }, lightningDelay);
}

/**
 * 추천할인 시스템 시작
 * @param {Function} getProducts - 상품 목록 조회 함수
 * @param {Function} getLastSelectedProductId - 마지막 선택 상품 ID 조회 함수
 * @param {Function} onSaleApplied - 세일 적용 시 콜백
 */
export function startSuggestSaleSystem(getProducts, getLastSelectedProductId, onSaleApplied) {
  setTimeout(() => {
    setInterval(() => {
      const products = getProducts();
      const lastSelectedId = getLastSelectedProductId();
      const target = findSuggestSaleTarget(products, lastSelectedId);
      
      if (target) {
        const saleInfo = applySuggestSale(target);
        onSaleApplied(saleInfo);
      }
    }, TIMER_DELAYS.SUGGEST.INTERVAL);
  }, Math.random() * TIMER_DELAYS.SUGGEST.DELAY_MAX);
}