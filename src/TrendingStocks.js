import '@coreui/coreui/dist/css/coreui.min.css';
import { cilExternalLink, cilReload } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { CAlert, CButton, div, CForm, CFormInput, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react';
import React, { useState } from "react";
import { CSVLink } from "react-csv";
import './App.css';

function TrendingStocks() {


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
        files.push(file)
      }

      //set file list
      setFile(files);
    }
  };

  const handleParse = () => {

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


      let filesContentObj = "";
      allFileData.forEach(data => {
        filesContentObj = filesContentObj += data;
      })


      const symbolSet = new Set();
      filesContentObj.split(",").forEach(symbol => {
        symbolSet.add("NSE:" + symbol.split(":")[1]);
      });


      const tableData = [];
      let finalfileData = "";

      symbolSet.forEach(value => {
        finalfileData += value + ","
        tableData.push(value.split(":")[1]);
      });

      setCsvData(finalfileData);
      setData(tableData);
      return allFileData;
    }

    readAllFiles(file);
  };


  return (
    <section>
      <div className='mt-4'>
        <div className="mb-3">
          <CFormInput onChange={handleFileChange}
            id="csvInput"
            name="file"
            type="File"
            label={<b>Select Stocks files</b>}
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
      </div>

      <div style={{ marginTop: "2rem" }}>
        <div>

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
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {data.map((Symbol, idx) =>

                <CTableRow key={idx}>
                  <CTableDataCell>{idx + 1}</CTableDataCell>
                  <CTableDataCell onClick={() => setSelectedCell(Symbol)} style={{ textAlign: "left", backgroundColor: selectedCell === Symbol ? "#A7F1A8" : "" }} >
                    <strong>{Symbol}</strong>
                    <a style={{ marginLeft: 10 }} href={'https://in.tradingview.com/chart/ZLWT61X3/?symbol=' + Symbol}
                      target="_blank"
                    >
                      <CIcon icon={cilExternalLink} className="text-primary" size="lg" />
                    </a>
                  </CTableDataCell>
                </CTableRow>
              )}

              {
                data && data.length === 0 && <CTableRow>

                  <CTableDataCell colSpan={2}>No records available  </CTableDataCell>
                </CTableRow>
              }
            </CTableBody>
          </CTable>
        </div>

      </div>
    </section >
  );
}

export default TrendingStocks;
