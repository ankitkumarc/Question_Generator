import React from 'react';
import { useState } from 'react';
import axios from 'axios';

function GeneratorForm() {
    const [subject, setSubject] = useState("");
    const [topic, setTopic] = useState("");
    const [nques, setNques] = useState("");
    const [time, setTime] = useState("");
    const [diffculty, setDiffculty] = useState("easy");
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);

    const generatePaper = async () => {
        setLoading(true);
        try {
            const res = await axios.post("http://localhost:4000/generate-test", {
                subject: subject,
                topic: topic,
                noOfQuestion: nques,
                diffculty: diffculty,
                time: time
            });

            if (res.status === 200) {
                const baseUrl = "http://localhost:3000/get-test?id=";
                const paper = res.data.test;
                const generatedUrl = baseUrl + paper.id;
                setUrl(generatedUrl);
            } else {
                window.alert("There Might Be Some Error. Please Generate Again");
            }
        } catch (err) {
            window.alert(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-xl mx-auto p-6 bg-white rounded-md shadow-md mt-20">
            <h1 className="text-3xl font-bold mb-6">Generate Paper</h1>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <input
                    type="text"
                    name="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Subject"
                    className="border border-gray-300 p-2 rounded-md focus:outline-none"
                />

                <input
                    type="text"
                    name="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Topic"
                    className="border border-gray-300 p-2 rounded-md focus:outline-none"
                />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <input
                    type="number"
                    name="noOfques"
                    value={nques}
                    onChange={(e) => setNques(e.target.value)}
                    placeholder="No of Questions"
                    min={5}
                    max={50}
                    className="border border-gray-300 p-2 rounded-md focus:outline-none"
                />

                <input
                    type="number"
                    name="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="Time in Minutes"
                    min={5}
                    className="border border-gray-300 p-2 rounded-md focus:outline-none"
                />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <select
                    className="border border-gray-300 p-2 rounded-md focus:outline-none"
                    value={diffculty}
                    onChange={(e) => setDiffculty(e.target.value)}
                >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                </select>

                <button
                    disabled={loading}
                    onClick={generatePaper}
                    className={`bg-blue-500 text-white p-2 rounded-md transition duration-300 ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
                        }`}
                >
                    {loading ? "Generating..." : "Generate"}
                </button>
            </div>

            {url && (
                <div className="mb-4">
                    <button
                        name="url"
                        onClick={() => window.open(url)}
                        className="border border-gray-300 p-2 rounded-md w-4/5 truncate bg-gray-100"
                    >
                        {url}
                    </button>
                    <button
                        className="border border-gray-300 p-2 rounded-md ml-2 bg-blue-500 text-white hover:bg-blue-600"
                        onClick={() => { navigator.clipboard.writeText(url) }}
                    >
                        Copy
                    </button>
                </div>
            )}
        </div>
    )
}

export default GeneratorForm;
