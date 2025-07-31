export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  stock: number;
  isOnSale: boolean;
  isSuggestedSale: boolean;
}

export interface CartItem {
  id: string;
  quantity: number;
}

export interface CartSummary {
  subtotal: number;
  totalQuantity: number;
  discountedTotal: number;
  individualDiscountInfo: DiscountInfo[];
}

export interface DiscountInfo {
  name: string;
  discountPercent: number;
}

export interface CartCalculation {
  subtotal: number;
  finalAmount: number;
  totalQuantity: number;
  totalDiscountRate: number;
  isTuesdayToday: boolean;
  individualDiscountInfo: DiscountInfo[];
}

export interface BulkDiscountResult {
  finalAmount: number;
  totalDiscountRate: number;
  isTuesdayToday: boolean;
}

export interface BusinessState {
  products: Product[];
  bonusPoints: number;
  itemCount: number;
  totalAmount: number;
  lastSelectedProductId: string | null;
}

export interface StockStatus {
  isLow: boolean;
  isWarning: boolean;
  message: string;
}

export interface PromotionService {
  startService: (
    getProducts: () => Product[],
    getLastSelectedProductId?: () => string | null,
    onUpdate?: () => void
  ) => void;
  stopService: () => void;
}
