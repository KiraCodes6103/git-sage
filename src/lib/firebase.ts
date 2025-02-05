// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAIAO6GVEZzCGjiXmxE2NulnK8eDG55BWg",
  authDomain: "git-sage.firebaseapp.com",
  projectId: "git-sage",
  storageBucket: "git-sage.firebasestorage.app",
  messagingSenderId: "575028800362",
  appId: "1:575028800362:web:3238de0cc5405e46831313",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);

export const uploadFile = async (
  file: File,
  setProgress?: (progress: number) => void,
) => {
  return new Promise((resolve, reject) => {
    try {
      const storageRef = ref(storage, file.name);

      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
          );
          if (setProgress) setProgress(progress);
        },
        (error) => {
          reject(error); // Handle errors
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL); // Resolve with the file's download URL
          } catch (error) {
            reject(error); // Handle URL fetch errors
          }
        },
      );
    } catch (error) {
      reject(error); // Handle unexpected errors
    }
  });
};
