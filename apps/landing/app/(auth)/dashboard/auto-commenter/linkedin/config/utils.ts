// Add these constants at the top level of your file
export const MAX_COMMENTS = 10;
export const MAX_LIKES = 10;

// Add this utility function to calculate totals
const calculateTotalInteractions = (
  feedInteractions: any,
  keywordTargets: any,
) => {
  let totalComments = feedInteractions?.numComments || 0;
  let totalLikes = feedInteractions?.numLikes || 0;

  // Add up all keyword target interactions
  keywordTargets?.forEach((target: any) => {
    totalComments += target.numComments || 0;
    totalLikes += target.numLikes || 0;
  });

  return { totalComments, totalLikes };
};