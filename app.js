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

app.post("/", (req, res) => {
    const {handle,startDate,endDate} = req.body;
    const url = "https://codeforces.com/api/user.status?handle=" + handle;
    const ratingUrl = "https://codeforces.com/api/user.rating?handle="+ handle;
    console.log(url);
    https.get(url, (response) => {
        console.log(response.statusCode);
        let chunks = [];

        response.on("data", (data) => {
            chunks.push(data);
        }).on("end", () => {
            let data = Buffer.concat(chunks);
            let result = JSON.parse(data);
            // console.log(result);
        })
    })

    https.get(ratingUrl, (response) => {
        console.log(response.statusCode);
        let chunks = [];
        response.on("data", (data) => {
            chunks.push(data);
        }).on("end", () => {
            let ratingData = Buffer.concat(chunks);
            let ratingResult = JSON.parse(ratingData);
            // console.log(ratingResult);
        })
    })

    res.render('analysis',{handle,display:1,problems})
})

class ProblemAnalysis {
    constructor(cntSubmission = 0, cntAC = 0, sumSubmitTime = 0, fastestSubmission = 0, slowestSubmission = Infinity, maxRatedProblem = 0) {
        this.cntSubmission = cntSubmission;
        this.cntAC = cntAC;
        this.sumSubmitTime = sumSubmitTime;
        this.fastestSubmission = fastestSubmission;
        this.slowestSubmission = slowestSubmission;
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
            }
        }
    });
}

const generalAnalysis=(result,ratingResult)=>{

    let numOfContests=0;
    let contestIds = new Map();
    result.forEach((submission)=>{
        if(submission.author.participantType==="CONTESTANT" && !contestIds.has(submission.contestId)){
            contestIds.set(submission.contestId,submission.author.startTimeSeconds);
        }
    })
}

app.listen(3000, () => {
    console.log("Server started on port 3000");
});
