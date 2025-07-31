import React from 'react';
import type { DiscountInfo } from '../../../shared/types';

interface OrderSummaryProps {
  totalAmount: number;
  bonusPoints: number;
  discountInfo: DiscountInfo[];
  isTuesdaySpecial: boolean;
}

export function OrderSummary({
  totalAmount,
  bonusPoints,
  discountInfo,
  isTuesdaySpecial,
}: OrderSummaryProps) {
  return (
    <section className="bg-black text-white p-8 flex flex-col">
      <h2 className="text-xs font-medium mb-5 tracking-extra-wide uppercase">
        Order Summary
      </h2>

      <div className="flex-1 flex flex-col">
        <div id="summary-details" className="space-y-3">
          {/* 할인 정보 표시 */}
          {discountInfo.length > 0 && (
            <div className="space-y-2">
              {discountInfo.map((info, index) => (
                <div key={index} className="text-xs text-white/80">
                  {info.name}: {info.discountPercent}% 할인
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-auto">
          <div id="discount-info" className="mb-4">
            {/* 추가 할인 정보가 있다면 여기에 */}
          </div>

          <div id="cart-total" className="pt-5 border-t border-white/10">
            <div className="flex justify-between items-baseline">
              <span className="text-sm uppercase tracking-wider">Total</span>
              <div className="text-2xl tracking-tight">
                ₩{totalAmount.toLocaleString()}
              </div>
            </div>
            <div
              id="loyalty-points"
              className="text-xs text-blue-400 mt-2 text-right"
            >
              적립 포인트: {bonusPoints}p
            </div>
          </div>

          {isTuesdaySpecial && (
            <div
              id="tuesday-special"
              className="mt-4 p-3 bg-white/10 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xs">🎉</span>
                <span className="text-xs uppercase tracking-wide">
                  Tuesday Special 10% Applied
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <button className="w-full py-4 bg-white text-black text-sm font-normal uppercase tracking-super-wide cursor-pointer mt-6 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30">
        Proceed to Checkout
      </button>

      <p className="mt-4 text-2xs text-white/60 text-center leading-relaxed">
        Free shipping on all orders.
        <br />
        <span id="points-notice">Earn loyalty points with purchase.</span>
      </p>
    </section>
  );
}
