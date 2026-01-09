import React from 'react';
import { KPICard } from '@/components/ui/kpi-card';

export const FoxerKPIs: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 reveal-on-scroll">
            <KPICard
              title="Operating Income"
              value="₱142,500"
              icon="payments"
              iconColor="text-accent"
              trend={{ value: "+12%", direction: "up", label: "vs last month" }}
              progressColor="bg-accent"
              progressWidth="70%"
            />
            <KPICard
              title="Tickets Sold"
              value="1,240"
              icon="confirmation_number"
              iconColor="text-primary"
              trend={{ value: "+8%", direction: "up", label: "this week" }}
              progressColor="bg-primary"
              progressWidth="85%"
            />
            <KPICard
              title="Active Events"
              value="12"
              icon="event"
              iconColor="text-secondary"
              progressColor="bg-secondary"
              progressWidth="60%"
            />
            <KPICard
              title="Total Bookings"
              value="94"
              icon="local_activity"
              iconColor="text-success"
              trend={{ value: "+24%", direction: "up", label: "vs last week" }}
              progressColor="bg-success"
              progressWidth="90%"
            />
          </div>
  );
};
