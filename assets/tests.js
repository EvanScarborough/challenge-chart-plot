function getTestCase(test){
  if(test == 'random10'){return testRandom(10);}
  if(test == 'random100'){return testRandom(100);}
  if(test == 'random1000'){return testRandom(1000);}
  if(test == 'random10000'){return testRandom(10000);}
  if(test == 'random100000'){return testRandom(100000);}
  return "// No test with name '" + test + "' found...";
}


function makeTest(){
  var value = '{type:"test", timestamp: 0, test:"TEST_NAME_HERE"}\n';
  value = value + '// Some tests:\n// random10, random100, random1000, random10000, random100000';
  jsonEditor.getDoc().setValue(value);
}

function testRandom(max){
  var min = 0;
  var ret = "// "+max+" random data events.\n";
  if(max > POINT_LIMIT){ret = ret + "// It is limited to plotting "+POINT_LIMIT+" points per series.\n";}
  if(max > DATA_LIMIT){ret = ret + "// Only up to "+DATA_LIMIT+" data events are allowed.\n";}
  ret = ret + "{type: 'start', timestamp: "+min+", select: ['data'], group: ['test']}\n\
{type: 'span', timestamp: "+min+", begin: "+min+", end: "+max+"}\n"
  for(var i = min; i < max; i++){
    ret = ret + "{type: 'data', timestamp: "+i+", test: 'random', data: "+Math.random()+"}\n";
  }
  ret = ret + "{type: 'stop', timestamp: "+max+"}";
  return ret;
}
