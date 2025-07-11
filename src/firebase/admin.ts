import { getApps } from "firebase-admin/app"
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { validateFirebaseConfig } from "@/lib/firebase-server-config";

const initFirebaseAdmin = () => {
    const apps = getApps();
    if (!apps.length) {
        const config = validateFirebaseConfig();
        
        initializeApp({
            credential: cert({
                projectId: config.projectId,
                clientEmail: config.clientEmail,
                privateKey: config.privateKey,
            }),
        });
    }

    return {
        auth: getAuth(),
        db: getFirestore(),
    }
}

export const { auth, db } = initFirebaseAdmin();
