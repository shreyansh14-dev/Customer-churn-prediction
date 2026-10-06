import React from 'react';
import {
  X,
  User,
  AlertTriangle,
  ShieldCheck,
  TrendingDown,
  CreditCard,
  Headphones,
  Calendar,
  DollarSign,
  Zap,
  ArrowRight
} from 'lucide-react';

interface Customer360ModalProps {
  customer: any;
  onClose: () => void;
  onApplyPlaybook?: (customerId: string) => void;
}

export const Customer360Modal: React.FC<Customer360ModalProps> = ({
  customer,
  onClose,
  onApplyPlaybook
}) => {
  if (!customer) return null;

  const isHighRisk = customer.risk_level === 'HIGH' || customer.risk_level === 'CRITICAL';
  const prob = (customer.probability * 100).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-[#c9c9cd] w-full max-w-3xl rounded-[22.5px] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-[#c9c9cd] flex items-center justify-between bg-[#f7f7f7]">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-[#1f1f1f] flex items-center justify-center text-white">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[18px] font-display font-medium text-[#1f1f1f] font-mono">{customer.customer_id}</h2>
                <span className={`text-[11px] px-3 py-0.5 rounded-full font-medium border ${
                  isHighRisk
                    ? 'bg-[#1f1f1f] text-white border-[#1f1f1f]'
                    : 'bg-white text-[#1f1f1f] border-[#c9c9cd]'
                }`}>
                  {customer.risk_level} RISK
                </span>
              </div>
              <p className="text-[12px] text-[#717173]">Customer 360 Longitudinal Profile & SHAP Explainability</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[#c9c9cd] flex items-center justify-center text-[#717173] hover:text-[#1f1f1f] hover:bg-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-[#1f1f1f]">
          {/* Top Probability Gauge & Risk Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-[20px] bg-[#f7f7f7] border border-[#e5e5e8] flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-sans uppercase tracking-[0.015em] text-[#717173]">Churn Probability</span>
                <div className="text-[32px] font-display font-medium text-[#1f1f1f] mt-1">{prob}%</div>
              </div>
              <div className="w-full bg-[#e5e5e8] h-1.5 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-[#1f1f1f] h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(customer.probability * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="p-5 rounded-[20px] bg-[#f7f7f7] border border-[#e5e5e8] flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-sans uppercase tracking-[0.015em] text-[#717173]">Decision Threshold</span>
                <div className="text-[32px] font-display font-medium text-[#1f1f1f] mt-1 font-mono">
                  {((customer.threshold || 0.5) * 100).toFixed(0)}%
                </div>
              </div>
              <p className="text-[11px] text-[#717173]">Cost-calibrated F1 optimal cutoff</p>
            </div>

            <div className="p-5 rounded-[20px] bg-[#f7f7f7] border border-[#e5e5e8] flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-sans uppercase tracking-[0.015em] text-[#717173]">Estimated Exposure</span>
                <div className="text-[32px] font-display font-medium text-[#1f1f1f] mt-1 font-mono">
                  ${((customer.customer_value || 89.9) * 1).toFixed(0)}/mo
                </div>
              </div>
              <p className="text-[11px] text-[#717173]">Monthly recurring contract value</p>
            </div>
          </div>

          {/* Why This Customer Is At Risk (SHAP Risk Drivers) */}
          <div className="p-5 rounded-[20px] bg-white border border-[#c9c9cd] space-y-3">
            <h3 className="text-[15px] font-display font-medium text-[#1f1f1f] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#1f1f1f]" />
              <span>Why This Customer Is At Risk (SHAP Tree Attribution)</span>
            </h3>

            {customer.top_risk_factors && customer.top_risk_factors.length > 0 ? (
              <div className="space-y-2">
                {customer.top_risk_factors.map((factor: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-full bg-[#f7f7f7] border border-[#e5e5e8] flex items-center justify-between text-[12px] px-4"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1f1f1f]" />
                      <span className="font-mono text-[#1f1f1f] font-medium">{factor.feature.replace(/_/g, " ")}</span>
                    </div>
                    <span className="font-mono text-[11px] text-[#717173]">
                      Impact: +{(factor.impact * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[12px] text-[#717173]">
                Baseline model probability. No extreme anomalous outliers detected.
              </p>
            )}
          </div>

          {/* Protective Factors */}
          {customer.protective_factors && customer.protective_factors.length > 0 && (
            <div className="p-5 rounded-[20px] bg-white border border-[#c9c9cd] space-y-3">
              <h3 className="text-[15px] font-display font-medium text-[#1f1f1f] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#1f1f1f]" />
                <span>Protective Factors (Retention Drivers)</span>
              </h3>

              <div className="space-y-2">
                {customer.protective_factors.map((factor: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-full bg-[#f7f7f7] border border-[#e5e5e8] flex items-center justify-between text-[12px] px-4"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#717173]" />
                      <span className="font-mono text-[#1f1f1f] font-medium">{factor.feature.replace(/_/g, " ")}</span>
                    </div>
                    <span className="font-mono text-[11px] text-[#717173]">
                      Reduced: {(factor.impact * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Retention Action Playbook */}
          <div className="p-5 rounded-[20px] bg-[#f7f7f7] border border-[#c9c9cd] flex items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-sans uppercase tracking-[0.015em] text-[#717173]">Recommended Action Playbook</span>
              <h4 className="text-[16px] font-display font-medium text-[#1f1f1f] mt-0.5">
                {customer.recommended_action || "Schedule proactive account check-in with customer success team."}
              </h4>
              <p className="text-[12px] text-[#717173] mt-1">
                Model Version: {customer.model_version || "1.0.0"} • Validated prediction
              </p>
            </div>

            <button
              onClick={() => {
                if (onApplyPlaybook) {
                  onApplyPlaybook(customer.customer_id);
                } else {
                  onClose();
                }
              }}
              className="btn-pill-dark text-[13px] !py-2 !px-5 whitespace-nowrap cursor-pointer hover:bg-black/80"
            >
              Apply Playbook
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
