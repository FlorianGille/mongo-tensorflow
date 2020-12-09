import './App.css';
require('@tensorflow/tfjs-backend-cpu');
require('@tensorflow/tfjs-backend-webgl');
const cocoSsd = require('@tensorflow-models/coco-ssd');
// const mobilenet = require('@tensorflow-models/mobilenet');

const logo = require('./assets/moi.png');

const App = () => {

  const detectImg = async() => {
    const img = document.getElementById('img');
    // Load the model.
    const model = await cocoSsd.load();
    // const model = await mobilenet.load();
    // Classify the image.
    const predictions = await model.detect(img);
    // const predictions = await model.classify(img);
    console.log('Predictions: ');
    console.log(predictions);
  }

  return (
    <div className="App">
      <header className="App-header">
        <img id="img" src={logo.default} alt="logo" crossOrigin='anonymous'/>
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <button onClick={detectImg}> Detect </button>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
