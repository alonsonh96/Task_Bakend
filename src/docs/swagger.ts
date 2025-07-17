import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
// import { Express } from 'express';
import YAML from 'yamljs';
import path from 'path';
import SwaggerParser from '@apidevtools/swagger-parser';

const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de UpTask',
      version: '1.0.0',
      description: 'Documentación generada con Swagger para UpTask',
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Servidor local',
      },
    ],
  },
  apis: ['./src/docs/**/*.yaml'], // Documentación externa en YAML
};

// const swaggerSpec = swaggerJSDoc(swaggerOptions);

// export function setupSwagger(app: Express) {
//   app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
//   // console.log('Swagger docs disponible en: http://localhost:4000/api-docs');
// } 

// export function setupSwagger(app: import('express').Express) {
//   const swaggerDocument = YAML.load(path.join(__dirname, './swagger.yaml'));

//   app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// }


export async function setupSwagger(app: import('express').Express) {
  const swaggerDoc = await SwaggerParser.dereference(path.join(__dirname, './swagger.yaml'));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
}