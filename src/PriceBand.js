import '@coreui/coreui/dist/css/coreui.min.css';
import { cilExternalLink, cilReload } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { CAlert, CButton, CForm, CFormInput, CFormSelect, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react';
import Papa from "papaparse";
import React, { useEffect, useState } from "react";
import { CSVLink } from "react-csv";
import './App.css';

function PriceBand() {

  const allowedExtensions = ["csv"];
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [file, setFile] = useState([]);

  const [selectedCell, setSelectedCell] = useState("");
  const [csvData, setCsvData] = useState("");
  const [watchlistName, setWatchlistName] = useState("Best Range Stocks");
  const [priceBand, setPriceBand] = useState("");
  
  const [mainFileData, setMainFileData] = useState([])

  const [csvFileData, setCsvFileData] = useState([])
   
   useEffect(() => {

    console.log("priceBand :",priceBand)
    if(priceBand && priceBand !=="Select Price Band") {
        const filteredData = mainFileData.filter(item => {
            if(priceBand === "5") {
                if(item.Band <= 5) {
                    return true;
                }                
            } else {
                return item.Band === priceBand;
            }
        });
        
        const csvData = [];
        filteredData.forEach(element => {
            csvData.push("NSE:" + element.Symbol);
        });
        
        const csvFileDataPrepared = [];
        const cloneData = [...csvData]
        for(let i = 0; i < cloneData.length; i++) {
          csvFileDataPrepared.push({
            fileName: priceBand+' % Upper Circuit File',
            content: cloneData.splice(0,1000).join(",")
          })
        }
       setCsvFileData(csvFileDataPrepared);
       console.log("csvFileDataPrepared",csvFileDataPrepared)
       setCsvData(csvData.join(","))
       setData(filteredData);
    }
}, [ mainFileData, priceBand])

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
    if (!file) return setError("Enter a valid file");

    const handleFileChosen = async (file) => {
      return new Promise((resolve, reject) => {
        let fileReader = new FileReader();

        fileReader.onload = () => {
          resolve(
            {
              fileName: file.name,
              data: fileReader.result
            }
          );
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

      console.log("allFileData :", allFileData);

      let filesContentObj = [];
      let fileWithItsContent = [];

      allFileData.forEach(result => {
        const csv = Papa.parse(result.data, { header: true });
        const parsedData = csv?.data;
        fileWithItsContent = fileWithItsContent.concat({
          name: result.fileName,
          data: parsedData
        });
        filesContentObj = filesContentObj.concat(parsedData);
      })

      console.log("fileWithItsContent :", filesContentObj);

      // console.log("Final Trades : ", filesContentObj)
      const filteredData = filesContentObj.filter(data => data && isNaN(data.Symbol)
    //   && (data.Band > 5 || data.Band.trim() === "No Band")       
    && data.Series === "EQ"
      );

      const csvData = [];
      filteredData.forEach(element => {
        csvData.push("NSE:" + element.Symbol);
      });
      
      setCsvData(csvData.join(","))
      setData(filteredData);
      setMainFileData(filteredData);
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
            label={<b>Select NSE Price Band CSV files.</b>}
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

                    <CFormSelect 
                    value={priceBand}
                    style={{ marginRight: 10, fontWeight: "bold" }}
                    aria-label="Default select example"
                    options={[
                        'Select Price Band',
                        { label: '5 % Or Less UC', value: '5' },
                        { label: '10 % UC', value: '10' },
                        { label: '20 % UC', value: '20' },
                        { label: 'No Band', value: 'No Band' }
                    ]}
                    onChange={(e) => {
                        setPriceBand(e.target.value);
                    }}
                    />
                  

                  {
                    csvFileData.map((item,index) => 
                      (<CSVLink key={index} filename={item.fileName + ((csvFileData.length === 1) ? '' : '_'+(index+1))} className='btn btn-primary btn-sm' style={{ fontWeight: "bold",marginRight: 4, width:"100%" }} data={item.content}>
                    {item.fileName + ((csvFileData.length === 1) ? '' : '_'+(index+1))}
                  </CSVLink>)
                    )
                  }
                    
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
                <CTableHeaderCell scope="col">Sr No</CTableHeaderCell>
                <CTableHeaderCell scope="col">Symbol</CTableHeaderCell>
                <CTableHeaderCell style={{ textAlign: "left" }} scope="col">Company Name</CTableHeaderCell>
                <CTableHeaderCell scope="col">Band</CTableHeaderCell>
                <CTableHeaderCell scope="col">Series</CTableHeaderCell>
                <CTableHeaderCell scope="col">Remark</CTableHeaderCell>                                
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {data.map((row, idx) =>
                <CTableRow key={idx}>
                  <CTableDataCell>{idx + 1}</CTableDataCell>
                  <CTableDataCell
                    onClick={() => setSelectedCell(row.Symbol)} style={{ backgroundColor: selectedCell === row.Symbol ? "#A7F1A8" : "" }}
                  >
                    <strong>{row.Symbol}  </strong>
                    <a href={'https://marketsmithindia.com/mstool/eval/list/' + row.Symbol + '/evaluation.jsp'}
                      target="_blank"
                    >
                      <CIcon icon={cilExternalLink} className="text-primary" size="md" />
                    </a>
                  </CTableDataCell>
                  <CTableDataCell style={{ textAlign: "left" }}>{row["Security Name"]}</CTableDataCell>
                  <CTableDataCell>{row.Band}</CTableDataCell>
                  <CTableDataCell>{row.Series}</CTableDataCell>
                  <CTableDataCell>{row.Remarks}</CTableDataCell>                  
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

      </div>
    </section >
  );
}

export default PriceBand;
