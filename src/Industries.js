import '@coreui/coreui/dist/css/coreui.min.css';
import { cilExternalLink, cilReload } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { CAlert, CButton, CFormInput, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react';
import Papa from "papaparse";
import React, { useState } from "react";
import './App.css';

function Industries() {

  const allowedExtensions = ["csv"];
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [file, setFile] = useState("");

  const [selectedCell, setSelectedCell] = useState("");

  const handleFileChange = (e) => {
    setError("");
    if (e.target.files.length) {
      const inputFile = e.target.files[0];
      const fileExtension = inputFile?.type.split("/")[1];
      if (!allowedExtensions.includes(fileExtension)) {
        setError("Please input a csv file");
        return;
      }
      setFile(inputFile);
    }
  };

  const handleParse = () => {



    function compare(a, b) {

      const bValue = a.weeklyChange;
      const aValue = b.weeklyChange;

      if (aValue < bValue) {
        return -1;
      }
      if (aValue > bValue) {
        return 1;
      }
      return 0;
    }

    const NUMBER_OF_STOCKS = 6;
    const CAPITALIZATION = 10000;

    if (!file) return setError("Enter a valid file");
    const reader = new FileReader();
    reader.onload = async ({ target }) => {
      const csv = Papa.parse(target.result, { header: true });
      const parsedData = csv?.data;
      // console.log("parsedData", parsedData)


      const industriesData = parsedData.map(data => {
        return {
          ...data,
          ...{
            weeklyChange: 100 - ((data.IndustryGroupRankCurrent * 100) / data.IndustryGroupRankLastWeek),
            threeMonthChange: 100 - ((data.IndustryGroupRankCurrent * 100) / data.IndustryGroupRankLast3MonthAgo),
            MarketCap: parseInt(data.MarketCapital && data.MarketCapital.replace("Cr", "").replaceAll(",", "").trim())
          }
        }
      });

      console.log(industriesData)

      const filteredData = industriesData.filter(data =>
        //industy has min 6 stocks
        data.NumberOfStocks >= NUMBER_OF_STOCKS &&

        //has 1 lakh CR capital
        data.MarketCap >= CAPITALIZATION &&

        (
          (data.IndustryGroupRankCurrent <= 40) ||
          (data.weeklyChange >= 5 && data.IndustryGroupRankCurrent <= 90)
        )
      ).sort(compare);

      // console.log("filteredData", filteredData)
      setData(filteredData);
    };
    reader.readAsText(file);
  };


  return (
    <section>
      <div className='mt-4'>
        <div className="mb-3">
          <CFormInput onChange={handleFileChange}
            id="csvInput"
            name="file"
            type="File"
            label={<b>Select Industry GroupList CSV file.</b>}
          />
        </div>
        <div>
          <CButton onClick={handleParse} color="primary" size="sm"> Get Industries</CButton>
          <CButton onClick={() => window.location.reload()} color="primary" size="sm" style={{ marginLeft: 10 }}>
            <CIcon icon={cilReload} className="text-secondary" size="sm" /> Reload


          </CButton>
        </div>
      </div>

      <div style={{ marginTop: "3rem" }}>
        {
          error &&
          <CAlert color="danger">
            {error}
          </CAlert>
        }
        <CTable style={{ textAlign: "center" }} striped>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell scope="col">Sr No</CTableHeaderCell>
              <CTableHeaderCell style={{ textAlign: "left" }} scope="col">Group Name</CTableHeaderCell>
              <CTableHeaderCell scope="col">Number Of Stocks</CTableHeaderCell>
              <CTableHeaderCell scope="col">Current Rank</CTableHeaderCell>
              <CTableHeaderCell scope="col">Last Week Rank</CTableHeaderCell>
              <CTableHeaderCell scope="col">3 Month Ago Rank</CTableHeaderCell>
              <CTableHeaderCell scope="col">W Change % </CTableHeaderCell>
              <CTableHeaderCell scope="col">3M Change % </CTableHeaderCell>
              <CTableHeaderCell scope="col">Market Cap</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {data.map((row, idx) =>
              <CTableRow key={idx}>
                <CTableDataCell>{idx + 1}</CTableDataCell>
                <CTableDataCell
                  onClick={() => setSelectedCell(row.IndustryGroupName)} style={{ textAlign: "left", backgroundColor: selectedCell === row.IndustryGroupName ? "#A7F1A8" : "" }}
                >
                  <strong>{row.IndustryGroupName}</strong>
                  <a style={{ marginLeft: 10 }} href={'https://marketsmithindia.com/mstool/eval/list/' + row.Symbol + '/evaluation.jsp'}
                    target="_blank"
                  >
                    <CIcon icon={cilExternalLink} className="text-primary" size="lg" />
                  </a>
                </CTableDataCell>
                <CTableDataCell>{row.NumberOfStocks}</CTableDataCell>
                <CTableDataCell>{row.IndustryGroupRankCurrent}</CTableDataCell>
                <CTableDataCell>{row.IndustryGroupRankLastWeek}</CTableDataCell>
                <CTableDataCell>{row.IndustryGroupRankLast3MonthAgo}</CTableDataCell>
                <CTableDataCell>{row.weeklyChange.toFixed(2) + " %"}</CTableDataCell>
                <CTableDataCell>{row.threeMonthChange.toFixed(2) + " %"}</CTableDataCell>
                <CTableDataCell>{row.MarketCapital}</CTableDataCell>

              </CTableRow>
            )}

            {
              data && data.length === 0 && <CTableRow>

                <CTableDataCell colSpan={9}>No records available  </CTableDataCell>
              </CTableRow>
            }
          </CTableBody>
        </CTable>


      </div>
    </section>
  );
}

export default Industries;
