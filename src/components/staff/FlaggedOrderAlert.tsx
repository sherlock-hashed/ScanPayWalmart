
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Flag, Shield } from 'lucide-react';
import type { OrderWithRisk } from '@/services/anomalyService';

interface FlaggedOrderAlertProps {
  order: OrderWithRisk;
}

export function FlaggedOrderAlert({ order }: FlaggedOrderAlertProps) {
  if (!order.needsManualVerification) {
    return null;
  }

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="flex items-center space-x-2">
        <span>Manual Verification Required</span>
        <Badge variant="destructive" className="ml-2">
          <Flag className="h-3 w-3 mr-1" />
          Flagged
        </Badge>
      </AlertTitle>
      <AlertDescription className="space-y-2">
        <p>
          This order has been flagged for manual verification due to suspicious activity patterns.
        </p>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <Shield className="h-3 w-3" />
            <span>Suspicion Score: <strong>{order.suspicionScore}/10</strong></span>
          </div>
        </div>
        {order.triggeredRules && order.triggeredRules.length > 0 && (
          <div className="mt-2">
            <p className="text-sm font-medium">Triggered Rules:</p>
            <ul className="text-sm list-disc list-inside ml-2">
              {order.triggeredRules.map((rule, index) => (
                <li key={index}>{rule}</li>
              ))}
            </ul>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}
