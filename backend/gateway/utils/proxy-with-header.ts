import proxy from "express-http-proxy";

/**
 * Configures express-http-proxy to forward requests to microservices 
 * while appending the authenticated user's ID to the downstream request headers.
 * 
 * @param {string} serviceUrl - Downstream service target URL (e.g. localhost:8002)
 * @param {string} [prefix=""] - Optional route prefix prepended to URL
 * @returns {RequestHandler} The configured Express HTTP proxy middleware
 */
export const proxyWithHeader = (serviceUrl: string, prefix: string = "") => {
  return proxy(serviceUrl, {
    limit: "50mb",
    // Resolves the destination request path dynamically
    proxyReqPathResolver: (req) => {
      // req.url contains the path suffix after the route mount point (e.g., "/messages")
      return prefix + req.url;
    },
    // Decorates headers before forwarding the request
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      // Inject authenticated user ID into headers for downstream service consumption
      if (srcReq.user) {
        proxyReqOpts.headers["X-USER-ID"] = srcReq.user._id;
      }
      return proxyReqOpts;
    },
  });
};

export default proxyWithHeader;
