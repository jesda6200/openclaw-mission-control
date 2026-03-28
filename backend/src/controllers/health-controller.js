function createHealthController({ db }) {
  return {
    health: (_req, res) => {
      res.json({
        success: true,
        data: {
          status: 'ok',
          storage: db.kind,
          uptime: process.uptime(),
          timestamp: new Date().toISOString(),
        },
      });
    },
  };
}

module.exports = { createHealthController };
