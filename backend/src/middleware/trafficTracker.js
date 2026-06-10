let trafficStats = {
  totalRequests: 0,
  failedLogins: 0
};

const trafficTracker = (req, res, next) => {
  trafficStats.totalRequests += 1;

  // Track failed login attempts by monitoring responses on login endpoints
  res.on("finish", () => {
    const isLoginPath = req.path.includes("/auth/login") || req.path.includes("/login");
    if (isLoginPath && res.statusCode >= 400 && res.statusCode < 500) {
      trafficStats.failedLogins += 1;
    }
  });

  next();
};

module.exports = {
  trafficTracker,
  trafficStats
};
