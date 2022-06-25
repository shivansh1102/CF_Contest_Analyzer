
const express = require("express");
const path = require("path")
const bodyParser = require("body-parser");
const app = express();
const https = require("https");
const ejsmate = require("ejs-mate")

app.engine('ejs', ejsmate)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')))


app.get("/", (req, res) => {
    res.render("analysis",{display:0});
});

class timeProblem
{
    contructor(submitTime = 0, contestID = "") {
        this.submitTime = submitTime;
        this.contestID = contestID;
    }
}
class ProblemAnalysis {
    constructor(cntSubmission = 0, cntAC = 0, sumSubmitTime = 0, fastestSubmission = new timeProblem(), slowestSubmission = new timeProblem(), maxRatedProblem = 0) {
        this.cntSubmission = cntSubmission;
        this.cntAC = cntAC;
        this.sumSubmitTime = sumSubmitTime;
        this.fastestSubmission = fastestSubmission;
        this.fastestSubmission.submitTime = 0;
        this.slowestSubmission = slowestSubmission;
        this.slowestSubmission.submitTime = Infinity;
        this.maxRatedProblem = maxRatedProblem;
    }
    countWA() {
        return this.cntSubmission - this.cntAC;
    }
    calculatePercentTimeSolved(cntContest) {
        return (this.cntAC / cntContest) * 100;
    }
    calculateAccuracy() {
        return (this.cntAC / this.cntSubmission) * 100;
    }
    calculateAvgTime() {
        return (this.sumSubmitTime / this.cntAC) * 100;
    }
}

let problems = [];
for(let i = 0; i < 10; i++)
problems[i] = new ProblemAnalysis();

const problemIndex = {
    "A" : 0,
    "B" : 1,
    "C" : 2,
    "D" : 3,
    "E" : 4,
    "F" : 5
};
function findIndex(index)
{
    return problemIndex.index;
}
function timeAnalysis(result, lowerTime, upperTime)
{
    result.forEach(submission => {
        if(submission.creationTimeSeconds >= lowerTime && submission.creationTimeSeconds <= upperTime && submission.author.participantType === "CONTESTANT")
        {
            const index = findIndex(submission.problem.index);
            problems[i].cntSubmission++;
            if(submission.verdict === "OK")
            {
                problems[i].cntAC++;
                problems[i].sumSubmitTime += submission.relativeTimeSeconds;
                if(submission.relativeTimeSeconds > problems[i].fastestSubmission.submitTime)
                {
                    problems[i].fastestSubmission.submitTime = submission.relativeTimeSeconds;
                    problems[i].fastestSubmission.contestID = submission.author.contestId
                }
            }
        }
    });
}

app.post("/", (req, res) => {
    const handle = req.body.handle;
    const url = "https://codeforces.com/api/user.status?handle=" + handle;
    console.log(url);
    https.get(url, (response) => {
        console.log(response.statusCode);
        let chunks = [];

        response.on("data", (data) => {
            chunks.push(data);
        }).on("end", () => {
            let data = Buffer.concat(chunks);
            let result = JSON.parse(data);
            console.log(result);
        })
    })
    res.render('analysis',{handle,display:1})
})

app.listen(3000, () => {
    console.log("Server started on port 3000");
});