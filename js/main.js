var MAINAPP = (function(nsp, $, domU, strU) {

    /*
    Quiz Functionality
    */
    var contentObj = {},
        questionsArray = [],
        navigationProto = {}, //Setup in setUpNavigation()
        prevBtn, 
        nextBtn,
        resultsArr = [],
        evalMode;

    var loadJSON = function(path) {
        var xobj = new XMLHttpRequest();
        xobj.overrideMimeType('application/json');
        xobj.open('GET', path);
        xobj.onreadystatechange = function() {
            if (xobj.readyState === 4) {
                contentObj = JSON.parse(xobj.responseText);
                parseData(contentObj);
            };
        };
        xobj.send(null);
    },
    parseData = function(cObj) {
        questionsArray = cObj.questions;
        //set button text
        domU.setHTML($('.fill-in-submit'), cObj.buttonText);

        questionsArray.forEach(function(element, index) {
            questionsArray[index] = new Question(element);
        });
        
    },

    initQuiz = function() {
        loadJSON("./JSON/content.json");
        setUpInitModal();
    };

    setUpInitModal = function() {
        const initModal = Object.create(domU.modalProto)
        initModal.setNode("#modal").setText("Would you like to start the test in evaluation mode?").open();
        initModal.yesBtn = initModal.modal.querySelector(".btn-testmode.YES");
        initModal.yesBtn.addEventListener('click', function(e){
            evalMode = true;
            setUpNavigation();
            initModal.close();
        });
        initModal.yesBtn.addEventListener('mouseover', function(e){
            initModal.setSubText("Evaluation mode: after submitting answer the next question is revealed. You cannot change your answer.")
        });
        initModal.yesBtn.addEventListener('mouseleave', function(e){
            initModal.setSubText("")
        });
        initModal.modal.querySelector(".btn-testmode.NO").addEventListener('click', function(e){
            evalMode = false;
            setUpNavigation();
            initModal.close();
        });
    }

    //question constructor
    var Question = function(obj) {
        let htmlDiv;
        //transfer data
        this.questionDiv = (obj.type === 'true-false') ? "multi-choice" : obj.type;
        // this.id = obj.id;
        // this.type = obj.type;
        // this.questionText = obj.questionText;
        // this.distractorText = obj.distractors;
        // this.correctResp = obj.correctResp;
        // this.feedback = obj.feedback;
        // this.weight = obj.weight;
        for (let i in obj) {
            this[i] = obj[i];
        }
        this.result = "no-answer";
        this.studentResp = [];
        this.correct = false;

        //assign DOM elements
        htmlDiv = $('#'+this.questionDiv)[0];
        this.questionField = htmlDiv.querySelector(".question-text");
        this.noAnswerFeed = htmlDiv.querySelector(".feedback.no-answer");
        this.correctFeed = htmlDiv.querySelector(".feedback.correct");
        this.incorrectFeed = htmlDiv.querySelector(".feedback.incorrect");
        this.htmlDiv = htmlDiv;

        switch (this.questionDiv) {
            case "fill-in":
                this.populateTheQuestion = function() {
                    this.populateQuestion();
                    htmlDiv.querySelector("textarea").value = "";
                }
                this.checkTheAnswer = function() {
                    let ans;
                    const value = htmlDiv.querySelector("textarea").value;

                    if (value !== "") {
                        ans = strU.breakOut(this.correctResp, ",");
                        this.correct = ans.every(function(val) {
                            return (value.indexOf(val) > -1);
                        });
                        this.studentResp = value;
                        this.result = (this.correct) ? "correct" : "incorrect";
                    }
                    else {
                        this.result = "no-answer";
                    }
                    if (!evalMode) {
                        this.hideFeedback();
                        this.displayFeedback();
                    } else {
                        nextBtn.goNext();
                    }
                }
                break;
            case "multi-choice":
                const distractorsArr = htmlDiv.querySelectorAll("label");
                const distractorsRadio = htmlDiv.querySelectorAll("input");
                let multiResp = false
                this.populateTheQuestion = function() {
                    this.populateQuestion();
                    if (this.correctResp.length > 1) {
                        multiResp = true;
                    }
                    domU.addClass(distractorsArr, 'remove');
                    distractorsArr.forEach((element, i) => {
                        if (this.distractors[i] !== undefined) {
                            element.innerHTML = this.distractors[i];
                            domU.removeClass([element], "remove");
                        }
                    });
                    distractorsRadio.forEach((element) => {
                        element.checked = false;
                        domU.removeClass([element], "imChecked")
                    });
                    distractorsRadio.forEach((element) => {
                        element.onclick = function(){
                            if (this.classList.contains("imChecked")) {
                                domU.removeClass([this], "imChecked");
                                this.checked = false;
                            } else {
                                if (!multiResp) {
                                    distractorsRadio.forEach(function(element) {
                                        element.checked = false;
                                        domU.removeClass([element], "imChecked");
                                    });
                                }
                                this.checked = true
                                domU.addClass([this], "imChecked")
                            }
                        }
                    });
                }
                this.checkTheAnswer = function() {
                    this.studentResp = [];
                    let counter = 0;
                    this.result = "no-answer";
                    distractorsArr.forEach((element, i) => {
                        if (distractorsRadio[i].checked) {
                            //this.studentResp = $('#' + distractorsRadio[i].id + '_label').innerHTML;
                            this.studentResp.push(element.innerHTML)
                        }
                    });
                    if (this.studentResp.length !== 0) {
                        this.correctResp.forEach((element, i) => {
                            if (element === this.studentResp[i]) {
                                counter++
                            }
                            this.correct = counter === this.correctResp.length;
                        });
                        
                        this.result = (this.correct) ? "correct" : "incorrect";
                    }
                    if (!evalMode) {
                        this.hideFeedback();
                        this.displayFeedback();
                    } else {
                        nextBtn.goNext();
                    }
                }
                break;
            default:
                this.populateTheQuestion = function() {
                    this.populateQuestion();
                }
                break;
        }
    };

    Question.prototype.displayQuestion = function(){
        domU.removeClass([this.htmlDiv], "hidden-question");
    };
    Question.prototype.hideQuestion = function(){
        domU.addClass([this.htmlDiv], "hidden-question");
    };
    Question.prototype.populateQuestion = function() {
        domU.setHTML([this.questionField], this.questionText);
        domU.setHTML([this.noAnswerFeed], '<p><span>X </span>' + this.feedback.noAnswer + '</p>');
        domU.setHTML([this.correctFeed], '<p><span>&#10003 </span>' + this.feedback.correctAnswer + '</p>');
        domU.setHTML([this.incorrectFeed], '<p><span>X </span>' + this.feedback.wrongAnswer + '</p>');
    };
    Question.prototype.hideFeedback = function() {
        const feedback = this.htmlDiv.querySelectorAll(".feedback.visible");
        domU.removeClass(feedback, 'visible');
    };
    Question.prototype.displayFeedback = function() {
        const feedback = $('.feedback.' + this.result);
        domU.addClass(feedback, 'visible');
    };

    //Set up navigation
    const setUpNavigation = function() {
        let cQuestion = 0;
        navigationProto = {
            questionsArray : questionsArray,
            totalQuestions: questionsArray.length,
            hideQuestion : function() {
                const curQuestion = this.questionsArray[this.currentQuestion];
                curQuestion.hideQuestion();
            },
            showQuestion: function() {
                const curQuestion = this.questionsArray[this.currentQuestion]; 
                curQuestion.hideFeedback(); 
                curQuestion.populateTheQuestion();
                curQuestion.displayQuestion();
            },
            setSubmit: function() {
                domU.assignEvent($(".btn-primary"), "click", () => {
                    this.questionsArray[this.currentQuestion].checkTheAnswer();
                });
            },
            get currentQuestion() {
                return cQuestion;
            },
            set currentQuestion(value) {
                cQuestion = value;
            }
        }
        
        navigationProto.showQuestion();
        navigationProto.setSubmit();

        nextBtn = Object.create(navigationProto);
        nextBtn.goNext = function(e) {
            if (this.currentQuestion < this.totalQuestions - 1) {
                this.hideQuestion();
                this.currentQuestion++;
                this.showQuestion();
            } else if (evalMode) { 
                this.hideQuestion();
                showFinalResults();
            }
        }

        prevBtn = Object.create(navigationProto);
        prevBtn.goPrev = function(e) {
            if (this.currentQuestion > 0) {
                this.hideQuestion();
                this.currentQuestion--;
                this.showQuestion();
            }
        }

        if (!evalMode) {
            domU.removeClass($(".navigation"), "hidden")
            $(".btn-prev")[0].addEventListener('click', function(e) {
                prevBtn.goPrev(e);
            });
            $(".btn-next")[0].addEventListener('click', function(e) {
                nextBtn.goNext(e);
            });
        }
    }

    const showFinalResults = function() {
        const body = $("body");
        const tbl = document.createElement("table");
        const tblBody = document.createElement("tbody");

        for (let i = 0; i < questionsArray.length + 1; i++) {
            const row = document.createElement("tr");
            row.className = "row"

            for (let j = 0; j < 5; j++) {
                if (i == 0 || j == 0) {
                    const cell = document.createElement("th");
                    cell.className = "cell";
                    cell.id = `${i}_${j}`;
                    row.appendChild(cell)
                } else { 
                    const cell = document.createElement("td");
                    cell.className = "cell";
                    cell.id = `${i}_${j}`;
                    row.appendChild(cell)
                }
            }
            tblBody.appendChild(row);
        }
        tbl.appendChild(tblBody);
        body[0].appendChild(tbl);

        fillInTheTable();
    }
    
    const fillInTheTable = function() {
        $(`#${0}_${0}`)[0].innerHTML = "Question ID";
        $(`#${0}_${1}`)[0].innerHTML = "Result";
        $(`#${0}_${2}`)[0].innerHTML = "Your answer";
        $(`#${0}_${3}`)[0].innerHTML = "Correct answer";
        $(`#${0}_${4}`)[0].innerHTML = "Points";
        for (let i = 0; i < questionsArray.length; i++) {
            for (let j = 0; j < 5; j++) {
                const currentCell = $(`#${i+1}_${j}`)[0];
                switch(j) {
                    case 0:
                        currentCell.innerHTML = questionsArray[i].id;
                        break;
                    case 1:
                        switch(questionsArray[i].result) {
                            case "correct":
                                currentCell.innerHTML = "<span>&#10003 </span>";
                                domU.addClass($(`#${i+1}_${j}`), "correct");
                                break;
                            default:
                                currentCell.innerHTML = "<span>X </span>";
                                domU.addClass($(`#${i+1}_${j}`), "incorrect");
                                break;
                        }
                        break;
                    case 2:
                        currentCell.innerHTML = questionsArray[i].studentResp;
                        break;
                    case 3:
                        currentCell.innerHTML = questionsArray[i].correctResp;
                        break;
                    case 4:
                        switch(questionsArray[i].result) {
                            case "correct":
                                currentCell.innerHTML = questionsArray[i].weight;
                                break;
                            default:
                                currentCell.innerHTML = "0";
                                break;
                        }
                        break;
                }
            }
        }
    }

    /*
    Setup
    */
    UTIL.domReady(function() {
        initQuiz();
    });
    
    //Public Methods and Properties
    nsp.initQuiz = initQuiz;
    nsp.prevBtn = prevBtn;
    nsp.nextBtn = nextBtn;
    return nsp;
    
})(MAINAPP || {}, UTIL.dom.$, UTIL.dom, UTIL.string);