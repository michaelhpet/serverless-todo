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

export async function getTodoItem(todoId: string): Promise<TodoItem> {
  const result = await docClient
    .get({
      TableName: todosTable,
      Key: { todoId }
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

export async function todoItemExists(todoId: string): Promise<boolean> {
  const todoItem = await getTodoItem(todoId)
  return Boolean(todoItem)
}

export async function updateTodoItem(
  userId: string,
  todoId: string,
  payload: TodoUpdate
): Promise<void> {
  await docClient
    .update({
      TableName: todosTable,
      Key: { userId, todoId },
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

  logger.info(`Todo item updated successfully: ${todoId}`)
}

export async function updateAttachmentUrl(
  userId: string,
  todoId: string,
  attachmentUrl: string
): Promise<void> {
  await docClient
    .update({
      TableName: todosTable,
      Key: { userId, todoId },
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl': attachmentUrl
      }
    })
    .promise()

  logger.info(`Todo item attachment URL updated: ${todoId}`)
}

export async function deleteTodoItem(
  userId: string,
  todoId: string
): Promise<void> {
  logger.info(`Attempting to delete todo item: ${todoId}`)
  await docClient
    .delete({
      TableName: todosTable,
      Key: { userId, todoId }
    })
    .promise()

  logger.info(`Todo item deleted successfully: ${todoId}`)
}
