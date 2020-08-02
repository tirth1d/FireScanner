import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import { compose } from "recompose";

import AuthUserContext from "../../../Session/context";
import Home from "../../../Home";
import TermsCheckbox from "../TermsCheckbox";

import { withFirebase } from "../../../Configuration";
import CollegeJSON from "../../../../CollegeList.json";

import * as ROUTES from "../../../../constants/routes";
import * as ROLE from "../../../../constants/role";

import Banner from "../../FormBanner";
import FacSignUpBanner from "../../../../images/faculty_banner.png";
import "../../index.css";

const condition = (authUser) => !!authUser;

const SignUpFacultyPageCondition = () => (
  <AuthUserContext.Consumer>
    {(authUser) => (condition(authUser) ? <Home /> : <SignUpFacPage />)}
  </AuthUserContext.Consumer>
);

const SignUpFacPage = () => (
  <div style={{ backgroundColor: `#FCFCFC` }}>
    <Banner
      banner={FacSignUpBanner}
      alt="FcaulLoginBanner"
      banner_header="Register as a Faculty"
      banner_subheader="Please Register Your Faculty Profile By Filling Below Blanks"
    />
    <SignUpFacForm />
    <SignInLink />
  </div>
);

const INITIAL_STATE = {
  fname: "",
  lname: "",
  email: "",
  college: "",
  accesscode: "",
  passwordOne: "",
  passwordTwo: "",
  error: null,
  role: ROLE.FACULTY,
  college_list: CollegeJSON,

  authUserID: "",

  termCheckboxToggle: false,
};

const ERROR_CODE_ACCOUNT_EXISTS = "auth/email-already-in-use";
const ERROR_CODE_INVALID_EMAIL = "auth/invalid-email";

const ERROR_MSG_ACCOUNT_EXISTS =
  "An account with this E-Mail address already exists. Try to login with another account instead.";
const ERROR_MSG_INVALID_EMAIL = "Invalid Email ID";

class SignUpFormBase extends Component {
  constructor(props) {
    super(props);

    this.state = { ...INITIAL_STATE };
  }

  onChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  onChangeCollege = (event) => {
    this.setState({
      [event.target.name]: this.state.college_list.find(
        (college) => `${college.code} - ${college.name}` === event.target.value
      ).name,
    });
  };

  onSubmit = (event) => {
    const {
      fname,
      lname,
      email,
      college,
      accesscode,
      passwordOne,
      passwordTwo,
      role,
    } = this.state;

    this.setState({ error: null });

    if (
      passwordOne === "" &&
      passwordTwo === "" &&
      fname === "" &&
      lname === "" &&
      email === "" &&
      accesscode === "" &&
      college === ""
    ) {
      this.setState({ error: "Please Fill Everything Up Properly" });
    } else if (college === "--SELECT--") {
      this.setState({ error: "Please Select the right Options" });
    } else if (accesscode.length !== 4 && accesscode.length !== 6) {
      this.setState({ error: "Access code must be of 4 or 6 digits" });
    } else if (fname === "" || lname === "") {
      this.setState({ error: "Please Enter Your First & Last Name Properly" });
    } else if (email === "") {
      this.setState({ error: "Please Enter Your Email Address" });
    } else if (college === "") {
      this.setState({ error: "Please Choose Your College" });
    } else if (accesscode === "") {
      this.setState({ error: "Please Enter Access Code" });
    } else if (passwordOne !== passwordTwo) {
      this.setState({ error: "Passwords are not matching" });
    } else if (passwordOne === "") {
      this.setState({ error: "Please Enter Password" });
    } else if (!this.state.termCheckboxToggle) {
      this.setState({ error: "Please Tick the Terms and Conditions" });
    } else {
      this.props.firebase
        .doCreateUserWithEmailAndPassword(email, passwordOne)
        .then((authUser) => {
          this.setState({ authUserID: authUser.user.uid });
          // Create a user in your Firebase realtime database
          return this.props.firebase.user(authUser.user.uid).set({
            name: fname + " " + lname,
            email,
            college,
            access_code: accesscode,
            role,
          });
        })
        .then(() => {
          // Create a user in your Firebase realtime database
          return this.props.firebase
            .faculty(college, this.state.authUserID)
            .set({
              name: fname + " " + lname,
              email,
              college,
              access_code: accesscode,
              role,
            });
        })
        .then(() => {
          this.setState({ authUserID: "" });
          this.setState({ ...INITIAL_STATE });
          this.props.history.push(ROUTES.HOME);
        })
        .catch((error) => {
          if (this.state.error == null) {
            if (error.code === ERROR_CODE_ACCOUNT_EXISTS) {
              error.message = ERROR_MSG_ACCOUNT_EXISTS;
              this.setState({ error: error.message });
            } else if (error.code === ERROR_CODE_INVALID_EMAIL) {
              error.message = ERROR_MSG_INVALID_EMAIL;
              this.setState({ error: error.message });
            }
          }
        });
    }

    event.preventDefault();
  };

  termCheckboxToggleInfo = () => {
    this.setState({ termCheckboxToggle: !this.state.termCheckboxToggle });
  };

  componentDidMount() {
    alert(
      "Make sure you're a Faculty not a Student going to make an account as a Faculty, because your data will be in the hands of your Head Of Department. If you try to create any problems, you'll be in a big troble. You can visit 'firedance.web.app', if you want to do some experiments with this application as a student or want to know more faculty section. Thank you."
    );
  }

  render() {
    const {
      fname,
      lname,
      email,
      college,
      accesscode,
      passwordOne,
      passwordTwo,
      error,

      college_list,
    } = this.state;

    return (
      <form
        onSubmit={this.onSubmit}
        className="FacSignupForm"
        autoComplete="off"
      >
        <div className="flex-grp flex-fila-grp">
          <div className="group fi-name">
            <input
              type="text"
              name="fname"
              className="input"
              value={fname}
              onChange={this.onChange}
            />
            <label
              className={fname !== "" ? "placeholder above" : "placeholder"}
            >
              First Name
            </label>
          </div>
          <div className="group la-name">
            <input
              type="text"
              name="lname"
              className="input"
              value={lname}
              onChange={this.onChange}
            />
            <label
              className={lname !== "" ? "placeholder above" : "placeholder"}
            >
              Last Name
            </label>
          </div>
        </div>
        <br />
        <div className="flex-grp">
          <div className="group">
            <input
              autoComplete="nope"
              type="email"
              name="email"
              className="input"
              value={email}
              onChange={this.onChange}
            />
            <label
              className={email !== "" ? "placeholder above" : "placeholder"}
            >
              Email ID
            </label>
          </div>
          <div className="group dropdown-group">
            <select
              className="Dropdown"
              value={college}
              onChange={this.onChangeCollege}
              name="college"
            >
              <option>--SELECT--</option>
              {college_list.map((e, key) => {
                return (
                  <option key={key}>
                    {e.code} - {e.name}
                  </option>
                );
              })}
            </select>
            <label className="dropdown-placeholder">
              <label>College</label>
            </label>
          </div>
        </div>
        <br />
        <div className="flex-grp">
          <div className="group">
            <input
              autoComplete="new-password"
              type="password"
              name="passwordOne"
              className="input"
              value={passwordOne}
              onChange={this.onChange}
            />
            <label
              className={
                passwordOne !== "" ? "placeholder above" : "placeholder"
              }
            >
              Password
            </label>
          </div>
          <div className="group">
            <input
              autoComplete="new-password"
              type="password"
              name="passwordTwo"
              className="input"
              value={passwordTwo}
              onChange={this.onChange}
            />
            <label
              className={
                passwordTwo !== "" ? "placeholder above" : "placeholder"
              }
            >
              Confirm Password
            </label>
          </div>
        </div>

        <br />
        <div className="group">
          <input
            type="number"
            name="accesscode"
            className="input"
            value={accesscode}
            onChange={this.onChange}
          />
          <label
            className={accesscode !== "" ? "placeholder above" : "placeholder"}
          >
            Access Code
          </label>
        </div>

        <TermsCheckbox toggleInfo={this.termCheckboxToggleInfo} />

        <button type="submit" name="submit" className="SubmitBut">
          Submit
        </button>
        <div className="error-text">
          {error && <p style={{ color: `#ff0000` }}>*{error}*</p>}
        </div>
      </form>
    );
  }
}

const SignInLink = () => (
  <p
    style={{
      textAlign: `center`,
      padding: `0`,
      paddingBottom: `60px`,
      margin: `0`,
    }}
  >
    Already have an account?{" "}
    <Link
      style={{
        textDecoration: `none`,
        color: `#0000ff`,
        fontWeight: `500`,
        paddingLeft: `5px`,
      }}
      to={ROUTES.SIGN_IN}
    >
      Sign In
    </Link>
  </p>
);

const SignUpFacForm = compose(withRouter, withFirebase)(SignUpFormBase);

export default SignUpFacultyPageCondition;

export { SignUpFacForm };
