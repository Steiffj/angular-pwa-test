import { IdbGlobalSettings } from './idb-global-settings';

fdescribe('IdbToggle', () => {
  afterEach(() => {
    IdbGlobalSettings.mode = 'persistent';
  });

  it('globalThis should have the real indexedDB implementation by default', () => {
    expect(IdbGlobalSettings.mode).toEqual('persistent');
    expect(IdbGlobalSettings.ok).toBeTrue();
  });

  it('should change globalThis to fake indexedDB implementation when setting mode to in-memory', () => {
    IdbGlobalSettings.mode = 'in-memory';
    expect(IdbGlobalSettings.mode).toEqual('in-memory');
    expect(IdbGlobalSettings.ok).toBeTrue();
  });

  it('should change globalThis to real indexedDB implementation when setting mode to persistent', () => {
    IdbGlobalSettings.mode = 'in-memory';
    IdbGlobalSettings.mode = 'persistent';
    expect(IdbGlobalSettings.mode).toEqual('persistent');
    expect(IdbGlobalSettings.ok).toBeTrue();
  });

  it('should report invalid when globalThis contains unexpected properties', () => {
    Object.defineProperty(globalThis, 'indexedDB', {
      value: 'nonsense',
    });
    expect(IdbGlobalSettings.mode).toEqual('invalid');
    expect(IdbGlobalSettings.ok).toBeFalse();
  });

  it('should restore globalThis to valid state when setting mode', () => {
    Object.defineProperty(globalThis, 'indexedDB', {
      value: 'nonsense',
    });
    expect(IdbGlobalSettings.mode).toEqual('invalid');
    expect(IdbGlobalSettings.ok).toBeFalse();

    IdbGlobalSettings.mode = 'persistent';
    expect(IdbGlobalSettings.mode).toEqual('persistent');
    expect(IdbGlobalSettings.ok).toBeTrue();

    Object.defineProperty(globalThis, 'indexedDB', {
      value: 'nonsense',
    });
    expect(IdbGlobalSettings.mode).toEqual('invalid');
    expect(IdbGlobalSettings.ok).toBeFalse();

    IdbGlobalSettings.mode = 'in-memory';
    expect(IdbGlobalSettings.mode).toEqual('in-memory');
    expect(IdbGlobalSettings.ok).toBeTrue();
  });
});
