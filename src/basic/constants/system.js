// ==================== 시스템 설정 상수 ====================

// 재고 관리
export const STOCK_THRESHOLDS = {
  LOW: 5, // 재고 부족 기준
  WARNING: 50, // 재고 경고 기준
};

// 타이머 설정
export const TIMER_DELAYS = {
  LIGHTNING: {
    DELAY_MAX: 10000, // 최대 지연 (ms)
    INTERVAL: 30000, // 간격 (30초)
  },
  SUGGEST: {
    DELAY_MAX: 20000, // 최대 지연 (ms)
    INTERVAL: 60000, // 간격 (60초)
  },
};

// 시스템 상수
export const TUESDAY = 2;

// 통화 및 포맷
export const CURRENCY_SYMBOL = '₩';

// 기본 메시지
export const DEFAULT_MESSAGES = {
  EMPTY_CART: '🛍️ 0 items in cart',
  STOCK_SHORTAGE: '재고가 부족합니다.',
  LIGHTNING_SALE: '⚡번개세일!',
  SUGGEST_SALE: '💝 추천할인',
};
