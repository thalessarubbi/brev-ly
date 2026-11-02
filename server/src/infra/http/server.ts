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
import { env } from '@/env'

const server = fastify()

server.setValidatorCompiler(validatorCompiler)
server.setSerializerCompiler(serializerCompiler)

server.setErrorHandler((error, request, reply) => {
  if (hasZodFastifySchemaValidationErrors(error)) {
    return reply.status(400).send({
      message: 'Validation error',
      issues: error.validation,
    })
  }
})

server.register(fastifyCors, { origin: '*' })

server.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Brev.ly API',
      description: 'API for the Brev.ly project',
      version: '1.0.0',
    },
  },
  transform: jsonSchemaTransform,
})

server.register(scalarUi, {
  routePrefix: '/docs',
  configuration: {},
})


server.listen({ port: env.PORT }).then(() => {
  console.log('HTTP server running! 🚀')
})
