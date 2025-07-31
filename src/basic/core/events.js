import {
  getProducts,
  getProductById,
  setLastSelectedProductId,
} from './business-state.js';
import {
  getAddButtonElement,
  getProductSelectElement,
  getCartDisplayElement,
} from './dom-refs.js';
import {
  calculateCartStuff,
  updateSelectOptions,
} from '../controllers/CartController.js';

// ==================== 이벤트 핸들러 초기화 ====================
export function initializeEvents() {
  setupAddButtonHandler();
  setupCartClickHandler();
}

/**
 * 헬프 매뉴얼 이벤트 핸들러 설정
 * @param {HTMLElement} helpToggle - 토글 버튼
 * @param {HTMLElement} helpOverlay - 오버레이
 * @param {HTMLElement} helpColumn - 매뉴얼 컬럼
 */
export function setupHelpManualEvents(helpToggle, helpOverlay, helpColumn) {
  // 토글 버튼 클릭
  helpToggle.onclick = function () {
    helpOverlay.classList.toggle('hidden');
    helpColumn.classList.toggle('translate-x-full');
  };

  // 오버레이 클릭 (외부 영역)
  helpOverlay.onclick = function (e) {
    if (e.target === helpOverlay) {
      helpOverlay.classList.add('hidden');
      helpColumn.classList.add('translate-x-full');
    }
  };

  // 닫기 버튼 클릭
  const closeButton = helpColumn.querySelector('button');
  closeButton.onclick = function () {
    helpOverlay.classList.add('hidden');
    helpColumn.classList.add('translate-x-full');
  };
}

// ==================== 장바구니 추가 버튼 이벤트 핸들러 ====================
function setupAddButtonHandler() {
  getAddButtonElement().addEventListener('click', function () {
    const selItem = getProductSelectElement().value;
    const itemToAdd = getProductById(selItem);

    if (!itemToAdd) return;
    if (itemToAdd.stock <= 0) return;

    const existingItem = document.getElementById(itemToAdd.id);

    // ---------------- 상품 추가 로직 ----------------
    if (existingItem) {
      // 기존 아이템 수량 증가
      const qtyElem = existingItem.querySelector('.quantity-number');
      const currentQty = parseInt(qtyElem.textContent);
      const newQty = currentQty + 1;

      if (newQty > itemToAdd.stock + currentQty) {
        alert('재고가 부족합니다.');
        return;
      }

      qtyElem.textContent = newQty;
      itemToAdd.stock--;
    } else {
      // 새 아이템 생성
      const newItem = document.createElement('div');
      newItem.id = itemToAdd.id;
      newItem.className =
        'grid grid-cols-[80px_1fr_auto] gap-5 py-5 border-b border-gray-100 first:pt-0 last:border-b-0 last:pb-0';

      newItem.innerHTML = `
        <div class="w-20 h-20 bg-gradient-black relative overflow-hidden">
          <div class="absolute top-1/2 left-1/2 w-[60%] h-[60%] bg-white/10 -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
        </div>
        <div>
          <h3 class="text-base font-normal mb-1 tracking-tight">${itemToAdd.isOnSale && itemToAdd.isSuggestedSale ? '⚡💝' : itemToAdd.isOnSale ? '⚡' : itemToAdd.isSuggestedSale ? '💝' : ''}${itemToAdd.name}</h3>
          <p class="text-xs text-gray-500 mb-0.5 tracking-wide">PRODUCT</p>
          <p class="text-xs text-black mb-3">${itemToAdd.isOnSale || itemToAdd.isSuggestedSale ? '<span class="line-through text-gray-400">₩' + itemToAdd.originalPrice.toLocaleString() + '</span> <span class="' + (itemToAdd.isOnSale && itemToAdd.isSuggestedSale ? 'text-purple-600' : itemToAdd.isOnSale ? 'text-red-500' : 'text-blue-500') + '">₩' + itemToAdd.price.toLocaleString() + '</span>' : '₩' + itemToAdd.price.toLocaleString()}</p>
          <div class="flex items-center gap-4">
            <button class="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white" data-product-id="${itemToAdd.id}" data-change="-1">−</button>
            <span class="quantity-number text-sm font-normal min-w-[20px] text-center tabular-nums">1</span>
            <button class="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white" data-product-id="${itemToAdd.id}" data-change="1">+</button>
          </div>
        </div>
        <div class="text-right">
          <div class="text-lg mb-2 tracking-tight tabular-nums">${itemToAdd.isOnSale || itemToAdd.isSuggestedSale ? '<span class="line-through text-gray-400">₩' + itemToAdd.originalPrice.toLocaleString() + '</span> <span class="' + (itemToAdd.isOnSale && itemToAdd.isSuggestedSale ? 'text-purple-600' : itemToAdd.isOnSale ? 'text-red-500' : 'text-blue-500') + '">₩' + itemToAdd.price.toLocaleString() + '</span>' : '₩' + itemToAdd.price.toLocaleString()}</div>
          <a class="remove-item text-2xs text-gray-500 uppercase tracking-wider cursor-pointer transition-colors border-b border-transparent hover:text-black hover:border-black" data-product-id="${itemToAdd.id}">Remove</a>
        </div>
      `;

      getCartDisplayElement().appendChild(newItem);
      itemToAdd.stock--;
    }

    // UI 업데이트 및 마지막 선택 저장
    calculateCartStuff();
    setLastSelectedProductId(selItem);
  });
}

// ==================== 장바구니 클릭 이벤트 핸들러 ====================
function setupCartClickHandler() {
  getCartDisplayElement().addEventListener('click', function (event) {
    const tgt = event.target;

    const prodId = tgt.dataset.productId;
    const itemElem = document.getElementById(prodId);
    const product = getProductById(prodId);

    if (!product) return; // 상품 없으면 즉시 종료

    // 수량 변경 처리
    if (tgt.classList.contains('quantity-change')) {
      const qtyChange = parseInt(tgt.dataset.change);
      const qtyElem = itemElem.querySelector('.quantity-number');
      const currentQty = parseInt(qtyElem.textContent);
      const newQty = currentQty + qtyChange;

      if (newQty <= 0) {
        product.stock += currentQty;
        itemElem.remove();
        calculateCartStuff();
        updateSelectOptions();
        return;
      }

      if (newQty > product.stock + currentQty) {
        alert('재고가 부족합니다.');
        return;
      }

      qtyElem.textContent = newQty;
      product.stock -= qtyChange;
      calculateCartStuff();
      updateSelectOptions();
      return;
    }

    // 아이템 제거 처리
    if (tgt.classList.contains('remove-item')) {
      const qtyElem = itemElem.querySelector('.quantity-number');
      const remQty = parseInt(qtyElem.textContent);
      product.stock += remQty;
      itemElem.remove();
      calculateCartStuff();
      updateSelectOptions();
      return;
    }

    // TODO: 상품 재고가 5개 미만일 때의 특별 처리 로직 추가
    // if (prod && prod.q < 5) {
    // }

    // UI 업데이트
    calculateCartStuff();
    updateSelectOptions();
  });
}
