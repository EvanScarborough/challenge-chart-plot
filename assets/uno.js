
var unoDemo;
let numImages = 37;
var imageOn = 0;

var wildSaveDemo;
let wildSaveNumImages = 3;
var wildSaveImageOn = 0;






$("#sfmlLink").click(function() {
  window.location = 'https://www.sfml-dev.org/';
  return false;
});



function startUnoDemo(){
  unoDemo = document.getElementById('unoDemo');
  document.getElementById('unoDemo_back').disabled = true;
  document.getElementById('whoWon').style.display = "none";
  // unoDemo.style.backgroundImage = "url('uno/uno1.png')";
  document.getElementById('unoDemo_next').onclick = function(){
    imageOn = imageOn + 1;
    if(imageOn >= numImages-1){imageOn=numImages-1;document.getElementById('unoDemo_next').disabled = true;
      document.getElementById('whoWon').style.display = "inherit";}
    document.getElementById('unoDemo_back').disabled = false;
    unoDemo.src = "uno/uno"+imageOn+".png";
  };
  document.getElementById('unoDemo_back').onclick = function(){
    imageOn = imageOn - 1;
    if(imageOn <= 0){imageOn=0;document.getElementById('unoDemo_back').disabled = true;}
    document.getElementById('unoDemo_next').disabled = false;
    unoDemo.src = "uno/uno"+imageOn+".png";
  };
}


function startWildSaveDemo(){
  wildSaveDemo = document.getElementById('wildSaveDemo');
  document.getElementById('wildSaveDemo_back').disabled = true;
  // unoDemo.style.backgroundImage = "url('uno/uno1.png')";
  document.getElementById('wildSaveDemo_next').onclick = function(){
    wildSaveImageOn = wildSaveImageOn + 1;
    if(wildSaveImageOn >= wildSaveNumImages-1){wildSaveImageOn=wildSaveNumImages-1;
      document.getElementById('wildSaveDemo_next').disabled = true;}
    document.getElementById('wildSaveDemo_back').disabled = false;
    wildSaveDemo.src = "uno/wildSave"+wildSaveImageOn+".png";
  };
  document.getElementById('wildSaveDemo_back').onclick = function(){
    wildSaveImageOn = wildSaveImageOn - 1;
    if(wildSaveImageOn <= 0){wildSaveImageOn=0;document.getElementById('wildSaveDemo_back').disabled = true;}
    document.getElementById('wildSaveDemo_next').disabled = false;
    wildSaveDemo.src = "uno/wildSave"+wildSaveImageOn+".png";
  };
}






$(document).ready(function(){
  startUnoDemo();
  startWildSaveDemo();
});









new Chart(document.getElementById('bestOddsPie').getContext('2d'),{
  "type":"doughnut",
  "data":{
    "labels":["Chris","Evan"],
    "datasets":[{
      "label":"Best Uno Odds",
      "data":[64343,35657],
      "backgroundColor":[
        "rgb(200, 0, 0)",
        "rgb(0, 0, 200)"]
    }]
  }
});

new Chart(document.getElementById('evilnessBar').getContext('2d'),{
  "type":"bar",
  "data":{
    "labels":["Evil","Random","Nice"],
    "datasets":[{
      "label":"Evilness",
      "data":[39873,29965,30162],
      "backgroundColor":[
        "rgb(200, 0, 0)",
        "rgb(250, 220, 0)",
        "rgb(0, 0, 200)"]
    }]
  },
  options: {
    scales: {
      yAxes: [{
        ticks: {
          suggestedMin: 0,
          suggestedMax: 45000
        }
      }]
    }
  }
});


// new Chart(document.getElementById('matchingBar').getContext('2d'),{
//   "type":"bar",
//   "data":{
//     "labels":["Color First","Number First"],
//     "datasets":[{
//       "label":"Matching Order",
//       "data":[48829,51171],
//       "backgroundColor":[
//         "rgb(200, 0, 0)",
//         "rgb(0, 0, 200)"]
//     }]
//   },
//   options: {
//     scales: {
//       yAxes: [{
//         ticks: {
//           suggestedMin: 0,
//           suggestedMax: 55000
//         }
//       }]
//     }
//   }
// });


new Chart(document.getElementById('wildSaveBar').getContext('2d'),{
  "type":"bar",
  "data":{
    "labels":["Save Wilds for 1 Draw","Don't Save Wilds"],
    "datasets":[{
      "label":"Wild Saving",
      "data":[57760,42240],
      "backgroundColor":[
        "rgb(200, 0, 0)",
        "rgb(0, 0, 200)"]
    }]
  },
  options: {
    scales: {
      yAxes: [{
        ticks: {
          suggestedMin: 0,
          suggestedMax: 55000
        }
      }]
    }
  }
});


new Chart(document.getElementById('wildSaveLine').getContext('2d'),{
  "type":"line",
  "data":{
    "labels":["1","2","3","4","5","6"],
    "datasets":[{
      "label":"Wild Saving",
      "data":[57.76,54.32,52.71,51.51,51.18,50.5],
      "fill":false,
      "borderColor":"rgb(200, 0, 0)",
      "lineTension":0.1
    }]
  },
  options: {
    scales: {
      yAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'Win Percent'
        },
        ticks: {
          suggestedMin: 50,
          suggestedMax: 60
        }
      }],
      xAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'Number of Turns to Save Wild Cards'
        }
      }]
    }
  }
});
