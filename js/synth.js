function UTOsynthesizer(){

  var axiom = "X";
  var sentence = axiom;
  var caSz = 64;

  /////////////////////////////////////////////

  var randSeed = 234234234;

  var binaryPool = [];
  var unaryPool = [];
  var varPool = [];

  var treeDepth = 8;
  var reuse_numbers = 0.9;
  var var_const_ratio = 0.5;
  var binary_unary_ratio = 0.5;
  var op_param_ratio = 0.5;
  var myRng;
  var seed;
  var intervalId;

  var params = {
    binaryOP: {
      add: 0, sub: 0, mlt: 0, div: 0, pow: 0, stp: 0, mod: 0, eql: 0, max: 0, min: 0, dst: 0, dot: 0
    },
    unaryOP: {
      sgn: 0, rnd: 0, flr: 0, cil: 0, frc: 0, sqt: 0, log: 0, nrm: 0, sin: 0, cos: 0, tan:0, atn:0
    },
    vars: {
      V: 0, V3: 0, V4:0, V5:0, V8:0, V9:0
    },
    setup: "vec(0)",
    maxVal: 1,
    minVal: 0
  }
  ///////////////////////////////////////////////


  var rules = [];
  rules[0] = {
  	a: "X",
  	b: "B(X, X)",
  	c: "U(X)",
  	d: "V"
  };


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

    console.log(key + ", " + val);
    FillSamplePools();
  }

  this.preset = function(preset){

      if(preset == "BASIC"){
        params = {
          binaryOP: {
            add: 3, sub: 3, mlt: 3, div: 3, pow: 0, stp: 1, mod: 1, eql: 1, max: 0, min: 0, dst: 0, dot: 0
          },
          unaryOP: {
            sgn: 3, rnd: 1, flr: 1, cil: 1, frc: 3, sqt: 0, log: 0, nrm: 0, sin: 0, cos: 0, tan:0, atn:0
          },
          vars: {
            V: 3, V3: 0, V4:3, V5:0, V8:0, V9:0
          },
          setup: "vec(stp(0.92,random()))",
          maxVal: 1,
          minVal: 0
        }
      }else if(preset == "UNIFORM"){
        params = {
          binaryOP: {
            add: 1, sub: 1, mlt: 1, div: 1, pow: 1, stp: 1, mod: 1, eql: 1, max: 1, min: 1, dst: 1, dot: 1
          },
          unaryOP: {
            sgn: 1, rnd: 1, flr: 1, cil: 1, frc: 1, sqt: 1, log: 1, nrm: 1, sin: 1, cos: 1, tan:1, atn:1
          },
          vars: {
            V: 1, V3: 1, V4:1, V5:1, V8:1, V9:1
          },
          setup: "vec(0)",
          maxVal: 1,
          minVal: 0
        }
        console.log(preset);
      }

      // TODO: set all UI values


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

    if(seed === undefined){
      seed = Math.random();
    }

    // 1) create an L-system string
  	sentence = axiom;
  	for (var k = 0; k < treeDepth; k++) {

  		var nextSentence = "";

  		for (var i = 0; i < sentence.length; i++) {

  			var current = sentence.charAt(i);
  			var found = false;
  			for (var j = 0; j < rules.length; j++) {
  				if (current == rules[j].a) {
  					found = true;
            //
            var rnd = RNG();
            //
            if (rnd < 0.45) {
  						nextSentence += rules[j].b;
  					} else if (rnd < 0.70) {
  						nextSentence += rules[j].c;
  					} else {
  						nextSentence += rules[j].d;
  					}
  					break;
  				}
  			}
  			if (!found) {
  				nextSentence += current;
  			}
  		}
  		sentence = nextSentence;
  	}

    // 1) Convert Binary and Unary symbols to operators from the list
    var nextSentence = "";
    for(var i = 0 ; i < sentence.length; i++){
      var currChar = sentence.charAt(i);

      if(currChar == "B"){
        nextSentence += selectFromPool(binaryPool);
      }else if(currChar == "U"){
        nextSentence += selectFromPool(unaryPool);
      }else{
        nextSentence += currChar;
      }

    }
    sentence = nextSentence;

    nextSentence = "";

    //TODO: create a disposible array of numbers to later select from it randomly using the vectors.
    // Note - in the node view, these will be the vector nodes and will connect to multiple operators

    for(var i = 0 ; i < sentence.length; i++){

      var currChar = sentence.charAt(i);

      if(currChar == "V" || currChar == "X"){
        if(RNG() > var_const_ratio){
          nextSentence += "vec("+randF(params.minVal, params.maxVal)+","+randF(params.minVal, params.maxVal)+","+randF(params.minVal, params.maxVal)+")";
        }else{
          nextSentence += selectFromPool(varPool);
        }

      }else{
        nextSentence += currChar;
      }
    }
    sentence = nextSentence;

    // 3) convert V and X symbols to vectors and variables


    // draw the final program
    //document.getElementById("result").innerHTML += "<br>" + sentence;

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
      // console.log(bop + ", " + params.binaryOP[bop]);
      for(var j = 0; j< params.binaryOP[bop];j++){
        // push the current op 'weight' times into the pool
        binaryPool.push(bop);
      }
    }

    // for(var i = 0; i < binary.length; i++){
    //   for(var j = 0; j< binaryW[i];j++){
    //     // push the current op 'weight' times into the pool
    //     binaryPool.push(binary[i]);
    //   }
    // }

    unaryPool = [];
    for (const bop in params.unaryOP) {
      for(var j = 0; j< params.unaryOP[bop];j++){
        // push the current op 'weight' times into the pool
        unaryPool.push(bop);
      }
    }
    // for(var i = 0; i < unary.length; i++){
    //   for(var j = 0; j< unaryW[i];j++){
    //     // push the current op 'weight' times into the pool
    //     unaryPool.push(unary[i]);
    //   }
    // }

    varPool = [];

    for (const bop in params.vars) {
      for(var j = 0; j< params.vars[bop];j++){
        // push the current op 'weight' times into the pool
        varPool.push(bop);
      }
    }
    // for(var i = 0; i < varyings.length; i++){
    //   for(var j = 0; j< varW[i];j++){
    //     // push the current var 'weight' times into the pool
    //     varPool.push(varyings[i]);
    //   }
    // }

    // console.log(binaryPool);
  }

  function selectFromPool(arr){
    return arr[randI(0, arr.length-1)];
  }

  FillSamplePools();




  return this;
}
