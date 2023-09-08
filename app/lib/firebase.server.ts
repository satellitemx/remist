import type { ServiceAccount } from "firebase-admin"
import { cert, initializeApp } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"
import { singleton } from "~/lib/singleton.server"

const serviceAccount = {
	type: "service_account",
	project_id: process.env.FIREBASE_PROJECT_ID,
	private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
	private_key: process.env.FIREBASE_PRIVATE_KEY,
	client_email: process.env.FIREBASE_CLIENT_EMAIL,
	client_id: process.env.FIREBASE_CLIENT_ID,
	auth_uri: process.env.FIREBASE_AUTH_URI,
	token_uri: process.env.FIREBASE_TOKEN_URI,
	auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_CERT_URL,
	client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
}

const firebase = singleton("firebase", () => initializeApp({
	credential: cert(serviceAccount as ServiceAccount),
}))

export const db = getFirestore(firebase)
export const auth = getAuth(firebase)
