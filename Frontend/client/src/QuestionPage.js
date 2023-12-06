import React, { useEffect, useState } from 'react';
import QuestionBox from './QuestionBox';
import { useSearchParams } from 'react-router-dom';
// import { useHistory } from 'react-router-dom';
import axios from 'axios';

export default function QuestionPage() {
    const [params] = useSearchParams();
    const paperid = params.get('id');
    const [paper, setPaper] = useState();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedAns, setSelectedAns] = useState([]);
    const [evaluationLoading, setEvaluationLoading] = useState(false);
    const [evaluated, setEvaluated] = useState(false);
    const [score, setScore] = useState();
    const [timer, setTimer] = useState(null);

    const evaluatePaper = async () => {
        setEvaluationLoading(true);
        try {
            let res = await axios.post(`http://localhost:4000/evaluate-paper/${paperid}`, {
                tickedOptions: selectedAns,
            });

            if (res && res.status === 200) {
                setEvaluationLoading(false);
                setEvaluated(true);
                setScore(res.data);
            } else {
                window.alert('There Might be Some Error');
                setEvaluationLoading(false);
            }
        } catch (err) {
            window.alert(err.message);
            setEvaluationLoading(false);
        }
    };

    const handleTimerTick = () => {
        setTimer((prevTimer) => prevTimer - 1);
    };

    useEffect(() => {
        const timerInterval = setInterval(() => {
            handleTimerTick();
        }, 1000);

        return () => clearInterval(timerInterval);
    }, []);

    useEffect(() => {
        if (timer === 1) {
            evaluatePaper();
            setTimer(null);
        }
    }, [timer, paperid, evaluatePaper]);

    useEffect(() => {
        (async function loadData() {
            try {
                let res = await axios.get(`http://localhost:4000/get-test/${paperid}`);
                if (res && res.status === 200) {
                    setPaper(res.data.test);
                    setTimer(parseInt(res.data.test.totalTime))
                    let lengthOfPaper = res.data.test.questions.length;
                    let selectedAnss = Array(lengthOfPaper).fill('k');
                    setSelectedAns(selectedAnss);
                    setLoading(false);
                } else {
                    setError("There might be Some Error While getting data");
                    setLoading(false);
                }
            } catch (err) {
                setError("There Might Be Some Error");
                setLoading(false);
            }
        })();
    }, [paperid]);

    return (
        <div className="max-w-full mx-auto">
            {loading ? (
                <div className="text-3xl text-center text-gray-600">Loading...</div>
            ) : error ? (
                <div className="text-red-500 text-center">{error}</div>
            ) : evaluated ? (
                <div className="max-w-md mx-auto bg-white p-6 rounded-md shadow-md mt-12">
                    <h2 className="text-2xl font-semibold mb-4">Hey, You Have Scored</h2>
                    <div className="flex justify-between items-center">
                        <p className="text-gray-700">Score:</p>
                        <p className="text-blue-500 text-3xl font-semibold">{`${score.total_marks}/${paper.questions.length * 2}`}</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-4 mb-10">
                    <div className="flex justify-between p-4 bg-blue-500 text-white rounded-md">
                        <h1 className="text-lg ml-2">Quiz</h1>
                        <p className="text-right">{`Time Remaining: ${Math.floor(timer / 60)}:${timer % 60 < 10 ? `0${timer % 60}` : timer % 60}`}</p>
                    </div>
                    {paper.questions.map((question, idx) => (
                        <QuestionBox key={idx} question={question} id={idx} selectedAns={selectedAns} setSelectedAns={setSelectedAns} />
                    ))}
                    <div className="flex items-center justify-between mt-6">
                        <button
                            disabled={evaluationLoading}
                            onClick={evaluatePaper}
                            className={`${evaluationLoading
                                ? 'bg-gray-500 cursor-not-allowed'
                                : 'bg-blue-500 hover:bg-blue-600'
                                } text-white py-2 px-4 rounded-md transition duration-300 mx-auto`}
                        >
                            {evaluationLoading ? 'Submitting...' : 'Submit Paper'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
