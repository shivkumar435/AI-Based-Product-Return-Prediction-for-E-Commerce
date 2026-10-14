/**
 * Utility functions for business day calculations and delivery dates.
 * Initial demo default: 3-7 business days after order confirmation.
 */

const CONFIG = {
  DEFAULT_MIN_BUSINESS_DAYS: 3,
  DEFAULT_MAX_BUSINESS_DAYS: 7,
  DEFAULT_BUSINESS_DAYS: 5
};

/**
 * Adds a specified number of business days to a given start date,
 * skipping weekends (Saturday = 6, Sunday = 0).
 *
 * @param {Date|string|number} startDate - Starting date
 * @param {number} businessDays - Number of business days to add (default: 5)
 * @returns {Date} The resulting date
 */
function addBusinessDays(startDate = new Date(), businessDays = CONFIG.DEFAULT_BUSINESS_DAYS) {
  const date = new Date(startDate);
  if (isNaN(date.getTime())) {
    throw new Error('Invalid startDate provided to addBusinessDays');
  }

  const daysToAdd = Math.max(1, parseInt(businessDays, 10) || CONFIG.DEFAULT_BUSINESS_DAYS);
  let added = 0;

  while (added < daysToAdd) {
    date.setDate(date.getDate() + 1);
    const dayOfWeek = date.getDay();
    // 0 is Sunday, 6 is Saturday
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      added++;
    }
  }

  return date;
}

/**
 * Calculates delivery estimate window (min and max business days).
 *
 * @param {Date|string|number} startDate
 * @param {number} minDays
 * @param {number} maxDays
 * @returns {{ minDate: Date, maxDate: Date, estimatedDelivery: Date }}
 */
function calculateDeliveryWindow(
  startDate = new Date(),
  minDays = CONFIG.DEFAULT_MIN_BUSINESS_DAYS,
  maxDays = CONFIG.DEFAULT_MAX_BUSINESS_DAYS
) {
  const minDate = addBusinessDays(startDate, minDays);
  const maxDate = addBusinessDays(startDate, maxDays);
  // Default estimatedDelivery is midpoint (5 business days)
  const estimatedDelivery = addBusinessDays(startDate, Math.round((minDays + maxDays) / 2));

  return {
    minDate,
    maxDate,
    estimatedDelivery
  };
}

/**
 * Formats delivery status message for UI / timeline
 */
function getDeliveryStatusInfo(order) {
  if (!order) return { statusText: 'Unknown', deliveryText: 'N/A' };

  const { status, estimatedDelivery, actualDeliveryDate } = order;
  const estFormatted = estimatedDelivery ? new Date(estimatedDelivery).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : null;
  const actFormatted = actualDeliveryDate ? new Date(actualDeliveryDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : null;

  switch (status) {
    case 'Pending':
      return {
        statusText: 'Pending Confirmation',
        deliveryText: estFormatted ? `Estimated delivery: ${estFormatted}` : 'Calculating delivery date...',
        isDelivered: false
      };
    case 'Confirmed':
      return {
        statusText: 'Order Confirmed',
        deliveryText: estFormatted ? `Estimated delivery: ${estFormatted}` : 'Est: 3–7 business days',
        isDelivered: false
      };
    case 'Processing':
    case 'Packed':
      return {
        statusText: 'Packed & Preparing for Dispatch',
        deliveryText: estFormatted ? `Estimated delivery: ${estFormatted}` : 'Est: 3–7 business days',
        isDelivered: false
      };
    case 'Shipped':
      return {
        statusText: 'Dispatched',
        deliveryText: estFormatted ? `Estimated delivery: ${estFormatted}` : 'In transit',
        isDelivered: false
      };
    case 'Out for Delivery':
      return {
        statusText: 'Out for Delivery',
        deliveryText: 'Expected today',
        isDelivered: false
      };
    case 'Delivered':
      return {
        statusText: 'Delivered',
        deliveryText: actFormatted ? `Delivered on ${actFormatted}` : (estFormatted ? `Delivered on ${estFormatted}` : 'Delivered'),
        isDelivered: true,
        actualDeliveryDate
      };
    case 'Cancelled':
      return {
        statusText: 'Cancelled',
        deliveryText: 'Order cancelled — No delivery',
        isDelivered: false
      };
    case 'Return Requested':
      return {
        statusText: 'Return Requested',
        deliveryText: actFormatted ? `Delivered on ${actFormatted} (Return requested)` : 'Return requested',
        isDelivered: true
      };
    case 'Return Approved':
      return {
        statusText: 'Return Approved',
        deliveryText: 'Return approved — Pickup pending',
        isDelivered: true
      };
    case 'Return Rejected':
      return {
        statusText: 'Return Rejected',
        deliveryText: actFormatted ? `Delivered on ${actFormatted}` : 'Delivered',
        isDelivered: true
      };
    case 'Returned':
      return {
        statusText: 'Returned',
        deliveryText: 'Returned to warehouse',
        isDelivered: true
      };
    case 'Refunded':
      return {
        statusText: 'Refunded',
        deliveryText: 'Returned & Refunded',
        isDelivered: true
      };
    default:
      return {
        statusText: status || 'Unknown',
        deliveryText: estFormatted ? `Est: ${estFormatted}` : 'Processing',
        isDelivered: false
      };
  }
}

module.exports = {
  CONFIG,
  addBusinessDays,
  calculateDeliveryWindow,
  getDeliveryStatusInfo
};
