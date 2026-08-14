import { cert, initializeApp } from "firebase-admin/app";
import type { ServiceAccount } from "firebase-admin/app";
import serviceAccountJson from "../serviceAccountKey.json" with { type: "json" };

/**
 * Firebase Admin SDK Credentials Mapper
 * Maps fields from serviceAccountKey.json to conform to standard ServiceAccount format.
 */
const serviceAccount: ServiceAccount = {
  projectId: serviceAccountJson.project_id,
  clientEmail: serviceAccountJson.client_email,
  privateKey: serviceAccountJson.private_key,
};

/**
 * Initializes and exports the singleton Firebase Admin App instance.
 * Used exclusively for verifying client ID tokens.
 */
export const app = initializeApp({
  credential: cert(serviceAccount),
});
