import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { ToastContainer } from "react-toastify";
/** @jsx jsx */
import { Global, css, jsx } from "@emotion/core";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import {
  lightGrey,
  faintOrange,
  brandOrange,
  brandDarkOrange
} from "../styles/variables";
import { isValidAddress } from "./utils";
import {
  loadAdminAddress,
  getAdminAddress,
  getAccountBalance,
  deployStore,
  getStoreAddress,
  updateStoreAddress,
  issueCertificate,
  getIssuedTx,
  getRevokedTx,
  revokeCertificate,
  getrevokingCertificate,
  getDeploying,
  getIssuingCertificate,
  getDeployedTx
} from "../reducers/admin";
import { updateNetworkId, getNetworkId } from "../reducers/application";
import StoreDeployBlock from "./StoreDeployBlock";
import StoreIssueBlock from "./StoreIssueBlock";
import StoreRevokeBlock from "./StoreRevokeBlock";
import HashColor from "./UI/HashColor";
import HashColorInput from "./UI/HashColorInput";
import Panel from "./UI/Panel";
import NetworkSelectorContainer from "./NetworkSelectorContainer";
import ErrorPage from "./ErrorPage";

const baseStyle = (
  <Global
    styles={css`
      .click-to-refresh {
        transform: rotateZ(0deg);
        transition: transform 1.5s ease-in;

        svg {
          width: 16px;
          vertical-align: middle;
        }
      }
      .click-to-refresh:hover {
        color: ${brandDarkOrange};
      }
      .click-to-refresh:active {
        transform: rotateZ(-360deg);
        transition: transform 0s;
      }
      .click-to-refresh:focus {
        outline: none;
      }

      .tab {
        cursor: pointer;
        border: solid 1px ${lightGrey};
      }

      .tab:hover {
        background-color: ${faintOrange};
      }

      .tab[aria-selected="true"] {
        border-left: solid 4px ${brandOrange};
        color: ${brandOrange};
        border-right: 0;
      }
    `}
  />
);

class AdminContainer extends Component {
  constructor(props) {
    super(props);
    this.refreshCurrentAddress = this.refreshCurrentAddress.bind(this);
    this.handleStoreDeploy = this.handleStoreDeploy.bind(this);
    this.storeAddressOnChange = this.storeAddressOnChange.bind(this);
    this.handleCertificateIssue = this.handleCertificateIssue.bind(this);
    this.handleCertificateRevoke = this.handleCertificateRevoke.bind(this);

    this.state = {
      localStoreAddress: ""
    };
  }

  componentDidMount() {
    if (!this.props.networkId) {
      this.props.updateNetworkId();
      this.props.loadAdminAddress();
    }
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.storeAddress !== this.state.localStoreAddress) {
      this.setState({ localStoreAddress: nextProps.storeAddress });
    }
  }

  storeAddressOnChange(event) {
    const address = event.target.value;
    this.setState({ localStoreAddress: address });
    if (isValidAddress(address)) {
      this.props.updateStoreAddress(address);
    }
  }

  handleStoreDeploy(payload) {
    this.props.deployStore(payload);
  }

  handleCertificateIssue(payload) {
    this.props.issueCertificate(payload);
  }

  handleCertificateRevoke(payload) {
    this.props.revokeCertificate(payload);
  }

  refreshCurrentAddress() {
    this.props.loadAdminAddress();
  }

  render() {
    const {
      adminAddress,
      accountBalance,
      storeAddress,
      issuingCertificate,
      issuedTx,
      revokingCertificate,
      revokedTx,
      networkId,
      deploying,
      deployedTx
    } = this.props;

    return (
      <React.Fragment>
        {adminAddress ? (
          <React.Fragment>
            <nav className="dt pa2 pl6-l pr6-l w-100 border-box ph5-ns bg-white shadow-1-ns items-center flex-l flex-row-l">
              <a href="/" title="Home">
                <img
                  src={"../../static/images/logo.svg"}
                  className="dtc v-mid mid-gray link dim pa3"
                  style={{ width: "200px" }}
                  alt="OpenCerts"
                />
              </a>
              <div className="w-80-ns flex-l flex-row-l justify-end">
                <div className="w-100-s pl3-l pr3-l">
                  <h3 className="ma0">
                    Current Account{" "}
                    <div
                      style={{ cursor: "pointer" }}
                      className="dib click-to-refresh"
                      onClick={this.refreshCurrentAddress}
                      title="Try to grab current account"
                      tabIndex={1}
                    >
                      <i className="fas fa-sync-alt" />
                    </div>
                  </h3>
                  <div className="pa2 pl0">
                    {adminAddress ? (
                      <HashColor hashee={adminAddress} networkId={networkId} />
                    ) : (
                      <div className="red">No wallet address found.</div>
                    )}
                  </div>
                </div>
                <div className="w-100-s pl3-l pr3-l">
                  <h3 className="ma0">Account Balance</h3>
                  <div className="pa2 pl0">
                    {Number.parseInt(accountBalance, 10) >= 0 ? (
                      <div>{accountBalance} ETH</div>
                    ) : (
                      <div className="red">Unable to load account balance.</div>
                    )}
                  </div>
                </div>
                <div className="w-100-s pl3-l">
                  <h3 className="ma0">Wallet Provider</h3>
                  <div className="pa1">
                    <NetworkSelectorContainer />
                  </div>
                </div>
              </div>
            </nav>
            <ToastContainer autoClose={4000} />
            <Panel style={{ maxWidth: "900px" }}>
              {baseStyle}
              <div className="flex">
                <div className="w-100 w-50-ns">
                  <h1 className="mt0">Admin</h1>
                </div>
              </div>
              <div className="flex bb pb3">
                <div className="w-100  w-50-l">
                  <h3>Store address</h3>
                  <HashColorInput
                    variant="rounded"
                    type="address"
                    value={this.state.localStoreAddress}
                    onChange={this.storeAddressOnChange}
                    placeholder="Enter existing (0x…), or deploy new instance"
                  />
                </div>
              </div>
              <Tabs className="flex flex-row w-100">
                <TabList className="flex flex-column w-30 list pa0">
                  <Tab
                    className="tab pl3"
                    style={{ borderTopLeftRadius: "5px" }}
                  >
                    <h3>Deploy new instance</h3>
                  </Tab>
                  <Tab className="tab pl3">
                    <h3>Issue certificate batch</h3>
                  </Tab>
                  <Tab
                    className="tab pl3"
                    style={{ borderBottomLeftRadius: "5px" }}
                  >
                    <h3>Revoke certificate</h3>
                  </Tab>
                </TabList>
                <div className="w-70 pa4 pl5">
                  <TabPanel>
                    <StoreDeployBlock
                      storeAddress={storeAddress}
                      handleStoreDeploy={this.handleStoreDeploy}
                      deploying={deploying}
                      networkId={networkId}
                      deployedTx={deployedTx}
                    />
                  </TabPanel>
                  <TabPanel>
                    {storeAddress ? (
                      <StoreIssueBlock
                        networkId={networkId}
                        issuedTx={issuedTx}
                        storeAddress={storeAddress}
                        handleCertificateIssue={this.handleCertificateIssue}
                        issuingCertificate={issuingCertificate}
                      />
                    ) : (
                      <div className="red">Enter a store address first.</div>
                    )}
                  </TabPanel>
                  <TabPanel>
                    {storeAddress ? (
                      <StoreRevokeBlock
                        networkId={networkId}
                        revokingCertificate={revokingCertificate}
                        revokedTx={revokedTx}
                        storeAddress={storeAddress}
                        handleCertificateRevoke={this.handleCertificateRevoke}
                      />
                    ) : (
                      <div className="red">Enter a store address first.</div>
                    )}
                  </TabPanel>
                </div>
              </Tabs>
            </Panel>
          </React.Fragment>
        ) : (
          <ErrorPage />
        )}
      </React.Fragment>
    );
  }
}

const mapStateToProps = store => ({
  adminAddress: getAdminAddress(store),
  accountBalance: getAccountBalance(store),
  storeAddress: getStoreAddress(store),
  issuedTx: getIssuedTx(store),
  revokingCertificate: getrevokingCertificate(store),
  revokedTx: getRevokedTx(store),
  networkId: getNetworkId(store),
  deploying: getDeploying(store),
  deployedTx: getDeployedTx(store),
  issuingCertificate: getIssuingCertificate(store)
});

const mapDispatchToProps = dispatch => ({
  loadAdminAddress: payload => dispatch(loadAdminAddress(payload)),
  updateNetworkId: () => dispatch(updateNetworkId()),
  deployStore: payload => dispatch(deployStore(payload)),
  issueCertificate: payload => dispatch(issueCertificate(payload)),
  revokeCertificate: payload => dispatch(revokeCertificate(payload)),
  updateStoreAddress: payload => dispatch(updateStoreAddress(payload))
});

export default connect(mapStateToProps, mapDispatchToProps)(AdminContainer);

AdminContainer.propTypes = {
  deploying: PropTypes.bool,
  deployedTx: PropTypes.string,
  updateNetworkId: PropTypes.func,
  loadAdminAddress: PropTypes.func,
  deployStore: PropTypes.func,
  issueCertificate: PropTypes.func,
  updateStoreAddress: PropTypes.func,
  adminAddress: PropTypes.string,
  accountBalance: PropTypes.number,
  storeAddress: PropTypes.string,
  issuingCertificate: PropTypes.bool,
  issuedTx: PropTypes.string,
  revokingCertificate: PropTypes.bool,
  revokedTx: PropTypes.string,
  revokeCertificate: PropTypes.func,
  networkId: PropTypes.number
};
