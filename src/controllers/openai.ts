import { logger as customLogger } from '../utils/pinoLogger';
import { Role } from '../services/openai/types';
import {
  createThread,
  createMessageInThread,
  createThreadRun,
  pollForThreadRunCompletion,
  listThreadMessages,
  getLastAssistantsMessage,
} from '../services/openai';
import {
  saveConversationEntry,
  getThreadByUserId,
  findOrCreateThread,
  findOrCreateUser,
  findOrCreateCustomer,
} from '../db';

const log = customLogger(__filename);

export const handleAssistantCompletion = async (customerId: string, userId: string, query: string): Promise<string> => {
  log.info({
    action: 'handleAssistantCompletion',
    msg: 'start',
    result: 'success',
    customerId,
    userId,
    query,
  });

  try {
    // Ensure that customer exists in db
    const customerIdFound = await findOrCreateCustomer(customerId);

    // Find thread by userId, if doesn't exist, create thread, save user and thread to db
    let threadId = await getThreadByUserId(userId);
    if (!threadId) {
      threadId = await createThread({ customerId: customerIdFound, userId });
      await findOrCreateUser(userId, customerIdFound);
      await findOrCreateThread(userId, customerIdFound, threadId);
    }

    // Create a message in the thread
    await createMessageInThread({ customerId, userId, threadId, query });

    // Run the assistant on the thread to get a response
    const runId = await createThreadRun({ customerId, threadId, userId });

    // Poll for the completion of the run
    const runSucceeded = await pollForThreadRunCompletion({ customerId, userId, threadId, runId });
    if (!runSucceeded) {
      return null;
    }

    // Retrieve the messages added by the Assistant to the Thread after the Run completes
    const threadMessages = await listThreadMessages({ customerId, userId, threadId });
    const lastAssistantsMessage = getLastAssistantsMessage({ threadMessages, customerId, userId });
    if (!lastAssistantsMessage) {
      return null;
    }

    // Save user's query and bot's response to DB (optional functionality)
    await saveConversationEntry(userId, customerId, query, Role.user);
    await saveConversationEntry(userId, customerId, lastAssistantsMessage, Role.assistant);

    // Return the assistant's response
    return lastAssistantsMessage;
  } catch (err) {
    log.error({
      action: 'handleAssistantCompletion',
      result: 'failure',
      e: err.stack,
    });
  }
};
