import axios from 'axios';
// import axiosRetry from 'axios-retry';

export default (baseURL, options) => {
  const instance = axios.create({
    baseURL,
    timeout: options?.timeout ?? 5000,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/plain, */*',
      ...options?.headers,
    },
    // httpsAgent: new https.Agent({
    //   rejectUnauthorized: false,
    // }),
  });

  // Configure retries with exponential backoff
  // axiosRetry(instance, {
  //   retries: options?.retries ?? 3, // number of retries
  //   retryDelay: axiosRetry.exponentialDelay, // exponential backoff
  //   retryCondition: (error) => {
  //     // Retry on network errors or 5xx responses
  //     return (
  //       axiosRetry.isNetworkError(error) ||
  //       axiosRetry.isRetryableError(error) ||
  //       error.response?.status >= 500
  //     );
  //   },
  // });

  // Request Interceptor
  instance.interceptors.request.use((req) => {
    req.metadata = { startTime: Date.now() };
    return req;
  });

  // Response Interceptor
  instance.interceptors.response.use(
    (res) => {
      const duration = Date.now() - res.config.metadata.startTime;
      console.log(`Execution time for: ${res.config.url} - ${duration} ms`);
      return res;
    },
    (error) => {
      const { config } = error;
      if (config?.metadata?.startTime) {
        const duration = Date.now() - config.metadata.startTime;
        console.error(
          `❌ [${config.method?.toUpperCase()} ${config.url}] failed after ${duration} ms`,
          error.message
        );
      }
      if (error.code === 'ECONNABORTED') {
        console.error(`⏱️ Timeout: ${error.config?.url}`);
      }
      return Promise.reject(error);
    }
  );

  return instance;
};
