// polyfill is required to fix regeneratorRuntime issue for ledgerhq u2f
// see: https://github.com/LedgerHQ/ledgerjs/issues/218
import "@babel/polyfill";
import { connect } from "react-redux";
import Meta from "../components/Meta";
import NetworkSelectorPage from "../components/NetworkSelectorPage";

const DefaultPage = () => (
  <div className="min-vh-100 bg-light">
    <Meta />
    <div className="mw9 mw8-ns center pa4 ph5-ns br3 pv5">
      <NetworkSelectorPage />
    </div>
  </div>
);

export default connect()(DefaultPage);
