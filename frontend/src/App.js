//import logo from './logo.svg';
//import './App.css';
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import Room from "./routes/Room";
import Home from "./routes/Home";

function App() {
  return (
    <BrowserRouter>
      {/*<link rel="stylesheet" href="https://unpkg.com/mvp.css"></link>*/}
      <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css"></link>
      <Routes>
        <Route path="/room" element={<Room/>}></Route>
        <Route path="/" element={<Home/>}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
