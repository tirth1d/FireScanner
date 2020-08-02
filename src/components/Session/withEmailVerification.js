import React from "react";

import AuthUserContext from "./context";
import { withFirebase } from "../Configuration";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const needsEmailVerification = (authUser) =>
  authUser &&
  !authUser.emailVerified &&
  authUser.providerData
    .map((provider) => provider.providerId)
    .includes("password");

const withEmailVerification = (Component) => {
  class WithEmailVerification extends React.Component {
    constructor(props) {
      super(props);

      this.state = {
        authUser: JSON.parse(localStorage.getItem("authUser")),
        isSent: false,
        error: "",
      };
    }

    onSendEmailVerification = () => {
      this.props.firebase
        .doSendEmailVerification()
        .then(() => this.setState({ isSent: true }));
    };

    doLogOut = () => {
      if (prompt("Enter 'Y' & press OK to Log Out!", "Y") === "Y") {
        this.props.firebase.doSignOut().catch((error) => {
          console.log(error.message);
        });
      }
    };

    doDeleteAccount = () => {
      if (
        prompt(
          "Enter 'Delete It' & press OK to Delete Your Account!",
          "Delete It"
        ) === "Delete It"
      ) {
        if (this.state.authUser.role === "Student") {
          this.props.firebase.doAccountDelete().catch((error) => {
            this.setState({ error: error.message });
          });

          if (this.state.error === "") {
            this.props.firebase.user(this.state.authUser.uid).remove();
            this.props.firebase
              .student(this.state.authUser.college, this.state.authUser.uid)
              .remove();

            this.props.firebase
              .studentSubjects(this.state.authUser.college)
              .on("child_added", (snapshot) => {
                var facKey = snapshot.key;

                this.props.firebase
                  .faculty(this.state.authUser.college, facKey)
                  .child(`subjects`)
                  .on("child_added", (snapshot) => {
                    var subKey = snapshot.key;

                    this.props.firebase
                      .studentLengthAttendance(
                        this.state.authUser.college,
                        facKey,
                        subKey,
                        this.state.authUser.uid
                      )
                      .remove();
                  });
              });
          } else {
            console.log(this.state.error);
          }
        }

        if (this.state.authUser.role === "Faculty") {
          this.props.firebase.doAccountDelete().catch((error) => {
            this.setState({ error: error.message });
          });

          if (this.state.error === "") {
            this.props.firebase.user(this.state.authUser.uid).remove();
            this.props.firebase
              .faculty(this.state.authUser.college, this.state.authUser.uid)
              .remove();
          } else {
            console.log(this.state.error);
          }
        }
      }
    };

    render() {
      return (
        <AuthUserContext.Consumer>
          {(authUser) =>
            needsEmailVerification(authUser) ? (
              <div
                className="needsEmailVerification"
                style={{
                  position: `absolute`,
                  top: `50%`,
                  left: `50%`,
                  transform: `translate(-50%,-50%)`,
                  backgroundColor: `blue`,
                  width: `280px`,
                  borderRadius: "10px",
                  padding: `15px`,
                  display: `flex`,
                  flexDirection: `column`,
                  justifyContent: `center`,
                  alignItems: `center`,
                  color: `#ffffff`,
                  textAlign: `center`,
                }}
              >
                {this.state.isSent ? (
                  <p
                    style={{
                      margin: `0px`,
                      padding: `0px`,
                      fontSize: `15px`,
                      fontWeight: `600`,
                    }}
                  >
                    {this.state.error !== ""
                      ? `${this.state.error}`
                      : "E-Mail confirmation sent : Check your E-Mail (Spam folder included) for a confirmation E-Mail. Refresh this page once you confirmed your E-Mail. Click on the below button to again send confirmation email."}
                  </p>
                ) : (
                  <p
                    style={{
                      margin: `0px`,
                      padding: `0px`,
                      fontSize: `15px`,
                      fontWeight: `600`,
                    }}
                  >
                    {this.state.error !== ""
                      ? `${this.state.error}`
                      : "Verify your E-Mail : Click on the below button to send a confirmation E-Mail to your registered mail address."}
                  </p>
                )}

                <div
                  onClick={this.onSendEmailVerification}
                  style={{
                    marginTop: `15px`,
                    cursor: `pointer`,
                    backgroundColor: `#ffffff`,
                    color: `#000000`,
                    fontSize: `13px`,
                    width: `200px`,
                    height: `30px`,
                    display: `flex`,
                    justifyContent: `center`,
                    alignItems: `center`,
                    borderRadius: `6px`,
                  }}
                >
                  {this.state.isSent
                    ? `Confirmation Mail Sent!`
                    : `Send confirmation E-Mail`}
                </div>

                <div
                  style={{
                    marginTop: `15px`,
                    display: `flex`,
                    justifyContent: `center`,
                    alignItems: `center`,
                  }}
                >
                  <div
                    style={{
                      cursor: `pointer`,
                      backgroundColor: `red`,
                      width: `35px`,
                      height: `35px`,
                      color: `#ffffff`,
                      display: `flex`,
                      justifyContent: `center`,
                      alignItems: `center`,
                      borderRadius: `50%`,
                      marginRight: `10px`,
                    }}
                    onClick={this.doLogOut}
                  >
                    <FontAwesomeIcon icon="sign-out-alt" />
                  </div>
                  <div
                    style={{
                      cursor: `pointer`,
                      backgroundColor: `red`,
                      width: `35px`,
                      height: `35px`,
                      color: `#ffffff`,
                      display: `flex`,
                      justifyContent: `center`,
                      alignItems: `center`,
                      borderRadius: `50%`,
                      marginLeft: `10px`,
                    }}
                    onClick={this.doDeleteAccount}
                  >
                    <FontAwesomeIcon icon="trash-alt" />
                  </div>
                </div>
              </div>
            ) : (
              <Component {...this.props} />
            )
          }
        </AuthUserContext.Consumer>
      );
    }
  }

  return withFirebase(WithEmailVerification);
};

export default withEmailVerification;
