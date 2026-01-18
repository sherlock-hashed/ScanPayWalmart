
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  trend?: string;
  color?: string;
}

export function KPICard({ title, value, description, icon: Icon, trend, color = 'text-primary' }: KPICardProps) {
  return (
    <Card className="glass-card hover-lift">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
          {trend && (
            <div className="text-sm font-medium text-green-600">
              {trend}
            </div>
          )}
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-foreground">{value}</h3>
          <p className="text-sm font-medium text-foreground/80">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
