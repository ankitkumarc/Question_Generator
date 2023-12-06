import './App.css';
import GeneratorForm from './GeneratorForm';
import { Routes, Route } from 'react-router-dom'
import QuestionPage from './QuestionPage';

function App() {
  return (
    <Routes>
      <Route path='/' element={<GeneratorForm />} />
      <Route path='/get-test' element={<QuestionPage />} />
    </Routes>
  );
}

export default App;
