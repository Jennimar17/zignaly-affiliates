import fs from 'fs';
import mongoose from 'mongoose';
import {
  connect,
  disconnect,
  loadChainsAndVisits,
  loadCustomerData,
} from '../service/data-importer';
import processChain from '../service/chain-processor';
import { logError } from '../service/logger';
import { MONGO_URL } from '../config';
import processVisit from '../service/visit-processor';
import Visit from '../model/visit';
import Chain from '../model/chain';

// Connect to database
mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.Promise = global.Promise;

const LOCK_FILE_PATH = './.elock';

const createLock = () => fs.writeFileSync(LOCK_FILE_PATH, '');
const checkLock = () => fs.existsSync(LOCK_FILE_PATH);
const removeLock = () => fs.unlinkSync(LOCK_FILE_PATH);

(async () => {
  if (checkLock()) {
    logError('Lock exists');
  } else {
    createLock();
    try {
      await connect();
      const { chains, visits } = await loadChainsAndVisits();
      const customerData = await loadCustomerData();
      await disconnect();
      if (process.argv[2] === 'clear') await Chain.remove({});
      await Visit.remove({});

      const tryProcess = async f => {
        try {
          await f();
        } catch (error) {
          logError('Failed at processing an eveent');
          logError(error);
        }
      };

      for (const chain of chains) {
        await tryProcess(() => processChain(chain, customerData[chain.userId]));
      }

      for (const visit of visits) {
        await tryProcess(() => processVisit(visit));
      }
    } catch (error) {
      logError('Failed at processing events');
      logError(error);
    }
  }

  removeLock();
  process.exit(0);
})();
