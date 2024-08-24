import { config, setupServer } from './config';

setupServer().then((app) => {
  app.listen(config.SERVER_PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`🚀 Server started on port ${config.SERVER_PORT} (${config.NODE_ENV})`);
  });
});
