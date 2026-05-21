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
 * 
 * V1: Returns all recent orders (not filtered by user)
 * V2: Will filter by authenticated user via JWT
 */
export async function fetchMyOrders(): Promise<Order[]> {
  try {
    const response = await fetch(`${ECOLIZ_API_URL}/my-orders`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // V2: Add Authorization header here when JWT is ready
        // "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      // V2: Handle 401 Unauthorized (user not authenticated)
      if (response.status === 401) {
        console.warn("User not authenticated, redirecting to login");
        // Optionally redirect to /connexion
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
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
  // TODO V2: Implement equipment list from WooCommerce custom post type or custom endpoint
  return [];
}

/**
 * Health check for EcoLiz API availability.
 */
export async function checkEcolizApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${ECOLIZ_API_URL}/health`, {
      method: "GET",
    });
    return response.ok;
  } catch {
    return false;
  }
}
