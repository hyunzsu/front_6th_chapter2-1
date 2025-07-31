import { DISCOUNT_RATES, TIMER_DELAYS } from '../../../shared/constants';
import type { Product } from '../../../shared/types';

export function findSuggestedSaleTarget(
  products: Product[],
  lastSelectedProductId: string | null
): Product | null {
  if (!lastSelectedProductId) return null;

  const targetProduct = products.find(
    (product) =>
      product.id === lastSelectedProductId &&
      product.stock > 0 &&
      !product.isSuggestedSale
  );

  return targetProduct || null;
}

export function applySuggestedSale(product: Product) {
  return {
    product,
    message: `💝 ${product.name}을 위한 특별 할인이 진행중입니다!`,
    discountRate: DISCOUNT_RATES.SUGGEST,
  };
}

export function removeSuggestedSale(product: Product) {
  return {
    product,
    message: `추천 할인이 종료되었습니다: ${product.name}`,
  };
}

export class SuggestedSaleManager {
  private intervalId: NodeJS.Timeout | null = null;
  private currentSaleProductId: string | null = null;

  constructor(
    private getProducts: () => Product[],
    private getLastSelectedProductId: () => string | null,
    private onApplySale: (productId: string) => void,
    private onRemoveSale: (productId: string) => void,
    private onUpdate?: () => void
  ) {}

  start() {
    if (this.intervalId) return;

    this.intervalId = setInterval(() => {
      this.runSuggestedSaleCycle();
    }, TIMER_DELAYS.SUGGEST.INTERVAL);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.currentSaleProductId) {
      this.onRemoveSale(this.currentSaleProductId);
      this.currentSaleProductId = null;
      this.onUpdate?.();
    }
  }

  private runSuggestedSaleCycle() {
    // 기존 세일 해제
    if (this.currentSaleProductId) {
      this.onRemoveSale(this.currentSaleProductId);
      this.currentSaleProductId = null;
    }

    // 새로운 추천 세일 적용
    const products = this.getProducts();
    const lastSelectedId = this.getLastSelectedProductId();
    const target = findSuggestedSaleTarget(products, lastSelectedId);

    if (target) {
      this.onApplySale(target.id);
      this.currentSaleProductId = target.id;

      const saleInfo = applySuggestedSale(target);
      console.log(saleInfo.message);
    }

    this.onUpdate?.();
  }
}
