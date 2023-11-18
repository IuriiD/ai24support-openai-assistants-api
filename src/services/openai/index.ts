import axios from 'axios';
import { setTimeout as wait } from 'timers/promises';
import { logger as customLogger } from '../../utils/pinoLogger';
import { getCustomerConfigById } from '../common';
import { Role } from './types';

const log = customLogger(__filename);

// OpenAI Assistants API - https://platform.openai.com/docs/api-reference/assistants
export const createThread = async ({
  customerId,
  userId,
}: {
  customerId: string;
  userId: string;
}): Promise<any | null> => {
  try {
    const customerConfig = getCustomerConfigById(customerId);
    if (!customerConfig) {
      return null;
    }

    const url = 'https://api.openai.com/v1/threads';

    const headers = {
      Authorization: `Bearer ${customerConfig.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v1',
    };

    const data = {
      metadata: {
        customerId,
        userId,
      },
    };

    const threadCreationRes = await axios.post(url, data, { headers });

    log.info({
      action: 'createThread',
      result: 'success',
      msg: `Created thead with id ${threadCreationRes.data.id}`,
      customerId,
      userId,
    });

    return threadCreationRes.data.id;
  } catch (err) {
    log.error({
      action: 'createThread',
      result: 'failure',
      e: err.stack,
      customerId,
      userId,
    });
    throw err;
  }
};

export const createMessageInThread = async ({
  customerId,
  userId,
  threadId,
  query,
}: {
  customerId: string;
  userId: string;
  threadId: string;
  query: string;
}): Promise<any | null> => {
  try {
    const customerConfig = getCustomerConfigById(customerId);
    if (!customerConfig) {
      return null;
    }

    // In our POC we assume that 1 user = 1 thread (threadI = userId)
    const url = `https://api.openai.com/v1/threads/${threadId}/messages`;

    const headers = {
      Authorization: `Bearer ${customerConfig.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v1',
    };

    const data = {
      role: Role.user,
      content: query,
    };

    const msgCreationRes = await axios.post(url, data, { headers });

    log.info({
      action: 'createMessageInThread',
      result: 'success',
      msg: `Created message with id ${msgCreationRes.data.id} for thread ${threadId}`,
      customerId,
      userId,
    });

    return msgCreationRes.data.id;
  } catch (err) {
    log.error({
      action: 'createMessageInThread',
      result: 'failure',
      e: err.stack,
      customerId,
      userId,
    });
    throw err;
  }
};

export const createThreadRun = async ({
  customerId,
  threadId,
  userId,
}: {
  customerId: string;
  threadId: string;
  userId: string;
}): Promise<any | null> => {
  try {
    const customerConfig = getCustomerConfigById(customerId);
    if (!customerConfig) {
      return null;
    }

    const url = `https://api.openai.com/v1/threads/${threadId}/runs`;

    const headers = {
      Authorization: `Bearer ${customerConfig.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v1',
    };

    const data = {
      assistant_id: customerConfig.OPENAI_ASSISTANT_ID,
    };

    const runCreationRes = await axios.post(url, data, { headers });

    log.info({
      action: 'createThreadRun',
      result: 'success',
      msg: `Created thread run with id ${runCreationRes.data.id} for thread ${threadId}`,
      customerId,
      userId,
    });

    return runCreationRes.data.id;
  } catch (err) {
    log.error({
      action: 'createThreadRun',
      result: 'failure',
      e: err.stack,
      customerId,
      userId,
    });
    throw err;
  }
};

const _retrieveThreadRun = async ({
  customerId,
  userId,
  threadId,
  runId,
}: {
  customerId: string;
  userId: string;
  threadId: string;
  runId: string;
}): Promise<any | null> => {
  try {
    const customerConfig = getCustomerConfigById(customerId);
    if (!customerConfig) {
      return null;
    }

    const url = `https://api.openai.com/v1/threads/${threadId}/runs/${runId}`;

    const headers = {
      Authorization: `Bearer ${customerConfig.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v1',
    };

    const runCreationRes = await axios.get(url, { headers });

    return runCreationRes.data.status;
  } catch (err) {
    log.error({
      action: 'retrieveThreadRun',
      result: 'failure',
      e: err.stack,
      customerId,
      userId,
    });
    throw err;
  }
};

export const pollForThreadRunCompletion = async ({
  customerId,
  userId,
  threadId,
  runId,
  checkCount = 0,
}: {
  customerId: string;
  userId: string;
  threadId: string;
  runId: string;
  checkCount?: number;
}): Promise<boolean | null> => {
  try {
    await wait(1000);
    const runStatus = await _retrieveThreadRun({ customerId, threadId, runId, userId });

    if (runStatus === 'completed') {
      log.info({
        action: 'pollForThreadRunCompletion',
        result: 'success',
        userId,
        customerId,
        runId,
        msg: 'Run succeeded',
      });
      return true;
    } else if (['cancelled', 'cancelling', 'failed', 'expired'].includes(runStatus)) {
      log.error({
        action: 'pollForThreadRunCompletion',
        result: 'failure',
        e: 'Run failed',
      });
      return false;
    } else {
      if (checkCount < 10) {
        return await pollForThreadRunCompletion({
          customerId,
          userId,
          threadId,
          runId,
          checkCount: checkCount++,
        });
      } else {
        log.error({
          action: 'pollForThreadRunCompletion',
          result: 'failure',
          e: 'Timed out polling for thread run results',
        });
      }
    }
  } catch (err) {
    log.error({
      action: 'pollForThreadRunCompletion',
      result: 'failure',
      e: err.stack,
      customerId,
      userId,
    });
    throw err;
  }
};

export const listThreadMessages = async ({
  customerId,
  userId,
  threadId,
}: {
  customerId: string;
  userId: string;
  threadId: string;
}): Promise<any | null> => {
  try {
    const customerConfig = getCustomerConfigById(customerId);
    if (!customerConfig) {
      return null;
    }

    const url = `https://api.openai.com/v1/threads/${threadId}/messages`;

    const headers = {
      Authorization: `Bearer ${customerConfig.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v1',
    };

    const messagesRes = await axios.get(url, { headers });

    return messagesRes.data;
  } catch (err) {
    log.error({
      action: 'listThreadMessages',
      result: 'failure',
      e: err.stack,
      customerId,
      userId,
    });
    throw err;
  }
};

export const getLastAssistantsMessage = ({
  threadMessages,
  customerId,
  userId,
}: {
  threadMessages: any;
  customerId: string;
  userId: string;
}): any => {
  try {
    const { first_id: mostRecentMsgId, data: messages } = threadMessages;
    const lastMessage = messages.find((msg: any) => msg.id === mostRecentMsgId);
    if (!lastMessage) {
      log.error({
        action: 'getLastAssistantsMessage',
        result: 'failure',
        e: 'Failed to get the last message from the thread',
        customerId,
        userId,
      });
      return false;
    }

    if (lastMessage?.role !== Role.assistant) {
      log.error({
        action: 'getLastAssistantsMessage',
        result: 'failure',
        e: 'Last message is not from the assistant',
        customerId,
        userId,
      });
      return false;
    }

    const assistantMessageContent = lastMessage?.content?.[0];
    if (!assistantMessageContent) {
      log.error({
        action: 'getLastAssistantsMessage',
        result: 'failure',
        e: 'No assistant message content was found',
        customerId,
        userId,
      });
      return false;
    }

    if (assistantMessageContent?.type !== 'text') {
      log.error({
        action: 'getLastAssistantsMessage',
        result: 'failure',
        e: 'Assistant message is not text',
        customerId,
        userId,
      });
      return false;
    }

    log.info({
      action: 'getLastAssistantsMessage',
      result: 'success',
      msg: assistantMessageContent.text.value,
      customerId,
      userId,
    });
    return assistantMessageContent?.text.value;
  } catch (err) {
    log.error({
      action: 'getLastAssistantsMessage',
      result: 'failure',
      e: err.stack,
      customerId,
      userId,
    });
    throw err;
  }
};
