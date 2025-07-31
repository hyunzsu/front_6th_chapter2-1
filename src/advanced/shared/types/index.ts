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

export interface AppState {
  products: Product[];
  cartItems: CartItem[];
  selectedProductId: string;
  bonusPoints: number;
  itemCount: number;
  totalAmount: number;
  subtotal: number;
  lastSelectedProductId: string | null;
  discountInfo: DiscountInfo[];
  isTuesdaySpecial: boolean;
}

export type AppAction =
  | { type: 'SELECT_PRODUCT'; payload: string }
  | { type: 'ADD_TO_CART'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'APPLY_LIGHTNING_SALE'; payload: string }
  | { type: 'APPLY_SUGGESTED_SALE'; payload: string }
  | { type: 'RESET_PROMOTIONS'; payload: string }
  | { type: 'CALCULATE_TOTALS' };

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
