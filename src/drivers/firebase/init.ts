import * as admin from "firebase-admin";
//import serviceAccount from "./gdvn-message-60f8b-firebase-adminsdk-6sl7v-3aa3deb121.json";
import serviceAccount from "./service-account.json";

let firebaseAdmin: admin.app.App | null = null;

const initializeFirebaseAdmin = () => {
  try {
    if (!firebaseAdmin) {
      firebaseAdmin = admin.initializeApp({
        credential: admin.credential.cert(
          serviceAccount as any
        ),
      });
      console.log("Khởi tạo firebase thành công");
    }
  } catch (error) {
    console.log(error);
    console.error("Firebase initialization error");
    setTimeout(() => {
      console.log(
        "Trying to initialize Firebase Admin again..."
      );
      initializeFirebaseAdmin();
    }, 5000); // Wait for 5 seconds before trying to reconnect
  }
};

initializeFirebaseAdmin();

export { firebaseAdmin, initializeFirebaseAdmin };
