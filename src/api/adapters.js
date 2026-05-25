// Преобразование DTO бэка в форму, которую ожидают наши UI-компоненты.

import { categorySlugByBackendId, categorySlugByBackendName } from '../data/products';

// Иконка-fallback оставлена только для совместимости со старым кодом,
// где image использовался как текст. Реально для рендера используется
// компонент CategoryIcon (см. components/CategoryIcon.jsx).
const ICON_BY_CAT = {
  smartphones: '',
  cases:       '',
  chargers:    '',
  powerbanks:  '',
  earphones:   '',
  glass:       '',
  watches:     '',
  tablets:     '',
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

  // Галерея (бэк v6): imageUrls — массив до 10 шт, imageUrl = первая.
  const gallery = Array.isArray(dto.imageUrls)
    ? dto.imageUrls.map(normalizeImageUrl).filter(Boolean)
    : [];
  const primaryImageUrl = normalizeImageUrl(dto.imageUrl) || gallery[0] || null;

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
    imageUrl:     primaryImageUrl,
    imageUrls:    gallery,
    stock:        dto.stockQuantity ?? 0,
    isActive:     dto.isActive !== false,
    specs:        dto.attributes || {},
    variantGroup: dto.variantGroupId || null,

    // Новые поля наличия из бэка v6
    availabilityStatus: dto.availabilityStatus || null,   // OUT_OF_STOCK | LOW_STOCK | IN_STOCK | PLENTY
    availabilityLabel:  dto.availabilityLabel  || null,   // готовый текст «Осталось 3 шт.»

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

// CartResponse → фронт-корзина.
// CartItemResponse v6: { id, productId, productName, productSku,
//                        unitPrice, quantity, lineTotal, stockQuantity }
// imageUrl / categoryName бэк здесь НЕ возвращает — фронт догружает их через productsApi.byId.
export function adaptCart(dto) {
  if (!dto) return { items: [], total: 0 };
  const items = (dto.items || []).map(it => ({
    id:         it.productId,
    cartItemId: it.id,
    name:       it.productName,
    sku:        it.productSku,
    price:      Number(it.unitPrice ?? it.price ?? 0),
    lineTotal:  Number(it.lineTotal ?? 0),
    qty:        it.quantity,
    stock:      it.stockQuantity ?? null,
    image:      '⚡',         // fallback — будет заменено когда дойдёт byId
    imageUrl:   null,
    category:   'all',
  }));
  const total = typeof dto.total === 'number'
    ? Number(dto.total)
    : items.reduce((s, x) => s + (x.lineTotal || x.price * x.qty), 0);
  return { items, total };
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
    id:       dto.id,
    rating:   dto.rating,
    title:    dto.title || '',
    text:     dto.comment || '',
    pros:     '',
    cons:     '',
    author:   dto.username || dto.userName || 'Пользователь',
    username: dto.username || dto.userName || '',  // для сравнения со своим
    userId:   dto.userId ?? null,
    date:     dto.createdAt,
    photos:   Array.isArray(dto.photos)
      ? dto.photos.map(normalizeImageUrl).filter(Boolean)
      : [],
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
