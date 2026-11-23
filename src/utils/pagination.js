import config from '../config/index.js';

// Lee ?page=&limit= de la query, con valores por defecto y un tope máximo
export const getPagination = (query = {}) => {
  const { defaultLimit, maxLimit } = config.pagination;
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || defaultLimit, 1), maxLimit);
  return { page, limit, skip: (page - 1) * limit };
};

// Metadatos para devolver junto a payload: { status, payload, pagination }
export const buildPaginationMeta = ({ total, page, limit }) => ({
  total,
  page,
  limit,
  totalPages: Math.max(Math.ceil(total / limit), 1),
  hasNextPage: page * limit < total,
  hasPrevPage: page > 1
});