import {
  STOCK_THRESHOLDS,
} from './constants/index.js';

import { initializeAppData } from './core/state.js';
import { createDOMStructure } from './core/dom.js';
import {
  renderProductSelector,
  renderOrderSummary,
  renderCartCount,
  renderLoyaltyPoints,
} from './components/index.js';
import {
  getProducts,
  getBonusPoints,
  setBonusPoints,
  getItemCount,
  setItemCount,
  getTotalAmount,
  setTotalAmount,
  getLastSelectedProductId,
  setLastSelectedProductId,
  getProductById,
} from './core/business-state.js';
import {
  getStockInfoElement,
  getProductSelectElement,
  getAddButtonElement,
  getCartDisplayElement,
  getTotalDisplayElement,
} from './core/dom-refs.js';
import {
  calculateCart,
  calculateTotalPoints,
  buildLowStockWarning,
  calculateTotalStock,
  startLightningSaleSystem,
  startSuggestSaleSystem,
} from './services/index.js';

// ==================== 메인 함수 시작 ====================
function main() {
  // ---------------- 앱 데이터 초기화 ----------------
  initializeAppData();

  // ---------------- DOM 구조 생성 ----------------
  createDOMStructure();

  // ---------------- 초기화 완료 ----------------
  // 초기 재고 계산 (사용되지 않는 변수)
  // let initStock = 0;
  // for (let i = 0; i < prodList.length; i++) {
  //   initStock += prodList[i].q;
  // }

  // 초기 UI 업데이트 (불필요한 initStock 계산 제거)
  onUpdateSelectOptions();
  handleCalculateCartStuff();

  // ---------------- 번개세일 시스템 ----------------
  startLightningSaleSystem(getProducts, (saleInfo) => {
    alert(saleInfo.message);
    onUpdateSelectOptions();
    doUpdatePricesInCart();
  });

  // ---------------- 추천할인 시스템 ----------------
  startSuggestSaleSystem(getProducts, getLastSelectedProductId, (saleInfo) => {
    alert(saleInfo.message);
    onUpdateSelectOptions();
    doUpdatePricesInCart();
  });
}

// ==================== 상품 옵션 생성 함수 ====================
// 이 함수는 utils/render.js로 이동되었습니다.

// ==================== 드롭다운 옵션 업데이트 함수 ====================
// 렌더링 함수로 교체됨 - renderProductSelector() 사용
function onUpdateSelectOptions() {
  renderProductSelector();

  // 전체 재고 계산 및 시각적 피드백
  const totalStock = calculateTotalStock(getProducts());

  // 재고 부족 시 시각적 피드백
  getProductSelectElement().style.borderColor =
    totalStock < STOCK_THRESHOLDS.WARNING ? 'orange' : '';
}


// ==================== 장바구니 계산 메인 함수 (오케스트레이터) ====================
function handleCalculateCartStuff() {
  const cartItems = getCartDisplayElement().children;

  // 1. 상태 초기화
  setTotalAmount(0);
  setItemCount(0);

  // 2. 장바구니 전체 계산 (서비스 함수 사용)
  const cartResult = calculateCart(cartItems, getProductById);
  const { subtotal, finalAmount, totalQuantity, totalDiscountRate, isTuesdayToday, individualDiscountInfo } = cartResult;

  // 3. 상태 업데이트
  setTotalAmount(finalAmount);
  setItemCount(totalQuantity);

  // 4. 렌더링 함수를 통한 UI 업데이트
  renderOrderSummary({
    subtotal,
    finalAmount,
    totalDiscountRate,
    bonusPoints: 0, // 포인트는 별도 함수에서 처리
    isTuesdayToday,
    individualDiscountInfo,
  });

  renderCartCount(totalQuantity);
  updateStockWarningDisplay();

  // 5. 포인트 상세 계산 및 표시
  doRenderBonusPoints();
}

// ==================== UI 업데이트: 장바구니 아이템 할인 스타일 적용 ====================
function updateCartItemDiscountStyles(cartItems) {
  for (let i = 0; i < cartItems.length; i++) {
    const quantityElement = cartItems[i].querySelector('.quantity-number');
    const quantity = parseInt(quantityElement.textContent);

    const cartItemElement = cartItems[i];
    const priceElements =
      cartItemElement.querySelectorAll('.text-lg, .text-xs');

    priceElements.forEach(function (priceElement) {
      if (priceElement.classList.contains('text-lg')) {
        const hasIndividualDiscount =
          quantity >= QUANTITY_THRESHOLDS.INDIVIDUAL_DISCOUNT;
        priceElement.style.fontWeight = hasIndividualDiscount
          ? 'bold'
          : 'normal';
      }
    });
  }
}

// ==================== UI 업데이트: 주문 요약 섹션 렌더링 ====================
function renderOrderSummarySection(
  cartItems,
  subtotal,
  individualDiscountInfo,
  totalDiscountRate,
  isTuesdayToday
) {
  const summaryDetailsElement = document.getElementById('summary-details');
  summaryDetailsElement.innerHTML = '';

  if (subtotal === 0) {
    return; // 빈 장바구니일 때는 요약 정보 없음
  }

  // 장바구니 아이템별 요약 추가
  addCartItemsSummaryToDisplay(cartItems, summaryDetailsElement);

  // 소계 추가
  addSubtotalToDisplay(subtotal, summaryDetailsElement);

  // 할인 정보 추가
  addDiscountInfoToDisplay(
    individualDiscountInfo,
    isTuesdayToday,
    summaryDetailsElement
  );

  // 배송비 정보 추가
  addShippingInfoToDisplay(summaryDetailsElement);

  // 총 할인율 박스 업데이트
  updateTotalDiscountInfoBox(totalDiscountRate, subtotal);

  // 화요일 특별 배너 업데이트
  updateTuesdaySpecialBanner(isTuesdayToday);
}

// ==================== UI 업데이트: 장바구니 아이템 요약 추가 ====================
function addCartItemsSummaryToDisplay(cartItems, summaryElement) {
  for (let i = 0; i < cartItems.length; i++) {
    const product = getProductById(cartItems[i].id);
    if (!product) continue;

    const quantityElement = cartItems[i].querySelector('.quantity-number');
    const quantity = parseInt(quantityElement.textContent);
    const itemTotal = product.price * quantity;

    summaryElement.innerHTML += `
      <div class="flex justify-between text-xs tracking-wide text-gray-400">
        <span>${product.name} x ${quantity}</span>
        <span>₩${formatPrice(itemTotal)}</span>
      </div>
    `;
  }
}

// ==================== UI 업데이트: 소계 정보 추가 ====================
function addSubtotalToDisplay(subtotal, summaryElement) {
  summaryElement.innerHTML += `
    <div class="border-t border-white/10 my-3"></div>
    <div class="flex justify-between text-sm tracking-wide">
      <span>Subtotal</span>
      <span>₩${formatPrice(subtotal)}</span>
    </div>
  `;
}

// ==================== UI 업데이트: 할인 정보 추가 ====================
function addDiscountInfoToDisplay(
  individualDiscountInfo,
  isTuesdayToday,
  summaryElement
) {
  // 대량구매 할인 (30개 이상)
  if (getItemCount() >= QUANTITY_THRESHOLDS.BONUS_LARGE) {
    summaryElement.innerHTML += `
      <div class="flex justify-between text-sm tracking-wide text-green-400">
        <span class="text-xs">🎉 대량구매 할인 (30개 이상)</span>
        <span class="text-xs">-${(DISCOUNT_RATES.BULK * 100).toFixed(0)}%</span>
      </div>
    `;
  } else {
    // 개별 상품 할인
    individualDiscountInfo.forEach(function (discountItem) {
      summaryElement.innerHTML += `
        <div class="flex justify-between text-sm tracking-wide text-green-400">
          <span class="text-xs">${discountItem.name} (${QUANTITY_THRESHOLDS.INDIVIDUAL_DISCOUNT}개↑)</span>
          <span class="text-xs">-${discountItem.discountPercent}%</span>
        </div>
      `;
    });
  }

  // 화요일 할인
  if (isTuesdayToday && getTotalAmount() > 0) {
    summaryElement.innerHTML += `
      <div class="flex justify-between text-sm tracking-wide text-purple-400">
        <span class="text-xs">🌟 화요일 추가 할인</span>
        <span class="text-xs">-${(DISCOUNT_RATES.TUESDAY * 100).toFixed(0)}%</span>
      </div>
    `;
  }
}

// ==================== UI 업데이트: 배송비 정보 추가 ====================
function addShippingInfoToDisplay(summaryElement) {
  summaryElement.innerHTML += `
    <div class="flex justify-between text-sm tracking-wide text-gray-400">
      <span>Shipping</span>
      <span>Free</span>
    </div>
  `;
}

// ==================== UI 업데이트: 총액 표시 업데이트 ====================
function updateCartTotalDisplay(finalAmount) {
  const totalDisplayElement =
    getTotalDisplayElement().querySelector('.text-2xl');
  if (totalDisplayElement) {
    totalDisplayElement.textContent = formatRoundedPrice(finalAmount);
  }
}

// ==================== UI 업데이트: 장바구니 아이템 수 표시 ====================
function updateItemCountDisplay(totalQuantity) {
  const itemCountElement = document.getElementById('item-count');
  if (itemCountElement) {
    itemCountElement.textContent = `🛍️ ${totalQuantity} items in cart`;
  }
}

// ==================== UI 업데이트: 재고 경고 메시지 표시 ====================
function updateStockWarningDisplay() {
  const warningMessage = buildLowStockWarning(getProducts());
  getStockInfoElement().textContent = warningMessage;
}

// ==================== UI 업데이트: 총 할인율 정보 박스 ====================
function updateTotalDiscountInfoBox(totalDiscountRate, subtotal) {
  const discountInfoElement = document.getElementById('discount-info');
  discountInfoElement.innerHTML = '';

  if (totalDiscountRate > 0 && getTotalAmount() > 0) {
    const savedAmount = subtotal - getTotalAmount();
    discountInfoElement.innerHTML = `
      <div class="bg-green-500/20 rounded-lg p-3">
        <div class="flex justify-between items-center mb-1">
          <span class="text-xs uppercase tracking-wide text-green-400">총 할인율</span>
          <span class="text-sm font-medium text-green-400">${(totalDiscountRate * 100).toFixed(1)}%</span>
        </div>
        <div class="text-2xs text-gray-300">${formatRoundedPrice(savedAmount)} 할인되었습니다</div>
      </div>
    `;
  }
}

// ==================== UI 업데이트: 화요일 특별 배너 ====================
function updateTuesdaySpecialBanner(isTuesdayToday) {
  const tuesdaySpecialElement = document.getElementById('tuesday-special');

  if (isTuesdayToday && getTotalAmount() > 0) {
    tuesdaySpecialElement.classList.remove('hidden');
  } else {
    tuesdaySpecialElement.classList.add('hidden');
  }
}



// ==================== 포인트 계산 메인 함수 (오케스트레이터) ====================
function doRenderBonusPoints() {
  const cartItems = getCartDisplayElement().children;

  // 빈 장바구니 체크
  if (cartItems.length === 0) {
    document.getElementById('loyalty-points').style.display = 'none';
    return;
  }

  // 포인트 계산 (서비스 함수 사용)
  const pointsResult = calculateTotalPoints(getTotalAmount(), getItemCount(), cartItems, getProductById);
  const { finalPoints, pointsDetails } = pointsResult;

  // 상태 업데이트 및 UI 표시
  setBonusPoints(finalPoints);
  renderLoyaltyPoints(finalPoints, pointsDetails);
}

// ==================== 유틸리티 함수들 ====================

// ==================== 가격 포맷팅 유틸리티 함수들 ====================
function formatPrice(price) {
  return '₩' + price.toLocaleString();
}

function formatRoundedPrice(price) {
  return '₩' + Math.round(price).toLocaleString();
}

// ==================== 장바구니 가격 업데이트 함수 ====================
function doUpdatePricesInCart() {
  const cartItems = getCartDisplayElement().children;
  for (let i = 0; i < cartItems.length; i++) {
    const itemId = cartItems[i].id;
    const product = getProductById(itemId);
    if (!product) continue;

    const priceDiv = cartItems[i].querySelector('.text-lg');
    const nameDiv = cartItems[i].querySelector('h3');

    // ---------------- 할인 상태별 가격 표시 (중복 로직) ----------------
    if (product.isOnSale && product.isSuggestedSale) {
      // 번개세일 + 추천할인
      priceDiv.innerHTML =
        '<span class="line-through text-gray-400">₩' +
        product.originalPrice.toLocaleString() +
        '</span> <span class="text-purple-600">₩' +
        product.price.toLocaleString() +
        '</span>';
      nameDiv.textContent = '⚡💝' + product.name;
    } else if (product.isOnSale) {
      // 번개세일만
      priceDiv.innerHTML =
        '<span class="line-through text-gray-400">₩' +
        product.originalPrice.toLocaleString() +
        '</span> <span class="text-red-500">₩' +
        product.price.toLocaleString() +
        '</span>';
      nameDiv.textContent = '⚡' + product.name;
    } else if (product.isSuggestedSale) {
      // 추천할인만
      priceDiv.innerHTML =
        '<span class="line-through text-gray-400">₩' +
        product.originalPrice.toLocaleString() +
        '</span> <span class="text-blue-500">₩' +
        product.price.toLocaleString() +
        '</span>';
      nameDiv.textContent = '💝' + product.name;
    } else {
      // 일반 가격
      priceDiv.textContent = '₩' + product.price.toLocaleString();
      nameDiv.textContent = product.name;
    }
  }

  // 계산 함수 재호출
  handleCalculateCartStuff();
}

// ==================== 애플리케이션 시작 ====================
main();

// ==================== 이벤트 핸들러들 ====================
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
  handleCalculateCartStuff();
  setLastSelectedProductId(selItem);
});

// ---------------- 장바구니 클릭 이벤트 (수량 변경, 삭제) ----------------
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
      handleCalculateCartStuff();
      onUpdateSelectOptions();
      return;
    }

    if (newQty > product.stock + currentQty) {
      alert('재고가 부족합니다.');
      return;
    }

    qtyElem.textContent = newQty;
    product.stock -= qtyChange;
    handleCalculateCartStuff();
    onUpdateSelectOptions();
    return;
  }

  // 아이템 제거 처리
  if (tgt.classList.contains('remove-item')) {
    const qtyElem = itemElem.querySelector('.quantity-number');
    const remQty = parseInt(qtyElem.textContent);
    product.stock += remQty;
    itemElem.remove();
    handleCalculateCartStuff();
    onUpdateSelectOptions();
    return;
  }

  // TODO: 상품 재고가 5개 미만일 때의 특별 처리 로직 추가
  // if (prod && prod.q < 5) {
  // }

  // UI 업데이트
  handleCalculateCartStuff();
  onUpdateSelectOptions();
});
