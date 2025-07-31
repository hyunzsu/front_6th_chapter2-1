import { initializeAppData } from './core/state.js';
import { createDOMStructure } from './core/dom.js';
import { initializeEvents } from './core/events.js';
import {
  updateSelectOptions,
  calculateCartStuff,
  updatePricesInCart,
} from './controllers/CartController.js';
import {
  getProducts,
  getLastSelectedProductId,
} from './core/business-state.js';
import {
  startLightningSaleSystem,
  startSuggestSaleSystem,
} from './services/index.js';

// ==================== 메인 함수 시작 ====================
function main() {
  // ---------------- 앱 데이터 초기화 ----------------
  initializeAppData();

  // ---------------- DOM 구조 생성 ----------------
  createDOMStructure();

  // ---------------- 초기 UI 업데이트 ----------------
  updateSelectOptions(); // 상품 목록
  calculateCartStuff(); // 장바구니 계산

  // ---------------- 이벤트 핸들러 초기화 ----------------
  initializeEvents();

  // ---------------- 이벤트 시스템 시작 ----------------
  // 번개세일
  startLightningSaleSystem(getProducts, () => {
    updateSelectOptions();
    updatePricesInCart();
  });
  // 추천할인
  startSuggestSaleSystem(getProducts, getLastSelectedProductId, () => {
    updateSelectOptions();
    updatePricesInCart();
  });
}

// ==================== 애플리케이션 시작 ====================
main();
