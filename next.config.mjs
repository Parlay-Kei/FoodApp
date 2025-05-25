/* next.config.mjs */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  webpack: (config, { isServer }) => {
    // Ignore missing optional dependencies (bufferutil and utf-8-validate) so that the build can proceed.
    config.ignoreWarnings = [ { module: /node_modules\/ws\/lib\/buffer-util\.js/, message: /Can't resolve 'bufferutil'/, }, { module: /node_modules\/ws\/lib\/validation\.js/, message: /Can't resolve 'utf-8-validate'/, } ];
    // (Optional) Fallback for missing optional dependencies (bufferutil and utf-8-validate) so that the build can proceed.
    config.resolve.fallback = { ...config.resolve.fallback, "bufferutil": false, "utf-8-validate": false };
    return config;
  }
};

export default nextConfig; 