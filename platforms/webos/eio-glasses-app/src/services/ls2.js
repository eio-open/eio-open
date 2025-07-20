/**
 * LS2 Service Wrapper - Production Grade
 * Real implementation for webOS Luna Service Bus calls
 */
export function ls2Request(uri, method, params = {}, { subscribe = false, timeout = 10000 } = {}) {
  return new Promise((resolve, reject) => {
    const controller = window.webOS?.service?.request;
    if (!controller) {
      return reject(new Error('LS2 unavailable'));
    }

    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      reject(new Error(`LS2 timeout after ${timeout} ms`));
    }, timeout);

    const req = controller(uri, {
      method,
      parameters: params,
      subscribe,
      onSuccess: (res) => { 
        if (!timedOut) { 
          clearTimeout(timer); 
          subscribe ? resolve(req) : resolve(res); 
        } 
      },
      onFailure: (err) => { 
        if (!timedOut) { 
          clearTimeout(timer); 
          reject(new Error(err.errorText || 'LS2 failure')); 
        } 
      }
    });
  });
} 