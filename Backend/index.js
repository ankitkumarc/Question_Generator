const express = require('express')
const app = express();
const OpenAI = require('openai');
const CosmosClient = require('@azure/cosmos').CosmosClient;
require('dotenv').config()
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
require('dotenv').config()
const cors = require('cors');

app.use(express.json())
app.use(cors())
async function generateQuestions(req, res) {
    try {
        const { subject, topic, noOfQuestion, diffculty, time } = req.body;
        const cosmosClient = new CosmosClient({ endpoint: process.env.COSMOS_ENDPOINT, key: process.env.COSMOS_KEY })
        const { database } = await cosmosClient.databases.createIfNotExists({ id: "test_generator" });
        // Create container if it doesn't exist
        const { container } = await database.containers.createIfNotExists({
            id: "test",
            partitionKey: {
                paths: "date_created"
            }
        });

        const completion = await openai.chat.completions.create({
            messages: [{
                role: "system", content: `
                Generate multiple-choice questions on ${topic} topic with ${diffculty} difficulty in ${subject}.

                1. [Question 1]
                a. [Option A]
                b. [Option B]
                c. [Option C]
                d. [Option D]
                Answer: [Option A]

                2. [Question 2]
                a. [Option A]
                b. [Option B]
                c. [Option C]
                d. [Option D]
                Answer: [Option A]

                3. [Question 3]
                a. [Option A]
                b. [Option B]
                c. [Option C]
                d. [Option D]
                Answer: [Option A]

                ${noOfQuestion} questions
            ` }],
            model: "gpt-3.5-turbo",
        });
        const questions = completion.choices[0].message.content.split("\n\n");
        console.log(questions);
        const fullQuestion = [];
        questions.map(async (question) => {
            const quesSeprated = question.split("\n");
            const ques = quesSeprated[0].substring(3, quesSeprated[0].length).trim();
            console.log(ques);
            const options = [];
            for (let i = 1; i < quesSeprated.length - 1; i++) {
                options.push(quesSeprated[i].substring(3, quesSeprated[i].length).trim());
            }
            const lastLine = quesSeprated[quesSeprated.length - 1];
            const correctOption = (lastLine && lastLine.split(":")[1]) ? lastLine.split(":")[1].trim()[0] : null;

            fullQuestion.push({
                question: ques,
                options: options,
                date_created: Date.now(),
                correctOption: correctOption
            });
        })

        const { resource } = await container.items.create({
            questions: fullQuestion,
            totalTime: time * 60
        })

        res.status(200).json({
            test: resource
        });
    } catch (err) {
        console.log(err.message);
    }

}

async function getPaper(req, res) {
    const id = req.params.id;
    const cosmosClient = new CosmosClient({ endpoint: process.env.COSMOS_ENDPOINT, key: process.env.COSMOS_KEY })
    const { database } = await cosmosClient.databases.createIfNotExists({ id: "test_generator" });
    // Create container if it doesn't exist
    const { container } = await database.containers.createIfNotExists({
        id: "test",
        partitionKey: {
            paths: "date_created"
        }
    });

    const { resource } = await container.item(id).read();
    res.status(200).json({
        test: resource
    });
}

async function evaluatePaper(req, res) {
    try {
        const { tickedOptions } = req.body
        const id = req.params.id;
        const cosmosClient = new CosmosClient({ endpoint: process.env.COSMOS_ENDPOINT, key: process.env.COSMOS_KEY })
        const { database } = await cosmosClient.databases.createIfNotExists({ id: "test_generator" });
        // Create container if it doesn't exist
        const { container } = await database.containers.createIfNotExists({
            id: "test",
            partitionKey: {
                paths: "date_created"
            }
        });
        const { resource } = await container.item(id).read();
        const questions = resource.questions;
        let total_correct = 0;
        for (let i = 0; i < questions.length; i++) {
            let question = questions[i];
            if (question.correctOption === tickedOptions[i]) {
                total_correct++;
            }
        }

        let total_marks = 2 * total_correct;
        res.status(200).json({
            total_correct: total_correct,
            total_marks: total_marks
        });
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}

app.post("/generate-test", generateQuestions);
app.get("/get-test/:id", getPaper);
app.post("/evaluate-paper/:id", evaluatePaper);


app.listen(4000, () => {
    console.log("The app is listening on port 4000");
})