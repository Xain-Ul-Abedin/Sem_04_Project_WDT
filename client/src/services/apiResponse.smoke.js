import assert from 'node:assert/strict';
import {
  getApiData,
  getApiList,
  getApiMessage,
  getApiPagination,
} from './apiResponse.js';

const wrappedResponse = {
  success: true,
  message: 'ok',
  data: { totalUsers: 4 },
};

assert.deepEqual(getApiData(wrappedResponse), { totalUsers: 4 });
assert.deepEqual(getApiList({ data: null }), []);
assert.deepEqual(getApiList({ data: { total: 2 } }), []);
assert.deepEqual(
  getApiPagination({
    data: [{ _id: '1' }],
    pagination: { page: 2, total: 25 },
  }),
  { page: 2, total: 25 }
);
assert.equal(getApiMessage({ message: 'Saved successfully' }), 'Saved successfully');
assert.equal(getApiMessage({}, 'Fallback message'), 'Fallback message');

console.log('apiResponse smoke tests passed');
