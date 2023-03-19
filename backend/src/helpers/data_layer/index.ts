import 'source-map-support/register'

import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../../utils/logger'
import { TodoItem } from '../../models/TodoItem'
import { TodoUpdate } from '../../models/TodoUpdate'

const AWSXRay = require('aws-xray-sdk')

const logger = createLogger('data_layer-todos')

const XAWS = AWSXRay.captureAWS(AWS)

const docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE
const todosByUserIndex = process.env.TODOS_BY_USER_INDEX

export async function createTodoItem(todoItem: TodoItem): Promise<void> {
  await docClient
    .put({
      TableName: todosTable,
      Item: todoItem
    })
    .promise()

  logger.info(`Todo item ${todoItem.todoId} was created`)
}

export async function getTodoItem(todoItemId: string): Promise<TodoItem> {
  const result = await docClient
    .get({
      TableName: todosTable,
      Key: { todoId: todoItemId }
    })
    .promise()

  logger.info(`Todo item fetched: ${result.Item}`)
  return result.Item as TodoItem
}

export async function getTodosByUserId(userId: string): Promise<TodoItem[]> {
  const result = await docClient
    .query({
      TableName: todosTable,
      IndexName: todosByUserIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    })
    .promise()

  logger.info(`Todos successfully fetched for user: ${userId}`)
  return result.Items as TodoItem[]
}

export async function todoItemExists(todoItemId: string): Promise<boolean> {
  const todoItem = await getTodoItem(todoItemId)
  return Boolean(todoItem)
}

export async function updateTodoItem(
  todoItemId: string,
  payload: TodoUpdate
): Promise<void> {
  await docClient
    .update({
      TableName: todosTable,
      Key: { todoId: todoItemId },
      UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
      ExpressionAttributeNames: {
        '#name': 'name'
      },
      ExpressionAttributeValues: {
        ':name': payload.name,
        ':dueDate': payload.dueDate,
        ':done': payload.done
      }
    })
    .promise()

  logger.info(`Todo item updated successfully: ${todoItemId}`)
}

export async function updateAttachmentUrl(
  todoItemId: string,
  attachmentUrl: string
): Promise<void> {
  await docClient
    .update({
      TableName: todosTable,
      Key: { todoId: todoItemId },
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl': attachmentUrl
      }
    })
    .promise()

  logger.info(`Todo item attachment URL updated: ${todoItemId}`)
}

export async function deleteTodoItem(todoItemId: string): Promise<void> {
  await docClient
    .delete({
      TableName: todosTable,
      Key: { todoId: todoItemId }
    })
    .promise()

  logger.info(`Todo item deleted successfully: ${todoItemId}`)
}
