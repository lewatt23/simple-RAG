import cors from 'cors';
import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';

import { setUpMediaEndpoints } from '../modules/media';
import { RegisterRoutes } from '../routes/routes';
import swaggerSchema from '../routes/swagger.json';
import { config } from './config';

export const setupServer = async (): Promise<Express> => {
  const app: Express = express();

  // Add helmet securities
  app.use(helmet({ contentSecurityPolicy: false }));

  // enable CORS - Cross Origin Resource Sharing
  app.use(cors());

  app.use(express.json());
  app.use(express.text());
  app.use(express.urlencoded({ extended: true }));

  // mount media endpoints
  setUpMediaEndpoints(app);

  // register all our routes on basePath
  const routesApp = express();
  RegisterRoutes(app);
  app.use(config.API_BASE_PATH, routesApp);

  // setup graphql

  app.use(
    `/docs`,
    (req: any, res: any, next: () => any) => {
      if (swaggerSchema.servers.length === 1) {
        swaggerSchema.servers = [
          { url: `http://${req.get('host')}` },
          { url: `https://${req.get('host')}` },
        ];

        if (config.REVERSE_PROXY) {
          // Avoid issues like failed to fetch errors when using http, due to Content-Security headers
          swaggerSchema.servers = swaggerSchema.servers.reverse();
        }
      }

      req.swaggerDoc = swaggerSchema;
      next();
    },
    swaggerUi.serve,
    swaggerUi.setup(),
  );

  // error handler
  app.use((err: any, req: Request, res: Response, next: any) => {
    if (res.headersSent) {
      return next(err);
    }

    const locals = {
      name: err.name,
      message: err.message,
      details: err.details,
    };

    if ('fields' in err) {
      const details: Record<string, any> = {};

      for (const key in err.fields) {
        // lets remove the body. when validating body
        if (key.startsWith('body.')) {
          details[key.substr(5)] = err.fields[key];
        } else {
          details[key] = err.fields[key];
        }
      }

      locals.details = details;
    }

    res.status(err.status || 500);
    res.json(locals);
  });

  return app;
};
