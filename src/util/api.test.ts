import { Product } from '../core/models/product';
import {
  ViewsResponse,
  convertViews,
  fetchManifest,
  fetchExtensionManifest,
  fetchUserInfo,
  fetchProducts
} from './api';
import {
  mockFetchError,
  mockFetchForExtensionManifest,
  mockFetchForManifest,
  mockFetchForUserInfo,
  mockFetchProducts
} from '../tests/mocks';

let globalAny = global as any;

describe('api', () => {
  describe('fetchManifest', () => {
    it('should return data', async function () {
      globalAny.fetch = jest.fn().mockImplementation(mockFetchForManifest);
      try {
        const data = await fetchManifest('127.0.0.1:8080', 'clientId', 'username', 'version', 'channelId', 'secret');
        expect(data).toBeDefined();
      } catch (e) {}
    });

    it('on error should be fired ', async function () {
      const onError = jest.fn();
      globalAny.fetch = jest.fn().mockImplementation(mockFetchError);
      try {
        const data = await fetchManifest('127.0.0.1:8080', 'clientId', '', '', '', '');
      } catch (error) {
        expect(error).toEqual('Missing configurations for rig: EXT_VERSION,EXT_CHANNEL,EXT_SECRET');
      }
    });
  })

  describe('fetchExtensionManifest', () => {
    beforeEach(function() {
      globalAny.fetch = jest.fn().mockImplementation(mockFetchForExtensionManifest);
    });

    it('should return data', async function () {
      const data = await fetchExtensionManifest('127.0.0.1:8080', 'clientId', 'version', 'jwt');
      expect(data).toBeDefined();
    });
  });

  describe('fetchUserInfo', () => {
    beforeEach(() => {
      globalAny.fetch = jest.fn().mockImplementation(mockFetchForUserInfo);
    });
    it('should return data', async function () {
      await fetchUserInfo('127.0.0.1:8080', 'token', (data: any) => {
        expect(data).toBeDefined();
      }, () => { });
    });

    it('on error should fire', async function () {
      const onError = jest.fn()
      globalAny.fetch = jest.fn().mockImplementation(mockFetchError);
      await fetchUserInfo('127.0.0.1:8080', 'token', () => { }, onError);
      expect(onError).toHaveBeenCalled();
    });
  });

  describe('convertViews', () => {
    const data: ViewsResponse = {
      config: {
        viewer_url: 'test',
      },
      hidden: {
        viewer_url: 'test',
      },
      live_config: {
        viewer_url: 'test',
      },
      video_overlay: {
        viewer_url: 'test',
      },
      panel: {
        viewer_url: 'test',
        height: 300,
      },
    };

    it('should convert camel case views correctly', () => {
      const results = convertViews(data);
      expect(results.config.viewerUrl).toBe('test');
      expect(results.liveConfig.viewerUrl).toBe('test');
      expect(results.videoOverlay.viewerUrl).toBe('test');
      expect(results.panel.viewerUrl).toBe('test');
      expect(results.hidden.viewerUrl).toBe('test');
    });
  });

  describe('fetchProducts', () => {
    beforeEach(function() {
      globalAny.fetch = jest.fn().mockImplementation(mockFetchProducts);
    });

    it('should return products', async function () {
      await fetchProducts('127.0.0.1:8080', 'clientId', '', (products: Product[]) => {
        expect(products).toBeDefined();
      }, jest.fn());
    });

    it('should serialize products correctly', async function () {
      await fetchProducts('127.0.0.1:8080', 'clientId', '', (products: Product[]) => {
        expect(products).toHaveLength(2);
        products.forEach(product => {
          expect(product).toMatchObject({
            sku: expect.any(String),
            displayName: expect.any(String),
            amount: expect.stringMatching(/[1-9]\d*/),
            inDevelopment: expect.stringMatching(/true|false/),
            broadcast: expect.stringMatching(/true|false/)
          });
        });
      }, jest.fn());
    });
  });
});
