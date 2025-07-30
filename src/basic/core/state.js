import {
  KEYBOARD_ID,
  MOUSE_ID,
  MONITOR_ID,
  HEADPHONE_ID,
  SPEAKER_ID,
} from '../constants/index.js';

// ==================== 중앙화된 애플리케이션 상태 (React State 패턴) ====================
export const appState = {
  // 비즈니스 데이터
  products: [], // 상품 목록 배열
  bonusPoints: 0, // 적립 포인트
  itemCount: 0, // 장바구니 총 수량
  totalAmount: 0, // 총 금액
  lastSelectedProductId: null, // 마지막 선택 상품 ID

  // DOM 요소 참조 (리액트에선 useRef로 대체될 예정)
  elements: {
    stockInfo: null, // 재고 정보 표시 DOM 요소
    productSelect: null, // 상품 선택 드롭다운 DOM 요소
    addButton: null, // 추가 버튼 DOM 요소
    cartDisplay: null, // 장바구니 표시 DOM 요소
    totalDisplay: null, // 총액 표시 DOM 요소
  },
};

// ==================== 상품 데이터 초기화 ====================
function initializeProductData() {
  return [
    {
      id: KEYBOARD_ID,
      name: '버그 없애는 키보드',
      price: 10000, // 현재 가격
      originalPrice: 10000, // 원래 가격
      stock: 50, // 재고
      isOnSale: false, // 번개세일 여부
      isSuggestedSale: false, // 추천할인 여부
    },
    {
      id: MOUSE_ID,
      name: '생산성 폭발 마우스',
      price: 20000,
      originalPrice: 20000,
      stock: 30,
      isOnSale: false,
      isSuggestedSale: false,
    },
    {
      id: MONITOR_ID,
      name: '거북목 탈출 모니터암',
      price: 30000,
      originalPrice: 30000,
      stock: 20,
      isOnSale: false,
      isSuggestedSale: false,
    },
    {
      id: HEADPHONE_ID,
      name: '에러 방지 노트북 파우치',
      price: 15000,
      originalPrice: 15000,
      stock: 0,
      isOnSale: false,
      isSuggestedSale: false,
    },
    {
      id: SPEAKER_ID,
      name: '코딩할 때 듣는 Lo-Fi 스피커',
      price: 25000,
      originalPrice: 25000,
      stock: 10,
      isOnSale: false,
      isSuggestedSale: false,
    },
  ];
}

// ==================== 앱 데이터 초기화 ====================
export function initializeAppData() {
  appState.totalAmount = 0;
  appState.itemCount = 0;
  appState.lastSelectedProductId = null;
  appState.bonusPoints = 0;
  appState.products = initializeProductData();
}

// ==================== 상태 접근자 함수들 (React Hooks 패턴) ====================
export function getProducts() {
  return appState.products;
}

export function getProductById(id) {
  return appState.products.find((product) => product.id === id);
}

export function getBonusPoints() {
  return appState.bonusPoints;
}

export function setBonusPoints(points) {
  appState.bonusPoints = points;
}

export function getItemCount() {
  return appState.itemCount;
}

export function setItemCount(count) {
  appState.itemCount = count;
}

export function getTotalAmount() {
  return appState.totalAmount;
}

export function setTotalAmount(amount) {
  appState.totalAmount = amount;
}

export function getLastSelectedProductId() {
  return appState.lastSelectedProductId;
}

export function setLastSelectedProductId(id) {
  appState.lastSelectedProductId = id;
}

export function getElements() {
  return appState.elements;
}
