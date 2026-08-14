import { cert, initializeApp } from "firebase-admin/app";
import type { ServiceAccount } from "firebase-admin/app";
import serviceAccountJson from "../serviceAccountKey.json" with { type: "json" };

const serviceAccount: ServiceAccount = {
  projectId: serviceAccountJson.project_id,
  clientEmail: serviceAccountJson.client_email,
  privateKey: serviceAccountJson.private_key,
};

export const app = initializeApp({
  credential: cert(serviceAccount),
});
