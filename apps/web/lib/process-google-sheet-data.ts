const PRICE_PER_SALE = 3.42; // $3 per sale

export function processGoogleSheetsData(data: any[]) {
  const vendors: { [key: string]: number } = {};
  const statuses: { [key: string]: number } = { ACTIVE: 0, INACTIVE: 0 };
  const dailySales: { [key: string]: { sales: number, revenue: number } } = {};
  const refundsByVendor: { [key: string]: number } = {};
  const refundsByDate: { [key: string]: number } = {};
  let totalSales = 0;
  let totalRevenue = 0;
  let appSumoSales = 0;
  let appSumoRevenue = 0;
  let totalRefunds = 0;
  let refundRevenue = 0;

  const today = new Date().toISOString().split('T')[0];
  let newSalesToday = 0;
  let newAppSumoSalesToday = 0;
  let newRefundsToday = 0;

  data.slice(1).forEach(row => {
    const [date, , , , vendor, status] = row;
    
    if (typeof vendor === 'string' && !['lemonsqueezy', 'internal'].includes(vendor.toLowerCase())) {
      // Vendor breakdown
      vendors[vendor] = (vendors[vendor] || 0) + 1;
      
      // Status breakdown
      if (typeof status === 'string' && (status === 'ACTIVE' || status === 'INACTIVE')) {
        statuses[status]++;
      }
      
      // Daily sales and refunds
      if (typeof date === 'string') {
        if (status === 'ACTIVE') {
          if (!dailySales[date]) {
            dailySales[date] = { sales: 0, revenue: 0 };
          }
          dailySales[date].sales++;
          dailySales[date].revenue += PRICE_PER_SALE;

          if (date === today) {
            newSalesToday++;
            if (vendor.toLowerCase() === 'appsumo') {
              newAppSumoSalesToday++;
            }
          }
          totalSales++;
          totalRevenue += PRICE_PER_SALE;

          if (vendor.toLowerCase() === 'appsumo') {
            appSumoSales++;
            appSumoRevenue += PRICE_PER_SALE;
          }
        } else if (status === 'INACTIVE') {
          totalRefunds++;
          refundRevenue += PRICE_PER_SALE;
          
          // Refunds by vendor
          refundsByVendor[vendor] = (refundsByVendor[vendor] || 0) + 1;
          
          // Refunds by date
          refundsByDate[date] = (refundsByDate[date] || 0) + 1;
          
          if (date === today) {
            newRefundsToday++;
          }
        }
      }
    }
  });

  // Calculate refund rate
  const refundRate = totalSales > 0 ? (totalRefunds / totalSales) * 100 : 0;

  return { 
    vendors, 
    statuses, 
    dailySales,
    newSalesToday, 
    totalSales, 
    totalRevenue,
    appSumoSales,
    appSumoRevenue,
    newAppSumoSalesToday,
    totalRefunds,
    refundRevenue,
    newRefundsToday,
    refundsByVendor,
    refundsByDate,
    refundRate
  };
}