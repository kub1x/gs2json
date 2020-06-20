module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [
    {
      name      : 'gs2json',
      script    : 'src/server.js',
      env: {
        PORT: '8099',
      },
    },
  ],
};
