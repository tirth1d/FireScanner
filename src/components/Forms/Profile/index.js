import React, { Component } from "react";

import { Link } from "react-router-dom";
import * as ROUTES from "../../../constants/routes";

import * as ROLES from "../../../constants/role";

import AuthUserContext from "../../Session/context";
import SignUpStuPage from "../SignUp/SignUpStu";

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
        {(authUser) => (condition(authUser) ? <Profile /> : <SignUpStuPage />)}
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
                  <div className="input">
                    {this.state.authUser.name}
                    <label
                      className={
                        this.state.authUser.name !== ""
                          ? "placeholder above"
                          : "placeholder"
                      }
                    >
                      Name
                    </label>
                  </div>
                </div>
                <div className="group">
                  <div className="input">
                    {this.state.authUser.email}
                    <label
                      className={
                        this.state.authUser.email !== ""
                          ? "placeholder above"
                          : "placeholder"
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
                    <div className="input">
                      {this.state.authUser.enrolment_no}
                      <label
                        className={
                          this.state.authUser.enrolment_no !== ""
                            ? "placeholder above"
                            : "placeholder"
                        }
                      >
                        Enrolment No.
                      </label>
                    </div>
                  </div>
                )}
                <div className="group">
                  <div
                    className="input"
                    style={{ whiteSpace: `nowrap`, overflowY: `hidden` }}
                  >
                    {this.state.authUser.college}
                    <label
                      className={
                        this.state.authUser.college !== ""
                          ? "placeholder above"
                          : "placeholder"
                      }
                    >
                      College
                    </label>
                  </div>
                </div>
                {this.state.authUser.role === ROLES.FACULTY && (
                  <div className="group">
                    <div
                      className="input"
                      style={{ whiteSpace: `nowrap`, overflowY: `hidden` }}
                    >
                      {this.state.authUser.access_code}
                      <label
                        className={
                          this.state.authUser.college !== ""
                            ? "placeholder above"
                            : "placeholder"
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
                    <div className="input">
                      {this.state.authUser.department}
                      <label
                        className={
                          this.state.authUser.department !== ""
                            ? "placeholder above"
                            : "placeholder"
                        }
                      >
                        Department
                      </label>
                    </div>
                  </div>
                  <div className="group">
                    <div className="input">
                      {this.state.authUser.division}
                      <label
                        className={
                          this.state.authUser.division !== ""
                            ? "placeholder above"
                            : "placeholder"
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
                    <div className="input">
                      {this.state.authUser.semester}
                      <label
                        className={
                          this.state.authUser.semester !== ""
                            ? "placeholder above"
                            : "placeholder"
                        }
                      >
                        Semester
                      </label>
                    </div>
                  </div>
                  <div className="group">
                    <div className="input">
                      {this.state.authUser.shift}
                      <label
                        className={
                          this.state.authUser.shift !== ""
                            ? "placeholder above"
                            : "placeholder"
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
              onClick={this.props.firebase.doAccountDelete}
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
