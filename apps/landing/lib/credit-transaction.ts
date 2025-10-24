import { TransactionType } from '@prisma/client';
import prismadb from './prismadb';

interface CreateTransactionParams {
  userId: string;
  amount: number;
  type: TransactionType;
  description?: string;
}

export async function createCreditTransaction({
  userId,
  amount,
  type,
  description
}: CreateTransactionParams) {
  try {
    // Get or create UserCredit
    let userCredit = await prismadb.userCredit.findUnique({ where: { userId } });
    if (!userCredit) {
      userCredit = await prismadb.userCredit.create({
        data: { userId, balance: 10 } // New users start with 10 credits
      });
    }

    // Calculate new balance
    const newBalance = userCredit.balance + (type === TransactionType.SPENT ? -amount : amount);

    if (newBalance < 0) {
      throw new Error('Insufficient credits');
    }

    // Create transaction
    const transaction = await prismadb.creditTransaction.create({
      data: {
        userCredit: { connect: { id: userCredit.id } },
        amount,
        type,
        description
      }
    });

    // Update user credit balance
    await prismadb.userCredit.update({
      where: { id: userCredit.id },
      data: { balance: newBalance }
    });

    return { transaction, newBalance };
  } catch (error) {
    console.error('Error in createCreditTransaction:', error);
    throw error;
  }
}