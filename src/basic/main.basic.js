import {
  QUANTITY_THRESHOLDS,
  DISCOUNT_RATES,
  POINT_RATES,
  STOCK_THRESHOLDS,
  TIMER_DELAYS,
  KEYBOARD_ID,
  MOUSE_ID,
  MONITOR_ID,
  HEADPHONE_ID,
  SPEAKER_ID,
  TUESDAY,
} from './constants/index.js';

import { appState, initializeAppData } from './core/state.js';
import { createDOMStructure } from './core/dom.js';
import {
  renderProductSelector,
  renderOrderSummary,
  renderCartCount,
} from './components/index.js';

// ==================== 메인 함수 시작 ====================
function main() {
  // ---------------- 앱 데이터 초기화 ----------------
  initializeAppData();

  // ---------------- DOM 구조 생성 ----------------
  createDOMStructure(appState);

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
  // 문제점: 전역 상태 직접 조작, alert() 남용
  const lightningDelay = Math.random() * TIMER_DELAYS.LIGHTNING.DELAY_MAX;
  setTimeout(() => {
    setInterval(function () {
      const luckyIdx = Math.floor(Math.random() * appState.products.length);
      const luckyItem = appState.products[luckyIdx];

      if (luckyItem.stock > 0 && !luckyItem.isOnSale) {
        luckyItem.price = Math.round(
          luckyItem.originalPrice * (1 - DISCOUNT_RATES.LIGHTNING)
        );
        luckyItem.isOnSale = true;
        alert('⚡번개세일! ' + luckyItem.name + '이(가) 20% 할인 중입니다!');
        onUpdateSelectOptions();
        doUpdatePricesInCart();
      }
    }, TIMER_DELAYS.LIGHTNING.INTERVAL);
  }, lightningDelay);

  // ---------------- 추천할인 시스템 ----------------
  setTimeout(function () {
    setInterval(function () {
      // TODO: 장바구니가 비어있을 때 특별한 프로모션이나 안내 메시지 표시 고려
      // if (cartDisp.children.length === 0) {
      // }

      // 마지막 선택 상품과 다른 상품 추천
      if (appState.lastSelectedProductId) {
        let suggest = null;

        // 추천할 상품 찾기 (복잡한 중첩 조건)
        for (let k = 0; k < appState.products.length; k++) {
          if (appState.products[k].id !== appState.lastSelectedProductId) {
            // 마지막 선택과 다른 상품
            if (appState.products[k].stock > 0) {
              // 재고 있는 상품
              if (!appState.products[k].isSuggestedSale) {
                // 아직 추천할인 적용 안된 상품
                suggest = appState.products[k];
                break;
              }
            }
          }
        }

        // 추천할인 적용
        if (suggest) {
          alert(
            '💝 ' +
              suggest.name +
              '은(는) 어떠세요? 지금 구매하시면 5% 추가 할인!'
          ); // UX 방해
          suggest.price = Math.round(
            suggest.price * (1 - DISCOUNT_RATES.SUGGEST)
          ); // 5% 할인
          suggest.isSuggestedSale = true;
          onUpdateSelectOptions(); // UI 업데이트
          doUpdatePricesInCart(); // 장바구니 가격 업데이트
        }
      }
    }, TIMER_DELAYS.SUGGEST.INTERVAL); // 60초마다 실행
  }, Math.random() * TIMER_DELAYS.SUGGEST.DELAY_MAX); // 0~20초 랜덤 지연
}

// ==================== 상품 옵션 생성 함수 ====================
// 이 함수는 utils/render.js로 이동되었습니다.

// ==================== 드롭다운 옵션 업데이트 함수 ====================
// 렌더링 함수로 교체됨 - renderProductSelector() 사용
function onUpdateSelectOptions() {
  renderProductSelector();

  // 전체 재고 계산 및 시각적 피드백
  let totalStock = 0;
  for (let idx = 0; idx < appState.products.length; idx++) {
    totalStock += appState.products[idx].stock;
  }

  // 재고 부족 시 시각적 피드백
  appState.elements.productSelect.style.borderColor =
    totalStock < STOCK_THRESHOLDS.WARNING ? 'orange' : '';
}

// ==================== 비즈니스 로직: 장바구니 상품별 소계 계산 ====================
function calculateCartItemsSubtotalAndQuantity(cartItems) {
  let subtotal = 0;
  let totalQuantity = 0;
  let discountedTotal = 0;
  const individualDiscountInfo = [];

  for (let i = 0; i < cartItems.length; i++) {
    const product = findProductById(cartItems[i].id);
    if (!product) continue;

    const quantityElement = cartItems[i].querySelector('.quantity-number');
    const quantity = parseInt(quantityElement.textContent);
    const itemSubtotal = product.price * quantity;

    totalQuantity += quantity;
    subtotal += itemSubtotal;

    // 개별 상품 할인 계산
    const discountRate = getIndividualProductDiscountRate(product.id, quantity);
    if (discountRate > 0) {
      individualDiscountInfo.push({
        name: product.name,
        discountPercent: discountRate * 100,
      });
    }

    // 할인 적용된 금액 누적
    discountedTotal += itemSubtotal * (1 - discountRate);
  }

  return {
    subtotal,
    totalQuantity,
    discountedTotal,
    individualDiscountInfo,
  };
}

// ==================== 비즈니스 로직: 상품별 개별 할인율 조회 ====================
function getIndividualProductDiscountRate(productId, quantity) {
  if (quantity < QUANTITY_THRESHOLDS.INDIVIDUAL_DISCOUNT) {
    return 0;
  }

  const productDiscountRates = {
    [KEYBOARD_ID]: DISCOUNT_RATES.PRODUCT.KEYBOARD,
    [MOUSE_ID]: DISCOUNT_RATES.PRODUCT.MOUSE,
    [MONITOR_ID]: DISCOUNT_RATES.PRODUCT.MONITOR_ARM,
    [HEADPHONE_ID]: DISCOUNT_RATES.PRODUCT.LAPTOP_POUCH,
    [SPEAKER_ID]: DISCOUNT_RATES.PRODUCT.SPEAKER,
  };

  return productDiscountRates[productId] || 0;
}

// ==================== 비즈니스 로직: 대량구매 및 화요일 할인 적용 ====================
function applyBulkAndSpecialDiscounts(
  subtotal,
  discountedTotal,
  totalQuantity
) {
  let finalAmount = discountedTotal;
  let totalDiscountRate = 0;

  // 대량구매 할인 (30개 이상) - 개별 할인보다 유리할 때 적용
  if (totalQuantity >= QUANTITY_THRESHOLDS.BONUS_LARGE) {
    const bulkDiscountAmount = subtotal * (1 - DISCOUNT_RATES.BULK);
    if (bulkDiscountAmount < discountedTotal) {
      finalAmount = bulkDiscountAmount;
    }
  }

  // 할인율 계산
  totalDiscountRate = (subtotal - finalAmount) / subtotal;

  // 화요일 추가 할인
  const today = new Date();
  const isTuesdayToday = today.getDay() === TUESDAY;

  if (isTuesdayToday && finalAmount > 0) {
    finalAmount = finalAmount * (1 - DISCOUNT_RATES.TUESDAY);
    totalDiscountRate = 1 - finalAmount / subtotal;
  }

  return {
    finalAmount,
    totalDiscountRate,
    isTuesdayToday,
  };
}

// ==================== 유틸리티: 재고 부족 알림 메시지 생성 ====================
function buildLowStockWarningMessage() {
  const warningMessages = [];

  for (const product of appState.products) {
    if (product.stock < STOCK_THRESHOLDS.LOW) {
      if (product.stock > 0) {
        warningMessages.push(
          `${product.name}: 재고 부족 (${product.stock}개 남음)`
        );
      } else {
        warningMessages.push(`${product.name}: 품절`);
      }
    }
  }

  return warningMessages.join('\n');
}

// ==================== 비즈니스 로직: 전체 포인트 계산 ====================
function calculateTotalBonusPoints(finalAmount, totalQuantity, cartItems) {
  // 1. 기본 포인트 계산
  const basePoints = calculateBasePoints(finalAmount);
  let finalPoints = basePoints;

  // 2. 화요일 배율 적용
  const today = new Date();
  const isTuesday = today.getDay() === TUESDAY;
  if (isTuesday) {
    finalPoints = finalPoints * POINT_RATES.TUESDAY_MULTIPLIER;
  }

  // 3. 세트 구매 보너스
  const productTypes = checkCartProductTypes(cartItems);
  if (
    productTypes.hasKeyboard &&
    productTypes.hasMouse &&
    productTypes.hasMonitor
  ) {
    finalPoints += POINT_RATES.SETS.FULL_SET; // 풀세트 보너스
  } else if (productTypes.hasKeyboard && productTypes.hasMouse) {
    finalPoints += POINT_RATES.SETS.KEYBOARD_MOUSE; // 키보드+마우스 보너스
  }

  // 4. 수량별 보너스
  if (totalQuantity >= QUANTITY_THRESHOLDS.BONUS_LARGE) {
    finalPoints += POINT_RATES.BULK_BONUS.LARGE;
  } else if (totalQuantity >= QUANTITY_THRESHOLDS.BONUS_MEDIUM) {
    finalPoints += POINT_RATES.BULK_BONUS.MEDIUM;
  } else if (totalQuantity >= QUANTITY_THRESHOLDS.BONUS_SMALL) {
    finalPoints += POINT_RATES.BULK_BONUS.SMALL;
  }

  return Math.round(finalPoints);
}

// ==================== 장바구니 계산 메인 함수 (오케스트레이터) ====================
function handleCalculateCartStuff() {
  const cartItems = appState.elements.cartDisplay.children;

  // 1. 상태 초기화
  appState.totalAmount = 0;
  appState.itemCount = 0;

  // 2. 장바구니 아이템별 계산
  const cartSummary = calculateCartItemsSubtotalAndQuantity(cartItems);
  const { subtotal, totalQuantity, discountedTotal, individualDiscountInfo } =
    cartSummary;

  // 3. 대량구매 및 특별 할인 적용
  const finalCalculation = applyBulkAndSpecialDiscounts(
    subtotal,
    discountedTotal,
    totalQuantity
  );
  const { finalAmount, totalDiscountRate, isTuesdayToday } = finalCalculation;

  // 4. 상태 업데이트
  appState.totalAmount = finalAmount;
  appState.itemCount = totalQuantity;

  // 5. 렌더링 함수를 통한 UI 업데이트
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

  // 6. 포인트 상세 계산 및 표시 (기존 함수 사용)
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
    const product = findProductById(cartItems[i].id);
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
  if (appState.itemCount >= QUANTITY_THRESHOLDS.BONUS_LARGE) {
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
  if (isTuesdayToday && appState.totalAmount > 0) {
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
    appState.elements.totalDisplay.querySelector('.text-2xl');
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
  const warningMessage = buildLowStockWarningMessage();
  appState.elements.stockInfo.textContent = warningMessage;
}

// ==================== UI 업데이트: 총 할인율 정보 박스 ====================
function updateTotalDiscountInfoBox(totalDiscountRate, subtotal) {
  const discountInfoElement = document.getElementById('discount-info');
  discountInfoElement.innerHTML = '';

  if (totalDiscountRate > 0 && appState.totalAmount > 0) {
    const savedAmount = subtotal - appState.totalAmount;
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

  if (isTuesdayToday && appState.totalAmount > 0) {
    tuesdaySpecialElement.classList.remove('hidden');
  } else {
    tuesdaySpecialElement.classList.add('hidden');
  }
}

// ==================== 비즈니스 로직: 기본 포인트 계산 ====================
function calculateBasePoints(finalAmount) {
  return Math.floor(finalAmount / 1000); // 1,000원당 1포인트
}

// ==================== 비즈니스 로직: 화요일 포인트 배율 적용 ====================
function applyTuesdayPointsMultiplier(basePoints, isTuesday) {
  if (!isTuesday || basePoints === 0) {
    return { points: basePoints, details: [] };
  }

  const multipliedPoints = basePoints * POINT_RATES.TUESDAY_MULTIPLIER;
  return {
    points: multipliedPoints,
    details: ['화요일 2배'],
  };
}

// ==================== 비즈니스 로직: 세트 구매 상품 타입 확인 ====================
function checkCartProductTypes(cartItems) {
  const productTypes = {
    hasKeyboard: false,
    hasMouse: false,
    hasMonitorArm: false,
  };

  for (const cartItem of cartItems) {
    const product = findProductById(cartItem.id);
    if (!product) continue;

    switch (product.id) {
      case KEYBOARD_ID:
        productTypes.hasKeyboard = true;
        break;
      case MOUSE_ID:
        productTypes.hasMouse = true;
        break;
      case MONITOR_ID:
        productTypes.hasMonitorArm = true;
        break;
    }
  }

  return productTypes;
}

// ==================== 비즈니스 로직: 세트 구매 보너스 계산 ====================
function calculateSetBonusPoints(productTypes) {
  const { hasKeyboard, hasMouse, hasMonitorArm } = productTypes;
  let bonusPoints = 0;
  const bonusDetails = [];

  // 키보드 + 마우스 세트
  if (hasKeyboard && hasMouse) {
    bonusPoints += POINT_RATES.SETS.KEYBOARD_MOUSE;
    bonusDetails.push('키보드+마우스 세트 +50p');
  }

  // 풀세트 (키보드 + 마우스 + 모니터암)
  if (hasKeyboard && hasMouse && hasMonitorArm) {
    bonusPoints += POINT_RATES.SETS.FULL_SET;
    bonusDetails.push('풀세트 구매 +100p');
  }

  return { bonusPoints, bonusDetails };
}

// ==================== 비즈니스 로직: 수량별 보너스 포인트 계산 ====================
function calculateQuantityBonusPoints(totalQuantity) {
  if (totalQuantity >= QUANTITY_THRESHOLDS.BONUS_LARGE) {
    return {
      bonusPoints: POINT_RATES.SETS.FULL_SET,
      bonusDetail: '대량구매(30개+) +100p',
    };
  } else if (totalQuantity >= QUANTITY_THRESHOLDS.BONUS_MEDIUM) {
    return {
      bonusPoints: POINT_RATES.BULK_BONUS.MEDIUM,
      bonusDetail: '대량구매(20개+) +50p',
    };
  } else if (totalQuantity >= QUANTITY_THRESHOLDS.BONUS_SMALL) {
    return {
      bonusPoints: POINT_RATES.BULK_BONUS.SMALL,
      bonusDetail: '대량구매(10개+) +20p',
    };
  }

  return { bonusPoints: 0, bonusDetail: null };
}

// ==================== UI 업데이트: 포인트 정보 표시 ====================
function updateLoyaltyPointsDisplay(finalPoints, pointsDetails) {
  const loyaltyPointsElement = document.getElementById('loyalty-points');

  if (!loyaltyPointsElement) return;

  if (finalPoints > 0) {
    loyaltyPointsElement.innerHTML = `
      <div>적립 포인트: <span class="font-bold">${finalPoints}p</span></div>
      <div class="text-2xs opacity-70 mt-1">${pointsDetails.join(', ')}</div>
    `;
    loyaltyPointsElement.style.display = 'block';
  } else {
    loyaltyPointsElement.textContent = '적립 포인트: 0p';
    loyaltyPointsElement.style.display = 'block';
  }
}

// ==================== 포인트 계산 메인 함수 (오케스트레이터) ====================
function doRenderBonusPoints() {
  const cartItems = appState.elements.cartDisplay.children;

  // 빈 장바구니 체크
  if (cartItems.length === 0) {
    document.getElementById('loyalty-points').style.display = 'none';
    return;
  }

  // 1. 기본 포인트 계산
  const basePoints = calculateBasePoints(appState.totalAmount);
  let finalPoints = basePoints;
  const pointsDetails = [];

  if (basePoints > 0) {
    pointsDetails.push(`기본: ${basePoints}p`);
  }

  // 2. 화요일 배율 적용
  const today = new Date();
  const isTuesday = today.getDay() === TUESDAY;
  const tuesdayResult = applyTuesdayPointsMultiplier(basePoints, isTuesday);
  finalPoints = tuesdayResult.points;
  pointsDetails.push(...tuesdayResult.details);

  // 3. 세트 구매 보너스
  const productTypes = checkCartProductTypes(cartItems);
  const setBonusResult = calculateSetBonusPoints(productTypes);
  finalPoints += setBonusResult.bonusPoints;
  pointsDetails.push(...setBonusResult.bonusDetails);

  // 4. 수량별 보너스
  const quantityBonusResult = calculateQuantityBonusPoints(appState.itemCount);
  finalPoints += quantityBonusResult.bonusPoints;
  if (quantityBonusResult.bonusDetail) {
    pointsDetails.push(quantityBonusResult.bonusDetail);
  }

  // 5. 상태 업데이트 및 UI 표시
  appState.bonusPoints = finalPoints;
  updateLoyaltyPointsDisplay(finalPoints, pointsDetails);
}

// ==================== 유틸리티 함수들 ====================

function findProductById(productId) {
  return appState.products.find((product) => product.id === productId);
}

// ==================== 가격 포맷팅 유틸리티 함수들 ====================
function formatPrice(price) {
  return '₩' + price.toLocaleString();
}

function formatRoundedPrice(price) {
  return '₩' + Math.round(price).toLocaleString();
}

// ==================== 장바구니 가격 업데이트 함수 ====================
function doUpdatePricesInCart() {
  const cartItems = appState.elements.cartDisplay.children;
  for (let i = 0; i < cartItems.length; i++) {
    const itemId = cartItems[i].id;
    const product = findProductById(itemId);
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
appState.elements.addButton.addEventListener('click', function () {
  const selItem = appState.elements.productSelect.value;
  const itemToAdd = findProductById(selItem);

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

    appState.elements.cartDisplay.appendChild(newItem);
    itemToAdd.stock--;
  }

  // UI 업데이트 및 마지막 선택 저장
  handleCalculateCartStuff();
  appState.lastSelectedProductId = selItem;
});

// ---------------- 장바구니 클릭 이벤트 (수량 변경, 삭제) ----------------
appState.elements.cartDisplay.addEventListener('click', function (event) {
  const tgt = event.target;

  const prodId = tgt.dataset.productId;
  const itemElem = document.getElementById(prodId);
  const product = findProductById(prodId);

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
