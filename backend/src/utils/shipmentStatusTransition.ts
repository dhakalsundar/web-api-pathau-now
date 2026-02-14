/**
 * Shipment Status Transition Validator
 * Defines allowed status transitions for shipments
 */

export type ShipmentStatus = 'CREATED' | 'ASSIGNED' | 'PICKED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';

// Define allowed transitions: currentStatus -> [allowedNextStatuses]
const ALLOWED_TRANSITIONS: Record<ShipmentStatus, ShipmentStatus[]> = {
  CREATED: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['PICKED', 'CANCELLED'],
  PICKED: ['IN_TRANSIT', 'CANCELLED'],
  IN_TRANSIT: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [], // Terminal state, no transitions allowed
  CANCELLED: [], // Terminal state, no transitions allowed
};

/**
 * Validates if a status transition is allowed
 * @param fromStatus Current shipment status
 * @param toStatus Desired new status
 * @returns true if transition is allowed, throws error otherwise
 */
export function validateStatusTransition(fromStatus: ShipmentStatus, toStatus: ShipmentStatus): boolean {
  // Check if fromStatus exists in transitions map
  if (!(fromStatus in ALLOWED_TRANSITIONS)) {
    throw new Error(`Invalid current status: ${fromStatus}`);
  }

  // Check if toStatus is valid
  if (!(toStatus in ALLOWED_TRANSITIONS)) {
    throw new Error(`Invalid target status: ${toStatus}`);
  }

  // Check if transition is allowed
  const allowedTransitions = ALLOWED_TRANSITIONS[fromStatus];
  if (!allowedTransitions.includes(toStatus)) {
    throw new Error(
      `Invalid status transition: ${fromStatus} -> ${toStatus}. Allowed transitions from ${fromStatus}: ${allowedTransitions.length > 0 ? allowedTransitions.join(', ') : 'none'}`
    );
  }

  return true;
}

/**
 * Get all allowed transitions from a status
 * @param status Current shipment status
 * @returns Array of allowed next statuses
 */
export function getAllowedTransitions(status: ShipmentStatus): ShipmentStatus[] {
  return ALLOWED_TRANSITIONS[status] || [];
}

/**
 * Check if a status is a terminal state (no further transitions allowed)
 * @param status Shipment status
 * @returns true if status is terminal
 */
export function isTerminalStatus(status: ShipmentStatus): boolean {
  return getAllowedTransitions(status as ShipmentStatus).length === 0;
}
