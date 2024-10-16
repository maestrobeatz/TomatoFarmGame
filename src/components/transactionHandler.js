// transactionHandler.js
import sessionKit from '../config/sessionConfig';  // Adjust the path based on your project structure
import { TAPOS } from '../hooks/useSession'; // Corrected path to import TAPOS from useSession

// Helper function to initialize and perform a transaction
export const InitTransaction = async (dataTrx) => {
  try {
    const session = await sessionKit.restore(); // Restores the session
    if (!session) {
      throw new Error("No session found");
    }

    const actions = [...dataTrx.actions]; // Spread in actions for the transaction

    const transaction = await session.transact({ actions }, TAPOS);
    if (transaction) {
      return {
        transactionId: String(transaction.resolved?.transaction.id),
        actions: actions
      };
    }
  } catch (error) {
    console.error('Transaction error:', error);
    throw new Error('Failed to perform transaction: ' + error.message);
  }
};
