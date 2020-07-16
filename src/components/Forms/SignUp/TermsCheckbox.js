import React, { Component } from "react";
import "../index.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

class TermsCheckbox extends Component {
  constructor(props) {
    super(props);
    this.checkboxToggleClass = this.checkboxToggleClass.bind(this);
    this.state = {
      active: false,
    };
  }
  checkboxToggleClass() {
    let currentState = this.state.active;
    this.setState({ active: !currentState });
  }
  render() {
    return (
      <div className="group-checkbox">
        <div
          className={
            this.state.active ? "checkbox-div-active" : "checkbox-div-inactive"
          }
          onClick={() => this.checkboxToggleClass()}
        >
          <FontAwesomeIcon icon="minus" />
        </div>
        <label htmlFor="termsandc">
          Accept <span>Terms</span> and <span>Conditions</span>
        </label>
      </div>
    );
  }
}

export default TermsCheckbox;
