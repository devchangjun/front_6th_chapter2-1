import {
  PRODUCT_IDS,
  PRODUCT_ONE,
  p2,
  product_3,
  p4,
  PRODUCT_5,
  PRICES,
  DISCOUNT_RATES,
  PRODUCT_DISCOUNTS,
  INITIAL_STOCK,
  QUANTITY_THRESHOLDS,
  POINTS_QUANTITY_THRESHOLDS,
  POINTS,
  QUANTITY_BONUS_POINTS,
  TIMERS,
} from "./constants/index.js";

import {
  createHeader,
  updateHeaderItemCount,
  createProductSelector,
  updateProductOptions,
  updateStockInfo,
  getSelectedProduct,
  createCartItem,
  updateCartItemQuantity,
  updateCartItemPrice,
  updateCartItemPriceStyle,
} from "./components/index.js";

let prodList;
let bonusPts = 0;
let stockInfo;
let itemCnt;
let lastSel;
let sel;
let addBtn;
let totalAmt = 0;
let cartDisp;
let header;
let selectorContainer;

/**
 * 선택된 상품이 유효한지 검증합니다.
 *
 * @param {string} selectedProductId - 선택된 상품 ID
 * @param {Array} productList - 상품 목록
 * @returns {Object|null} 유효한 상품 객체 또는 null
 */
function validateSelectedItem(selectedProductId, productList) {
  if (!selectedProductId) return null;

  let isProductExists = false;
  for (
    let productIndex = 0;
    productIndex < productList.length;
    productIndex++
  ) {
    if (productList[productIndex].id === selectedProductId) {
      isProductExists = true;
      break;
    }
  }
  if (!isProductExists) return null;

  let productToAdd = null;
  for (
    let productIndex = 0;
    productIndex < productList.length;
    productIndex++
  ) {
    if (productList[productIndex].id === selectedProductId) {
      productToAdd = productList[productIndex];
      break;
    }
  }

  return productToAdd && productToAdd.q > 0 ? productToAdd : null;
}

/**
 * 기존 장바구니 아이템의 수량을 증가시킵니다.
 *
 * @param {HTMLElement} cartItemElement - 장바구니 아이템 요소
 * @param {Object} productToAdd - 추가할 상품 객체
 * @returns {boolean} 성공 여부
 */
function incrementExistingItem(cartItemElement, productToAdd) {
  const quantityElement = cartItemElement.querySelector(".quantity-number");
  const currentQuantity = parseInt(quantityElement.textContent);
  const newQuantity = currentQuantity + 1;

  if (newQuantity <= productToAdd.q + currentQuantity) {
    quantityElement.textContent = newQuantity;
    productToAdd.q--;
    return true;
  } else {
    alert("재고가 부족합니다.");
    return false;
  }
}

/**
 * 장바구니에 상품을 추가하는 핸들러 함수
 *
 * @param {HTMLElement} selectorContainer - ProductSelector 컴포넌트
 * @param {Array} productList - 상품 목록
 * @param {HTMLElement} cartDisplay - 장바구니 컨테이너
 */
function handleAddToCart(selectorContainer, productList, cartDisplay) {
  const selectedProductId = getSelectedProduct(selectorContainer);
  const productToAdd = validateSelectedItem(selectedProductId, productList);

  if (!productToAdd) return;

  const existingCartItem = document.getElementById(productToAdd.id);
  if (existingCartItem) {
    if (!incrementExistingItem(existingCartItem, productToAdd)) return;
  } else {
    const newCartItem = createCartItem({
      product: productToAdd,
      onQuantityChange: (productId, change) => {
        const cartItemElement = document.getElementById(productId);
        if (!cartItemElement) return;

        const quantityElement =
          cartItemElement.querySelector(".quantity-number");
        const currentQuantity = parseInt(quantityElement.textContent);
        const newQuantity = currentQuantity + change;

        if (
          newQuantity > 0 &&
          newQuantity <= productToAdd.q + currentQuantity
        ) {
          updateCartItemQuantity(cartItemElement, newQuantity);
          productToAdd.q -= change;
        } else if (newQuantity <= 0) {
          productToAdd.q += currentQuantity;
          cartItemElement.remove();
        } else {
          alert("재고가 부족합니다.");
        }
        handleCalculateCartStuff();
        onUpdateSelectOptions();
      },
      onRemove: productId => {
        const cartItemElement = document.getElementById(productId);
        if (!cartItemElement) return;

        const quantityElement =
          cartItemElement.querySelector(".quantity-number");
        const removeQuantity = parseInt(quantityElement.textContent);
        productToAdd.q += removeQuantity;
        cartItemElement.remove();
        handleCalculateCartStuff();
        onUpdateSelectOptions();
      },
    });

    cartDisplay.appendChild(newCartItem);
    productToAdd.q--;
  }

  handleCalculateCartStuff();
  lastSel = selectedProductId;
}

function main() {
  const root = document.getElementById("app");
  totalAmt = 0;
  itemCnt = 0;
  lastSel = null;
  prodList = [
    {
      id: PRODUCT_ONE,
      name: "버그 없애는 키보드",
      val: PRICES.KEYBOARD,
      originalVal: PRICES.KEYBOARD,
      q: INITIAL_STOCK.KEYBOARD,
      onSale: false,
      suggestSale: false,
    },
    {
      id: p2,
      name: "생산성 폭발 마우스",
      val: PRICES.MOUSE,
      originalVal: PRICES.MOUSE,
      q: INITIAL_STOCK.MOUSE,
      onSale: false,
      suggestSale: false,
    },
    {
      id: product_3,
      name: "거북목 탈출 모니터암",
      val: PRICES.MONITOR_ARM,
      originalVal: PRICES.MONITOR_ARM,
      q: INITIAL_STOCK.MONITOR_ARM,
      onSale: false,
      suggestSale: false,
    },
    {
      id: p4,
      name: "에러 방지 노트북 파우치",
      val: PRICES.LAPTOP_POUCH,
      originalVal: PRICES.LAPTOP_POUCH,
      q: INITIAL_STOCK.LAPTOP_POUCH,
      onSale: false,
      suggestSale: false,
    },
    {
      id: PRODUCT_5,
      name: "코딩할 때 듣는 Lo-Fi 스피커",
      val: PRICES.SPEAKER,
      originalVal: PRICES.SPEAKER,
      q: INITIAL_STOCK.SPEAKER,
      onSale: false,
      suggestSale: false,
    },
  ];
  header = createHeader({ itemCount: 0 });

  const gridContainer = document.createElement("div");
  const leftColumn = document.createElement("div");
  leftColumn["className"] =
    "bg-white border border-gray-200 p-8 overflow-y-auto";
  gridContainer.className =
    "grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 flex-1 overflow-hidden";

  // ProductSelector 컴포넌트 생성
  selectorContainer = createProductSelector({
    products: prodList,
    onProductSelect: () => {},
    onAddToCart: () => {
      handleAddToCart(selectorContainer, prodList, cartDisp);
    },
  });

  leftColumn.appendChild(selectorContainer);
  cartDisp = document.createElement("div");
  leftColumn.appendChild(cartDisp);
  cartDisp.id = "cart-items";
  const rightColumn = document.createElement("div");
  rightColumn.className = "bg-black text-white p-8 flex flex-col";
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
  sum = rightColumn.querySelector("#cart-total");
  const manualToggle = document.createElement("button");
  manualToggle.onclick = function () {
    manualOverlay.classList.toggle("hidden");
    manualColumn.classList.toggle("translate-x-full");
  };
  manualToggle.className =
    "fixed top-4 right-4 bg-black text-white p-3 rounded-full hover:bg-gray-900 transition-colors z-50";
  manualToggle.innerHTML = `
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
  `;
  const manualOverlay = document.createElement("div");
  manualOverlay.className =
    "fixed inset-0 bg-black/50 z-40 hidden transition-opacity duration-300";
  manualOverlay.onclick = function (e) {
    if (e.target === manualOverlay) {
      manualOverlay.classList.add("hidden");
      manualColumn.classList.add("translate-x-full");
    }
  };
  const manualColumn = document.createElement("div");
  manualColumn.className =
    "fixed right-0 top-0 h-full w-80 bg-white shadow-2xl p-6 overflow-y-auto z-50 transform translate-x-full transition-transform duration-300";
  manualColumn.innerHTML = `
    <button class="absolute top-4 right-4 text-gray-500 hover:text-black" onclick="document.querySelector('.fixed.inset-0').classList.add('hidden'); this.parentElement.classList.add('translate-x-full')">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </button>
    <h2 class="text-xl font-bold mb-4">📖 이용 안내</h2>

    <div class="mb-6">
      <h3 class="text-base font-bold mb-3">💰 할인 정책</h3>
      <div class="space-y-3">
        <div class="bg-gray-100 rounded-lg p-3">
          <p class="font-semibold text-sm mb-1">개별 상품</p>
          <p class="text-gray-700 text-xs pl-2">
            • 키보드 10개↑: 10%<br>
            • 마우스 10개↑: 15%<br>
            • 모니터암 10개↑: 20%<br>
            • 스피커 10개↑: 25%
          </p>
        </div>

        <div class="bg-gray-100 rounded-lg p-3">
          <p class="font-semibold text-sm mb-1">전체 수량</p>
          <p class="text-gray-700 text-xs pl-2">• 30개 이상: 25%</p>
        </div>

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

    <div class="mb-6">
      <h3 class="text-base font-bold mb-3">🎁 포인트 적립</h3>
      <div class="space-y-3">
        <div class="bg-gray-100 rounded-lg p-3">
          <p class="font-semibold text-sm mb-1">기본</p>
          <p class="text-gray-700 text-xs pl-2">• 구매액의 0.1%</p>
        </div>

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

    <div class="border-t border-gray-200 pt-4 mt-4">
      <p class="text-xs font-bold mb-1">💡 TIP</p>
      <p class="text-2xs text-gray-600 leading-relaxed">
        • 화요일 대량구매 = MAX 혜택<br>
        • ⚡+💝 중복 가능<br>
        • 상품4 = 품절
      </p>
    </div>
  `;
  gridContainer.appendChild(leftColumn);
  gridContainer.appendChild(rightColumn);
  manualOverlay.appendChild(manualColumn);
  root.appendChild(header);
  root.appendChild(gridContainer);
  root.appendChild(manualToggle);
  root.appendChild(manualOverlay);

  onUpdateSelectOptions();
  handleCalculateCartStuff();
  const lightningDelay = Math.random() * TIMERS.LIGHTNING_SALE_DELAY;
  setTimeout(() => {
    setInterval(() => {
      const luckyIdx = Math.floor(Math.random() * prodList.length);
      const luckyItem = prodList[luckyIdx];
      if (luckyItem.q > 0 && !luckyItem.onSale) {
        luckyItem.val = Math.round(
          luckyItem.originalVal * DISCOUNT_RATES.LIGHTNING_SALE
        );
        luckyItem.onSale = true;
        alert("⚡번개세일! " + luckyItem.name + "이(가) 20% 할인 중입니다!");
        onUpdateSelectOptions();
        doUpdatePricesInCart();
      }
    }, TIMERS.LIGHTNING_SALE_INTERVAL);
  }, lightningDelay);
  setTimeout(() => {
    setInterval(() => {
      if (cartDisp.children.length === 0) {
        console.log("cartDisplay 길이가 0입니다.");
      }
      if (lastSel) {
        let suggest = null;

        for (let k = 0; k < prodList.length; k++) {
          if (prodList[k].id !== lastSel) {
            if (prodList[k].q > 0) {
              if (!prodList[k].suggestSale) {
                suggest = prodList[k];
                break;
              }
            }
          }
        }
        if (suggest) {
          alert(
            "💝 " +
              suggest.name +
              "은(는) 어떠세요? 지금 구매하시면 5% 추가 할인!"
          );

          suggest.val = Math.round(suggest.val * DISCOUNT_RATES.SUGGEST_SALE);
          suggest.suggestSale = true;
          onUpdateSelectOptions();
          doUpdatePricesInCart();
        }
      }
    }, TIMERS.SUGGEST_SALE_INTERVAL);
  }, Math.random() * TIMERS.SUGGEST_SALE_DELAY);
}
let sum;
function onUpdateSelectOptions() {
  let totalStock = 0;
  for (let idx = 0; idx < prodList.length; idx++) {
    const _p = prodList[idx];
    totalStock = totalStock + _p.q;
  }

  // ProductSelector 컴포넌트 업데이트
  updateProductOptions(
    selectorContainer,
    prodList,
    totalStock,
    QUANTITY_THRESHOLDS.LOW_STOCK_WARNING
  );
  updateStockInfo(
    selectorContainer,
    prodList,
    QUANTITY_THRESHOLDS.LOW_STOCK_WARNING
  );
}
function handleCalculateCartStuff() {
  const cartItems = cartDisp.children;
  let subTot;
  const itemDiscounts = [];
  const lowStockItems = [];
  let idx;
  let bulkDisc;
  let itemDisc;
  let savedAmount;
  const summaryDetails = document.getElementById("summary-details");
  const loyaltyPointsDiv = document.getElementById("loyalty-points");
  let points;
  const discountInfoDiv = document.getElementById("discount-info");
  const itemCountElement = document.getElementById("item-count");
  let previousCount;
  let stockMsg;
  let pts;
  let hasP1;
  let hasP2;
  let loyaltyDiv;
  totalAmt = 0;
  itemCnt = 0;
  subTot = 0;
  for (idx = 0; idx < prodList.length; idx++) {
    if (
      prodList[idx].q < QUANTITY_THRESHOLDS.LOW_STOCK_WARNING &&
      prodList[idx].q > 0
    ) {
      lowStockItems.push(prodList[idx].name);
    }
  }
  for (let i = 0; i < cartItems.length; i++) {
    (function () {
      let curItem;
      for (let j = 0; j < prodList.length; j++) {
        if (prodList[j].id === cartItems[i].id) {
          curItem = prodList[j];
          break;
        }
      }
      const qtyElem = cartItems[i].querySelector(".quantity-number");
      const q = parseInt(qtyElem.textContent);
      const itemTot = curItem.val * q;
      let disc;
      disc = 0;
      itemCnt += q;
      subTot += itemTot;
      const itemDiv = cartItems[i];
      const priceElems = itemDiv.querySelectorAll(".text-lg, .text-xs");
      priceElems.forEach(elem => {
        if (elem.classList.contains("text-lg")) {
          elem.style.fontWeight = q >= 10 ? "bold" : "normal";
        }
      });
      updateCartItemPriceStyle(itemDiv, q);
      if (q >= QUANTITY_THRESHOLDS.INDIVIDUAL_DISCOUNT) {
        if (curItem.id === PRODUCT_ONE) {
          disc = PRODUCT_DISCOUNTS.KEYBOARD_10_PLUS;
        } else {
          if (curItem.id === p2) {
            disc = PRODUCT_DISCOUNTS.MOUSE_10_PLUS;
          } else {
            if (curItem.id === product_3) {
              disc = PRODUCT_DISCOUNTS.MONITOR_ARM_10_PLUS;
            } else {
              if (curItem.id === p4) {
                disc = PRODUCT_DISCOUNTS.LAPTOP_POUCH_10_PLUS;
              } else {
                if (curItem.id === PRODUCT_5) {
                  disc = PRODUCT_DISCOUNTS.SPEAKER_10_PLUS;
                }
              }
            }
          }
        }
        if (disc > 0) {
          itemDiscounts.push({ name: curItem.name, discount: disc * 100 });
        }
      }
      totalAmt += itemTot * (1 - disc);
    })();
  }
  let discRate = 0;
  const originalTotal = subTot;
  if (itemCnt >= QUANTITY_THRESHOLDS.BULK_PURCHASE) {
    totalAmt = subTot * DISCOUNT_RATES.BULK_PURCHASE;
    discRate = 1 - DISCOUNT_RATES.BULK_PURCHASE;
  } else {
    discRate = (subTot - totalAmt) / subTot;
  }

  const today = new Date();
  const isTuesday = today.getDay() === 2;
  const tuesdaySpecial = document.getElementById("tuesday-special");
  if (isTuesday) {
    if (totalAmt > 0) {
      totalAmt = totalAmt * DISCOUNT_RATES.TUESDAY_SPECIAL;

      discRate = 1 - totalAmt / originalTotal;
      tuesdaySpecial.classList.remove("hidden");
    } else {
      tuesdaySpecial.classList.add("hidden");
    }
  } else {
    tuesdaySpecial.classList.add("hidden");
  }
  updateHeaderItemCount(header, itemCnt);
  summaryDetails.innerHTML = "";
  if (subTot > 0) {
    for (let i = 0; i < cartItems.length; i++) {
      let curItem;
      for (let j = 0; j < prodList.length; j++) {
        if (prodList[j].id === cartItems[i].id) {
          curItem = prodList[j];
          break;
        }
      }
      const qtyElem = cartItems[i].querySelector(".quantity-number");
      const q = parseInt(qtyElem.textContent);
      const itemTotal = curItem.val * q;
      summaryDetails.innerHTML += `
        <div class="flex justify-between text-xs tracking-wide text-gray-400">
          <span>${curItem.name} x ${q}</span>
          <span>₩${itemTotal.toLocaleString()}</span>
        </div>
      `;
    }

    summaryDetails.innerHTML += `
      <div class="border-t border-white/10 my-3"></div>
      <div class="flex justify-between text-sm tracking-wide">
        <span>Subtotal</span>
        <span>₩${subTot.toLocaleString()}</span>
      </div>
    `;

    if (itemCnt >= QUANTITY_THRESHOLDS.BULK_PURCHASE) {
      summaryDetails.innerHTML += `
        <div class="flex justify-between text-sm tracking-wide text-green-400">
          <span class="text-xs">🎉 대량구매 할인 (${QUANTITY_THRESHOLDS.BULK_PURCHASE}개 이상)</span>
          <span class="text-xs">-${(1 - DISCOUNT_RATES.BULK_PURCHASE) * 100}%</span>
        </div>
      `;
    } else if (itemDiscounts.length > 0) {
      itemDiscounts.forEach(item => {
        summaryDetails.innerHTML += `
          <div class="flex justify-between text-sm tracking-wide text-green-400">
            <span class="text-xs">${item.name} (10개↑)</span>
            <span class="text-xs">-${item.discount}%</span>
          </div>
        `;
      });
    }
    if (isTuesday) {
      if (totalAmt > 0) {
        summaryDetails.innerHTML += `
          <div class="flex justify-between text-sm tracking-wide text-purple-400">
            <span class="text-xs">🌟 화요일 추가 할인</span>
            <span class="text-xs">-10%</span>
          </div>
        `;
      }
    }
    summaryDetails.innerHTML += `
      <div class="flex justify-between text-sm tracking-wide text-gray-400">
        <span>Shipping</span>
        <span>Free</span>
      </div>
    `;
  }
  const totalDiv = sum.querySelector(".text-2xl");
  if (totalDiv) {
    totalDiv.textContent = "₩" + Math.round(totalAmt).toLocaleString();
  }
  if (loyaltyPointsDiv) {
    points = Math.floor(totalAmt / POINTS.BASE_RATE);
    if (points > 0) {
      loyaltyPointsDiv.textContent = "적립 포인트: " + points + "p";
      loyaltyPointsDiv.style.display = "block";
    } else {
      loyaltyPointsDiv.textContent = "적립 포인트: 0p";
      loyaltyPointsDiv.style.display = "block";
    }
  }
  discountInfoDiv.innerHTML = "";

  if (discRate > 0 && totalAmt > 0) {
    savedAmount = originalTotal - totalAmt;
    discountInfoDiv.innerHTML = `
      <div class="bg-green-500/20 rounded-lg p-3">
        <div class="flex justify-between items-center mb-1">
          <span class="text-xs uppercase tracking-wide text-green-400">총 할인율</span>
          <span class="text-sm font-medium text-green-400">${(discRate * 100).toFixed(1)}%</span>
        </div>
        <div class="text-2xs text-gray-300">₩${Math.round(savedAmount).toLocaleString()} 할인되었습니다</div>
      </div>
    `;
  }
  if (itemCountElement) {
    previousCount = parseInt(itemCountElement.textContent.match(/\d+/) || 0);
    itemCountElement.textContent = "🛍️ " + itemCnt + " items in cart";
    if (previousCount !== itemCnt) {
      itemCountElement.setAttribute("data-changed", "true");
    }
  }
  stockMsg = "";

  for (let stockIdx = 0; stockIdx < prodList.length; stockIdx++) {
    const item = prodList[stockIdx];
    if (item.q < 5) {
      if (item.q > 0) {
        stockMsg =
          stockMsg + item.name + ": 재고 부족 (" + item.q + "개 남음)\n";
      } else {
        stockMsg = stockMsg + item.name + ": 품절\n";
      }
    }
  }
  // stockInfo가 존재하는 경우에만 업데이트
  if (stockInfo) {
    stockInfo.textContent = stockMsg;
  }

  handleStockInfoUpdate();
  doRenderBonusPoints();
}
const doRenderBonusPoints = function () {
  let hasKeyboard;
  let hasMouse;
  let hasMonitorArm;
  if (cartDisp.children.length === 0) {
    document.getElementById("loyalty-points").style.display = "none";
    return;
  }
  const basePoints = Math.floor(totalAmt / POINTS.BASE_RATE);
  let finalPoints = 0;
  const pointsDetail = [];

  if (basePoints > 0) {
    finalPoints = basePoints;
    pointsDetail.push("기본: " + basePoints + "p");
  }
  if (new Date().getDay() === 2) {
    if (basePoints > 0) {
      finalPoints = basePoints * POINTS.TUESDAY_MULTIPLIER;
      pointsDetail.push("화요일 2배");
    }
  }
  hasKeyboard = false;
  hasMouse = false;
  hasMonitorArm = false;
  const nodes = cartDisp.children;
  for (const node of nodes) {
    let product = null;

    for (let pIdx = 0; pIdx < prodList.length; pIdx++) {
      if (prodList[pIdx].id === node.id) {
        product = prodList[pIdx];
        break;
      }
    }
    if (!product) continue;
    if (product.id === PRODUCT_ONE) {
      hasKeyboard = true;
    } else if (product.id === p2) {
      hasMouse = true;
    } else if (product.id === product_3) {
      hasMonitorArm = true;
    }
  }
  if (hasKeyboard && hasMouse) {
    finalPoints = finalPoints + POINTS.KEYBOARD_MOUSE_SET;
    pointsDetail.push("키보드+마우스 세트 +50p");
  }
  if (hasKeyboard && hasMouse && hasMonitorArm) {
    finalPoints = finalPoints + POINTS.FULL_SET;
    pointsDetail.push("풀세트 구매 +100p");
  }

  if (itemCnt >= POINTS_QUANTITY_THRESHOLDS.LARGE_BULK) {
    finalPoints = finalPoints + QUANTITY_BONUS_POINTS.LARGE_BULK;
    pointsDetail.push("대량구매(30개+) +100p");
  } else {
    if (itemCnt >= POINTS_QUANTITY_THRESHOLDS.MEDIUM_BULK) {
      finalPoints = finalPoints + QUANTITY_BONUS_POINTS.MEDIUM_BULK;
      pointsDetail.push("대량구매(20개+) +50p");
    } else {
      if (itemCnt >= POINTS_QUANTITY_THRESHOLDS.SMALL_BULK) {
        finalPoints = finalPoints + QUANTITY_BONUS_POINTS.SMALL_BULK;
        pointsDetail.push("대량구매(10개+) +20p");
      }
    }
  }
  bonusPts = finalPoints;
  const ptsTag = document.getElementById("loyalty-points");
  if (ptsTag) {
    if (bonusPts > 0) {
      ptsTag.innerHTML =
        '<div>적립 포인트: <span class="font-bold">' +
        bonusPts +
        "p</span></div>" +
        '<div class="text-2xs opacity-70 mt-1">' +
        pointsDetail.join(", ") +
        "</div>";
      ptsTag.style.display = "block";
    } else {
      ptsTag.textContent = "적립 포인트: 0p";
      ptsTag.style.display = "block";
    }
  }
};
function onGetStockTotal() {
  let sum;
  let i;
  let currentProduct;
  sum = 0;
  for (i = 0; i < prodList.length; i++) {
    currentProduct = prodList[i];
    sum += currentProduct.q;
  }
  return sum;
}
const handleStockInfoUpdate = function () {
  updateStockInfo(
    selectorContainer,
    prodList,
    QUANTITY_THRESHOLDS.LOW_STOCK_WARNING
  );
};
function doUpdatePricesInCart() {
  let totalCount = 0,
    j = 0;
  while (cartDisp.children[j]) {
    const qty = cartDisp.children[j].querySelector(".quantity-number");
    totalCount += qty ? parseInt(qty.textContent) : 0;
    j++;
  }
  totalCount = 0;
  for (j = 0; j < cartDisp.children.length; j++) {
    totalCount += parseInt(
      cartDisp.children[j].querySelector(".quantity-number").textContent
    );
  }
  const cartItems = cartDisp.children;
  for (let i = 0; i < cartItems.length; i++) {
    const itemId = cartItems[i].id;
    let product = null;

    for (let productIdx = 0; productIdx < prodList.length; productIdx++) {
      if (prodList[productIdx].id === itemId) {
        product = prodList[productIdx];
        break;
      }
    }
    if (product) {
      updateCartItemPrice(cartItems[i], product);
    }
  }
  handleCalculateCartStuff();
}
main();
