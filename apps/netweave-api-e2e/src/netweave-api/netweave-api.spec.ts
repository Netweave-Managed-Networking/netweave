import axios from 'axios';

describe('GET /api', () => {
  it('should return "healthy"', async () => {
    const res = await axios.get(`/api`);

    expect(res.status).toBe(200);
    expect(res.data).toEqual('healthy');
  });
});
