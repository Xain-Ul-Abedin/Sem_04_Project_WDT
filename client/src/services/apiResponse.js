export const getApiData = (response, fallback = null) => {
  if (response && typeof response === 'object' && 'data' in response) {
    return response.data ?? fallback;
  }

  return response ?? fallback;
};

export const getApiList = (response) => {
  const data = getApiData(response, []);
  return Array.isArray(data) ? data : [];
};

export const getApiPagination = (response) => {
  if (response && typeof response === 'object' && 'pagination' in response) {
    return response.pagination ?? null;
  }

  return null;
};

export const getApiMessage = (response, fallback = '') => {
  if (response && typeof response === 'object' && 'message' in response) {
    return response.message || fallback;
  }

  return fallback;
};
