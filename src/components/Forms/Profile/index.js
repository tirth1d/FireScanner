import React, { Component } from "react";

import { Link } from "react-router-dom";
import * as ROUTES from "../../../constants/routes";

import * as ROLES from "../../../constants/role";

import AuthUserContext from "../../Session/context";
import SignInPage from "../SignIn";

import { compose } from "recompose";
import { withFirebase } from "../../Configuration";

import Banner from "../../Forms/FormBanner";
import StuSignUpBanner from "../../../images/stud_banner.png";

import "../index.css";
import "./profile.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const condition = (authUser) => !!authUser;

class ProfilePageCondition extends Component {
  render() {
    return (
      <AuthUserContext.Consumer>
        {(authUser) => (condition(authUser) ? <Profile /> : <SignInPage />)}
      </AuthUserContext.Consumer>
    );
  }
}

class ProfilePageBase extends Component {
  constructor(props) {
    super(props);

    this.state = {
      authUser: JSON.parse(localStorage.getItem("authUser")),
      onClickAccountDel: false,
    };
  }

  _onClickAccountDel = () => {
    this.setState({ onClickAccountDel: true });
  };

  _delConBoxHide = () => {
    this.setState({ onClickAccountDel: false });
  };

  doAccountDeletion = () => {
    if (this.state.authUser.role === "Student") {
      this.props.firebase.doAccountDelete();
      if (this.props.firebase.doAccountDelete()) {
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
      }
    }

    if (this.state.authUser.role === "Faculty") {
      this.props.firebase.doAccountDelete();
      if (this.props.firebase.doAccountDelete()) {
        this.props.firebase.user(this.state.authUser.uid).remove();
        this.props.firebase
          .faculty(this.state.authUser.college, this.state.authUser.uid)
          .remove();
      }
    }
  };

  onClickSignOut = () => {
    if (
      prompt("Enter 'Sign Out' & Press OK to Log Out.", "Sign Out") ===
      "Sign Out"
    ) {
      this.props.firebase.doSignOut();
    }
  };

  render() {
    return (
      <div>
        <div
          className={
            this.state.onClickAccountDel
              ? "profilePageBaseMain visibleProfilePageBaseMain"
              : "profilePageBaseMain"
          }
        >
          <Banner
            banner={StuSignUpBanner}
            alt="FcaulLoginBanner"
            banner_header="Your Profile"
          />
          <div>
            <form className="profileForm">
              <div className="flex-grp">
                <div className="group">
                  <div className="inputProfile input">
                    {this.state.authUser.name}
                    <label
                      className={
                        this.state.authUser.name !== ""
                          ? "placeholderProfile placeholder above"
                          : "placeholderProfile placeholder"
                      }
                    >
                      Name
                    </label>
                  </div>
                </div>
                <div className="group">
                  <div className="inputProfile input">
                    {this.state.authUser.email}
                    <label
                      className={
                        this.state.authUser.email !== ""
                          ? "placeholderProfile placeholder above"
                          : "placeholderProfile placeholder"
                      }
                    >
                      Email ID
                    </label>
                  </div>
                </div>
              </div>
              <br />
              <div className="flex-grp">
                {this.state.authUser.role === ROLES.STUDENT && (
                  <div className="group">
                    <div className="inputProfile input">
                      {this.state.authUser.enrolment_no}
                      <label
                        className={
                          this.state.authUser.enrolment_no !== ""
                            ? "placeholderProfile placeholder above"
                            : "placeholderProfile placeholder"
                        }
                      >
                        Enrolment No.
                      </label>
                    </div>
                  </div>
                )}
                <div className="group">
                  <div
                    className="inputProfile input"
                    style={{ whiteSpace: `nowrap`, overflowY: `hidden` }}
                  >
                    {this.state.authUser.college}
                    <label
                      className={
                        this.state.authUser.college !== ""
                          ? "placeholderProfile placeholder above"
                          : "placeholderProfile placeholder"
                      }
                    >
                      College
                    </label>
                  </div>
                </div>
                {this.state.authUser.role === ROLES.FACULTY && (
                  <div className="group">
                    <div
                      className="inputProfile input"
                      style={{ whiteSpace: `nowrap`, overflowY: `hidden` }}
                    >
                      {this.state.authUser.access_code}
                      <label
                        className={
                          this.state.authUser.college !== ""
                            ? "placeholderProfile placeholder above"
                            : "placeholderProfile placeholder"
                        }
                      >
                        Access Code
                      </label>
                    </div>
                  </div>
                )}
              </div>
              <br />

              {this.state.authUser.role === ROLES.STUDENT && (
                <div className="flex-grp">
                  <div className="group">
                    <div className="inputProfile input">
                      {this.state.authUser.department}
                      <label
                        className={
                          this.state.authUser.department !== ""
                            ? "placeholderProfile placeholder above"
                            : "placeholderProfile placeholder"
                        }
                      >
                        Department
                      </label>
                    </div>
                  </div>
                  <div className="group">
                    <div className="inputProfile input">
                      {this.state.authUser.division}
                      <label
                        className={
                          this.state.authUser.division !== ""
                            ? "placeholderProfile placeholder above"
                            : "placeholderProfile placeholder"
                        }
                      >
                        Division
                      </label>
                    </div>
                  </div>
                </div>
              )}

              <br />

              {this.state.authUser.role === ROLES.STUDENT && (
                <div className="flex-grp">
                  <div className="group">
                    <div className="inputProfile input">
                      {this.state.authUser.semester}
                      <label
                        className={
                          this.state.authUser.semester !== ""
                            ? "placeholderProfile placeholder above"
                            : "placeholderProfile placeholder"
                        }
                      >
                        Semester
                      </label>
                    </div>
                  </div>
                  <div className="group">
                    <div className="inputProfile input">
                      {this.state.authUser.shift}
                      <label
                        className={
                          this.state.authUser.shift !== ""
                            ? "placeholderProfile placeholder above"
                            : "placeholderProfile placeholder"
                        }
                      >
                        Shift
                      </label>
                    </div>
                  </div>
                </div>
              )}

              <br />
              <div className="ProfileEditDelBtn">
                <Link to={ROUTES.PASSWORD_UPDATE}>
                  <div className="editFontawesomeBtn">
                    <FontAwesomeIcon icon="undo" />
                  </div>
                </Link>
                <div
                  className="deleteFontawesomeBtn"
                  onClick={this._onClickAccountDel}
                >
                  <FontAwesomeIcon icon="trash-alt" />
                </div>
                <div
                  className="signOutFontawesomeBtn"
                  onClick={this.onClickSignOut}
                >
                  <FontAwesomeIcon icon="sign-out-alt" />
                </div>
              </div>
            </form>
          </div>
        </div>
        <div
          className={
            this.state.onClickAccountDel
              ? "deleteConfirmationBox visibleDelConfirmationBox"
              : "deleteConfirmationBox"
          }
        >
          <div className="deleteConfirmationBoxHeader">
            <p className="deleteConfirmationBoxHeaderMainP">Are you sure!</p>
            <p className="deleteConfirmationBoxHeaderSubP">
              Do You really want to delete your Account?
            </p>
          </div>
          <div className="deleteConfirmationBoxBtn">
            <div
              className="deleteConfirmationBoxBtnNo"
              onClick={this._delConBoxHide}
            >
              No
            </div>
            <div
              className="deleteConfirmationBoxBtnYes"
              onClick={this.doAccountDeletion}
            >
              Yes, Delete It
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const Profile = compose(withFirebase)(ProfilePageBase);

export default ProfilePageCondition;

export { Profile };
