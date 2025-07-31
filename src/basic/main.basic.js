import { initializeAppData } from './core/state.js';
import { createDOMStructure } from './core/dom.js';
import { initializeEvents } from './core/events.js';
import {
  onUpdateSelectOptions,
  handleCalculateCartStuff,
  doUpdatePricesInCart,
} from './components/CartUpdater.js';
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
  onUpdateSelectOptions(); // 상품 목록
  handleCalculateCartStuff(); // 장바구니 계산

  // ---------------- 이벤트 핸들러 초기화 ----------------
  initializeEvents();

  // ---------------- 이벤트 시스템 시작 ----------------
  // 번개세일
  startLightningSaleSystem(getProducts, () => {
    onUpdateSelectOptions();
    doUpdatePricesInCart();
  });
  // 추천할인
  startSuggestSaleSystem(getProducts, getLastSelectedProductId, () => {
    onUpdateSelectOptions();
    doUpdatePricesInCart();
  });
}

// ==================== 애플리케이션 시작 ====================
main();
