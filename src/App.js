import "./App.css";
import { useCallback, useEffect, useState } from "react";
import { createTensorflows, deleteTensorflows, getTensorflows } from "./services/tensorflow";
import { arround, convertByte, formatPercent, getUnitFromByte, toBase64 } from "./services/utils";
import rightArrow from './assets/images/arrow-right.svg'
import fileSolid from './assets/images/file-solid.svg'
import trashSolid from './assets/images/trash-solid.svg'
import pollH from './assets/images/poll-h-solid.svg'
import Loader from "./components/Loader";
require('@tensorflow/tfjs-backend-cpu');
require('@tensorflow/tfjs-backend-webgl');
const cocoSsd = require('@tensorflow-models/coco-ssd');
const mobilen = require('@tensorflow-models/mobilenet');

const App = () => {
  // States
  const [tensorflows, setTensorflows] = useState([]);
  const [selectedImage, setSelectedImage] = useState();
  const [selectedFile, setSelectedFile] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRes, setIsLoadingRes] = useState(false);
  const [results, setResults] = useState([]);

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
    setSelectedFile(file)
  }

  const detectImg = async () => {
    if (selectedImage) {
      const img = new Image();
      img.src = selectedImage;
      setIsLoadingRes(true)

      const [coco, mobilenet] = await Promise.all([
        cocoSsd.load(),
        mobilen.load()
      ])

      const [predCoco, predMobile] = await Promise.all([
        coco.detect(img),
        mobilenet.classify(img)
      ]);

      // const predictions = await model.classify(img);
      console.log('Predictions: ');
      console.log(predCoco);
      let predictions = predCoco.map(pred => ({ type: pred.class, percent: pred.score }))
      if (!predCoco || predCoco.length === 0) {
        console.log(predMobile);
        predictions = [
          ...predictions,
          ...predMobile.map(pred => ({ type: pred.className, percent: pred.probability }))
        ]
      }
      console.log(predictions)
      setResults(predictions)
      setIsLoadingRes(false)
      await createTensorflow(predictions)
    }
  }

  const createTensorflow = async (currentResults) => {
    console.log({
      name: selectedFile.name,
      weight: selectedFile.size,
      date: selectedFile.lastModifiedDate,
      results: [
        ...currentResults
      ]
    })
    const data = await createTensorflows({
      name: selectedFile.name,
      weight: selectedFile.size,
      date: selectedFile.lastModifiedDate,
      results: [
        ...currentResults
      ]
    })

    if (!data || !data.data) {
      return
    }

    await fetchData()
    // CONFETTI
    console.log('CONFETII')
  }

  const handleDelete = (id) => async () => {
    console.log({ id })
    const data = await deleteTensorflows(id);

    if (!data || !data.data) {
      return
    }
    await fetchData()
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
              {isLoadingRes ? (
                  <Loader/>
                ) : (
                  <img src={rightArrow} className={`${isLoadingRes || !selectedImage ? 'disable' : ''}`} alt="" onClick={detectImg} />
                )
              }
            </div>
            <div className="results">
              {results && results.length > 0 && results.map((result, index) => (
                <div key={index}>
                  <p>{result.type}</p>
                  <p>{formatPercent(result.percent)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="history">
          <h1>Historique</h1>
          {isLoading && (
            <Loader />
          )}
          {tensorflows && !isLoading && tensorflows.map((tensorflow, index) => (
            <div key={index}>
              <div className="line">
                <div className="line-content">
                  <img src={fileSolid} alt="" />
                  <p>{tensorflow.name}</p>
                  <p>{arround(convertByte(tensorflow.weight, getUnitFromByte(tensorflow.weight)))} {getUnitFromByte(tensorflow.weight)}</p>
                  <p>{tensorflow.date}</p>
                </div>
                <img src={trashSolid} alt="" onClick={handleDelete(tensorflow._id)}/>
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
