// ==================== 가격 포맷팅 유틸리티 함수들 ====================
export function formatPrice(price) {
  return '₩' + price.toLocaleString();
}

export function formatRoundedPrice(price) {
  return '₩' + Math.round(price).toLocaleString();
}
