/**
 * EcoLiz Custom API Service
 */

export interface Order {
  id: string | number;
  date: string;
  total: number;
  items: number;
  status: string;
}

const ECOLIZ_API_URL = "/wp-api/ecoliz/v1";

async function ecolizRequest(endpoint: string) {
  const response = await fetch(`${ECOLIZ_API_URL}${endpoint}`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message || `Erreur API EcoLiz ${response.status}`);
  }

  return data;
}

/**
 * Fetch orders for the current logged-in user.
 */
export async function fetchMyOrders(): Promise<Order[]> {
  const user = JSON.parse(localStorage.getItem("ecoliz_user") || "{}");
  const customerId = user?.id;

  const endpoint = customerId
    ? `/my-orders?customer_id=${encodeURIComponent(customerId)}`
    : "/my-orders";

  const data = await ecolizRequest(endpoint);

  return Array.isArray(data) ? data : [];
}

/**
 * Placeholder for future equipment API.
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