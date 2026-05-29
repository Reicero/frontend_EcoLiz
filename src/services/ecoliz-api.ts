/**
 * EcoLiz Custom API Service
 *
 * This service handles all calls to the custom WordPress REST API endpoints
 * at /wp-json/ecoliz/v1/
 */

export interface Order {
  id: string | number;
  date: string;
  total: number;
  items: number;
  status: string;
}

const ECOLIZ_API_URL = "/wp-api/ecoliz/v1";

/**
 * Fetch orders for the current logged-in user.
 */
export async function fetchMyOrders(): Promise<Order[]> {
  try {
    const response = await fetch(`${ECOLIZ_API_URL}/my-orders`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.warn("User not authenticated.");
      }

      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
}

/**
 * Placeholder for future equipment API.
 * Currently not connected to any backend.
 */
export async function fetchMyEquipment() {
  return [];
}

/**
 * Health check for EcoLiz API availability.
 */
export async function checkEcolizApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${ECOLIZ_API_URL}/health`, {
      method: "GET",
      credentials: "include",
    });

    return response.ok;
  } catch {
    return false;
  }
}