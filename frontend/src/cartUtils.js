export const getCartItemCount = (cart = []) => {
  if (!Array.isArray(cart)) return 0;
  return cart.reduce((total, item) => {
    const qty = Math.floor(Number(item?.quantity) || 0);
    return total + (qty > 0 ? qty : 0);
  }, 0);
};

export const calculateCartTotal = (cart = []) => {
  if (!Array.isArray(cart)) return 0;
  return cart.reduce((total, item) => {
    const price = Math.max(0, Number(item?.price) || 0);
    const qty = Math.max(0, Math.floor(Number(item?.quantity) || 0));
    return total + price * qty;
  }, 0);
};

export const getProductImageUrl = (product) => {
  let imagePath =
    product?.image ||
    product?.images?.[0]?.url ||
    product?.images?.[0] ||
    product?.imageUrl ||
    "";

  if (!imagePath || typeof imagePath !== "string") return "";
  if (imagePath.includes("placeholder-product")) return "";

  const consoleUrl = imagePath.match(
    /^https:\/\/res-console\.cloudinary\.com\/([^/]+)\/thumbnails\/v1\/image\/upload\/v(\d+)\/([^/]+)\/preview$/
  );

  if (consoleUrl) {
    try {
      imagePath = `https://res.cloudinary.com/${consoleUrl[1]}/image/upload/v${consoleUrl[2]}/${atob(consoleUrl[3])}`;
    } catch {
      return "";
    }
  }

  return imagePath;
};

export const normalizeCartItem = (product = {}, quantity = 1) => {
  const rawKey =
    product?._id || product?.id || product?.productId || product?.product;
  const itemKey = rawKey ? String(rawKey).trim() : "";

  if (!itemKey) {
    return null;
  }

  const rawStock = product?.stock;
  const hasValidStock =
    rawStock !== undefined &&
    rawStock !== null &&
    !isNaN(Number(rawStock)) &&
    Number(rawStock) >= 0;
  const safeStock = hasValidStock ? Math.floor(Number(rawStock)) : Infinity;

  const parsedQty = Math.floor(Number(quantity) || 1);
  const minStockCapped = safeStock === Infinity ? parsedQty : Math.max(1, safeStock);
  const safeQuantity = Math.max(1, Math.min(parsedQty, minStockCapped));

  return {
    _id: itemKey,
    id: itemKey,
    productId: itemKey,
    product: itemKey,
    name: String(product?.name || "Handmade Artwork").trim(),
    price: Math.max(0, Number(product?.price) || 0),
    image: getProductImageUrl(product),
    category: String(product?.category || "Madhubani Art").trim(),
    stock: safeStock,
    quantity: safeQuantity,
  };
};

export const addCartItem = (cart = [], product, quantity = 1) => {
  const safeCart = Array.isArray(cart) ? cart : [];
  const normalized = normalizeCartItem(product, quantity);

  if (!normalized || !normalized.productId) {
    return safeCart;
  }

  let found = false;
  const result = [];
  const seenKeys = new Set();

  for (const item of safeCart) {
    const rawKey =
      item?.productId || item?._id || item?.id || item?.product;
    const currentKey = rawKey ? String(rawKey).trim() : "";

    if (!currentKey || seenKeys.has(currentKey)) {
      continue;
    }
    seenKeys.add(currentKey);

    if (currentKey === normalized.productId) {
      found = true;
      const currentQty = Math.max(0, Math.floor(Number(item?.quantity) || 0));
      const addQty = Math.max(1, Math.floor(Number(quantity) || 1));
      const stockLimit =
        item?.stock !== undefined && item?.stock !== null
          ? item.stock
          : normalized.stock;

      const nextQty =
        stockLimit === Infinity
          ? currentQty + addQty
          : Math.min(currentQty + addQty, Math.max(1, stockLimit));

      result.push({
        ...item,
        ...normalized,
        quantity: nextQty,
      });
    } else {
      result.push(item);
    }
  }

  if (!found) {
    result.push(normalized);
  }

  return result;
};

export const updateCartItemQuantity = (cart = [], itemId, delta) => {
  if (!Array.isArray(cart) || !itemId) {
    return Array.isArray(cart) ? cart : [];
  }

  const targetKey = String(itemId).trim();
  const deltaNum = Math.floor(Number(delta) || 0);

  const result = [];
  const seenKeys = new Set();

  for (const item of cart) {
    const rawKey =
      item?.productId || item?._id || item?.id || item?.product;
    const currentKey = rawKey ? String(rawKey).trim() : "";

    if (!currentKey || seenKeys.has(currentKey)) {
      continue;
    }
    seenKeys.add(currentKey);

    if (currentKey === targetKey) {
      const currentQty = Math.max(0, Math.floor(Number(item?.quantity) || 0));
      const nextQty = currentQty + deltaNum;

      if (nextQty > 0) {
        const stockLimit =
          item?.stock !== undefined && item?.stock !== null
            ? item.stock
            : Infinity;

        const safeNextQty =
          stockLimit === Infinity
            ? nextQty
            : Math.min(nextQty, Math.max(1, stockLimit));

        result.push({
          ...item,
          quantity: safeNextQty,
        });
      }
    } else {
      result.push(item);
    }
  }

  return result;
};

export const removeCartItem = (cart = [], itemId) => {
  if (!Array.isArray(cart) || !itemId) {
    return Array.isArray(cart) ? cart : [];
  }

  const targetKey = String(itemId).trim();

  return cart.filter((item) => {
    const rawKey =
      item?.productId || item?._id || item?.id || item?.product;
    const currentKey = rawKey ? String(rawKey).trim() : "";
    return currentKey && currentKey !== targetKey;
  });
};
