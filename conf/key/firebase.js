import dotenv from "dotenv";
dotenv.config();
const serviceAccount = {
  "type": "service_account",
  "project_id": "syncify-4aa34",
  "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
  "private_key": process.env.FIREBASE_PRIVATE_KEY,
  "client_email": "firebase-adminsdk-ozx2o@syncify-4aa34.iam.gserviceaccount.com",
  "client_id": "103387742896156657939",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-ozx2o%40syncify-4aa34.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}

export default serviceAccount;