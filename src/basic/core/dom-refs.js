// ==================== DOM 요소 참조 관리 (React useRef 패턴) ====================

/**
 * DOM 요소 참조 저장소
 * React로 전환 시 useRef 훅으로 대체될 예정
 */
export const domRefs = {
  stockInfo: null, // 재고 정보 표시 DOM 요소
  productSelect: null, // 상품 선택 드롭다운 DOM 요소
  addButton: null, // 추가 버튼 DOM 요소
  cartDisplay: null, // 장바구니 표시 DOM 요소
  totalDisplay: null, // 총액 표시 DOM 요소
};

/**
 * DOM 요소 참조 초기화
 * React에서는 useEffect에서 ref 설정하는 것과 동일한 역할
 */
export function initializeDOMReferences() {
  domRefs.stockInfo = document.getElementById('stock-status');
  domRefs.productSelect = document.getElementById('product-select');
  domRefs.addButton = document.getElementById('add-to-cart');
  domRefs.cartDisplay = document.getElementById('cart-items');
  domRefs.totalDisplay = document.getElementById('cart-total');
}

/**
 * DOM 요소 참조 접근자 함수들
 * React에서는 ref.current로 접근하는 것과 동일한 패턴
 */
export function getStockInfoElement() {
  return domRefs.stockInfo;
}

export function getProductSelectElement() {
  return domRefs.productSelect;
}

export function getAddButtonElement() {
  return domRefs.addButton;
}

export function getCartDisplayElement() {
  return domRefs.cartDisplay;
}

export function getTotalDisplayElement() {
  return domRefs.totalDisplay;
}