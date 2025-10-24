import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@repo/ui/components/ui/button';
import { Card } from '@repo/ui/components/ui/card';
import { Badge } from '@repo/ui/components/ui/badge';
import { ArrowLeft, Users } from 'lucide-react';

const COLORS = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#84cc16', '#14b8a6'];

type LicenseInfo = {
  vendor: string | null;
  tier: number | null;
  lemonProductId: number | null;
  deActivatedAt?: Date | null;
}

type LicenseStatus = {
  hasActiveLicense: boolean;
  hasInactiveLicense: boolean;
  deactivatedAt: Date | null;
  activeLicense: LicenseInfo | null;
  inactiveLicense: LicenseInfo | null;
}

type UserDetail = {
  email: string;
  role: string;
  createdAt: string;
  licenseStatus: LicenseStatus;
}

type RoleData = {
  name: string;
  value: number;
}

type RoleDistributionChartProps = {
  data: RoleData[];
};

export function RoleDistributionChart({ data }: RoleDistributionChartProps) {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetail[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsersByRole = async (role: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/onboarding/users-by-role?role=${encodeURIComponent(role)}`);
      const data = await response.json();
      setUserDetails(data);
      setSelectedRole(role);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setSelectedRole(null);
    setUserDetails([]);
  };

  const getLicenseBadge = (user: UserDetail) => {
    const { licenseStatus } = user;

    if (licenseStatus.hasActiveLicense && licenseStatus.activeLicense) {
      const license = licenseStatus.activeLicense;
      
      if (license.vendor === 'appsumo') {
        return (
          <Badge variant="default" className="bg-orange-500">
            AppSumo T{license.tier}
          </Badge>
        );
      }

      if (license.vendor === 'lemonsqueezy') {
        return (
          <Badge variant="default" className="bg-yellow-500">
            Lemon #{license.lemonProductId}
          </Badge>
        );
      }

      return <Badge variant="default">Paid</Badge>;
    }

    if (licenseStatus.hasInactiveLicense && licenseStatus.inactiveLicense) {
      const inactiveLicense = licenseStatus.inactiveLicense;
      const deactivatedDays = inactiveLicense.deActivatedAt 
        ? Math.floor((new Date().getTime() - new Date(inactiveLicense.deActivatedAt).getTime()) / (1000 * 60 * 60 * 24))
        : null;

      return (
        <div className="flex gap-2 items-center">
          <Badge variant="destructive">
            Refunded
          </Badge>
          {inactiveLicense.vendor === 'appsumo' && (
            <Badge variant="outline" className="text-orange-500">
              Was T{inactiveLicense.tier}
            </Badge>
          )}
          {inactiveLicense.vendor === 'lemonsqueezy' && (
            <Badge variant="outline" className="text-yellow-500">
              Was #{inactiveLicense.lemonProductId}
            </Badge>
          )}
          {deactivatedDays && (
            <span className="text-xs text-gray-500">
              ({deactivatedDays}d ago)
            </span>
          )}
        </div>
      );
    }

    return <Badge variant="secondary">Free</Badge>;
  };

  if (selectedRole) {
    return (
      <Card className="p-4">
        <div className="flex items-center mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="mr-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h3 className="text-lg font-semibold">Users with role: {selectedRole}</h3>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <span className="loading loading-spinner">Loading...</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-4 font-semibold pb-2 border-b">
              <div>Email</div>
              <div>Role</div>
              <div>License Status</div>
              <div>Joined</div>
            </div>
            {userDetails.map((user, index) => (
              <div key={`user-${user.email}-${index}`} className="grid grid-cols-4 py-2 border-b border-gray-100">
                <div className="truncate">{user.email}</div>
                <div>{user.role}</div>
                <div>{getLicenseBadge(user)}</div>
                <div>{new Date(user.createdAt).toLocaleDateString()}</div>
              </div>
            ))}
            {userDetails.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No users found for this role
              </div>
            )}
          </div>
        )}

        {/* Summary Section */}
        <div className="mt-6 pt-6 border-t">
          <h4 className="font-semibold mb-3">Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-3">
              <div className="text-sm text-gray-600">Total Users</div>
              <div className="text-xl font-semibold">{userDetails.length}</div>
            </Card>
            <Card className="p-3">
              <div className="text-sm text-gray-600">Active Licenses</div>
              <div className="text-xl font-semibold">
                {userDetails.filter(u => u.licenseStatus.hasActiveLicense).length}
              </div>
            </Card>
            <Card className="p-3">
              <div className="text-sm text-gray-600">Refunded</div>
              <div className="text-xl font-semibold">
                {userDetails.filter(u => u.licenseStatus.hasInactiveLicense).length}
              </div>
            </Card>
            <Card className="p-3">
              <div className="text-sm text-gray-600">Free Users</div>
              <div className="text-xl font-semibold">
                {userDetails.filter(u => !u.licenseStatus.hasActiveLicense && !u.licenseStatus.hasInactiveLicense).length}
              </div>
            </Card>
          </div>

          {/* AppSumo Tiers Breakdown */}
          <div className="mt-4">
            <h5 className="font-semibold mb-2">AppSumo Tiers</h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5].map(tier => (
                <Card key={`tier-${tier}`} className="p-3">
                  <div className="text-sm text-gray-600">Tier {tier}</div>
                  <div className="text-xl font-semibold">
                    {userDetails.filter(u => 
                      u.licenseStatus.hasActiveLicense && 
                      u.licenseStatus.activeLicense?.vendor === 'appsumo' && 
                      u.licenseStatus.activeLicense?.tier === tier
                    ).length}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="relative">
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              outerRadius={140}
              fill="#8884d8"
              dataKey="value"
              isAnimationActive={true}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${entry.name}-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-2 border rounded shadow">
                      <p className="text-sm">{`${payload[0].name}: ${payload[0].value}`}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Role Buttons Section */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">View Users by Role</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {data.map((role, index) => (
            <Button
              key={`role-${role.name}`}
              variant="outline"
              className="flex items-center justify-center"
              onClick={() => fetchUsersByRole(role.name)}
              style={{
                borderColor: COLORS[index % COLORS.length],
                color: COLORS[index % COLORS.length]
              }}
            >
              <Users className="w-4 h-4 mr-2" />
              {role.name} ({role.value})
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
}