import React, { Component } from "react";
import PropTypes from "prop-types";
import Button from "./UI/Button";
import HashColor from "./UI/HashColor";
import Input from "./UI/Input";

class StoreDeployBlock extends Component {
  constructor(props) {
    super(props);
    this.state = {
      issuerName: ""
    };

    this.onNameChange = this.onNameChange.bind(this);
    this.onDeployClick = this.onDeployClick.bind(this);
  }

  onNameChange(event) {
    this.setState({
      issuerName: event.target.value
    });
  }

  onDeployClick() {
    const { adminAddress, handleStoreDeploy } = this.props;
    handleStoreDeploy({
      fromAddress: adminAddress,
      name: this.state.issuerName
    });
  }

  render() {
    return (
      <div className="w-100">
        <div className="mb4">
          <div>
            Issuer Name
            <br />
            <Input
              type="text"
              onChange={this.onNameChange}
              value={this.state.issuerName}
              placeholder="Name of organization"
              size={50}
              className="danger"
              required
            />
          </div>
        </div>

        <Button
          onClick={this.onDeployClick}
          disabled={this.props.deploying}
          className="danger"
        >
          {this.props.deploying ? "Deploying…" : "Deploy"}
        </Button>

        {this.props.deployedTx ? (
          <div className="mt5">
            <div>
              🎉 New store deployed at
              <HashColor hashee={this.props.storeAddress} type="address" />
            </div>
            <div className="mt2">
              Transaction ID
              <HashColor
                hashee={this.props.deployedTx}
                isTx
                networkId={this.props.networkId}
              />
            </div>
          </div>
        ) : null}
      </div>
    );
  }
}

export default StoreDeployBlock;

StoreDeployBlock.propTypes = {
  adminAddress: PropTypes.string,
  storeAddress: PropTypes.string,
  deploying: PropTypes.bool,
  deployedTx: PropTypes.string,
  networkId: PropTypes.number,
  loadAdminAddress: PropTypes.func,
  handleStoreDeploy: PropTypes.func
};
