import os

content = """import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PredictionGauge from '../components/PredictionGauge';
import PageTransition from '../components/PageTransition';

const FEATURE_LABELS = {
  price: 'Product Price',
  category: 'Category',
  quantity: 'Quantity',
  paymentMethod: 'Payment Method',
  discount: 'Discount (%)',
  deliveryTime: 'Delivery Time (days)',
  age: 'Customer Age',
  gender: 'Gender',
  rating: 'Product Rating',
  previousReturns: 'Previous Returns',
  shippingDistance: 'Shipping Distance (km)',
  orderFrequency: 'Order Frequency',
};

export default function PredictionResultPage() {
  const location = useLocation();
  const navigate = useNavigate();

  if (!location.state) {
    navigate('/dashboard');
    return null;
  }

  const { result, input, productName } = location.state;
  const prob = result.confidence || result.probability || 0;
  
  // Use risk_level if provided, otherwise compute it
  const riskLevel = result.risk_level || (prob > 70 ? 'High' : prob >= 40 ? 'Medium' : 'Low');
  const isHighRisk = riskLevel.toLowerCase() === 'high' || prob > 70;
  const isMedium = riskLevel.toLowerCase() === 'medium' || (prob >= 40 && prob <= 70);

  const riskConfig = isHighRisk && !isMedium
    ? { label: 'High Risk (Likely to Return)', color: 'red', icon: '⚠', bgClass: 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20', textClass: 'text-red-700 dark:text-red-400', rec: 'Consider adding a return protection plan or adjusting the discount strategy for this order.' }
    : isMedium
    ? { label: 'Medium Risk (Moderate)', color: 'amber', icon: '~', bgClass: 'bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/20', textClass: 'text-amber-700 dark:text-amber-400', rec: 'Monitor this order. Customer has a moderate chance of return based on their profile.' }
    : { label: 'Low Risk (Not Likely)', color: 'green', icon: '✓', bgClass: 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/20', textClass: 'text-emerald-700 dark:text-emerald-400', rec: 'This order is low risk. Proceed with confidence — return probability is low.' };

  const riskFactors = result.risk_factors || null;

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-800 overflow-hidden"
        >

          {/* Header */}
          <div className={`p-8 border-b ${riskConfig.bgClass} text-center`}>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">AI Prediction Result</p>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{productName}</h1>
            <span className={`inline-flex items-center gap-2 mt-2 px-4 py-1.5 rounded-full text-sm font-semibold border ${riskConfig.bgClass} ${riskConfig.textClass}`}>
              {riskConfig.icon} {riskConfig.label}
            </span>
          </div>

          <div className="p-8">
            {/* Gauge + Analysis */}
            <div className="flex flex-col md:flex-row items-center justify-around gap-8 mb-10">
              <PredictionGauge probability={prob} />

              <div className="flex-1 max-w-sm space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Model Analysis</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    Based on 12 input features and historical transaction data, the Random Forest model evaluated this order.
                  </p>
                </div>

                {/* Confidence Bar — actual value */}
                <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Return Probability</span>
                    <span className={`text-sm font-bold ${riskConfig.textClass}`}>{prob.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(prob, 100)}%` }}
                      transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                      className={`h-2.5 rounded-full ${
                        prob >= 70 ? 'bg-red-500' : prob >= 40 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Recommendation */}
                <div className={`p-4 rounded-xl border text-sm ${riskConfig.bgClass} ${riskConfig.textClass}`}>
                  <p className="font-semibold mb-1">Recommendation</p>
                  <p className="leading-relaxed opacity-90">{riskConfig.rec}</p>
                </div>
              </div>
            </div>
            
            {/* AI Explanation / Risk Factors */}
            {riskFactors && riskFactors.length > 0 ? (
              <div className="border-t border-gray-100 dark:border-slate-800 pt-8 mb-8">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  AI Explanation: Key Risk Factors
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {riskFactors.map((factor, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + (idx * 0.1) }}
                      className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start gap-3"
                    >
                      <div className={`mt-0.5 w-2 h-2 rounded-full ${factor.impact === 'high' ? 'bg-red-500' : factor.impact === 'medium' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-white">{factor.feature}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{factor.reason}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="border-t border-gray-100 dark:border-slate-800 pt-8 mb-8">
                 <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  AI Explanation
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700">
                  The model predicted this outcome by comparing the {prob >= 50 ? 'high risk' : 'low risk'} pattern of these 12 input features with thousands of historical return records. Key contributing factors likely include category-specific return trends, discount levels, and customer history.
                </p>
              </div>
            )}

            {/* Input Features Grid */}
            <div className="border-t border-gray-100 dark:border-slate-800 pt-8">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Input Features Evaluated</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {Object.entries(input).map(([key, value]) => {
                  if (key === 'productId') return null;
                  const label = FEATURE_LABELS[key] || key.replace(/([A-Z])/g, ' $1').trim();
                  return (
                    <div key={key} className="bg-gray-50 dark:bg-slate-800/80 p-3 rounded-xl border border-gray-100 dark:border-slate-700">
                      <span className="block text-xs font-medium text-gray-400 dark:text-gray-500 mb-1 truncate">{label}</span>
                      <span className="block text-sm font-semibold text-slate-800 dark:text-white truncate">
                        {key === 'price' ? `$${Number(value).toFixed(2)}` : value?.toString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={() => navigate('/orders')}
                className="px-6 py-2.5 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-slate-700 transition text-sm"
              >
                View Order History
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2.5 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-slate-700 transition text-sm"
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate('/products')}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition shadow-md shadow-indigo-500/20 text-sm"
              >
                Make Another Prediction
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
"""
with open('src/pages/PredictionResultPage.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated PredictionResultPage.jsx")
