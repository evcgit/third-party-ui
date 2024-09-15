import React from "react"; 
import PDFViewer from "./PDFViewer";
// import PDFMultiPageStamps from "./MultiPDFViewer";

function App() {
  return (
    <div className="App" style={{margin: 50}}>
			<PDFViewer />
			{/* <PDFMultiPageStamps /> */}
    </div>
  );
}

export default App;
