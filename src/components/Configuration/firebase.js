import app from "firebase/app";
import "firebase/auth";
import "firebase/database";

const config = {
  apiKey: "AIzaSyCrwUxxUd6WOxUxoM2zurPc-3YIwHG-t2M",
  authDomain: "firescan-16f8e.firebaseapp.com",
  databaseURL: "https://firescan-16f8e.firebaseio.com",
  projectId: "firescan-16f8e",
  storageBucket: "firescan-16f8e.appspot.com",
  messagingSenderId: "840594084455",
  appId: "1:840594084455:web:90ea0009ff74e08653bac2",
  measurementId: "G-D9N2JRM1TY",
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
        "https://firescan-16f8e.firebaseapp.com/__/auth/action?mode=<action>&oobCode=<code>",
    });

  doPasswordUpdate = (password) =>
    this.auth.currentUser.updatePassword(password);

  doAccountDelete = () => this.auth.currentUser.delete();

  // *** Merge Auth and DB User API *** //

  onAuthUserListener = (next, fallback) =>
    this.auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        this.user(authUser.uid)
          .once("value")
          .then((snapshot) => {
            const dbUser = snapshot.val();
            // default empty role
            if (!dbUser.role) {
              dbUser.role = "";
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

  studentList = (clgName) => this.db.ref(`Students/${clgName}`);

  student = (clgName, stuId) => this.db.ref(`Students/${clgName}/${stuId}`);

  studentSubjects = (clgName) => this.db.ref(`Faculties/${clgName}`);

  faculty = (clgName, facId) => this.db.ref(`Faculties/${clgName}/${facId}`);

  facultySubjects = (facId, clgName) =>
    this.db.ref(`Faculties/${clgName}/${facId}/subjects`);

  studentLength = (collegeName, facId, subId) =>
    this.db.ref(`Faculties/${collegeName}/${facId}/subjects/${subId}/students`);

  studentLengthAttendance = (collegeName, facId, subId, stuId) =>
    this.db.ref(
      `Faculties/${collegeName}/${facId}/subjects/${subId}/students/${stuId}`
    );

  // users = () => this.db.ref("users");

  // *** Message API ***

  // message = (uid) => this.db.ref(`messages/${uid}`);

  // messages = () => this.db.ref("messages");
}

export default Firebase;
