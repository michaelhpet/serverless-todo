import * as uuid from 'uuid'
import {
  createTodoItem,
  deleteTodoItem,
  getTodoItem,
  getTodosByUserId,
  updateTodoItem,
  updateAttachmentUrl as _updateAttachmentUrl
} from '../data_layer'
import { getAttachmentUrl, getSignedUrl } from '../file_storage'
import { TodoItem } from '../../models/TodoItem'
import { createLogger } from '../../utils/logger'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { TodoUpdate } from '../../models/TodoUpdate'

// TODO: Implement businessLogic => DONE
const logger = createLogger('business_logic-todos')

export async function createTodo(
  userId: string,
  payload: CreateTodoRequest
): Promise<TodoItem> {
  const todoId: string = uuid.v4()

  const todoItem: TodoItem = {
    userId,
    todoId,
    createdAt: new Date().toISOString(),
    done: false,
    attachmentUrl: null,
    ...payload
  }

  try {
    await createTodoItem(todoItem)
    logger.info(`Todo item created successfully: ${todoId}`, todoItem)
    return todoItem
  } catch (error) {
    logger.error(`Could not create todo item for user: ${userId}`)
  }
}

export async function getTodos(userId: string): Promise<TodoItem[]> {
  try {
    const todoItems = await getTodosByUserId(userId)
    logger.info(
      `Fetched todo items for user: ${userId}`,
      JSON.stringify(todoItems)
    )
    return todoItems
  } catch (error) {
    logger.error(`Could not fetch todo items for user: ${userId}`)
    return []
  }
}

export async function updateTodo(
  userId: string,
  todoId: string,
  payload: UpdateTodoRequest
): Promise<void> {
  try {
    const item = await getTodoItem(todoId)

    if (!item) throw new Error('Todo item not found')

    if (userId !== item.userId) {
      throw new Error('Update action on todo item unauthorized')
    }

    await updateTodoItem(todoId, payload as TodoUpdate)
    logger.info('Todo item updated:', payload)
  } catch (error) {
    logger.error(error?.message || 'Could not update todo item')
  }
}

export async function deleteTodo(
  userId: string,
  todoId: string
): Promise<void> {
  try {
    const item = await getTodoItem(todoId)

    if (!item) throw new Error('Todo item not found')

    if (userId !== item.userId) {
      throw new Error('Delete action on todo item unauthorized')
    }

    await deleteTodoItem(todoId)
    logger.info(`Deleted todo item: ${todoId} for user: ${userId}`)
  } catch (error) {
    logger.error(error?.message || 'Could not delete todo item')
  }
}

export async function updateAttachmentUrl(
  userId: string,
  todoId: string,
  attachmentId: string
): Promise<void> {
  try {
    const attachmentUrl = getAttachmentUrl(attachmentId)

    const item = await getTodoItem(todoId)

    if (!item) throw new Error('Todo item not found')

    if (userId !== item.userId) {
      throw new Error('Update action on todo item unauthorized')
    }

    await _updateAttachmentUrl(todoId, attachmentUrl)
    logger.info(`Updated todo item attachment url: ${todoId}, ${attachmentUrl}`)
  } catch (error) {
    logger.error(error?.message || 'Could not update attachment URL')
  }
}

export function getUploadUrl(attachmentId: string): string {
  try {
    const signedUrl = getSignedUrl(attachmentId)
    logger.info(`Signed URL created: ${signedUrl}`)
    return signedUrl
  } catch (error) {
    logger.error('Could not get upload URL')
  }
}
