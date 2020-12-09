import "./App.css";
import { useCallback, useEffect, useState } from "react";
import { getTensorflows } from "./services/tensorflow";
import { arround, convertByte, formatPercent, getUnitFromByte, toBase64 } from "./services/utils";
import rightArrow from './assets/images/arrow-right.svg'
import fileSolid from './assets/images/file-solid.svg'
import pollH from './assets/images/poll-h-solid.svg'
require('@tensorflow/tfjs-backend-cpu');
require('@tensorflow/tfjs-backend-webgl');
const cocoSsd = require('@tensorflow-models/coco-ssd');

const App = () => {
  // States
  const [tensorflows, setTensorflows] = useState([]);
  const [selectedImage, setSelectedImage] = useState();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch tensorflows from API
  // result: []
  const fetchData = useCallback(async () => {
    setIsLoading(true)
    const data = await getTensorflows();
    setIsLoading(false)
    if (!data || !data.data) {
      return;
    }
    setTensorflows(data.data)
  }, [])

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  // Called when the file is updated by the input
  // Set the image
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    console.log(file)
    setSelectedImage(await toBase64(file))
  }


  const detectImg = async () => {
    //get image file here !
    // const img = document.getElementById('img');

    const model = await cocoSsd.load();
    // const model = await mobilenet.load();

    const predictions = await model.detect(img);
    // const predictions = await model.classify(img);
    console.log('Predictions: ');
    console.log(predictions);
  }
  return (
    <div className="App">
      <div className="content">
        <div className="content-input">
          <div className="left-part">
            <img className="selected-img" src={selectedImage} alt="" />
            <label htmlFor="file" className="label-file">Choisissez une image</label>
            <input onChange={handleFileChange} type="file" id="file"></input>
          </div>
          <div className="right-part">
            <div className="arrow">
              <img src={rightArrow} alt="" />
            </div>
            <div className="results">

            </div>
          </div>
        </div>
        <div className="history">
          <h1>Historique</h1>
          {isLoading && (
            <p>Loading...</p>
          )}
          {tensorflows && !isLoading && tensorflows.map((tensorflow, index) => (
            <div key={index}>
              <div className="line">
                <img src={fileSolid} alt="" />
                <p>{tensorflow.name}</p>
                <p>{arround(convertByte(tensorflow.weight, getUnitFromByte(tensorflow.weight)))} {getUnitFromByte(tensorflow.weight)}</p>
                <p>{tensorflow.date}</p>
              </div>
              {tensorflow && tensorflow.results.map((result, index) => (
                <div className="sub-line" key={`sub-line-${index}`}>
                  <img src={pollH} alt="" />
                  <p>{result.type}</p>
                  <p>{formatPercent(result.percent)}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
