// Chạy: node helpers/order.test.js
const assert = require('assert');
const { validQuantities, itemAmount, couponDiscount } = require('./order.helper');

const item = (quantityAdult, quantityChildren = 0, quantityBaby = 0) => ({ quantityAdult, quantityChildren, quantityBaby });
assert.ok(validQuantities(item(1)));
assert.ok(validQuantities(item(2, 1, 1)));
assert.ok(!validQuantities(item(0, 2)));
assert.ok(!validQuantities(item(1, -1)));
assert.ok(!validQuantities(item(1.5)));
assert.ok(!validQuantities(item("2")));
assert.ok(!validQuantities({}));

const tour = { newPriceAdult: 100, newPriceChildren: 50, newPriceBaby: 10 };
assert.strictEqual(itemAmount(item(2, 1, 1), tour), 260);

const lines = [{ tourId: "a", amount: 300 }, { tourId: "b", amount: 700 }];
const promo = (discountUpTo, ...tourIds) => ({ discountUpTo, products: tourIds.map(tourId => ({ tourId })) });
assert.strictEqual(couponDiscount(promo(100), lines), 100);
assert.strictEqual(couponDiscount(promo(5000), lines), 1000);  // không giảm quá tổng đơn
assert.strictEqual(couponDiscount(promo(500, "a"), lines), 300);  // chỉ tính tour thuộc chiến dịch
assert.strictEqual(couponDiscount(promo(500, "x"), lines), 0);
assert.strictEqual(couponDiscount(promo(0), lines), 0);
console.log("ok");
