function getTestCase(test){
  if(test == 'random10'){return testRandom(10);}
  if(test == 'random100'){return testRandom(100);}
  if(test == 'random1000'){return testRandom(1000);}
  if(test == 'random10000'){return testRandom(10000);}
  if(test == 'random100000'){return testRandom(100000);}

  if(test == 'smallSines'){return smallSines();}
  if(test == 'bigSines'){return bigSines();}
  if(test == 'hugeSines'){return hugeSines();}
  if(test == 'manySines'){return manySines(100);}

  if(test == '5Groups'){return manyGroups(5,5);}
  if(test == '50Groups'){return manyGroups(50,5);}
  if(test == '500Groups'){return manyGroups(500,5);}

  if(test == 'outOfBounds'){return outOfBounds();}
  if(test == 'updateBounds'){return updateBounds();}

  if(test == 'overlapPoints'){return overlapPoints();}
  if(test == 'updateSine'){return updateSine();}

  if(test == 'afterStop'){return dataAfterStop();}

  if(test == 'missingGroups'){return missingGroups();}

  return "// No test with name '" + test + "' found...";
}


function makeTest(){
  var value = '{type:"test", timestamp: 0, test:"TEST_NAME_HERE"}\n';
  value = value + '// Some tests:\n// random10, random100, random1000, random10000, random100000\n';
  value = value + '// smallSines, bigSines, hugeSines, manySines\n';
  value = value + '// 5Groups, 50Groups, 500Groups\n';
  value = value + '// outOfBounds, updateBounds\n';
  value = value + '// overlapPoints, updateSine\n';
  value = value + '// afterStop\n';
  value = value + '// missingGroups\n';
  jsonEditor.getDoc().setValue(value);
}

function testRandom(max){
  var min = 0;
  var ret = "// "+max+" random data events.\n";
  if(max > POINT_LIMIT){ret = ret + "// It is limited to plotting "+POINT_LIMIT+" points per series.\n";}
  if(max > DATA_LIMIT){ret = ret + "// Only up to "+DATA_LIMIT+" data events are allowed.\n";}
  ret = ret + "{type: 'start', timestamp: "+min+", select: ['data'], group: ['test']}\n\
{type: 'span', timestamp: "+min+", begin: "+min+", end: "+max+"}\n";
  for(var i = min; i < max; i++){
    ret = ret + "{type: 'data', timestamp: "+i+", test: 'random', data: "+Math.random()+"}\n";
  }
  ret = ret + "{type: 'stop', timestamp: "+max+"}";
  return ret;
}

function smallSines(){
  var ret = "{type: 'start', timestamp: 100, select: ['a','b'], group: ['test1','test2']}\n\
{type: 'span', timestamp: 100, begin: 100, end: 200}\n";
  ret = ret + plot(100,200,100,'test1:"x", test2:"1"',['a','b'],[
    function(t){return Math.sin(t/5)*6;},
    function(t){return Math.cos(t/6)*5;}
  ]);
  ret = ret + "{type: 'stop', timestamp: 200}";
  return ret;
}
function bigSines(){
  var ret = "{type: 'start', timestamp: 100, select: ['male','female'], group: ['color','species']}\n\
{type: 'span', timestamp: 100, begin: 100, end: 200}\n";
  ret = ret + plot(100,200,100,'color:"red", species:"fish"',['male','female'],[
    function(t){return Math.sin(t/5)*6;},
    function(t){return Math.cos(t/6)*5;}
  ]);
  ret = ret + plot(110,190,160,'color:"red", species:"bird"',['male','female'],[
    function(t){return Math.sin(t/7)*2+2;},
    function(t){return Math.cos(t/7)*5-1;}
  ]);
  ret = ret + plot(140,180,200,'color:"blue", species:"fish"',['male','female'],[
    function(t){return Math.sin(t/9)*4-1;},
    function(t){return Math.cos(t/4)*7-1.5;}
  ]);
  ret = ret + plot(120,200,80,'color:"blue", species:"bird"',['male','female'],[
    function(t){return Math.sin(t/6)*4+1;},
    function(t){return Math.cos(t/11)*2+3;}
  ]);
  ret = ret + "{type: 'stop', timestamp: 200}";
  return ret;
}
function hugeSines(){
  var ret = "{type: 'start', timestamp: 0, select: ['a','b','c','d'], group: ['test']}\n\
{type: 'span', timestamp: 0, begin: 0, end: 100}\n";
  ret = ret + plot(0,100,10000,'test:"sine"',['a','b','c','d'],[
    function(t){return Math.sin(t/8)*8;},
    function(t){return Math.sin(t/6)*6;},
    function(t){return Math.sin(t/4)*4;},
    function(t){return Math.cos(t/2)*2;}
  ]);
  ret = ret + "{type: 'stop', timestamp: 100}";
  return ret;
}

function randomName(length){
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function manyGroups(numGroups,numSeries){
  var groupList = [];
  for(var g=0;g<numGroups;g++){
    groupList[g]=randomName(5);
  }
  var ret = "{type: 'start', timestamp: 100, group: ['"+groupList[0]+"'";
  for(g=1;g<numGroups;g++){ret=ret+",'"+groupList[g]+"'";}
  ret = ret+"], select: ['data']}\n"
  ret = ret+"{type: 'span', timestamp: 0, begin: 0, end: 100}\n";
  for(var i=0; i<numSeries; i++){

    var group = "";
    for(g=0;g<numGroups;g++){group=group+groupList[g]+":'"+randomName(3)+"',";}
    group = group.substring(0, group.length - 1);
    ret = ret + plot(0,100,100,group,['data'],[function(t){return Math.random();}]);
    console.log(i);
  }
  ret = ret + "{type: 'stop', timestamp: 100}";
  return ret;
}


function plot(tmin,tmax,numPoints,groups,series,functions){
  var ret = "";
  var interval = (tmax - tmin)/numPoints;
  for(var i = 0; i < numPoints; i++){
    var time = (tmin + i*interval);
    ret = ret + "{type: 'data', timestamp: "+time;
    if(groups.length>0)ret=ret+", "+groups;
    for(var s = 0; s < series.length; s++){
      ret = ret+", "+series[s]+": "+(functions[s](time));
    }
    ret = ret+"}\n";
  }
  return ret;
}


function outOfBounds(){
  var ret = "// The span is 100-200, but points are 0-50. Nothing should plot.\n"
  ret = ret + "{type: 'start', timestamp: 100, select: ['a','b'], group: ['test1','test2']}\n\
{type: 'span', timestamp: 100, begin: 100, end: 200}\n";
  ret = ret + plot(0,50,100,'test1:"x", test2:"1"',['a','b'],[
    function(t){return Math.sin(t/5)*6;},
    function(t){return Math.cos(t/6)*5;}
  ]);
  ret = ret + "{type: 'stop', timestamp: 200}";
  return ret;
}

function updateBounds(){
  var ret = "// The span is 100-200, but points are 0-50.\n"
  ret = ret + "// Then at the end we update the bounds to match. It should plot, but not animate\n"
  ret = ret + "{type: 'start', timestamp: 100, select: ['a','b'], group: ['test1','test2']}\n"
  ret = ret + "{type: 'span', timestamp: 100, begin: 100, end: 200}\n";
  ret = ret + plot(0,50,1000,'test1:"x", test2:"1"',['a','b'],[
    function(t){return Math.sin(t/5)*6;},
    function(t){return Math.cos(t/6)*5;}
  ]);
  ret = ret + "{type: 'span', timestamp: 200, begin: 0, end: 50}\n";
  ret = ret + "{type: 'stop', timestamp: 200}";
  return ret;
}



function overlapPoints(){
  var ret = "// When points are added to the same series with the same timestamp,\n"
  ret = ret + "// only the latest point is used (in this case, 30).\n"
  ret = ret + "{type: 'start', timestamp: 100, select: ['data'], group: ['test']}\n"
  ret = ret + "{type: 'span', timestamp: 100, begin: 100, end: 200}\n";
  ret = ret + "{type: 'data', timestamp: 150, test: 'overlap', data: 10}\n";
  ret = ret + "{type: 'data', timestamp: 150, test: 'overlap', data: 20}\n";
  ret = ret + "{type: 'data', timestamp: 150, test: 'overlap', data: 30}\n";
  ret = ret + "{type: 'stop', timestamp: 200}";
  return ret;
}

function updateSine(){
  var ret = "// By updating the same points, we can animate this sine wave.\n"
  ret = ret + "{type: 'start', timestamp: 0, select: ['data'], group: ['test']}\n"
  ret = ret + "{type: 'span', timestamp: 0, begin: 0, end: 1000}\n";
  ret = ret + plot(0,999,1000,'test:"sine"',['data'],[
    function(t){return Math.sin(t/50)*6;}
  ]);
  ret = ret + plot(0,999,1000,'test:"sine"',['data'],[
    function(t){return Math.cos(t/50)*6;}
  ]);
  ret = ret + plot(0,999,1000,'test:"sine"',['data'],[
    function(t){return Math.sin(t/50)*6;}
  ]);
  ret = ret + "{type: 'stop', timestamp: 1000}";
  return ret;
}


function dataAfterStop(){
  var ret = "// Data after a stop should be ignored.\n"
  ret = ret + "// Try deleting the stop on line 105.\n"
  ret = ret + "{type: 'start', timestamp: 0, select: ['data'], group: ['test']}\n"
  ret = ret + "{type: 'span', timestamp: 0, begin: 0, end: 100}\n";
  ret = ret + plot(0,99,100,'test:"sin"',['data'],[
    function(t){return Math.sin(t/5)*6;}
  ]);
  ret = ret + "{type: 'stop', timestamp: 1000}";
  ret = ret + plot(0,99,100,'test:"cos"',['data'],[
    function(t){return Math.cos(t/5)*6;}
  ]);
  return ret;
}



function missingGroups(){
  var ret = "// It's perfectly fine to not specify groups.\n"
  ret = ret + "// (although the name looks like it has an extra space!).\n"
  ret = ret + "{type: 'start', timestamp: 0, select: ['data'], group: ['test1', 'test2']}\n"
  ret = ret + "{type: 'span', timestamp: 0, begin: 0, end: 100}\n";
  ret = ret + plot(0,100,100,'test1:"sine", test2:"wave"',['data'],[
    function(t){return Math.sin(t/5)*6;}
  ]);
  ret = ret + plot(0,100,100,'test1:"sine"',['data'],[
    function(t){return Math.sin(t/5)*4;}
  ]);
  ret = ret + plot(0,100,100,'',['data'],[
    function(t){return Math.sin(t/5)*2;}
  ]);
  ret = ret + "{type: 'stop', timestamp: 1000}";
  return ret;
}


function manySines(num){
  var ret = "// Making a bunch of sine waves.\n"
  ret = ret + "{type: 'start', timestamp: 0, select: ['data'], group: ['test']}\n"
  ret = ret + "{type: 'span', timestamp: 0, begin: 0, end: 100}\n";
  for(var i = 0; i < num; i++){
    ret = ret + plot(0,100,100,'test:"sine(t/'+(i+1)+')", test2:"wave"',['data'],[
      function(t){return Math.sin(t/(i+1))*6;}
    ]);
  }
  ret = ret + "{type: 'stop', timestamp: 1000}";
  return ret;
}
