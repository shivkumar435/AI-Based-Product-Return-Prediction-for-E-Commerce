import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
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
  const source = result?.savedPrediction || result || {};
  const isFallback = Boolean(result?.isFallback || source?.isFallback || result?.prediction === 'Unavailable' || source?.prediction === 'Unavailable');
  const fallbackReason = result?.fallbackReason || source?.fallbackReason;

  const prob = typeof result?.probability === 'number'
    ? result.probability
    : typeof source?.probability === 'number'
    ? source.probability
    : 0;

  const confidence = typeof result?.confidence === 'number'
    ? result.confidence
    : typeof source?.confidence === 'number'
    ? source.confidence
    : 0;
  
  const riskLevel = result?.risk_level ?? source?.riskLevel ?? (prob > 70 ? 'High' : prob >= 40 ? 'Medium' : 'Low');
  const isHighRisk = riskLevel.toLowerCase() === 'high' || prob > 70;
  const isMedium = riskLevel.toLowerCase() === 'medium' || (prob >= 40 && prob <= 70);

  const riskConfig = isFallback
    ? {
        label: 'Prediction Unavailable',
        color: 'gray',
        icon: 'ℹ',
        bgClass: 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/30',
        textClass: 'text-amber-800 dark:text-amber-300',
        rec: fallbackReason || 'The AI return prediction service was unavailable. Order parameters were saved safely without an automated prediction.'
      }
    : isHighRisk && !isMedium
    ? { label: 'High Risk (Likely to Return)', color: 'red', icon: '⚠', bgClass: 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20', textClass: 'text-red-700 dark:text-red-400', rec: result?.recommendation || source?.recommendation || 'Consider adding a return protection plan or adjusting the discount strategy for this order.' }
    : isMedium
    ? { label: 'Medium Risk (Moderate)', color: 'amber', icon: '~', bgClass: 'bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/20', textClass: 'text-amber-700 dark:text-amber-400', rec: result?.recommendation || source?.recommendation || 'Monitor this order. Customer has a moderate chance of return based on their profile.' }
    : { label: 'Low Risk (Not Likely)', color: 'green', icon: '✓', bgClass: 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/20', textClass: 'text-emerald-700 dark:text-emerald-400', rec: result?.recommendation || source?.recommendation || 'This order is low risk. Proceed with confidence — return probability is low.' };

  const riskFactors = result?.risk_factors ?? source?.riskFactors ?? null;
  const featureImportance = result?.feature_importance ?? source?.featureImportance ?? null;

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
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
              {isFallback ? 'AI Service Notice' : 'AI Prediction Result'}
            </p>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{productName || 'Order Evaluation'}</h1>
            <span className={`inline-flex items-center gap-2 mt-2 px-4 py-1.5 rounded-full text-sm font-semibold border ${riskConfig.bgClass} ${riskConfig.textClass}`}>
              {riskConfig.icon} {riskConfig.label}
            </span>
          </div>

          <div className="p-8">
            {/* Gauge + Analysis */}
            <div className="flex flex-col md:flex-row items-center justify-around gap-8 mb-10">
              <PredictionGauge probability={prob} isFallback={isFallback} />

              <div className="flex-1 max-w-sm space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                    {isFallback ? 'Service Status' : 'Model Analysis'}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    {isFallback
                      ? 'The prediction pipeline was offline during this evaluation. The system recorded all 12 input features without generating a synthetic score.'
                      : 'Based on 12 input features and historical transaction data, the Random Forest model evaluated this order.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Probability */}
                  <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1">Return Chance</span>
                    <span className={`text-xl font-bold ${riskConfig.textClass}`}>
                      {isFallback ? 'N/A' : `${prob.toFixed(1)}%`}
                    </span>
                  </div>
                  {/* Confidence */}
                  <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1">Model Certainty</span>
                    <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                      {isFallback ? 'N/A' : `${confidence.toFixed(1)}%`}
                    </span>
                  </div>
                </div>

                {/* Recommendation */}
                <div className={`p-4 rounded-xl border text-sm ${riskConfig.bgClass} ${riskConfig.textClass}`}>
                  <p className="font-semibold mb-1">Status Note</p>
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
                      <div className={`mt-0.5 w-2 h-2 flex-shrink-0 rounded-full ${factor.impact === 'high' ? 'bg-red-500' : factor.impact === 'medium' ? 'bg-amber-500' : 'bg-green-500'}`} />
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-white">{factor.feature}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{factor.reason}</p>
                        <span className={`inline-block mt-2 text-[10px] uppercase tracking-wide font-bold px-2 py-0.5 rounded-full ${factor.impact === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : factor.impact === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                          {factor.impact} impact
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Feature Importance */}
            {featureImportance && (
              <div className="border-t border-gray-100 dark:border-slate-800 pt-8 mb-8">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Feature Importance</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={featureImportance} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                      <XAxis type="number" hide />
                      <YAxis dataKey="feature" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                      <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                      <Bar dataKey="importance" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
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
