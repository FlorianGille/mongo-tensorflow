import "./App.css";
import { useCallback, useEffect, useState } from "react";
import { createTensorflows, deleteTensorflows, getTensorflows } from "./services/tensorflow";
import { arround, convertByte, formatPercent, getUnitFromByte, toBase64 } from "./services/utils";
import rightArrow from './assets/images/arrow-right.svg'
import fileSolid from './assets/images/file-solid.svg'
import trashSolid from './assets/images/trash-solid.svg'
import pollH from './assets/images/poll-h-solid.svg'
import Loader from "./components/Loader";
import Confetti from "react-dom-confetti";
import dayjs from "dayjs";
import * as tf from '@tensorflow/tfjs';
import * as tmImage from '@teachablemachine/image';
require('@tensorflow/tfjs-backend-cpu');
require('@tensorflow/tfjs-backend-webgl');
const cocoSsd = require('@tensorflow-models/coco-ssd');
const mobilen = require('@tensorflow-models/mobilenet');
const URL = "https://teachablemachine.withgoogle.com/models/4TBBxa5Av/";


const config = {
  angle: 90,
  spread: 360,
  startVelocity: 40,
  elementCount: 70,
  dragFriction: 0.12,
  duration: 3000,
  stagger: 3,
  width: "10px",
  height: "10px",
  perspective: "500px",
  colors: ["#a864fd", "#29cdff", "#78ff44", "#ff718d", "#fdff6a"]
};

const App = () => {
  // States
  const [tensorflows, setTensorflows] = useState([]);
  const [selectedImage, setSelectedImage] = useState();
  const [selectedFile, setSelectedFile] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRes, setIsLoadingRes] = useState(false);
  const [isCollapse, setIsCollapse] = useState({});
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
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    if (selectedImage) {
      const img = new Image();
      img.src = selectedImage;
      setIsLoadingRes(true)

      const [coco, mobilenet, custom] = await Promise.all([
        cocoSsd.load(),
        mobilen.load(),
        tmImage.load(modelURL, metadataURL)
      ])

      const [predCoco, predMobile, predCustom] = await Promise.all([
        coco.detect(img),
        mobilenet.classify(img),
        custom.predict(img)
      ]);

      let predictions = predCustom.map(pred => ({ type: pred.className, percent: pred.probability }))

      if (!predCustom || predCustom.length === 0 || predCustom[0].probability < predCustom[1].probability) {
        predictions = []
        predictions = [
          ...predictions,
          ...predCoco.map(pred => ({ type: pred.class, percent: pred.score }))
        ]
        if (!predCoco || predCoco.length === 0) {
          predictions = [
            ...predictions,
            ...predMobile.map(pred => ({ type: pred.className, percent: pred.probability }))
          ]
        }
      }
      setResults(predictions)
      setIsLoadingRes(false)
      await createTensorflow(predictions)
    }
  }

  const createTensorflow = async (currentResults) => {
    const data = await createTensorflows({
      name: selectedFile.name,
      weight: selectedFile.size,
      date: dayjs(),
      results: [
        ...currentResults
      ]
    })

    if (!data || !data.data) {
      return
    }

    await fetchData()
  }

  const handleDelete = (id) => async () => {
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
              <Confetti active={ !isLoadingRes } config={ config }/>
              {isLoadingRes ? (
                  <Loader/>
                ) : (
                  <img src={rightArrow} className={`${isLoadingRes || !selectedImage ? 'disable' : ''}`} alt="" onClick={detectImg} />
                )
              }
            </div>
            <div className="results">
              {results && results.length > 0 && results.map((result, index) => (
                <div className="result" key={index}>
                  <p className={`${index === 0 ? 'first-result' : ''}`}>{result.type}</p>
                  <p className={`${index === 0 ? 'first-result' : ''}`}>{formatPercent(result.percent)}</p>
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
              <div className="line" onClick={() => setIsCollapse({ ...isCollapse, [tensorflow._id]: !isCollapse[tensorflow._id]})}>
                <div className="line-content">
                  <img src={fileSolid} alt="" />
                  <p>{tensorflow.name}</p>
                  <p>{arround(convertByte(tensorflow.weight, getUnitFromByte(tensorflow.weight)))} {getUnitFromByte(tensorflow.weight)}</p>
                  <p>{dayjs(tensorflow.date).format('DD/MM/YYYY')}</p>
                </div>
                <img src={trashSolid} alt="" onClick={handleDelete(tensorflow._id)}/>
              </div>
              {!isCollapse[tensorflow._id] && tensorflow && tensorflow.results.map((result, index) => (
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
