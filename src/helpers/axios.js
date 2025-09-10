import axios from 'axios';

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

  // Request Interceptor
  instance.interceptors.request.use((req) => {
    req.headers['Request-Started-At'] = new Date().getTime();
    return req;
  });

  // Response Interceptor
  instance.interceptors.response.use(
    (res) => {
      const startTime = res.config.headers['Request-Started-At'];
      if (startTime) {
        console.log(
          `Execution time for: ${res.config.url} - ${new Date().getTime() - startTime} ms`
        );
      }
      return res;
    },
    (error) => {
      if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
        console.log('Request timed out');
      }
      return Promise.reject(error);
    }
  );

  return instance;
};
