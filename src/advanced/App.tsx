import React from 'react';
import {
  Header,
  MainGrid,
  LeftColumn,
  HelpToggleButton,
} from './shared/components';
import {
  ProductPanel,
  ProductSelect,
  AddToCartButton,
  StockInfo,
} from './features/product/components';

function App() {
  // 임시 상태 (나중에 실제 상태관리로 교체)
  const itemCount = 0;
  const products = [
    {
      id: 'p1',
      name: '버그 없애는 키보드',
      price: 10000,
      originalPrice: 10000,
      stock: 50,
      isOnSale: false,
      isSuggestedSale: false,
    },
    {
      id: 'p2',
      name: '생산성 폭발 마우스',
      price: 20000,
      originalPrice: 20000,
      stock: 30,
      isOnSale: false,
      isSuggestedSale: false,
    },
    {
      id: 'p3',
      name: '거북목 탈출 모니터암',
      price: 30000,
      originalPrice: 30000,
      stock: 20,
      isOnSale: false,
      isSuggestedSale: false,
    },
    {
      id: 'p4',
      name: '에러 방지 노트북 파우치',
      price: 15000,
      originalPrice: 15000,
      stock: 0,
      isOnSale: false,
      isSuggestedSale: false,
    },
    {
      id: 'p5',
      name: '코딩할 때 듣는 Lo-Fi 스피커',
      price: 25000,
      originalPrice: 25000,
      stock: 10,
      isOnSale: false,
      isSuggestedSale: false,
    },
  ];

  const selectedProductId = '';

  return (
    <div className="flex flex-col h-full">
      <Header itemCount={itemCount} />

      <MainGrid>
        <LeftColumn>
          <ProductPanel>
            <ProductSelect
              products={products}
              selectedProductId={selectedProductId}
              onProductChange={(id) => console.log('Selected:', id)}
            />
            <AddToCartButton
              disabled={!selectedProductId}
              onClick={() => console.log('Add to cart')}
            />
            <StockInfo products={products} />
          </ProductPanel>

          {/* CartContainer 영역 */}
          <div id="cart-items">
            <p className="text-gray-500 text-center py-8">🛍️ 0 items in cart</p>
          </div>
        </LeftColumn>

        {/* OrderSummary - 기본과제와 동일한 구조 */}
        <section className="bg-black text-white p-8 flex flex-col">
          <h2 className="text-xs font-medium mb-5 tracking-extra-wide uppercase">
            Order Summary
          </h2>
          <div className="flex-1 flex flex-col">
            <div id="summary-details" className="space-y-3"></div>
            <div className="mt-auto">
              <div id="discount-info" className="mb-4"></div>
              <div id="cart-total" className="pt-5 border-t border-white/10">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm uppercase tracking-wider">
                    Total
                  </span>
                  <div className="text-2xl tracking-tight">₩0</div>
                </div>
                <div
                  id="loyalty-points"
                  className="text-xs text-blue-400 mt-2 text-right"
                >
                  적립 포인트: 0p
                </div>
              </div>
              <div
                id="tuesday-special"
                className="mt-4 p-3 bg-white/10 rounded-lg hidden"
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xs">🎉</span>
                  <span className="text-xs uppercase tracking-wide">
                    Tuesday Special 10% Applied
                  </span>
                </div>
              </div>
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
      </MainGrid>

      <HelpToggleButton />
    </div>
  );
}

export default App;
