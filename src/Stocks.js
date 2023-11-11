import './App.css';
import '@coreui/coreui/dist/css/coreui.min.css';
import { CAlert, CButton, CCol, CForm, CFormInput, CRow, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react';
import Papa from "papaparse";
import React, { useState } from "react";
import { CContainer } from '@coreui/react';
import { cilCopy, cilExternalLink, cilReload } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { CSVLink, CSVDownload } from "react-csv";

function Stocks() {

  const allowedExtensions = ["csv"];
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [file, setFile] = useState([]);
  const [copy, setCopy] = useState({
    value: '',
    copiedIndustry: "",
  });
  const [selectedCell, setSelectedCell] = useState("");
  const [csvData, setCsvData] = useState("");
  const [watchlistName, setWatchlistName] = useState("Strong-Sector-Week");


  const handleFileChange = (e) => {
    setError("");
    const selectedFiles = e.target.files;
    if (e.target.files.length) {

      //For every selected file check error and add to final file list
      const files = new Array();

      for (let index = 0; index < selectedFiles.length; index++) {
        const file = selectedFiles[index];
        const fileExtension = file?.type.split("/")[1];
        if (!allowedExtensions.includes(fileExtension)) {
          setError("Please input a csv file");
          return;
        }
        files.push(file)
      }

      //set file list
      setFile(files);
    }
  };

  const handleParse = () => {

    const BUYER_DEMAND = ["A+", "A", "A-", "B+"];
    if (!file) return setError("Enter a valid file");


    const handleFileChosen = async (file) => {
      return new Promise((resolve, reject) => {
        let fileReader = new FileReader();
        fileReader.onload = () => {
          resolve(fileReader.result);
        };
        fileReader.onerror = reject;
        fileReader.readAsText(file);
      });
    }


    const readAllFiles = async (AllFiles) => {
      const allFileData = await Promise.all(AllFiles.map(async (file) => {
        const fileContents = await handleFileChosen(file);
        return fileContents;
      }));

      // console.log(allFileData);

      let filesContentObj = [];


      allFileData.forEach(data => {
        const csv = Papa.parse(data, { header: true });
        const parsedData = csv?.data;
        filesContentObj = filesContentObj.concat(parsedData);
      })

      // console.log("Final Trades : ", filesContentObj)

      const filteredData = filesContentObj.filter(data => data.Symbol && isNaN(data.Symbol)
        && data.MarketCapital.length >= 11
        && BUYER_DEMAND.includes(data.BuyerDemand)
        && data.Price.replaceAll(",", "") > 28
      );

      // console.log("filteredData : ", filteredData)

      const sortedData = [];
      BUYER_DEMAND.forEach(demand => {
        filteredData.forEach(data => {
          if (demand === data.BuyerDemand) {
            sortedData.push(data)
          }
        })
      })

      setData(sortedData);

      const result = [];
      sortedData.forEach(element => {
        result.push("NSE:" + element.Symbol);
      });

      setCsvData(result.join(","))

      return allFileData;
    }

    readAllFiles(file);
  };


  return (
    <section>
      <CContainer className='mt-4'>
        <div className="mb-3">
          <CFormInput onChange={handleFileChange}
            id="csvInput"
            name="file"
            type="File"
            label={<b>Select Industry Stocks CSV file.</b>}
            multiple
          />
        </div>
        <div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <CButton onClick={handleParse} color="primary" size="sm" style={{ fontWeight: "bold" }}> Get Stocks</CButton>
              <CButton onClick={() => window.location.reload()} color="primary" size="sm" style={{ marginLeft: 10, fontWeight: "bold" }}>
                <CIcon icon={cilReload} className="text-secondary" size="sm" /> Reload
              </CButton>
            </div>

            <div>
              {
                csvData &&

                <CForm style={{ display: "flex" }}>
                  <CFormInput
                    type="text"
                    id="WatchlistNameFormControlInput"

                    placeholder="Enter Watchlist"
                    value={watchlistName}
                    onChange={(e) => {
                      setWatchlistName(e.target.value);
                    }}
                    style={{ marginRight: 10, fontWeight: "bold" }}
                  />
                  <CSVLink filename={watchlistName} className='btn btn-primary btn-sm' style={{ fontWeight: "bold" }} data={csvData}>
                    Download

                  </CSVLink>
                </CForm>
              }
            </div>
          </div>
        </div>
      </CContainer>

      <div style={{ marginTop: "2rem" }}>
        <CContainer>

          {
            error &&
            <CAlert color="danger">
              {error}
            </CAlert>
          }

          <CTable style={{ textAlign: "center" }} striped>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell scope="col">Stock No</CTableHeaderCell>
                <CTableHeaderCell style={{ textAlign: "left" }} scope="col">Symbol</CTableHeaderCell>
                <CTableHeaderCell style={{ textAlign: "left" }} scope="col">Company Name</CTableHeaderCell>
                <CTableHeaderCell scope="col">Price</CTableHeaderCell>
                <CTableHeaderCell scope="col">BuyerDemand</CTableHeaderCell>
                <CTableHeaderCell scope="col">Market Cap</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {data.map((row, idx) =>
                <CTableRow key={idx}>
                  <CTableDataCell>{idx + 1}</CTableDataCell>
                  <CTableDataCell onClick={() => setSelectedCell(row.Symbol)} style={{ textAlign: "left", backgroundColor: selectedCell === row.Symbol ? "#A7F1A8" : "" }} >
                    <strong>{row.Symbol}</strong>
                    {/* <CopyToClipboard text={row.Symbol} onCopy={() => setCopy({ copiedSymbol: row.Symbol })}>
                      <CIcon style={{ marginLeft: 10 }} icon={cilCopy} className={copy.copiedSymbol === row.Symbol ? "text-primary" : "text-secondary"} size="xl" />
                    </CopyToClipboard> */}
                    <a style={{ marginLeft: 10 }} href={'https://in.tradingview.com/chart/ZLWT61X3/?symbol=NSE:' + row.Symbol}
                      target="_blank"
                    >
                      <CIcon icon={cilExternalLink} className="text-primary" size="lg" />
                    </a>
                  </CTableDataCell>
                  <CTableDataCell style={{ textAlign: "left" }}>{row.CompanyName}</CTableDataCell>
                  <CTableDataCell>{row.Price}</CTableDataCell>
                  <CTableDataCell><strong>{row.BuyerDemand}</strong></CTableDataCell>
                  <CTableDataCell>{row.MarketCapital}</CTableDataCell>
                  <CTableDataCell>

                  </CTableDataCell>

                </CTableRow>
              )}

              {
                data && data.length === 0 && <CTableRow>

                  <CTableDataCell colSpan={6}>No records available  </CTableDataCell>
                </CTableRow>
              }
            </CTableBody>
          </CTable>
        </CContainer>

      </div>
    </section >
  );
}

export default Stocks;
