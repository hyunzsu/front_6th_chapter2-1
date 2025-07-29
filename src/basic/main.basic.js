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

// ==================== 전역 변수 선언부 ====================
// 비즈니스 데이터
let prodList; // 상품 목록 배열
let bonusPts = 0; // 적립 포인트
let itemCnt; // 장바구니 총 수량
let totalAmt = 0; // 총 금액
let lastSel; // 마지막 선택 상품 ID

// DOM 요소 참조
let stockInfo; // 재고 정보 표시 DOM 요소
let sel; // 상품 선택 드롭다운 DOM 요소
let addBtn; // 추가 버튼 DOM 요소
let cartDisp; // 장바구니 표시 DOM 요소

// ==================== 메인 함수 시작 ====================
function main() {
  // ---------------- 전역 상태 초기화 ----------------
  totalAmt = 0;
  itemCnt = 0;
  lastSel = null;

  // ---------------- 상품 데이터 하드코딩 ----------------
  prodList = [
    {
      id: KEYBOARD_ID,
      name: '버그 없애는 키보드',
      val: 10000, // 현재 가격 (price가 더 명확)
      originalVal: 10000, // 원래 가격 (originalPrice가 더 명확)
      q: 50, // 재고 (stock이 더 명확)
      onSale: false,
      suggestSale: false,
    },
    {
      id: MOUSE_ID,
      name: '생산성 폭발 마우스',
      val: 20000,
      originalVal: 20000,
      q: 30,
      onSale: false,
      suggestSale: false,
    },
    {
      id: MONITOR_ID,
      name: '거북목 탈출 모니터암',
      val: 30000,
      originalVal: 30000,
      q: 20,
      onSale: false,
      suggestSale: false,
    },
    {
      id: HEADPHONE_ID,
      name: '에러 방지 노트북 파우치',
      val: 15000,
      originalVal: 15000,
      q: 0,
      onSale: false,
      suggestSale: false,
    },
    {
      id: SPEAKER_ID,
      name: '코딩할 때 듣는 Lo-Fi 스피커',
      val: 25000,
      originalVal: 25000,
      q: 10,
      onSale: false,
      suggestSale: false,
    },
  ];

  // ---------------- DOM 구조 생성 시작 ----------------
  const root = document.getElementById('app');

  // ---------------- 헤더 영역 생성 ----------------
  const header = document.createElement('div');
  header.className = 'mb-8';
  header.innerHTML = `
    <h1 class="text-xs font-medium tracking-extra-wide uppercase mb-2">🛒 Hanghae Online Store</h1>
    <div class="text-5xl tracking-tight leading-none">Shopping Cart</div>
    <p id="item-count" class="text-sm text-gray-500 font-normal mt-3">🛍️ 0 items in cart</p>
  `;

  // ---------------- 상품 선택 드롭다운 생성 ----------------
  sel = document.createElement('select');
  sel.id = 'product-select';
  sel.className = 'w-full p-3 border border-gray-300 rounded-lg text-base mb-3';

  // ---------------- 그리드 컨테이너 생성 ----------------
  const gridContainer = document.createElement('div');
  gridContainer.className =
    'grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 flex-1 overflow-hidden';

  // ---------------- 좌측 컬럼 (상품 선택 + 장바구니) ----------------
  const leftColumn = document.createElement('div');
  leftColumn.className = 'bg-white border border-gray-200 p-8 overflow-y-auto';

  // 상품 선택 영역 컨테이너
  const selectorContainer = document.createElement('div');
  selectorContainer.className = 'mb-6 pb-6 border-b border-gray-200';

  // 추가 버튼 생성
  addBtn = document.createElement('button');
  addBtn.id = 'add-to-cart';
  addBtn.innerHTML = 'Add to Cart';
  addBtn.className =
    'w-full py-3 bg-black text-white text-sm font-medium uppercase tracking-wider hover:bg-gray-800 transition-all';

  // 재고 정보 표시 영역
  stockInfo = document.createElement('div');
  stockInfo.id = 'stock-status';
  stockInfo.className = 'text-xs text-red-500 mt-3 whitespace-pre-line';

  // 좌측 컬럼 요소들 조립
  selectorContainer.appendChild(sel);
  selectorContainer.appendChild(addBtn);
  selectorContainer.appendChild(stockInfo);
  leftColumn.appendChild(selectorContainer);

  // 장바구니 표시 영역
  cartDisp = document.createElement('div');
  cartDisp.id = 'cart-items';
  leftColumn.appendChild(cartDisp);

  // ---------------- 우측 컬럼 (주문 요약) ----------------
  const rightColumn = document.createElement('div');
  rightColumn.className = 'bg-black text-white p-8 flex flex-col';
  rightColumn.innerHTML = `
    <h2 class="text-xs font-medium mb-5 tracking-extra-wide uppercase">Order Summary</h2>
    <div class="flex-1 flex flex-col">
      <div id="summary-details" class="space-y-3"></div>
      <div class="mt-auto">
        <div id="discount-info" class="mb-4"></div>
        <div id="cart-total" class="pt-5 border-t border-white/10">
          <div class="flex justify-between items-baseline">
            <span class="text-sm uppercase tracking-wider">Total</span>
            <div class="text-2xl tracking-tight">₩0</div>
          </div>
          <div id="loyalty-points" class="text-xs text-blue-400 mt-2 text-right">적립 포인트: 0p</div>
        </div>
        <div id="tuesday-special" class="mt-4 p-3 bg-white/10 rounded-lg hidden">
          <div class="flex items-center gap-2">
            <span class="text-2xs">🎉</span>
            <span class="text-xs uppercase tracking-wide">Tuesday Special 10% Applied</span>
          </div>
        </div>
      </div>
    </div>
    <button class="w-full py-4 bg-white text-black text-sm font-normal uppercase tracking-super-wide cursor-pointer mt-6 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30">
      Proceed to Checkout
    </button>
    <p class="mt-4 text-2xs text-white/60 text-center leading-relaxed">
      Free shipping on all orders.<br>
      <span id="points-notice">Earn loyalty points with purchase.</span>
    </p>
  `;

  // 총액 표시 요소 참조 획득
  sum = rightColumn.querySelector('#cart-total');

  // ---------------- 사용자 매뉴얼 토글 버튼 ----------------
  const manualToggle = document.createElement('button');
  manualToggle.onclick = function () {
    manualOverlay.classList.toggle('hidden');
    manualColumn.classList.toggle('translate-x-full');
  }; // 문제점: 인라인 이벤트 핸들러
  manualToggle.className =
    'fixed top-4 right-4 bg-black text-white p-3 rounded-full hover:bg-gray-900 transition-colors z-50';
  manualToggle.innerHTML = `
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
  `;

  // ---------------- 매뉴얼 오버레이 ----------------
  const manualOverlay = document.createElement('div');
  manualOverlay.className =
    'fixed inset-0 bg-black/50 z-40 hidden transition-opacity duration-300';
  manualOverlay.onclick = function (e) {
    if (e.target === manualOverlay) {
      manualOverlay.classList.add('hidden');
      manualColumn.classList.add('translate-x-full');
    }
  }; // 문제점: 인라인 이벤트 핸들러

  // ---------------- 매뉴얼 사이드바 ----------------
  const manualColumn = document.createElement('div');
  manualColumn.className =
    'fixed right-0 top-0 h-full w-80 bg-white shadow-2xl p-6 overflow-y-auto z-50 transform translate-x-full transition-transform duration-300';
  manualColumn.innerHTML = `
    <button class="absolute top-4 right-4 text-gray-500 hover:text-black" onclick="document.querySelector('.fixed.inset-0').classList.add('hidden'); this.parentElement.classList.add('translate-x-full')">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </button>
    <h2 class="text-xl font-bold mb-4">📖 이용 안내</h2>
    <!-- 할인 정책 섹션 -->
     <div class="mb-6">
      <h3 class="text-base font-bold mb-3">💰 할인 정책</h3>
      <div class="space-y-3">
      <!-- 개별 상품 할인 -->
        <div class="bg-gray-100 rounded-lg p-3">
          <p class="font-semibold text-sm mb-1">개별 상품</p>
          <p class="text-gray-700 text-xs pl-2">
            • 키보드 10개↑: 10%<br>
            • 마우스 10개↑: 15%<br>
            • 모니터암 10개↑: 20%<br>
            • 스피커 10개↑: 25%
          </p>
        </div>
        <!-- 전체 수량 할인 -->
        <div class="bg-gray-100 rounded-lg p-3">
          <p class="font-semibold text-sm mb-1">전체 수량</p>
          <p class="text-gray-700 text-xs pl-2">• 30개 이상: 25%</p>
        </div>
        <!-- 특별 할인 -->
        <div class="bg-gray-100 rounded-lg p-3">
          <p class="font-semibold text-sm mb-1">특별 할인</p>
          <p class="text-gray-700 text-xs pl-2">
            • 화요일: +10%<br>
            • ⚡번개세일: 20%<br>
            • 💝추천할인: 5%
          </p>
        </div>
      </div>
    </div>
    <!-- 포인트 적립 섹션 -->
    <div class="mb-6">
      <h3 class="text-base font-bold mb-3">🎁 포인트 적립</h3>
      <div class="space-y-3">
        <!-- 기본 적립 -->
        <div class="bg-gray-100 rounded-lg p-3">
          <p class="font-semibold text-sm mb-1">기본</p>
          <p class="text-gray-700 text-xs pl-2">• 구매액의 0.1%</p>
        </div>
        <!-- 추가 적립 -->
        <div class="bg-gray-100 rounded-lg p-3">
          <p class="font-semibold text-sm mb-1">추가</p>
          <p class="text-gray-700 text-xs pl-2">
            • 화요일: 2배<br>
            • 키보드+마우스: +50p<br>
            • 풀세트: +100p<br>
            • 10개↑: +20p / 20개↑: +50p / 30개↑: +100p
          </p>
        </div>
      </div>
    </div>
    <!-- 팁 섹션 -->
    <div class="border-t border-gray-200 pt-4 mt-4">
      <p class="text-xs font-bold mb-1">💡 TIP</p>
      <p class="text-2xs text-gray-600 leading-relaxed">
        • 화요일 대량구매 = MAX 혜택<br>
        • ⚡+💝 중복 가능<br>
        • 상품4 = 품절
      </p>
    </div>
  `; // 문제점: 할인 정책이 하드코딩, 비즈니스 로직과 UI가 혼재

  // ---------------- DOM 트리 조립 ----------------
  gridContainer.appendChild(leftColumn);
  gridContainer.appendChild(rightColumn);
  manualOverlay.appendChild(manualColumn);
  root.appendChild(header);
  root.appendChild(gridContainer);
  root.appendChild(manualToggle);
  root.appendChild(manualOverlay);

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
      const luckyIdx = Math.floor(Math.random() * prodList.length);
      const luckyItem = prodList[luckyIdx];

      if (luckyItem.q > 0 && !luckyItem.onSale) {
        luckyItem.val = Math.round(
          luckyItem.originalVal * (1 - DISCOUNT_RATES.LIGHTNING)
        );
        luckyItem.onSale = true;
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
      if (lastSel) {
        let suggest = null;

        // 추천할 상품 찾기 (복잡한 중첩 조건)
        for (let k = 0; k < prodList.length; k++) {
          if (prodList[k].id !== lastSel) {
            // 마지막 선택과 다른 상품
            if (prodList[k].q > 0) {
              // 재고 있는 상품
              if (!prodList[k].suggestSale) {
                // 아직 추천할인 적용 안된 상품
                suggest = prodList[k];
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
          suggest.val = Math.round(suggest.val * (1 - DISCOUNT_RATES.SUGGEST)); // 5% 할인
          suggest.suggestSale = true;
          onUpdateSelectOptions(); // UI 업데이트
          doUpdatePricesInCart(); // 장바구니 가격 업데이트
        }
      }
    }, TIMER_DELAYS.SUGGEST.INTERVAL); // 60초마다 실행
  }, Math.random() * TIMER_DELAYS.SUGGEST.DELAY_MAX); // 0~20초 랜덤 지연
}

// ==================== 전역 변수 (sum) ====================
let sum; // 총액 표시 DOM 요소 (main 함수에서 초기화)

// ==================== 상품 옵션 생성 함수 ====================
function createProductOption(item) {
  const opt = document.createElement('option');
  opt.value = item.id;

  let discountText = '';
  if (item.onSale) discountText += ' ⚡SALE';
  if (item.suggestSale) discountText += ' 💝추천';

  // Guard clause: 품절 상품
  if (item.q === 0) {
    opt.textContent = item.name + ' - ' + item.val + '원 (품절)' + discountText;
    opt.disabled = true;
    opt.className = 'text-gray-400';
    return opt;
  }

  // 번개세일 + 추천할인
  if (item.onSale && item.suggestSale) {
    opt.textContent =
      '⚡💝' +
      item.name +
      ' - ' +
      item.originalVal +
      '원 → ' +
      item.val +
      '원 (25% SUPER SALE!)';
    opt.className = 'text-purple-600 font-bold';
    return opt;
  }

  // 번개세일만
  if (item.onSale) {
    opt.textContent =
      '⚡' +
      item.name +
      ' - ' +
      item.originalVal +
      '원 → ' +
      item.val +
      '원 (20% SALE!)';
    opt.className = 'text-red-500 font-bold';
    return opt;
  }

  // 추천할인만
  if (item.suggestSale) {
    opt.textContent =
      '💝' +
      item.name +
      ' - ' +
      item.originalVal +
      '원 → ' +
      item.val +
      '원 (5% 추천할인!)';
    opt.className = 'text-blue-500 font-bold';
    return opt;
  }

  // 일반 상품
  opt.textContent = item.name + ' - ' + item.val + '원' + discountText;
  return opt;
}

// ==================== 드롭다운 옵션 업데이트 함수 ====================
function onUpdateSelectOptions() {
  let totalStock = 0;

  sel.innerHTML = '';

  // 전체 재고 계산
  for (let idx = 0; idx < prodList.length; idx++) {
    totalStock += prodList[idx].q;
  }

  // 상품별 옵션 생성
  for (let i = 0; i < prodList.length; i++) {
    const opt = createProductOption(prodList[i]);
    sel.appendChild(opt);
  }

  // 재고 부족 시 시각적 피드백
  sel.style.borderColor = totalStock < STOCK_THRESHOLDS.WARNING ? 'orange' : '';
}

// ==================== 장바구니 계산 메인 함수 ====================
function handleCalculateCartStuff() {
  // ---------------- 지역 변수 선언 ----------------
  const cartItems = cartDisp.children;
  const itemDiscounts = [];
  let subTot = 0;
  let savedAmount;
  let points;
  let previousCount;
  let stockMsg;

  // ---------------- 전역 상태 초기화 ----------------
  totalAmt = 0;
  itemCnt = 0;

  // ---------------- 재고 부족 상품 수집 ----------------
  // for (let idx = 0; idx < prodList.length; idx++) {
  //   if (prodList[idx].q < STOCK_LOW_THRESHOLD && prodList[idx].q > 0) {
  //     lowStockItems.push(prodList[idx].name); // 수집 후 사용되지 않음
  //   }
  // }

  // ---------------- 장바구니 아이템별 계산 ----------------
  for (let i = 0; i < cartItems.length; i++) {
    const curItem = findProductById(cartItems[i].id);
    if (!curItem) continue;

    // 수량 및 기본 계산
    const qtyElem = cartItems[i].querySelector('.quantity-number');
    const q = parseInt(qtyElem.textContent);
    const itemTot = curItem.val * q;
    let disc = 0;

    itemCnt += q;
    subTot += itemTot;

    // ---------------- UI 스타일 업데이트 ----------------
    const itemDiv = cartItems[i];
    const priceElems = itemDiv.querySelectorAll('.text-lg, .text-xs');
    priceElems.forEach(function (elem) {
      if (elem.classList.contains('text-lg')) {
        elem.style.fontWeight =
          q >= QUANTITY_THRESHOLDS.INDIVIDUAL_DISCOUNT ? 'bold' : 'normal';
      }
    });

    // ---------------- 개별 상품 할인 계산 ----------------
    if (q >= QUANTITY_THRESHOLDS.INDIVIDUAL_DISCOUNT) {
      if (curItem.id === KEYBOARD_ID) {
        disc = DISCOUNT_RATES.PRODUCT.KEYBOARD;
      } else if (curItem.id === MOUSE_ID) {
        disc = DISCOUNT_RATES.PRODUCT.MOUSE;
      } else if (curItem.id === MONITOR_ID) {
        disc = DISCOUNT_RATES.PRODUCT.MONITOR_ARM;
      } else if (curItem.id === HEADPHONE_ID) {
        disc = DISCOUNT_RATES.PRODUCT.LAPTOP_POUCH;
      } else if (curItem.id === SPEAKER_ID) {
        disc = DISCOUNT_RATES.PRODUCT.SPEAKER;
      }

      // 할인 정보 수집
      if (disc > 0) {
        itemDiscounts.push({ name: curItem.name, discount: disc * 100 });
      }
    }

    // 할인 적용된 총액 누적
    totalAmt += itemTot * (1 - disc);
  }

  // ---------------- 대량 할인 계산 ----------------
  let discRate = 0;
  const originalTotalAmount = subTot;

  if (itemCnt >= QUANTITY_THRESHOLDS.BONUS_LARGE) {
    totalAmt = subTot * (1 - DISCOUNT_RATES.BULK); // 25% 할인
    discRate = DISCOUNT_RATES.BULK;
  } else {
    discRate = (subTot - totalAmt) / subTot;
  }

  // ---------------- 화요일 할인 ----------------
  const today = new Date();
  const isTuesday = today.getDay() === TUESDAY;
  const tuesdaySpecial = document.getElementById('tuesday-special');

  if (isTuesday) {
    if (totalAmt > 0) {
      totalAmt = totalAmt * (1 - DISCOUNT_RATES.TUESDAY); // 10% 추가 할인
      discRate = 1 - totalAmt / originalTotalAmount;
      tuesdaySpecial.classList.remove('hidden');
    } else {
      tuesdaySpecial.classList.add('hidden');
    }
  } else {
    tuesdaySpecial.classList.add('hidden');
  }

  // ---------------- 장바구니 아이템 수 업데이트 ----------------
  document.getElementById('item-count').textContent =
    '🛍️ ' + itemCnt + ' items in cart';

  // ---------------- 주문 요약 HTML 생성 ----------------
  const summaryDetails = document.getElementById('summary-details');
  summaryDetails.innerHTML = '';

  if (subTot > 0) {
    // 아이템별 요약 생성
    for (let i = 0; i < cartItems.length; i++) {
      const curItem = findProductById(cartItems[i].id);
      if (!curItem) continue;

      const qtyElem = cartItems[i].querySelector('.quantity-number');
      const q = parseInt(qtyElem.textContent);
      const itemTotal = curItem.val * q;

      summaryDetails.innerHTML += `
        <div class="flex justify-between text-xs tracking-wide text-gray-400">
          <span>${curItem.name} x ${q}</span>
          <span>₩${formatPrice(itemTotal)}</span>
        </div>
      `;
    }

    // 소계 추가
    summaryDetails.innerHTML += `
      <div class="border-t border-white/10 my-3"></div>
      <div class="flex justify-between text-sm tracking-wide">
        <span>Subtotal</span>
        <span>₩${formatPrice(subTot)}</span>
      </div>
    `;

    // ---------------- 할인 정보 표시 ----------------
    // 대량 할인
    if (itemCnt >= QUANTITY_THRESHOLDS.BONUS_LARGE) {
      summaryDetails.innerHTML += `
        <div class="flex justify-between text-sm tracking-wide text-green-400">
          <span class="text-xs">🎉 대량구매 할인 (30개 이상)</span>
          <span class="text-xs">-${(DISCOUNT_RATES.BULK * 100).toFixed(0)}%</span>
        </div>
      `;
    } else if (itemDiscounts.length > 0) {
      // 개별 상품 할인
      itemDiscounts.forEach(function (item) {
        summaryDetails.innerHTML += `
          <div class="flex justify-between text-sm tracking-wide text-green-400">
            <span class="text-xs">${item.name} (${QUANTITY_THRESHOLDS.INDIVIDUAL_DISCOUNT}개↑)</span>
            <span class="text-xs">-${item.discount}%</span>
          </div>
        `;
      });
    }

    // 화요일 할인 표시
    if (isTuesday) {
      if (totalAmt > 0) {
        summaryDetails.innerHTML += `
          <div class="flex justify-between text-sm tracking-wide text-purple-400">
            <span class="text-xs">🌟 화요일 추가 할인</span>
            <span class="text-xs">-${(DISCOUNT_RATES.TUESDAY * 100).toFixed(0)}%</span>
          </div>
        `;
      }
    }

    // 배송비 표시
    summaryDetails.innerHTML += `
      <div class="flex justify-between text-sm tracking-wide text-gray-400">
        <span>Shipping</span>
        <span>Free</span>
      </div>
    `;
  }

  // ---------------- 총액 표시 업데이트 ----------------
  const totalDiv = sum.querySelector('.text-2xl');
  if (totalDiv) {
    totalDiv.textContent = formatRoundedPrice(totalAmt);
  }

  // ---------------- 기본 포인트 표시 ----------------
  const loyaltyPointsDiv = document.getElementById('loyalty-points');
  if (loyaltyPointsDiv) {
    points = Math.floor(totalAmt * POINT_RATES.BASE_RATE); // 0.1% 적립률
    if (points > 0) {
      loyaltyPointsDiv.textContent = '적립 포인트: ' + points + 'p';
      loyaltyPointsDiv.style.display = 'block';
    } else {
      loyaltyPointsDiv.textContent = '적립 포인트: 0p';
      loyaltyPointsDiv.style.display = 'block';
    }
  }

  // ---------------- 할인 정보 박스 생성 ----------------
  const discountInfoDiv = document.getElementById('discount-info');
  discountInfoDiv.innerHTML = '';

  if (discRate > 0 && totalAmt > 0) {
    savedAmount = originalTotalAmount - totalAmt;
    discountInfoDiv.innerHTML = `
      <div class="bg-green-500/20 rounded-lg p-3">
        <div class="flex justify-between items-center mb-1">
          <span class="text-xs uppercase tracking-wide text-green-400">총 할인율</span>
          <span class="text-sm font-medium text-green-400">${(discRate * 100).toFixed(1)}%</span>
        </div>
        <div class="text-2xs text-gray-300">${formatRoundedPrice(savedAmount)} 할인되었습니다</div>
      </div>
    `;
  }

  // ---------------- 아이템 수 변경 감지 ----------------
  const itemCountElement = document.getElementById('item-count');
  if (itemCountElement) {
    previousCount = parseInt(itemCountElement.textContent.match(/\d+/) || 0);
    itemCountElement.textContent = '🛍️ ' + itemCnt + ' items in cart';
    if (previousCount !== itemCnt) {
      itemCountElement.setAttribute('data-changed', 'true');
    }
  }

  // ---------------- 재고 상태 메시지 생성 ----------------
  stockMsg = '';
  for (let stockIdx = 0; stockIdx < prodList.length; stockIdx++) {
    const item = prodList[stockIdx];
    if (item.q < STOCK_THRESHOLDS.LOW) {
      if (item.q > 0) {
        stockMsg =
          stockMsg + item.name + ': 재고 부족 (' + item.q + '개 남음)\n';
      } else {
        stockMsg = stockMsg + item.name + ': 품절\n';
      }
    }
  }
  stockInfo.textContent = stockMsg;

  // ---------------- 다른 함수 호출 ----------------
  handleStockInfoUpdate(); // 재고 정보 업데이트 (중복 로직)
  doRenderBonusPoints(); // 보너스 포인트 계산 및 표시
}

// ==================== 보너스 포인트 계산 함수 ====================
const doRenderBonusPoints = function () {
  let finalPoints;
  let hasKeyboard;
  let hasMouse;
  let hasMonitorArm;

  // ---------------- 빈 장바구니 처리 ----------------
  if (cartDisp.children.length === 0) {
    document.getElementById('loyalty-points').style.display = 'none';
    return;
  }

  // ---------------- 기본 포인트 계산 ----------------
  const basePoints = Math.floor(totalAmt / 1000);
  finalPoints = 0;
  const pointsDetail = [];

  if (basePoints > 0) {
    finalPoints = basePoints;
    pointsDetail.push('기본: ' + basePoints + 'p');
  }

  // ---------------- 화요일 2배 적립 ----------------
  if (new Date().getDay() === TUESDAY) {
    if (basePoints > 0) {
      finalPoints = basePoints * POINT_RATES.TUESDAY_MULTIPLIER;
      pointsDetail.push('화요일 2배');
    }
  }

  // ---------------- 세트 구매 보너스 확인 ----------------
  hasKeyboard = false;
  hasMouse = false;
  hasMonitorArm = false;
  const nodes = cartDisp.children;

  // 장바구니에서 상품 타입 확인
  for (const node of nodes) {
    const product = findProductById(node.id);
    if (!product) continue;

    // 상품 타입별 플래그 설정
    if (product.id === KEYBOARD_ID) {
      hasKeyboard = true;
    } else if (product.id === MOUSE_ID) {
      hasMouse = true;
    } else if (product.id === MONITOR_ID) {
      hasMonitorArm = true;
    }
  }

  // ---------------- 세트 보너스 적용 ----------------
  if (hasKeyboard && hasMouse) {
    finalPoints = finalPoints + POINT_RATES.SETS.KEYBOARD_MOUSE;
    pointsDetail.push('키보드+마우스 세트 +50p');
  }

  if (hasKeyboard && hasMouse && hasMonitorArm) {
    finalPoints = finalPoints + POINT_RATES.SETS.FULL_SET;
    pointsDetail.push('풀세트 구매 +100p');
  }

  // ---------------- 수량별 보너스 (중첩 if-else) ----------------
  if (itemCnt >= QUANTITY_THRESHOLDS.BONUS_LARGE) {
    finalPoints = finalPoints + POINT_RATES.SETS.FULL_SET;
    pointsDetail.push('대량구매(30개+) +100p');
  } else if (itemCnt >= QUANTITY_THRESHOLDS.BONUS_MEDIUM) {
    finalPoints = finalPoints + POINT_RATES.BULK_BONUS.MEDIUM;
    pointsDetail.push('대량구매(20개+) +50p');
  } else if (itemCnt >= QUANTITY_THRESHOLDS.BONUS_SMALL) {
    finalPoints = finalPoints + POINT_RATES.BULK_BONUS.SMALL;
    pointsDetail.push('대량구매(10개+) +20p');
  }

  // ---------------- 전역 상태 업데이트 및 UI 표시 ----------------
  bonusPts = finalPoints;
  const ptsTag = document.getElementById('loyalty-points');

  if (ptsTag) {
    if (bonusPts > 0) {
      ptsTag.innerHTML =
        '<div>적립 포인트: <span class="font-bold">' +
        bonusPts +
        'p</span></div>' +
        '<div class="text-2xs opacity-70 mt-1">' +
        pointsDetail.join(', ') +
        '</div>';
      ptsTag.style.display = 'block';
    } else {
      ptsTag.textContent = '적립 포인트: 0p';
      ptsTag.style.display = 'block';
    }
  }
};

// ==================== 유틸리티 함수들 ====================
// function onGetStockTotal() {
//   let totalStock = 0;

//   for (let i = 0; i < prodList.length; i++) {
//     const currentProduct = prodList[i];
//     totalStock += currentProduct.q;
//   }
//   return totalStock;
// }

function findProductById(productId) {
  return prodList.find((product) => product.id === productId);
}

// ==================== 가격 포맷팅 유틸리티 함수들 ====================
function formatPrice(price) {
  return '₩' + price.toLocaleString();
}

function formatRoundedPrice(price) {
  return '₩' + Math.round(price).toLocaleString();
}

const handleStockInfoUpdate = function () {
  let infoMsg = '';
  // const totalStock = onGetStockTotal();

  // TODO: 전체 재고가 부족할 때의 알림 로직 추가 필요
  // if (totalStock < 30) {
  // }

  // 재고 부족/품절 메시지 생성 (handleCalculateCartStuff와 중복)
  prodList.forEach(function (item) {
    if (item.q < STOCK_THRESHOLDS.LOW) {
      if (item.q > 0) {
        infoMsg = infoMsg + item.name + ': 재고 부족 (' + item.q + '개 남음)\n';
      } else {
        infoMsg = infoMsg + item.name + ': 품절\n';
      }
    }
  });

  stockInfo.textContent = infoMsg;
};

// ==================== 장바구니 가격 업데이트 함수 ====================
function doUpdatePricesInCart() {
  const cartItems = cartDisp.children;
  for (let i = 0; i < cartItems.length; i++) {
    const itemId = cartItems[i].id;
    const product = findProductById(itemId);
    if (!product) continue;

    const priceDiv = cartItems[i].querySelector('.text-lg');
    const nameDiv = cartItems[i].querySelector('h3');

    // ---------------- 할인 상태별 가격 표시 (중복 로직) ----------------
    if (product.onSale && product.suggestSale) {
      // 번개세일 + 추천할인
      priceDiv.innerHTML =
        '<span class="line-through text-gray-400">₩' +
        product.originalVal.toLocaleString() +
        '</span> <span class="text-purple-600">₩' +
        product.val.toLocaleString() +
        '</span>';
      nameDiv.textContent = '⚡💝' + product.name;
    } else if (product.onSale) {
      // 번개세일만
      priceDiv.innerHTML =
        '<span class="line-through text-gray-400">₩' +
        product.originalVal.toLocaleString() +
        '</span> <span class="text-red-500">₩' +
        product.val.toLocaleString() +
        '</span>';
      nameDiv.textContent = '⚡' + product.name;
    } else if (product.suggestSale) {
      // 추천할인만
      priceDiv.innerHTML =
        '<span class="line-through text-gray-400">₩' +
        product.originalVal.toLocaleString() +
        '</span> <span class="text-blue-500">₩' +
        product.val.toLocaleString() +
        '</span>';
      nameDiv.textContent = '💝' + product.name;
    } else {
      // 일반 가격
      priceDiv.textContent = '₩' + product.val.toLocaleString();
      nameDiv.textContent = product.name;
    }
  }

  // 계산 함수 재호출
  handleCalculateCartStuff();
}

// ==================== 애플리케이션 시작 ====================
main();

// ==================== 이벤트 핸들러들 ====================
addBtn.addEventListener('click', function () {
  const selItem = sel.value;
  const itemToAdd = findProductById(selItem);

  if (!itemToAdd) return;
  if (itemToAdd.q <= 0) return;

  const existingItem = document.getElementById(itemToAdd.id);

  // ---------------- 상품 추가 로직 ----------------
  if (existingItem) {
    // 기존 아이템 수량 증가
    const qtyElem = existingItem.querySelector('.quantity-number');
    const currentQty = parseInt(qtyElem.textContent);
    const newQty = currentQty + 1;

    if (newQty > itemToAdd.q + currentQty) {
      alert('재고가 부족합니다.');
      return;
    }

    qtyElem.textContent = newQty;
    itemToAdd.q--;
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
        <h3 class="text-base font-normal mb-1 tracking-tight">${itemToAdd.onSale && itemToAdd.suggestSale ? '⚡💝' : itemToAdd.onSale ? '⚡' : itemToAdd.suggestSale ? '💝' : ''}${itemToAdd.name}</h3>
        <p class="text-xs text-gray-500 mb-0.5 tracking-wide">PRODUCT</p>
        <p class="text-xs text-black mb-3">${itemToAdd.onSale || itemToAdd.suggestSale ? '<span class="line-through text-gray-400">₩' + itemToAdd.originalVal.toLocaleString() + '</span> <span class="' + (itemToAdd.onSale && itemToAdd.suggestSale ? 'text-purple-600' : itemToAdd.onSale ? 'text-red-500' : 'text-blue-500') + '">₩' + itemToAdd.val.toLocaleString() + '</span>' : '₩' + itemToAdd.val.toLocaleString()}</p>
        <div class="flex items-center gap-4">
          <button class="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white" data-product-id="${itemToAdd.id}" data-change="-1">−</button>
          <span class="quantity-number text-sm font-normal min-w-[20px] text-center tabular-nums">1</span>
          <button class="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white" data-product-id="${itemToAdd.id}" data-change="1">+</button>
        </div>
      </div>
      <div class="text-right">
        <div class="text-lg mb-2 tracking-tight tabular-nums">${itemToAdd.onSale || itemToAdd.suggestSale ? '<span class="line-through text-gray-400">₩' + itemToAdd.originalVal.toLocaleString() + '</span> <span class="' + (itemToAdd.onSale && itemToAdd.suggestSale ? 'text-purple-600' : itemToAdd.onSale ? 'text-red-500' : 'text-blue-500') + '">₩' + itemToAdd.val.toLocaleString() + '</span>' : '₩' + itemToAdd.val.toLocaleString()}</div>
        <a class="remove-item text-2xs text-gray-500 uppercase tracking-wider cursor-pointer transition-colors border-b border-transparent hover:text-black hover:border-black" data-product-id="${itemToAdd.id}">Remove</a>
      </div>
    `;

    cartDisp.appendChild(newItem);
    itemToAdd.q--;
  }

  // UI 업데이트 및 마지막 선택 저장
  handleCalculateCartStuff();
  lastSel = selItem;
});

// ---------------- 장바구니 클릭 이벤트 (수량 변경, 삭제) ----------------
cartDisp.addEventListener('click', function (event) {
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
      product.q += currentQty;
      itemElem.remove();
      handleCalculateCartStuff();
      onUpdateSelectOptions();
      return;
    }

    if (newQty > product.q + currentQty) {
      alert('재고가 부족합니다.');
      return;
    }

    qtyElem.textContent = newQty;
    product.q -= qtyChange;
    handleCalculateCartStuff();
    onUpdateSelectOptions();
    return;
  }

  // 아이템 제거 처리
  if (tgt.classList.contains('remove-item')) {
    const qtyElem = itemElem.querySelector('.quantity-number');
    const remQty = parseInt(qtyElem.textContent);
    product.q += remQty;
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
