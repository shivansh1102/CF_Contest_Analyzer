
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
    constructor(cntSubmission, cntAC, sumSubmitTime, fastestSubmission, slowestSubmission, maxRatedProblem)
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



app.listen(3000, ()=>{
    console.log("Server started on port 3000");
});