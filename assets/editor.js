

// some variables we will use
var span_min = 0;
var span_max = 0;
var started = false;
var groups = [];
var select = [];
var warnings = "";
const POINT_LIMIT = 300;
const DATA_LIMIT = 20000;
function warn(w){warnings=warnings+w+'\n';}
var json = {};
var eventOn;
var dataEvents = 0;
var data = {};

// some handy selectors to cache!
var $plot = $('#plotArea');
var $fillBar = $('#footerFillBar');
var $bottomPanel = $('.panel-bottom');
var $topPanel = $('.panel-top');
var $chartContainer = $('.chart-container');





// setting up the codemirror formatting on the editor.
// initialize it with some data too.
var jsonEditor = CodeMirror(document.getElementById('editor'), {
  value: "{type: 'start', timestamp: 1519780251293, select: ['min_response_time', 'max_response_time'], group: ['os', 'browser']}\n\
{type: 'span', timestamp: 1519780251293, begin: 1519780251293, end: 1519780260201}\n\
{type: 'data', timestamp: 1519780251293, os: 'linux', browser: 'chrome', min_response_time: 0.1, max_response_time: 1.3}\n\
{type: 'data', timestamp: 1519780255824, os: 'linux', browser: 'chrome', min_response_time: 0.2, max_response_time: 1.2}\n\
{type: 'data', timestamp: 1519780260201, os: 'linux', browser: 'chrome', min_response_time: 0.25, max_response_time: 1}\n\
{type: 'stop', timestamp: 1519780251293}",
  mode:  "javascript",
  lineNumbers: true,
  json: true
});

// make the sections resizable
$topPanel.resizable({
  handleSelector: ".splitter-horizontal",
  resizeWidth: false
});


// formats a string for use as a json file
function formatRawJSON(rawText){
  // first of all, put "" around each word that doesn't have ""
  var formattedText = rawText.replace(/(['"])?([a-z0-9A-Z_]+)(['"])?:/g, '"$2": ');
  // then replace all '' with "" (NOTE: this could be better, it would break any
  // actual ' like if you wanted a plot called "Evan's Data" or whatever)
  formattedText = formattedText.replace(/'/g,'"');
  // remove comments
  formattedText = formattedText.replace(/(\/\*[^*]*\*\/)|(\/\/[^\n]*)/g, '');
  // also remove new lines
  formattedText = formattedText.replace(/(\r\n|\n|\r)/gm,"");
  // put , between each of the events
  formattedText = formattedText.replace(/}/g,'},');
  // but delete the last ,
  formattedText = formattedText.substring(0, formattedText.length - 1);
  // then put them all in a json array
  formattedText = '{"events":[' + formattedText.replace(/'/g,'"') + ']}';
  return formattedText;
}

// this function is for when the generate button is clicked.
// it will read in the json and update the plot accordingly
function updatePlot(){
  var rawText = jsonEditor.getValue();
  var formattedText = formatRawJSON(rawText);

  // now we can parse it!
  warnings = "";
  eventOn = 0;

  try{
    json = JSON.parse(formattedText);
    eventOn = 0;
    // use a regular expression to predict the number of events
    dataEvents = (formattedText.match(/\"type\":\s*\"data\"/g) || []).length;

    if(started == false){data={};}

    // start a batch to read the events line by line
    setButtonsDisabled(true);
    processEventBatch();
  }
  catch (e){
    var errorMsg = 'Something went wrong :(\n';
    errorMsg = errorMsg + e.toString();
    alert(errorMsg);
  }
}

function processEventBatch(){
  var count = 10;
  var eventType, eventTime;
  // process {count} events
  for(var i = eventOn; (i < json.events.length) && (count > 0); i++){
    eventType = json.events[i].type;
    eventTime = json.events[i].timestamp;
    eventOn = eventOn+1;
    count = count-1;

    // here are all of the actual events!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    if(eventType == 'start'){startEvent(json.events[i]);}
    else if(eventType == 'span'){spanEvent(json.events[i]);}
    else if(eventType == 'data'){
      if(typeof eventTime == 'undefined'){warn('Missing timestamp from data! (event '+(i+1)+')');continue;}
      dataEvent(json.events[i]);
    }
    else if(eventType == 'stop'){stopEvent(json.events[i]);}
    else if(eventType == 'test'){jsonEditor.getDoc().setValue(getTestCase(json.events[i].test));updatePlot();return;}
    else{
      warn('Unknown event type: ' + eventType + ' (event ' + (i+1) + ')');
    }
  }
  $fillBar.width((eventOn/json.events.length*100)+'vw');
  // once you're done, wait a few milliseconds and start another batch
  if(eventOn < json.events.length){
    setTimeout(processEventBatch,1);
  }
  else{
    setButtonsDisabled(false);
    if(warnings.length>0){alert("Warnings:\n"+warnings);warnings="";}
    replotData();
  }
}

function startEvent(event){
  // NOTE: I'm not sure how I should handle when there are two start events...
  // this would probably be an error, but I'm going to be liberal and
  // allow two start events. They just build off of each other.
  if(started == false){
    // clear the data and reset if stopped
    data = {};
    span_min = 0;
    span_max = 0;
    groups = [];
    select = [];
  }
  started = true;
  var i;
  for(i=0; i<event.group.length; i++){
    groups.push(event.group[i]);
  }
  for(i=0; i<event.select.length; i++){
    select.push(event.select[i]);
  }
}

function spanEvent(event){
  if(started == false){return;}
  if(typeof event.begin !== 'undefined'){span_min=event.begin;}
  if(typeof event.end !== 'undefined'){span_max=event.end;}
}

function dataEvent(event){
  if(started == false){warn('Data event before start of series.');return;}
  var time = event.timestamp;
  // figure out what group this data belongs to.
  var group = [];
  for(var i=0; i < groups.length; i++){
    var g = event[groups[i]];
    if(typeof g != 'undefined'){group.push(event[groups[i]]);}
    else{group.push('');}
  }
  // now add data for each series
  var value;
  for(i=0; i < select.length; i++){
    value = event[select[i]];
    if(typeof value != 'undefined'){
      // this event has data for select[i]
      var tempGroup = group.slice();
      addData(data,tempGroup,select[i],time,value);
    }
  }
}

function addData(target,group,series,time,value){
  if(group.length > 0){
    var groupOn = group[0];
    if(typeof target[groupOn] == 'undefined'){
      target[groupOn] = {};
    }
    group.shift();
    addData(target[groupOn],group,series,time,value);
  }
  else{
    if(typeof target[series] == 'undefined'){target[series]=[];}
    var i;
    for(i = 0; i < target[series].length; i++){
      if(target[series][i].time == time){target[series].splice(i,1);break;}
      if(target[series][i].time > time){break;}
    }
    target[series].splice(i,0,{"time":time,"value":value});
  }
}


function stopEvent(event){
  started = false;
}




function setButtonsDisabled(status){
  $("#plotButton").attr("disabled", status);
  $("#testButton").attr("disabled", status);
}


// creating the chart
var chart = new Chart(document.getElementById('plotArea').getContext('2d'),{
  "type":"scatter",
  "data":{
    "datasets":[
      {
      "label":"First Reading",
      "data":[
        {
          x: -10,
          y: 0
        },{
          x: 0,
          y: 10
        }, {
          x: 10,
          y: 5
        }
      ],
      "showLine": true,
      "fill":true,
      "borderColor":"rgb(200, 0, 0)",
      "lineTension":0
      }
    ]
  },
  options: {
    maintainAspectRatio: false,
    legend: {
      position: 'right'
    },
    scales: {
      yAxes: [{
        scaleLabel: {
          // display: true,
          // labelString: 'Y'
        }
      }],
      xAxes: [{
        scaleLabel: {
          type: 'linear',
          position: 'bottom',
          display: true,
          labelString: 'Timestamp (seconds)'
        }
      }]
    }
  }
});







function replotData(){
  // console.log(data);
  chart.data.datasets = [];
  recurseToDataset(data,0,"");
  chart.update();
}

function recurseToDataset(target,depth,nameSoFar){
  if(depth >= groups.length){
    plotDataset(target,nameSoFar);
    return;
  }
  for(var property in target) {
    recurseToDataset(target[property],depth+1,nameSoFar + " " + property);
  }
}

function plotDataset(target,name){
  var series = "";
  var point;
  // as part of the large data protection plan, the number of plotable
  // data points is limited. To do this without losing too much of the
  // data's shape, we limit how close one point can be to another.
  // this limit will be called intervalLimit
  var intervalLimit = (span_max - span_min) / POINT_LIMIT;

  for(var i = 0; i < select.length; i++){
    series = select[i];
    if(typeof target[series] != 'undefined'){
      // set up the dataset for chart.js
      var dataset = {"showLine": true,"fill":true,"lineTension":0};
      dataset.label = name + " " + series;
      dataset.borderColor = "hsl("+(Math.random()*360)+", 80%, 40%)";
      dataset.data = [];

      var lastTime = span_min - intervalLimit - 1;
      // for each point, add it to the dataset (if necessary)
      for(var j = 0; j < target[series].length; j++){
        point = target[series][j];
        var time = point.time;
        // ignore if outside of span
        if(time < span_min || time > span_max){continue;}

        if(time-lastTime < intervalLimit){continue;}
        lastTime=time;

        time = (time - span_min) / 1000;
        dataset.data.push({x:time,y:point.value});
      }
      // console.log(dataset);
      chart.data.datasets.push(dataset);
    }
  }
}




var lastHeight = 0;
function resizeChart(){
  // if the size has changed, resize the chart too.
  // I had to do this with js. I got it to work with just css, but then
  // realized that it only worked in Chrome :(
  if(lastHeight != $bottomPanel.height()) {
    lastHeight = $bottomPanel.height();
    $chartContainer.height($bottomPanel.height());
    $chartContainer.width($bottomPanel.width());
  }
}
resizeChart();
$(document).ready(function() {
  $topPanel.height(150);
  updatePlot();
  // Note, it might not be the best solution to have this on a timer, but I
  // could not for the life of me get the jquery resize event to work!!
  // I do not know why.
  setInterval(function () {
    resizeChart();
  }, 60);
});

// vvv my failed attempts at a resize event. I tried these in doc ready too

// $(".panel-top").on("resize", function(event,ui){
//   console.log('hello?');
// });
// $(".panel-top").resize(function(){
//   console.log('hello2?');
// });
