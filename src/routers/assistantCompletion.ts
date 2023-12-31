/* istanbul ignore file */
import express from 'express';

import auth from '../middleware/auth';
import { handleAssistantCompletion } from '../controllers/openai';
import { logger as customLogger } from '../utils/pinoLogger';

const log = customLogger(__filename);

export const router = express.Router();
router.use(auth);

router.use('/assistant/complete', async (req, res) => {
  let customerId;
  let userId;
  try {
    customerId = req.headers['x-customer-id'] as string;
    ({ userId } = req.body);
    const { query } = req.body;
    const aiAnswer = await handleAssistantCompletion(customerId, userId, query);
    return res.json(aiAnswer);
  } catch (e) {
    log.error({
      action: '/assistant/complete',
      result: 'failure',
      customerId,
      userId,
      e: e.stack,
    });
  }
});
