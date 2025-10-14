export const catchAsync = async (fn: () => Promise<any>) => {
    try {
      return await fn();
    } catch (error) {
      console.error('Navigation error:', error);
      return null;
    }
  };