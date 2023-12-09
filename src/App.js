import '@coreui/coreui/dist/css/coreui.min.css';
import { CCard, CCardBody, CContainer, CNav, CNavItem, CNavLink, CTabContent, CTabPane } from '@coreui/react';
import React, { useState } from "react";
import './App.css';
import Industries from './Industries';
import Stocks from './Stocks';
import TrendingStocks from './TrendingStocks';

function App() {

  const [activeKey, setActiveKey] = useState(1);

  return (

    <CContainer className="App">
      <header className="App-header mt-4">
        <h1>Market Smith</h1>
      </header>

      <CCard>
        <CCardBody>
          <CNav variant='tabs'>
            <CNavItem>
              <CNavLink href='#' onClick={() => setActiveKey(1)} active={activeKey === 1}>
                <strong>197 Industries</strong>
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink href='#' onClick={() => setActiveKey(2)} active={activeKey === 2}>
                <strong>Industry Stocks</strong>
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink href='#' onClick={() => setActiveKey(3)} active={activeKey === 3}>
                <strong>Trending Stocks</strong>
              </CNavLink>
            </CNavItem>
          </CNav>

          <CTabContent>

            <CTabPane role='tabpanel' visible={activeKey === 1}>
              <Industries />
            </CTabPane>

            <CTabPane role='tabpanel' visible={activeKey === 2}>
              <Stocks />
            </CTabPane>

            <CTabPane role='tabpanel' visible={activeKey === 3}>
              <TrendingStocks />
            </CTabPane>
          </CTabContent>
        </CCardBody>
      </CCard>
    </CContainer>
  );
}

export default App;
