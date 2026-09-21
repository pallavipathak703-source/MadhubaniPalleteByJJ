import test from 'node:test';
import assert from 'node:assert/strict';

import {
  addCartItem,
  calculateCartTotal,
  getCartItemCount,
  updateCartItemQuantity,
  removeCartItem,
  normalizeCartItem,
} from './cartUtils.js';

test('addCartItem adds a new product once and increments quantity safely', () => {
  const cart = [];
  const product = { _id: 'p1', name: 'Test', price: 199, stock: 5 };

  const nextCart = addCartItem(cart, product);
  const updatedCart = addCartItem(nextCart, product);

  assert.equal(nextCart.length, 1);
  assert.equal(updatedCart[0].quantity, 2);
  assert.equal(getCartItemCount(updatedCart), 2);
  assert.equal(calculateCartTotal(updatedCart), 398);
});

test('addCartItem respects stock limit when incrementing', () => {
  const cart = [];
  const product = { _id: 'p-limited', name: 'Limited Art', price: 500, stock: 3 };

  let current = addCartItem(cart, product, 2);
  assert.equal(current[0].quantity, 2);

  current = addCartItem(current, product, 2);
  assert.equal(current[0].quantity, 3, 'Should cap at stock limit of 3');
});

test('addCartItem deduplicates existing duplicate entries cleanly', () => {
  const duplicateCart = [
    { productId: 'dup1', name: 'Item', price: 100, quantity: 1, stock: 10 },
    { productId: 'dup1', name: 'Item', price: 100, quantity: 1, stock: 10 },
  ];

  const cleanCart = addCartItem(duplicateCart, { _id: 'dup1', name: 'Item', price: 100, stock: 10 }, 1);
  assert.equal(cleanCart.length, 1, 'Should eliminate duplicate entries');
  assert.equal(cleanCart[0].quantity, 2);
});

test('updateCartItemQuantity keeps minimum quantity and removes zero', () => {
  const cart = [
    { _id: 'p2', productId: 'p2', name: 'Other', price: 250, quantity: 1 },
  ];

  const lowered = updateCartItemQuantity(cart, 'p2', -1);
  assert.deepEqual(lowered, []);

  const raised = updateCartItemQuantity(cart, 'p2', 1);
  assert.equal(raised[0].quantity, 2);
});

test('updateCartItemQuantity respects stock bounds', () => {
  const cart = [
    { productId: 'p-stock', name: 'Test', price: 100, quantity: 4, stock: 5 },
  ];

  const capped = updateCartItemQuantity(cart, 'p-stock', 3);
  assert.equal(capped[0].quantity, 5, 'Should not exceed max stock of 5');
});

test('removeCartItem removes item cleanly from cart', () => {
  const cart = [
    { productId: 'p1', name: 'Item 1', price: 100, quantity: 1 },
    { productId: 'p2', name: 'Item 2', price: 200, quantity: 1 },
  ];

  const filtered = removeCartItem(cart, 'p1');
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].productId, 'p2');
});

test('normalizeCartItem ensures proper key normalization and fallback values', () => {
  const rawProduct = {
    _id: 'mongo-id-123',
    name: 'Madhubani Saree',
    price: 3500,
    images: [{ url: 'https://example.com/saree.jpg' }],
    stock: 3,
    description: 'Very long description that should not bloat the cart',
    __v: 0,
  };

  const normalized = normalizeCartItem(rawProduct, 2);
  assert.equal(normalized.productId, 'mongo-id-123');
  assert.equal(normalized.product, 'mongo-id-123');
  assert.equal(normalized.image, 'https://example.com/saree.jpg');
  assert.equal(normalized.quantity, 2);
  assert.equal(normalized.description, undefined, 'Should strip raw description from cart item');
  assert.equal(normalized.__v, undefined, 'Should strip MongoDB metadata');
});

test('normalizeCartItem handles null, undefined, or NaN stock safely', () => {
  const itemNullStock = normalizeCartItem({ _id: 'p-null', stock: null }, 1);
  assert.equal(itemNullStock.stock, Infinity);
  assert.equal(itemNullStock.quantity, 1);

  const itemNaNStock = normalizeCartItem({ _id: 'p-nan', stock: 'invalid' }, 1);
  assert.equal(itemNaNStock.stock, Infinity);
  assert.equal(itemNaNStock.quantity, 1);
});

test('calculateCartTotal and getCartItemCount never return NaN on malformed items', () => {
  const malformedCart = [
    { productId: 'm1', price: 'abc', quantity: null },
    { productId: 'm2', price: 200, quantity: -5 },
    { productId: 'm3', price: 150, quantity: 2 },
    null,
    undefined,
  ];

  const count = getCartItemCount(malformedCart);
  assert.equal(count, 2, 'Should only count valid positive quantities');

  const total = calculateCartTotal(malformedCart);
  assert.equal(total, 300, 'Should accurately calculate 150 * 2 without returning NaN');
  assert.ok(!Number.isNaN(total));
});

