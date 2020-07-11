import app from "firebase/app";
import "firebase/auth";
import "firebase/database";

const config = {
  apiKey: "AIzaSyCDaj4Hq0GxGia7M7HxkYzXJEFA4mzc5yg",
  authDomain: "newattend-fd9b9.firebaseapp.com",
  databaseURL: "https://newattend-fd9b9.firebaseio.com",
  projectId: "newattend-fd9b9",
  storageBucket: "newattend-fd9b9.appspot.com",
  messagingSenderId: "486249001888",
  appId: "1:486249001888:web:d500d5079d6f3e95706ac5",
};

class Firebase {
  constructor() {
    app.initializeApp(config);

    /* Helper */

    this.serverValue = app.database.ServerValue;
    this.emailAuthProvider = app.auth.EmailAuthProvider;

    /* Firebase APIs */

    this.auth = app.auth();
    this.db = app.database();
  }

  // *** Auth API ***

  doCreateUserWithEmailAndPassword = (email, password) =>
    this.auth.createUserWithEmailAndPassword(email, password);

  doSignInWithEmailAndPassword = (email, password) =>
    this.auth.signInWithEmailAndPassword(email, password);

  doSignInWithGoogle = () => this.auth.signInWithPopup(this.googleProvider);

  doSignOut = () => this.auth.signOut();

  doPasswordReset = (email) => this.auth.sendPasswordResetEmail(email);

  doSendEmailVerification = () =>
    this.auth.currentUser.sendEmailVerification({
      // url: process.env.REACT_APP_CONFIRMATION_EMAIL_REDIRECT,
      url:
        "https://newattend-fd9b9.firebaseapp.com/__/auth/action?mode=<action>&oobCode=<code>",
    });

  doPasswordUpdate = (password) =>
    this.auth.currentUser.updatePassword(password);

  // *** Merge Auth and DB User API *** //

  onAuthUserListener = (next, fallback) =>
    this.auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        this.user(authUser.uid)
          .once("value")
          .then((snapshot) => {
            const dbUser = snapshot.val();

            // default empty roles
            if (!dbUser.role) {
              dbUser.role = {};
            }

            // merge auth and db user
            authUser = {
              uid: authUser.uid,
              email: authUser.email,
              emailVerified: authUser.emailVerified,
              providerData: authUser.providerData,
              ...dbUser,
            };

            next(authUser);
          });
      } else {
        fallback();
      }
    });

  // *** User API ***

  user = (uid) => this.db.ref(`users/${uid}`);

  users = () => this.db.ref("users");

  // *** Message API ***

  message = (uid) => this.db.ref(`messages/${uid}`);

  messages = () => this.db.ref("messages");
}

export default Firebase;
