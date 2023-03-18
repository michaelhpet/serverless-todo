import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'
import { updateTodo } from '../../helpers/business_logic'

const logger = createLogger('updateTodo')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
    // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
    logger.info('Processing a new event: updateTodo', { event })

    const userId: string = getUserId(event)
    await updateTodo(userId, todoId, updatedTodo)

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: ''
    }
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
