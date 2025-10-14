import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import prismadb from "@/lib/prismadb";
import OrgDashboard from "../../_components/org/dashboard";

export default async function OrgDashboardPage(props: { params: Promise<{ orgId: string }> }) {
  const params = await props.params;
  const { user } = await validateRequest();
  if (!user) {
    return redirect("/login");
  }

  const orgUser = await prismadb.organizationUser.findUnique({
    where: {
      userId_organizationId: {
        userId: user.id,
        organizationId: params.orgId,
      },
    },
    include: {
      organization: true,
    },
  });

  if (!orgUser) {
    return redirect("/dashboard");
  }

  const rawLicenses = await prismadb.licenseKey.findMany({
    where: { organizationId: params.orgId },
    select: {
      id: true,
      key: true,
      isActive: true,
      tier: true,
      vendor: true,
      lemonProductId: true
    },
  });

  const licenses = rawLicenses.map(license => ({
    ...license,
    vendor: license.vendor || 'unknown'
  }));

  const rawSubLicenses = await prismadb.subLicense.findMany({
    where: { assignedEmail: user.email },
    select: {
      id: true,
      key: true,
      status: true,
      assignedEmail: true,
      mainLicenseKey: {
        select: {
          id: true,
          tier: true,
          vendor: true,
          lemonProductId: true
        }
      }
    }
  });

  const subLicenses = rawSubLicenses.map(subLicense => ({
    ...subLicense,
    mainLicenseKey: {
      ...subLicense.mainLicenseKey,
      vendor: subLicense.mainLicenseKey.vendor || 'unknown'
    }
  }));

  // Calculate the date range
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const usageLogs = await prismadb.usageTracking.groupBy({
    by: ['action', 'platform', 'createdAt'],
    _count: {
      _all: true
    },
    where: {
      licenseKey: { organizationId: params.orgId },
      createdAt: {
        gte: sevenDaysAgo,
        lte: today
      }
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  const formattedUsageLogs: { 
    date: string; 
    total: number; 
    [key: string]: number | string | { [action: string]: number };
  }[] = [];

  usageLogs.forEach(log => {
    const date = log.createdAt.toISOString().split('T')[0];
    let dateEntry = formattedUsageLogs.find(entry => entry.date === date);
    
    if (!dateEntry) {
      dateEntry = { date, total: 0 };
      formattedUsageLogs.push(dateEntry);
    }

    const platform = log.platform as string;
    const action = log.action as string;
    
    if (!dateEntry[platform]) {
      dateEntry[platform] = {};
    }
    
    (dateEntry[platform] as { [action: string]: number })[action] = log._count._all;
    dateEntry.total += log._count._all;
  });

  const last7Days = Array.from({length: 7}, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const filledUsageLogs = last7Days.map(date => {
    return formattedUsageLogs.find(log => log.date === date) || { date, total: 0 };
  });

  return (
    <OrgDashboard
      organization={orgUser.organization}
      licenses={licenses}
      subLicenses={subLicenses}
      usageLogs={formattedUsageLogs}
      userRole={orgUser.role}
    />
  );
}