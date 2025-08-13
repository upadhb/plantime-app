declare namespace jest {
  interface MockedFunction<T extends (...args: any[]) => any> extends Mock<ReturnType<T>, Parameters<T>> {
    mockResolvedValue(value: Awaited<ReturnType<T>>): this;
    mockRejectedValue(value: any): this;
  }

  interface Mock<T = any, Y extends any[] = any> {
    mockResolvedValue(value: Awaited<T>): this;
    mockRejectedValue(value: any): this;
  }
}