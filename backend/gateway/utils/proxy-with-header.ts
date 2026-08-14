import proxy from "express-http-proxy";

export const proxyWithHeader = (serviceUrl: string, prefix: string = "") => {
  return proxy(serviceUrl, {
    proxyReqPathResolver: (req) => {
      // req.url is the path matching after the gateway mount point, e.g. "/get-conversations"
      return prefix + req.url;
    },
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      if (srcReq.user) {
        proxyReqOpts.headers["X-USER-ID"] = srcReq.user._id;
      }
      return proxyReqOpts;
    },
  });
};

export default proxyWithHeader;
