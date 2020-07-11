import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import { compose } from "recompose";
import { withFirebase } from "../../../Configuration";

import * as ROUTES from "../../../../constants/routes";
import * as ROLE from "../../../../constants/role";

import Banner from "../../FormBanner";
import StuSignUpBanner from "../../../../images/stud_banner.png";
import "../../index.css";

const SignUpStuPage = () => (
  <div>
    <Banner
      banner={StuSignUpBanner}
      alt="FcaulLoginBanner"
      banner_header="Register as an Attendee"
      banner_subheader="Please Register Your Student Profile By Filling Below Blanks"
    />
    <SignUpStuForm />
    <SignInLink />
  </div>
);

const INITIAL_STATE = {
  fname: "",
  lname: "",
  enrolno: "",
  department: "",
  semester: "",
  email: "",
  passwordOne: "",
  passwordTwo: "",
  error: null,
  isStudent: true,
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

  onSubmit = (event) => {
    const {
      fname,
      lname,
      enrolno,
      department,
      semester,
      email,
      passwordOne,
      passwordTwo,
      isStudent,
    } = this.state;

    const role = {};

    if (isStudent) {
      //Usually we don't need isStudent condition as it is always gonna be true bu i'm keeping it fot better understanding purposes.
      role[ROLE.STUDENT] = ROLE.STUDENT;
    }

    this.setState({ error: null });

    if (
      passwordOne === "" &&
      fname === "" &&
      lname === "" &&
      email === "" &&
      department === "" &&
      semester === ""
    ) {
      this.setState({ error: "Please Fill Everything Up Properly" });
    } else if (fname === "" || lname === "") {
      this.setState({ error: "Please Enter Your First & Last Name Properly" });
    } else if (email === "") {
      this.setState({ error: "Please Enter Your Email Address" });
    } else if (enrolno === "") {
      this.setState({ error: "Please Enter Your GTU Enrolment No." });
    } else if (department === "") {
      this.setState({ error: "Please Enter Your Department" });
    } else if (semester === "") {
      this.setState({ error: "Please Enter Your Semester" });
    } else if (passwordOne !== passwordTwo) {
      this.setState({ error: "Passwords are not matching" });
    } else if (passwordOne === "") {
      this.setState({ error: "Please Enter Password" });
    } else {
      this.props.firebase
        .doCreateUserWithEmailAndPassword(email, passwordOne)
        .then((authUser) => {
          // Create a user in your Firebase realtime database
          return (
            this.props.firebase
              .user(authUser.user.uid)
              // .user("(Student) => " + fname + " " + lname + " - " + enrolno)
              .set({
                name: fname + " " + lname,
                enrolment_no: enrolno,
                department,
                semester,
                email,
                password: passwordOne,
                role,
              })
          );
        })
        .then(() => {
          // console.log("Successfully Signed Up.");
          this.setState({ ...INITIAL_STATE });
          // console.log("Initialized newState!!");
          this.props.history.push(ROUTES.HOME);
          // console.log("Redirected to Home!!");
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

  render() {
    const {
      fname,
      lname,
      enrolno,
      department,
      semester,
      email,
      passwordOne,
      passwordTwo,
      error,
    } = this.state;

    return (
      <form onSubmit={this.onSubmit}>
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
              type="number"
              name="enrolno"
              className="input"
              value={enrolno}
              onChange={this.onChange}
            />
            <label
              className={enrolno !== "" ? "placeholder above" : "placeholder"}
            >
              Enrolment No.
            </label>
          </div>
          <div className="group dropdown-group">
            <select
              className="Dropdown"
              value={department}
              onChange={this.onChange}
              name="department"
            >
              <option>Department</option>
              <option>I.T.</option>
              <option>Computer</option>
              <option>Mechanical</option>
              <option>Electrical</option>
              <option>Aeronautical</option>
              <option>Chemical</option>
              <option>Civil</option>
            </select>
            <label className="dropdown-placeholder">Department</label>
          </div>
        </div>
        <br />
        <div className="flex-grp">
          <div className="group dropdown-group">
            <select
              className="Dropdown"
              name="semester"
              value={semester}
              onChange={this.onChange}
            >
              <option>Semester</option>
              <option>1st</option>
              <option>2nd</option>
              <option>3rd</option>
              <option>4th</option>
              <option>5th</option>
              <option>6th</option>
              <option>7th</option>
              <option>8th</option>
            </select>
            <label className="dropdown-placeholder">Semester</label>
          </div>
          <div className="group">
            <input
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
        </div>
        <br />
        <div className="flex-grp">
          <div className="group">
            <input
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

        <button type="submit" name="submit" className="SubmitBut">
          Submit
        </button>
        <div className="error-text">
          {/* {error && <p style={{ color: `#ff0000` }}>*{error.message}*</p>} */}
          {error && <p style={{ color: `#ff0000` }}>*{error}*</p>}
        </div>
      </form>
    );
  }
}

const SignInLink = () => (
  <p style={{ textAlign: `center`, marginTop: `50px` }}>
    Already have an account?{" "}
    <Link
      to={ROUTES.SIGN_IN}
      style={{
        textDecoration: `none`,
        color: `#0000ff`,
        fontWeight: `500`,
        marginLeft: `5px`,
      }}
    >
      Sign In
    </Link>
  </p>
);

const SignUpStuForm = compose(withRouter, withFirebase)(SignUpFormBase);

export default SignUpStuPage;

export { SignUpStuForm, SignInLink };
