import { greet } from '../index';

describe('greet', () => {
  it('should return a greeting message', () => {
    expect(greet('World')).toBe('Hello, World!');
  });

  it('should include the provided name', () => {
    expect(greet('TypeScript')).toBe('Hello, TypeScript!');
  });
});
