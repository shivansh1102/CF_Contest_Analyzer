
const express = require("express");
const path = require("path")
const bodyParser = require("body-parser");
const app = express();
const https = require("https");
const ejsmate = require("ejs-mate");
const { start } = require("repl");

app.engine('ejs', ejsmate)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')))


app.get("/", (req, res) => {
    res.render("analysis",{display:0});
});

class timeProblem // this is used in storing fastest & slowest submission {time, contestID} so that link can be provided to user
{
    contructor(submitTime = 0, contestID = "") {
        this.submitTime = submitTime;
        this.contestID = contestID;
    }
}
class RatingProblem{ // this is used in storing max rated problem {rating, contestID}
    contructor(rating = 0, contestID = "") {
        this.rating = rating;
        this.contestID = contestID;
    }
}
class ProblemAnalysis {
    constructor(cntSubmission = 0, cntAC = 0, sumSubmitTime = 0, fastestSubmission = new timeProblem(), slowestSubmission = new timeProblem(), maxRatedProblem = new RatingProblem()) {
        this.cntSubmission = cntSubmission;
        this.cntAC = cntAC;
        this.sumSubmitTime = sumSubmitTime;
        this.fastestSubmission = fastestSubmission;
        this.fastestSubmission.submitTime = Infinity;
        this.slowestSubmission = slowestSubmission;
        this.slowestSubmission.submitTime = 0;
        this.maxRatedProblem = maxRatedProblem;
        this.maxRatedProblem.rating = 0;
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
function resetArray()
{
    problems = [];
    for(let i = 0; i < 10; i++)
    {
        problems[i] = new ProblemAnalysis();
    }
}



function findIndex(index)
{
    let ans;
    switch(index)
    {
        case "A" :
            ans = 0;
            break;
        case "B" :
            ans = 1;
            break;
        case "C" :
            ans = 2;
            break;
        case "D" :
            ans = 3;
            break;
        case "E" :
            ans = 4;
            break;    
        case "F" : 
            ans = 5;
            break;
    }
    return ans;
}

function timeAnalysis(result, lowerTime, upperTime, problems)
{
    result.forEach((submission)=>{
        if(submission.creationTimeSeconds >= lowerTime && submission.creationTimeSeconds <= upperTime && submission.author.participantType === "CONTESTANT")
        {
            const index = submission.problem.index.substring(0,1);
            const i = findIndex(index);
            problems[i].cntSubmission += 1;
            if(submission.verdict === "OK")
            {
                problems[i].cntAC++;
                problems[i].sumSubmitTime += submission.relativeTimeSeconds;
                if(submission.relativeTimeSeconds < problems[i].fastestSubmission.submitTime)
                {
                    problems[i].fastestSubmission.submitTime = submission.relativeTimeSeconds;
                    problems[i].fastestSubmission.contestID = submission.author.contestId;
                }
                if(submission.relativeTimeSeconds > problems[i].slowestSubmission.submitTime)
                {
                    problems[i].slowestSubmission.submitTime = submission.relativeTimeSeconds;
                    problems[i].slowestSubmission.contestID = submission.author.contestId;
                }
                if(submission.problem.rating > problems[i].maxRatedProblem.rating)
                {
                    problems[i].maxRatedProblem.rating = submission.problem.rating;
                    problems[i].maxRatedProblem.contestID = submission.author.contestId;
                }
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

app.post("/", (req, res) => {
    resetArray();
    let {handle,startDate,endDate} = req.body;
    startDate = parseInt((new Date(startDate).getTime() / 1000).toFixed(0));
    endDate = parseInt((new Date(endDate).getTime() / 1000).toFixed(0));
    const url = "https://codeforces.com/api/user.status?handle=" + handle ;
    const ratingUrl = "https://codeforces.com/api/user.rating?handle="+ handle;
    console.log(url);
    https.get(url, (response) => {
        console.log(response.statusCode);
        let chunks = [];

        response.on("data", (data) => {
            chunks.push(data);
        }).on("end", () => {
            let data = Buffer.concat(chunks);
            let result = JSON.parse(data).result;
            timeAnalysis(result, startDate, endDate, problems);
            console.log(problems);
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

app.listen(3000, () => {
    console.log("Server started on port 3000");
});