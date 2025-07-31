import { DISCOUNT_RATES, TIMER_DELAYS } from '../../../shared/constants';
import type { Product } from '../../../shared/types';

export function findLightningSaleTarget(products: Product[]): Product | null {
  const availableProducts = products.filter(
    (product) => product.stock > 0 && !product.isOnSale
  );

  if (availableProducts.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * availableProducts.length);
  return availableProducts[randomIndex];
}

export function applyLightningSale(product: Product) {
  return {
    product,
    message: `⚡ 번개세일! ${product.name}이 ${DISCOUNT_RATES.LIGHTNING * 100}% 할인 중입니다!`,
    discountRate: DISCOUNT_RATES.LIGHTNING,
  };
}

export function removeLightningSale(product: Product) {
  return {
    product,
    message: `번개세일이 종료되었습니다: ${product.name}`,
  };
}

export class LightningSaleManager {
  private intervalId: NodeJS.Timeout | null = null;
  private currentSaleProductId: string | null = null;

  constructor(
    private getProducts: () => Product[],
    private onApplySale: (productId: string) => void,
    private onRemoveSale: (productId: string) => void,
    private onUpdate?: () => void
  ) {}

  start() {
    if (this.intervalId) return;

    this.intervalId = setInterval(() => {
      this.runLightningSaleCycle();
    }, TIMER_DELAYS.LIGHTNING.INTERVAL);
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

  private runLightningSaleCycle() {
    // 기존 세일 해제
    if (this.currentSaleProductId) {
      this.onRemoveSale(this.currentSaleProductId);
      this.currentSaleProductId = null;
    }

    // 새로운 세일 적용
    const products = this.getProducts();
    const target = findLightningSaleTarget(products);

    if (target) {
      this.onApplySale(target.id);
      this.currentSaleProductId = target.id;

      const saleInfo = applyLightningSale(target);
      console.log(saleInfo.message);
    }

    this.onUpdate?.();
  }
}
