import React, { useState } from 'react';

function QuestionBox({ question, id, selectedAns, setSelectedAns }) {
    const [selectedIndex, setSelectedIndex] = useState();

    const handleSelect = (idx) => {
        setSelectedIndex(() => {
            const newSelectedAns = [...selectedAns];
            newSelectedAns[id] = String.fromCharCode(97 + idx);
            setSelectedAns(newSelectedAns);
            return idx;
        });
    };

    return (
        <div className="w-[80%]  mx-auto bg-white rounded-md shadow-md mb-6">
            <h2 className="text-lg font-semibold mb-4 p-4 border-b border-gray-300">{question.question}</h2>

            <div className="px-4 py-2">
                {question.options.map((option, idx) => (
                    <div key={idx} className="flex items-center space-x-4">
                        <input
                            type="radio"
                            id={`option-${id}-${idx}`}
                            onClick={() => handleSelect(idx)}
                            checked={selectedIndex === idx}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-500 border-gray-300"
                        />
                        <label
                            htmlFor={`option-${id}-${idx}`}
                            className="text-gray-700 cursor-pointer hover:text-blue-500"
                        >
                            {option}
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default QuestionBox;
