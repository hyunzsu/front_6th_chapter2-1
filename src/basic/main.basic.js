import { initializeAppData } from './core/state.js';
import { createDOMStructure } from './core/dom.js';
import { initializeEvents } from './core/events.js';
import {
  updateSelectOptions,
  updateCartDisplay,
  updateCartPrices,
} from './ui/index.js';
import {
  getProducts,
  getLastSelectedProductId,
} from './core/business-state.js';
import {
  startLightningSaleSystem,
  startSuggestSaleSystem,
} from './services/index.js';

function main() {
  // 앱 데이터 초기화
  initializeAppData();

  // DOM 구조 생성
  createDOMStructure();

  // 초기 UI 업데이트
  updateSelectOptions(); // 상품 목록
  updateCartDisplay(); // 장바구니 계산

  // 이벤트 핸들러 초기화
  initializeEvents();

  // 이벤트 시스템
  // 번개세일
  startLightningSaleSystem(getProducts, () => {
    updateSelectOptions();
    updateCartPrices();
  });
  // 추천할인
  startSuggestSaleSystem(getProducts, getLastSelectedProductId, () => {
    updateSelectOptions();
    updateCartPrices();
  });
}

main();
