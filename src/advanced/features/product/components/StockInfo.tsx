import React from 'react';
import { Product } from '../../../shared/types';
import { STOCK_THRESHOLDS } from '../../../shared/constants';

interface StockInfoProps {
  products: Product[];
}

export function StockInfo({ products }: StockInfoProps) {
  const getStockMessage = (): string => {
    const lowStockProducts = products.filter(
      (product) => product.stock > 0 && product.stock <= STOCK_THRESHOLDS.LOW
    );

    const outOfStockProducts = products.filter(
      (product) => product.stock === 0
    );

    if (outOfStockProducts.length > 0) {
      const productNames = outOfStockProducts.map((p) => p.name).join(', ');
      return `⚠️ 품절: ${productNames}`;
    }

    if (lowStockProducts.length > 0) {
      const productNames = lowStockProducts
        .map((p) => `${p.name}(${p.stock}개)`)
        .join(', ');
      return `⚠️ 재고부족: ${productNames}`;
    }

    return '';
  };

  const stockMessage = getStockMessage();

  if (!stockMessage) {
    return null;
  }

  return (
    <div
      id="stock-status"
      className="text-xs text-red-500 mt-3 whitespace-pre-line"
    >
      {stockMessage}
    </div>
  );
}
