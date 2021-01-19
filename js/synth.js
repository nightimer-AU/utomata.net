/*

A class for synthesizing utomata programs.
Works by creating utomata program trees as L-systems
It is fully parameterizable and seedable

*/

function UTOsynthesizer(){

  var _this = this;
  var axiom = "X";
  var sentence = axiom;

  var selectionPool = [];
  var binaryPool = [];
  var unaryPool = [];
  var varPool = [];


  var treeDepth = 8;
  // var reuse_numbers = 0.9;
  var var_const_ratio = 0.5;
  var myRng;
  var seed;

  var params = {};
  ///////////////////////////////////////////////


  this.setSeed = function(_seed){
    seed = _seed;
  }
  this.getSeed = function(){
    return seed;
  }

  this.generateProgram = function(){
    return  "setup = " + params.setup + ";\n\nupdate = " + generate() + ";";
  }

  this.getParams = function(){
    return params;
  }

  this.setParam = function(key, val){

    if(params.binaryOP.hasOwnProperty(key)){
      params.binaryOP[key] = val;
    }else if(params.unaryOP.hasOwnProperty(key)){
      params.unaryOP[key] = val;
    }else if(params.vars.hasOwnProperty(key)){
      params.vars[key] = val;
    }else{
      params[key] = val;
    }

    // console.log(key + ", " + val);

    FillSamplePools();
  }


  function RNG(){
    if(seed == ""){
      return Math.random();
    }else{
      myRng = new Math.seedrandom(seed);
    }
    seed += 0.1;
    return myRng();
  }


  function generate() {

    // 1) create an L-system string
  	sentence = axiom;

    // TODO: this should be a while loop (while there are "X"s in the string)
    // but should have safe guards for not being too long.
    // it should diminish the likelyhood of getting an OP with each iteration

    var found = true;
    var counter = 0;
    // for (var k = 0; k < treeDepth; k++) {
    while(found == true){

      found = false;
  		var nextSentence = "";

  		for (var i = 0; i < sentence.length; i++) {

        var current = sentence.charAt(i);

        if (current == "X") {
					found = true; // to get the while loop to continue
          if(counter < 10){ // max number of operators
            var rnd = Math.floor( RNG()*selectionPool.length );
            var selected = selectionPool[rnd];
            nextSentence += selected;
          }else{
            nextSentence += "C"; // if too long - just add a constant for now
          }

				}else{
          nextSentence += current;
        }
  		}
  		sentence = nextSentence;
      counter++;
  	}


    // now done with the abstract L-system string
    // console.log(sentence);

    // 2) Convert Binary and Unary symbols to operators from the list
    var nextSentence = "";
    for(var i = 0 ; i < sentence.length; i++){
      var currChar = sentence.charAt(i);

      if(currChar == "B"){
        nextSentence += selectFromPool(binaryPool);
      }else if(currChar == "U"){
        nextSentence += selectFromPool(unaryPool);
      }else if(currChar == "V"){
        nextSentence += selectFromPool(varPool);
      }else if(currChar == "C"){
        //TODO: create a disposible array of numbers to later select from it randomly using the vectors.
        // TODO: differentiate between vectors and floats
        if(RNG()*100 > params.vecsRat){
            nextSentence += "vec("+randF(params.minVal, params.maxVal)+")";
        }else{
          nextSentence += "vec("+randF(params.minVal, params.maxVal)+","+randF(params.minVal, params.maxVal)+","+randF(params.minVal, params.maxVal)+")";
        }

      }else{
        // continue
        nextSentence += currChar;
      }

    }
    sentence = nextSentence;

    return sentence;
  }



  function randI(min, max){
    return Math.round(min + RNG()*(max - min));
  }

  function randF(min = 0, max = 1.0, decimal = 3){
    return (min + RNG()*(max - min)   ).toFixed(decimal);
  }

  function FillSamplePools(){

    binaryPool = [];
    for (const bop in params.binaryOP) {
      for(var j = 0; j< params.binaryOP[bop];j++){
        binaryPool.push(bop);
      }
    }

    unaryPool = [];
    for (const bop in params.unaryOP) {
      for(var j = 0; j< params.unaryOP[bop];j++){
        unaryPool.push(bop);
      }
    }

    varPool = [];
    for (const bop in params.vars) {
      for(var j = 0; j< params.vars[bop];j++){
        varPool.push(bop);
      }
    }

    selectionPool = [];
    for(var i = 0 ; i < params.valsRat; i++) selectionPool.push("C");
    for(var i = 0 ; i < params.varsRat; i++) selectionPool.push("V");
    for(var i = 0 ; i < params.unaryRat; i++) selectionPool.push("U(X)");
    for(var i = 0 ; i < params.binaryRat; i++) selectionPool.push("B(X,X)");
    // for(var i = 0 ; i < params.miscRat; i++) selectionPool.push("M");
    // TODO: implement the misc
  }

  function selectFromPool(arr){
    return arr[randI(0, arr.length-1)];
  }


  this.preset = function(preset){

      if(preset == "BASIC"){
        params = {
          setup: "vec(stp(0.92,random()))",
          binaryOP: {
            add: 3, sub: 3, mlt: 3, div: 3, pow: 0, stp: 1, mod: 1, eql: 1, max: 0, min: 0, dst: 0, dot: 0
          },
          unaryOP: {
            sgn: 3, rnd: 1, flr: 1, cil: 1, frc: 3, sqt: 0, log: 0, nrm: 0, sin: 0, cos: 0, tan:0, atn:0
          },
          vars: {
            V: 3, V3: 0, V4:3, V5:0, V8:0, V9:0
          },
          stochastic:{
            random:0, noise:0
          },
          maxVal: 1,
          minVal: 0,
          valsRat: 10,
          varsRat: 10,
          vecsRat: 10,
          unaryRat: 10,
          binaryRat: 10,
          miscRat: 0,

        }
      }else if(preset == "UNIFORM"){
        params = {
          setup: "vec(random())",
          binaryOP: {
            add: 1, sub: 1, mlt: 1, div: 1, pow: 1, stp: 1, mod: 1, eql: 1, max: 1, min: 1, dst: 1, dot: 1
          },
          unaryOP: {
            sgn: 1, rnd: 1, flr: 1, cil: 1, frc: 1, sqt: 1, log: 1, nrm: 1, sin: 1, cos: 1, tan:1, atn:1
          },
          vars: {
            V: 1, V3: 1, V4:1, V5:1, V8:1, V9:1
          },
          maxVal: 1,
          minVal: 0,
          valsRat: 10,
          varsRat: 10,
          vecsRat: 10,
          unaryRat: 10,
          binaryRat: 10,
          miscRat: 0,
        }

      }else if(preset == "ZERO"){
        params = {
          setup: "vec(0)",
          binaryOP: {
            add: 0, sub: 0, mlt: 0, div: 0, pow: 0, stp: 0, mod: 0, eql: 0, max: 0, min: 0, dst: 0, dot: 0
          },
          unaryOP: {
            sgn: 0, rnd: 0, flr: 0, cil: 0, frc: 0, sqt: 0, log: 0, nrm: 0, sin: 0, cos: 0, tan:0, atn:0
          },
          vars: {
            V: 0, V3: 0, V4:0, V5:0, V8:0, V9:0
          },
          maxVal: 1,
          minVal: 0,
          valsRat: 10,
          varsRat: 10,
          vecsRat: 10,
          unaryRat: 10,
          binaryRat: 10,
          miscRat: 0,
        }

      }

      FillSamplePools();
    }

    this.preset("BASIC");

  return this;
}
