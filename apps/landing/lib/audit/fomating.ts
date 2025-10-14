

  // Format date for display
  export const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  export const formatNumber = (num: number, type: 'views' | 'subscribers' = 'subscribers') => {
    if (type === 'views') {
      if (num >= 1_000_000_000) {
        return (num / 1_000_000_000).toFixed(1) + "B";
      } else if (num >= 1_000_000) {
        return (num / 1_000_000).toFixed(1) + "M";
      }
    } else if (type === 'subscribers') {
      if (num >= 1_000_000) {
        return (num / 1_000_000).toFixed(1) + "M";
      } else if (num >= 1_000) {
        return (num / 1_000).toFixed(1) + "K";
      }
    }
    return num.toLocaleString();
  };
  