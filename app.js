
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const https = require("https");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


app.get("/", (req, res)=>{
    res.render("home");
});

class ProblemAnalysis
{
    constructor(cntSubmission = 0, cntAC = 0, sumSubmitTime = 0, fastestSubmission = 0, slowestSubmission = Infinity, maxRatedProblem = 0)
    {
        this.cntSubmission = cntSubmission;
        this.cntAC = cntAC;
        this.sumSubmitTime = sumSubmitTime;
        this.fastestSubmission = fastestSubmission;
        this.slowestSubmission = slowestSubmission;
        this.maxRatedProblem = maxRatedProblem;
    }
    countWA()
    {
        return this.cntSubmission-this.cntAC;
    }
    calculatePercentTimeSolved(cntContest)
    {
        return (this.cntAC/cntContest)*100;
    }
    calculateAccuracy()
    {
        return (this.cntAC/this.cntSubmission)*100;
    }
    calculateAvgTime()
    {
        return (this.sumSubmitTime/this.cntAC)*100;
    }
}

let problems = [];
for(let i = 0; i < 6; i++)
problems[i] = new ProblemAnalysis();

function timeAnalysis(submissions)
{
     
}


app.post("/", (req, res)=>{
    const handle = req.body.handle;
    const url = "https://codeforces.com/api/user.status?handle=" + handle ;
    console.log(url);
    https.get(url, (response)=>{
        console.log(response.statusCode);
        let chunks = [];
        response.on("data", (data)=>{
            chunks.push(data);
        }).on("end", ()=>{
            let data = Buffer.concat(chunks);
            let result = JSON.parse(data);
            console.log(result);
        })
    })
})


app.listen(3000, ()=>{
    console.log("Server started on port 3000");
});