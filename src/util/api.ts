import { ExtensionViews } from '../core/models/extension';
import { Product } from '../core/models/product';
import { createSignedToken } from '../util/token';
import { missingConfigurations } from '../util/errors';
import { RigRole } from '../constants/rig';

export interface ViewsResponse {
  component?: {
    viewer_url: string;
    aspect_height: number;
    aspect_width: number;
    size: number;
    zoom: boolean;
    zoom_pixels: number;
  };
  config?: {
    viewer_url: string;
  };
  hidden?: {
    viewer_url: string;
  };
  live_config?: {
    viewer_url: string;
  };
  mobile?: {
    viewer_url: string;
  };
  panel?: {
    height: number;
    viewer_url: string;
  };
  video_overlay?: {
    viewer_url: string;
  };
}

export function convertViews(data: ViewsResponse): ExtensionViews {
  const views: ExtensionViews = {};

  if (data.config) {
    views.config = { viewerUrl: data.config.viewer_url };
  }

  if (data.hidden) {
    views.hidden = { viewerUrl: data.hidden.viewer_url };
  }

  if (data.live_config) {
    views.liveConfig = { viewerUrl: data.live_config.viewer_url };
  }

  if (data.panel) {
    views.panel = {
      height: data.panel.height,
      viewerUrl: data.panel.viewer_url,
    };
  }

  if (data.video_overlay) {
    views.videoOverlay = { viewerUrl: data.video_overlay.viewer_url };
  }

  if (data.mobile) {
    views.mobile = { viewerUrl: data.mobile.viewer_url };
  }

  if (data.component) {
    views.component = {
      aspectHeight: data.component.aspect_height,
      aspectWidth: data.component.aspect_width,
      viewerUrl: data.component.viewer_url,
      zoom: data.component.zoom,
      zoomPixels: data.component.zoom_pixels,
    };
  }

  return views;
}

export function fetchExtensionManifest(host: string, clientId: string, version: string, jwt: string, onSuccess: Function, onError: Function) {
  const api = 'https://' + host + '/kraken/extensions/search';
  return fetch(api, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + jwt,
      'Accept': 'application/vnd.twitchtv.v5+json',
      'Content-Type': 'application/json',
      'Client-ID': clientId,
    },
    body: JSON.stringify({
      limit: 1,
      searches: [
        {
          field: 'id',
          term: clientId,
        },
        {
          field: 'version',
          term: version,
        }
      ]
    }),
    referrer: 'Twitch Developer Rig',
  }).then((response) =>  response.json())
    .then((data) => {
      if (data.extensions && data.extensions.length > 0) {
        const manifest = data.extensions[0];
        manifest.views = convertViews(manifest.views);
        onSuccess({ manifest: manifest, error: '' });
      } else {
        onError("Unable to retrieve extension manifest, please verify EXT_OWNER_NAME and EXT_SECRET");
      }
    });
}

export function fetchManifest(host: string, clientId: string, username: string, version: string, channelId: string, secret: string, onSuccess: Function, onError: Function) {
  if (!username || !clientId || !version || !channelId || !secret) {
    onError(missingConfigurations({
      'EXT_CLIENT_ID': clientId,
      'EXT_VERSION': version,
      'EXT_CHANNEL': channelId,
      'EXT_SECRET': secret,
    }));
    return null;
  }

  const api = 'https://' + host + '/helix/users?login=' + username;
  return fetch(api, {
    method: 'GET',
    headers: {
      'Client-ID': clientId,
    },
    referrer: 'Twitch Developer Rig',
  }).then((response) => {
    if (response.status >= 400 && response.status < 500) {
      onError(`Unable to authorize for user ${username} and client id ${clientId}`)
      return null;
    }
    if (response.status >= 500) {
      onError('Unable to hit Twitch API to initialize the rig. Try again later.');
      return null;
    }
    return response.json()
  }).then((respJson) => {
    if (!respJson) {
      return null;
    }

    const data = respJson.data;
    if (!data && data.length === 0) {
      onError('Unable to verify the id for username: ' + username);
      return null;
    }
    const userId = data[0]['id'];
    onSuccess({ userId: userId });

    const token = createSignedToken(RigRole, '', userId, channelId, secret);
    return fetchExtensionManifest(host, clientId, version, token, onSuccess, onError);
  });
}

export function fetchUserInfo(host: string, accessToken: string, onSuccess: Function, onError: Function) {
  const api = 'https://' + host + '/helix/users';
  return fetch(api, {
    method: 'GET',
    headers: {
      'authorization': 'Bearer ' + accessToken,
    }
  }).then(response => response.json())
    .then(respJson => {
      const data = respJson.data;
      if (!data && data.length === 0) {
        onError('Unable to get user data for token: ', accessToken);
        return null;
      }
      onSuccess(data[0]);
    }).catch(error => {
      onError(error);
    });
}

export function fetchProducts(host: string, clientId: string, token: string, onSuccess: Function, onError: Function) {
  const api = 'https://' + host + '/v5/bits/extensions/twitch.ext.' + clientId + '/products?includeAll=true';

  fetch(api, {
    method: 'GET',
    headers: {
      'Accept': 'application/vnd.twitchtv.v5+json',
      'Content-Type': 'application/json',
      'Authorization': 'OAuth ' + token,
      'Client-ID': clientId,
    },
    referrer: 'Twitch Developer Rig',
  }).then(response => response.json())
    .then(respJson => {
      if (respJson.error) {
        onError(respJson.message);
        return null;
      }
      const products = respJson.products;
      if (!products) {
        onError('Unable to get products for clientId: ' + clientId);
        return null;
      }
      const serializedProducts = products.map(p => {
        let product = {
          sku: p.sku || '',
          displayName: p.displayName || '',
          amount: p.cost ? p.cost.amount.toString() : '1',
          inDevelopment: p.inDevelopment ? 'true' : 'false',
          broadcast: p.broadcast ? 'true' : 'false',
          deprecated: p.expiration ? Date.parse(p.expiration) <= Date.now() : false,
        };

        return product;
      });
      onSuccess(serializedProducts);
    }).catch(error => {
      onError(error);
    });
}

export function saveProduct(host: string, clientId: string, token: string, product: Product, index: number, onSuccess: Function, onError: Function) {
  const api = 'https://' + host + '/v5/bits/extensions/twitch.ext.' + clientId + '/products/put';
  const deserializedProduct = {
    domain: 'twitch.ext.' + clientId,
    sku: product.sku,
    displayName: product.displayName,
    cost: {
      amount: product.amount,
      type: 'bits'
    },
    inDevelopment: product.inDevelopment === 'true' ? true : false,
    broadcast: product.broadcast === 'true' ? true : false,
    expiration: product.deprecated ? new Date(Date.now()).toISOString() : null
  };

  fetch(api, {
    method: 'POST',
    body: JSON.stringify({ product: deserializedProduct }),
    headers: {
      'Accept': 'application/vnd.twitchtv.v5+json',
      'Content-Type': 'application/json',
      'Authorization': 'OAuth ' + token,
      'Client-ID': clientId,
    },
    referrer: 'Twitch Developer Rig',
  }).then(response => response.json())
    .then(respJson => {
      onSuccess(index);
    }).catch(error => {
      onError(index, error);
    });
}

export function fetchNewRelease(onSuccess: Function, onError: Function) {
  const api = 'https://api.github.com/repos/twitchdev/developer-rig/releases/latest';
  return fetch(api, {
    method: 'GET',
    headers: {
      'Accept': 'application/vnd.github.v3+json',
    }
  }).then(response => response.json())
    .then(respJson => {
      const tagName = respJson.tag_name;
      const zipUrl = respJson.assets[0].browser_download_url;
      if (tagName && zipUrl) {
        onSuccess(tagName, zipUrl);
      } else {
        throw new Error('Cannot get GitHub developer rig latest release');
      }
    }).catch(error => {
      if (onError) {
        onError(error);
      } else {
        console.error(error);
      }
    });
}
