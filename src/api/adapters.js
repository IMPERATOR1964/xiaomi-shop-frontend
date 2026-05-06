// Преобразование DTO бэка в форму, которую ожидают наши UI-компоненты.

import { categorySlugByBackendId, categorySlugByBackendName } from '../data/products';

const ICON_BY_CAT = {
  smartphones: '📱',
  cases:       '🛡️',
  chargers:    '🔌',
  powerbanks:  '🔋',
  earphones:   '🎧',
  glass:       '🔲',
  watches:     '⌚',
  tablets:     '📱',
};

const makeShort = (desc) => {
  if (!desc) return '';
  const s = desc.split(/\.\s+|\n/)[0];
  return s.length > 110 ? s.slice(0, 107) + '…' : s;
};

const normalizeImageUrl = (url) => {
  if (!url) return null;
  if (/^https?:\/\//.test(url)) return url;
  return url.startsWith('/') ? url : `/${url}`;
};

export function adaptProduct(dto) {
  if (!dto) return null;

  const slug =
    categorySlugByBackendId(dto.categoryId) !== 'all'
      ? categorySlugByBackendId(dto.categoryId)
      : categorySlugByBackendName(dto.categoryName);

  const price = typeof dto.price === 'string' ? Number(dto.price) : dto.price;

  return {
    id:           dto.id,
    sku:          dto.sku,
    category:     slug,
    name:         dto.name,
    desc:         dto.description || '',
    shortDesc:    makeShort(dto.description),
    price:        price,
    oldPrice:     null,
    badge:        null,
    image:        ICON_BY_CAT[slug] || '⚡',
    imageUrl:     normalizeImageUrl(dto.imageUrl),
    stock:        dto.stockQuantity ?? 0,
    isActive:     dto.isActive !== false,
    specs:        dto.attributes || {},
    variantGroup: dto.variantGroupId || null,

    categoryId:    dto.categoryId,
    categoryName:  dto.categoryName,
    averageRating: dto.averageRating ?? 0,
    reviewsCount:  Number(dto.reviewsCount || 0),
    viewsCount:    dto.viewsCount ?? 0,
    sharesCount:   dto.sharesCount ?? 0,
  };
}

export function adaptProductList(page) {
  if (!page) return { items: [], total: 0, page: 0, size: 0, pages: 0 };
  if (Array.isArray(page)) {
    return { items: page.map(adaptProduct), total: page.length, page: 0, size: page.length, pages: 1 };
  }
  return {
    items:  (page.content || []).map(adaptProduct),
    total:  page.totalElements ?? 0,
    page:   page.number ?? 0,
    size:   page.size ?? 0,
    pages:  page.totalPages ?? 0,
  };
}

export function adaptCart(dto) {
  if (!dto) return { items: [], total: 0 };
  const items = (dto.items || []).map(it => {
    const slug = categorySlugByBackendName(it.categoryName);
    return {
      id:         it.productId,
      cartItemId: it.id,
      name:       it.productName,
      sku:        it.productSku,
      price:      Number(it.price ?? it.priceAtAdd ?? 0),
      qty:        it.quantity,
      image:      ICON_BY_CAT[slug] || '⚡',
      imageUrl:   normalizeImageUrl(it.imageUrl),
    };
  });
  return {
    items,
    total: items.reduce((s, x) => s + x.price * x.qty, 0),
  };
}

export function adaptOrder(dto) {
  if (!dto) return null;
  return {
    id:        dto.id,
    status:    dto.status,
    total:     Number(dto.totalAmount ?? 0),
    createdAt: dto.createdAt,
    items: (dto.items || []).map(it => ({
      id:    it.id,
      name:  it.productName,
      sku:   it.productSku,
      price: Number(it.priceAtPurchase),
      qty:   it.quantity,
    })),
    deliveryAddress: dto.deliveryAddress,
    contactPhone:    dto.contactPhone,
    customerNotes:   dto.customerNotes,
  };
}

export function adaptReview(dto) {
  if (!dto) return null;
  return {
    id:      dto.id,
    rating:  dto.rating,
    title:   dto.title || '',
    text:    dto.comment || '',
    pros:    '',
    cons:    '',
    author:  dto.username || dto.userName || 'Пользователь',
    date:    dto.createdAt,
  };
}

export function adaptCategory(dto) {
  if (!dto) return null;
  const slug = categorySlugByBackendId(dto.id);
  return {
    id:            dto.id,
    slug,
    name:          dto.name,
    description:   dto.description,
    productsCount: Number(dto.productsCount || 0),
  };
}
