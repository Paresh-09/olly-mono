export function processOnboardingData(onboardingData: any[]) {
    const dailySummaries: Record<string, { count: number, roles: Record<string, number>, platforms: Record<string, number> }> = {};
    const roleSummary: Record<string, number> = {};
    const platformSummary: Record<string, number> = {};
    const engagementGoalSummary: Record<string, number> = {};
    const contentFrequencySummary: Record<string, number> = {};
    const commentFrequencySummary: Record<string, number> = {};
    const companySizeSummary: Record<string, number> = {};
    const aiExperienceSummary: Record<string, number> = {};
    const referralSourceSummary: Record<string, number> = {};
    let totalUsers = 0;
    let skippedUsers = 0;
  
    onboardingData.forEach(entry => {
      const dateKey = entry.completedAt.toISOString().split('T')[0];
      const role = entry.role || entry.roleOther || 'Other';
      const platform = entry.primaryPlatform || entry.primaryPlatformOther || 'Other';
      
      if (!dailySummaries[dateKey]) {
        dailySummaries[dateKey] = { count: 0, roles: {}, platforms: {} };
      }
      
      dailySummaries[dateKey].count++;
      dailySummaries[dateKey].roles[role] = (dailySummaries[dateKey].roles[role] || 0) + 1;
      dailySummaries[dateKey].platforms[platform] = (dailySummaries[dateKey].platforms[platform] || 0) + 1;
  
      if (!entry.skipped) {
        roleSummary[role] = (roleSummary[role] || 0) + 1;
        platformSummary[platform] = (platformSummary[platform] || 0) + 1;
        engagementGoalSummary[entry.engagementGoal || 'Not specified'] = (engagementGoalSummary[entry.engagementGoal || 'Not specified'] || 0) + 1;
        contentFrequencySummary[entry.contentFrequency || 'Not specified'] = (contentFrequencySummary[entry.contentFrequency || 'Not specified'] || 0) + 1;
        commentFrequencySummary[entry.commentFrequency || 'Not specified'] = (commentFrequencySummary[entry.commentFrequency || 'Not specified'] || 0) + 1;
        companySizeSummary[entry.companySize || 'Not specified'] = (companySizeSummary[entry.companySize || 'Not specified'] || 0) + 1;
        aiExperienceSummary[entry.aiExperience || 'Not specified'] = (aiExperienceSummary[entry.aiExperience || 'Not specified'] || 0) + 1;
        referralSourceSummary[entry.referralSource || 'Not specified'] = (referralSourceSummary[entry.referralSource || 'Not specified'] || 0) + 1;
        totalUsers++;
      } else {
        skippedUsers++;
      }
    });
  
    return {
      dailySummaries,
      roleSummary,
      platformSummary,
      engagementGoalSummary,
      contentFrequencySummary,
      commentFrequencySummary,
      companySizeSummary,
      aiExperienceSummary,
      referralSourceSummary,
      totalUsers,
      skippedUsers,
    };
  }