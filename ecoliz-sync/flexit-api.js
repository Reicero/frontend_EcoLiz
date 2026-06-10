require("dotenv").config();

const axios = require("axios");

const FLEXIT_API_BASE_URL = process.env.FLEXIT_API_BASE_URL?.replace(/\/+$/, "");
const FLEXIT_CLIENT_ID = process.env.FLEXIT_CLIENT_ID;
const FLEXIT_CLIENT_SECRET = process.env.FLEXIT_CLIENT_SECRET;
const FLEXIT_API_DRY_RUN = process.env.FLEXIT_API_DRY_RUN === "true";

if (!FLEXIT_API_BASE_URL) {
  throw new Error("FLEXIT_API_BASE_URL est manquant dans le .env");
}

if (!FLEXIT_CLIENT_ID || !FLEXIT_CLIENT_SECRET) {
  throw new Error("FLEXIT_CLIENT_ID ou FLEXIT_CLIENT_SECRET est manquant dans le .env");
}

const flexit = axios.create({
  baseURL: FLEXIT_API_BASE_URL,
  timeout: 30000,
});

function getHeaders() {

console.log("Headers envoyés à FlexIT :", {
  client_id: FLEXIT_CLIENT_ID ? "présent" : "manquant",
  client_secret: FLEXIT_CLIENT_SECRET ? "présent" : "manquant",
  baseUrl: FLEXIT_API_BASE_URL,
});

  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    client_id: FLEXIT_CLIENT_ID,
    client_secret: FLEXIT_CLIENT_SECRET,
  };
}

async function flexitRequest(method, endpoint, data = undefined) {
  try {
    const response = await flexit.request({
      method,
      url: endpoint,
      data,
      headers: getHeaders(),
    });

    return response.data;
  } catch (error) {
    console.error(`Erreur API FlexIT sur ${method.toUpperCase()} ${endpoint}`);

    if (error.response) {
      console.error("Status :", error.response.status);
      console.error("Réponse :", JSON.stringify(error.response.data, null, 2));
    } else {
      console.error("Erreur :", error.message);
    }

    throw error;
  }
}

async function getFlexitProductDetails(sku) {
  if (!sku) {
    throw new Error("SKU manquant pour getFlexitProductDetails");
  }

  return flexitRequest("get", `/order/api/product/${encodeURIComponent(sku)}`);
}

async function createFlexitOrder(orderPayload) {
  if (!orderPayload) {
    throw new Error("Payload commande manquant");
  }

  if (FLEXIT_API_DRY_RUN) {
    console.log("[DRY RUN] Commande FlexIT qui aurait été envoyée :");
    console.log(JSON.stringify(orderPayload, null, 2));

    return {
      dryRun: true,
      message: "Commande non envoyée car FLEXIT_API_DRY_RUN=true",
      payload: orderPayload,
    };
  }

  return flexitRequest("post", "/order/api/order", orderPayload);
}

async function getFlexitOrderStatus(customerNumber) {
  if (!customerNumber) {
    throw new Error("customerNumber manquant pour getFlexitOrderStatus");
  }

  return flexitRequest(
    "get",
    `/order/api/order/${encodeURIComponent(customerNumber)}/status`
  );
}

async function getFlexitShipment(customerNumber) {
  if (!customerNumber) {
    throw new Error("customerNumber manquant pour getFlexitShipment");
  }

  return flexitRequest(
    "get",
    `/order/api/shipment/${encodeURIComponent(customerNumber)}`
  );
}

async function getFlexitInvoice(customerNumber) {
  if (!customerNumber) {
    throw new Error("customerNumber manquant pour getFlexitInvoice");
  }

  return flexitRequest(
    "get",
    `/order/api/invoice/${encodeURIComponent(customerNumber)}`
  );
}

module.exports = {
  getFlexitProductDetails,
  createFlexitOrder,
  getFlexitOrderStatus,
  getFlexitShipment,
  getFlexitInvoice,
};
