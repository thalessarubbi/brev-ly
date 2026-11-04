import fastifyCors from '@fastify/cors'
import fastifySwagger from '@fastify/swagger'
import scalarUi from '@scalar/fastify-api-reference'
import fastify from 'fastify'
import {
  hasZodFastifySchemaValidationErrors,
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { createLinkRoute } from './routes/create-link'
import { getLinkByShortUrlRoute } from './routes/get-link-by-short-url'
import { incrementLinkAccessCountRoute } from './routes/increment-link-access-count'

export const app = fastify()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.setErrorHandler((error, _request, reply) => {
  if (hasZodFastifySchemaValidationErrors(error)) {
    return reply.status(400).send({
      message: 'Validation error',
      issues: error.validation,
    })
  }

  console.error(error)

  return reply.status(500).send({ message: 'Internal server error' })
})

app.register(fastifyCors, { origin: '*' })

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Brev.ly API',
      description: 'API for the Brev.ly project',
      version: '1.0.0',
    },
  },
  transform: jsonSchemaTransform,
})

app.register(scalarUi, {
  routePrefix: '/docs',
  configuration: {},
})

app.register(createLinkRoute)
app.register(getLinkByShortUrlRoute)
app.register(incrementLinkAccessCountRoute)
