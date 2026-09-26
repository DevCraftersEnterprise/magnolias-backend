import { USER_LIST_QUERY_OPTIONS } from './user-list-query.util';

describe('USER_LIST_QUERY_OPTIONS', () => {
  it('incluye branch y branches en relations y select', () => {
    expect(USER_LIST_QUERY_OPTIONS.relations).toEqual({
      branch: true,
      branches: true,
    });
    expect(USER_LIST_QUERY_OPTIONS.select).toMatchObject({
      id: true,
      name: true,
      lastname: true,
      username: true,
      role: true,
      branch: { id: true, name: true },
      branches: { id: true, name: true },
    });
  });

  it('ordena por fecha de creación descendente y nombre ascendente', () => {
    expect(USER_LIST_QUERY_OPTIONS.order).toEqual({
      createdAt: 'DESC',
      name: 'ASC',
    });
  });
});
