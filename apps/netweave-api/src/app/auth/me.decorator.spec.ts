import { ExecutionContext } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { UserAuthDTO, UserDTO } from '@netweave/api-types';
import { Request } from 'express';
import { Me } from './me.decorator';

/**
 * NestJS wraps the factory passed to `createParamDecorator` in metadata
 * rather than exposing it directly. This helper extracts the underlying
 * factory function so it can be invoked and tested in isolation, without
 * needing to spin up a full controller/HTTP request.
 * This is the pattern recommended in the official NestJS testing docs.
 */
// Mirrors the call signature of the function returned by
// `createParamDecorator` (e.g. `Me()`), which produces a ParameterDecorator.
type ParamDecoratorFactory = (...args: unknown[]) => ParameterDecorator;

// Shape of the metadata Nest stores for each decorated route parameter.
interface RouteParamMetadataEntry<T = unknown> {
  factory: (data: unknown, ctx: ExecutionContext) => T;
}

function getParamDecoratorFactory<T = unknown>(
  decorator: ParamDecoratorFactory,
): (data: unknown, ctx: ExecutionContext) => T {
  class TestDecorator {
    public test(@decorator() _: T) {
      /* empty */
    }
  }

  const args: Record<string, RouteParamMetadataEntry<T>> = Reflect.getMetadata(
    ROUTE_ARGS_METADATA,
    TestDecorator,
    'test',
  );
  // There is only ever one param decorated in TestDecorator.test,
  // so grab its factory regardless of the generated key.
  return args[Object.keys(args)[0]].factory;
}

describe('Me decorator', () => {
  let factory: (data: unknown, ctx: ExecutionContext) => unknown;

  const createMockExecutionContext = (
    request: Partial<Request>,
  ): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: jest.fn(),
        getNext: jest.fn(),
      }),
    } as unknown as ExecutionContext;
  };

  beforeAll(() => {
    factory = getParamDecoratorFactory(Me);
  });

  it('returns request.user when it is set', () => {
    const mockUser = { id: 1, email: 'test@example.com' } as UserDTO;
    const mockUserAuth: UserAuthDTO = { sub: 1, user: mockUser };
    const context = createMockExecutionContext({ user: mockUserAuth });

    const result = factory(undefined, context);

    expect(result).toEqual(mockUserAuth);
  });

  it('returns undefined when request.user is not set', () => {
    const context = createMockExecutionContext({});

    const result = factory(undefined, context);

    expect(result).toBeUndefined();
  });

  it('ignores the data argument passed to the decorator', () => {
    const mockUser = { id: 42, email: 'jane@example.com' } as UserDTO;
    const mockUserAuth: UserAuthDTO = { sub: 1, user: mockUser };
    const context = createMockExecutionContext({ user: mockUserAuth });

    // @Me() is used with no data, but the factory should behave the
    // same regardless of what's passed as the first argument.
    const result = factory('some-unused-data', context);

    expect(result).toEqual(mockUserAuth);
  });

  it('retrieves the request via context.switchToHttp().getRequest()', () => {
    const mockUser = { id: 1, email: 'test@example.com' } as UserDTO;
    const mockUserAuth: UserAuthDTO = { sub: 1, user: mockUser };
    const getRequest = jest.fn().mockReturnValue({ user: mockUserAuth });
    const context = {
      switchToHttp: () => ({
        getRequest,
        getResponse: jest.fn(),
        getNext: jest.fn(),
      }),
    } as unknown as ExecutionContext;

    factory(undefined, context);

    expect(getRequest).toHaveBeenCalledTimes(1);
  });
});
