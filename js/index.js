

/*



      _                        _                     _
_   _| |_ ___  _ __ ___   __ _| |_ __ _   _ __   ___| |_
| | | | __/ _ \| '_ ` _ \ / _` | __/ _` | | '_ \ / _ \ __|
| |_| | || (_) | | | | | | (_| | || (_| |_| | | |  __/ |_
\__,_|\__\___/|_| |_| |_|\__,_|\__\__,_(_)_| |_|\___|\__|


// main js file for utomata.net                                               

*/



//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
////////////////// GLOBAL VARS  //////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////


	var isFullscreenMode = false;
	var isRunning = true;
	var currFps = 0;
	var editorTimeOut;
	var infoInterval;
	var editor;
	var useLocalStorage = true;

  var uto;
  var three;
  var threeIsSetup = false;
  // var synthUto;
  var collectionUto;

  var currentCollectionItem = undefined;
  var currentCollectionItemreset = false;

	var pgm = "";
	var wid = 1024, hei = 1024, zoom = 1, fps = 60, edge = "REPEAT";
	var errors = [];

  var examples = {};
  var synthesizer;
  var autoGenerating = false;
  var analyzer;
  var mainNeedsConfig = false;

  var autoConfiguringCollection = false;
  var seedDial , seedDialProxy, seedProxy, seedDialFlag;




  //////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////
  ////////////////// DOCUMENT READY  ///////////////////////
  //////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////



  $( function() {


		//////////////////////////////
		// init all windows

		//snap: ".snapper"

		$( "#systemWindow" ).draggable({containment: "#windowBorder", scroll: false, handle: "div.handle" }).resizable({containment: "#desktop"});
		$( "#consoleWindow" ).draggable({containment: "#windowBorder", scroll: false, handle: "div.handle" }).resizable({containment: "#desktop"});
    $( "#synthesisWindow" ).draggable({containment: "#windowBorder", scroll: false, handle: "div.handle" }).resizable({containment: "#desktop", handles: 'n, s'});
    $( "#analysisWindow" ).draggable({containment: "#windowBorder", scroll: false, handle: "div.handle" }).resizable({containment: "#desktop", handles: 'n, s'});
    $( "#collectionWindow" ).draggable({containment: "#windowBorder", scroll: false, handle: "div.handle" }).resizable({containment: "#desktop"});
    $( "#learnWindow" ).draggable({containment: "#windowBorder", scroll: false, handle: "div.handle" }).resizable({containment: "#desktop"});
		$( "#controlWindow" ).draggable({containment: "#windowBorder", scroll: false, handle: "div.handle" });
		$( "#codeWindow" ).draggable({containment: "#windowBorder", scroll: false, handle: "div.handle" }).resizable({containment: "#desktop", snap: ".snapper"});
    $( "#threeWindow" ).draggable({containment: "#windowBorder", scroll: false, handle: "div.handle" }).resizable({containment: "#desktop", snap: ".snapper"});

		$( "#codeWindow" ).resize(function(){
			editor.resize();
		});

		$(".closeBtn").click(function(){
			$(this).parent().parent().toggle();
		});

		$(".maxBtn").click(function(){
			var win = $(this).parent().parent();


			if(!win.attr('maximized') || win.attr("maximized") == "false"){
				win.attr("_top", win.offset().top);
				win.attr("_left", win.offset().left);
				win.attr("_wid", win.width());
				win.attr("_hei", win.height());
				win.attr("_zidx", win.css("z-index"));
				win.css("top", "32px");
				win.css("left", "0");
				win.css("width", "calc(100% - 4px)");
				win.css("height", "calc(100% - 4px)");
				win.attr("maximized", "true");
				win.css("z-index", 90);
			}else{
				win.offset({ top: win.attr("_top"), left: win.attr("_left") });
				win.width(win.attr("_wid"));
				win.height(win.attr("_hei"));
				win.css("z-index", win.attr("_zidx"));
				win.attr("maximized", "false");
			}

      if(win.attr('id') == "threeWindow"){
        three.onWindowResize();
      }

		});

		var numWindows = $('.window').length;


		$('.window').mousedown(function(){
      bringToFront($(this));
		});


		//////////////////////////////
		// init menus
		$( "#fileMenu" ).menu();
		$( "#editMenu" ).menu();
		$( "#viewMenu" ).menu();
		$( "#windowMenu" ).menu();
		$( "#helpMenu" ).menu();

		$("#fileBtn").click(function(){hideMenus();$( "#fileMenu" ).toggle(); $(this).addClass("menuItem-highlight")});
		$("#editBtn").click(function(){hideMenus();$( "#editMenu" ).toggle(); $(this).addClass("menuItem-highlight")});
		$("#viewBtn").click(function(){hideMenus();$( "#viewMenu" ).toggle(); $(this).addClass("menuItem-highlight")});
		$("#windowBtn").click(function(){hideMenus();$( "#windowMenu" ).toggle(); $(this).addClass("menuItem-highlight")});
		$("#helpBtn").click(function(){hideMenus();$( "#helpMenu" ).toggle(); $(this).addClass("menuItem-highlight")});
		$("#desktop").mousedown(function(){hideMenus()});

		$(".ui-menu li").click(function(){hideMenus();});

    $("#fontSizeMenu li").click(function(){
      editor.setOption("fontSize", parseInt($(this).text()));
    })

    //////////////////////////////
    // INIT INDIVIDUAL WINDOWS


    // LEARNING
    $(".tabular").tabs();


    // EXAMPLES
    // create all examples for the array in examples.js
    for(var i = 0; i < examples.length; i++){
      $("#examplesList").append(
        $(document.createElement('li')).attr("index", i).text(examples[i].name).click(function(){
            var i = parseInt($(this).attr("index"));
            editor.setValue(examples[i].pgm);
            editor.session.selection.clearSelection();

            if(examples[i].zoom !== undefined){
              uto.zoom(examples[i].zoom);
              $("#zoomInput").val(examples[i].zoom);
            }
            if(examples[i].width !== undefined){
              uto.width(examples[i].width);
              $("#widthInput").val(examples[i].width);
            }
            if(examples[i].height !== undefined){
              uto.height(examples[i].height);
              $("#heightInput").val(examples[i].height);
            }
            if(examples[i].fps !== undefined){
              uto.fps(examples[i].fps);
              $("#fpsInput").val(examples[i].fps);
            }
            isRunning = true;
            mainNeedsConfig = true;
            runPgm(isRunning);
          }
        )
      )
    }

    $( ".slider" ).slider({
      create: function() {
        $(this).find( ".custom-handle" ).text( $( this ).slider( "value" ) );
      },
      slide: function( event, ui ) {
        $(this).find( ".custom-handle" ).text( ui.value );
      },
      min: 0,
      max: 99,
      step: 1,
    });


    initCodeWindow();
    initGLWindow();
    initSynthWindow();
    initAnalysisWindow();
    initCollectionWindow();
    initThreeWindow();


    hideAllWindows();
    hideMenus();

    toggleCodeWin();
    toggleSystemWin();
    toggleControlWin();

    resetUtomata();
    editor.resize();


  }); // document ready




  //////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////
  ////////////////// WORKSPACE MANAGMENT  //////////////////
  //////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////




	function hideMenus(){
		$(".menuItem").removeClass("menuItem-highlight");
		$( ".ui-menu" ).hide();
	}
	function hideAllWindows(){
		$( ".window" ).hide();
	}
	function showAllWindows(){
		$( ".window" ).show();
	}

  function toggleAnalysisWin(){
		bringToFront($("#analysisWindow").toggle());
	}
  function toggleCollectionWin(){
		bringToFront($("#collectionWindow").toggle());
	}
  function toggleSynthesisWin(){
		bringToFront($("#synthesisWindow").toggle());
	}
	function toggleSystemWin(){
		bringToFront($("#systemWindow").toggle());
	}
	function toggleCodeWin(){
		bringToFront($("#codeWindow").toggle());
	}
	function toggleConsoleWin(){
		bringToFront($("#consoleWindow").toggle());
	}
  function toggleLearningWin(){
		bringToFront($("#learnWindow").toggle());
	}
	function toggleControlWin(){
		bringToFront($("#controlWindow").toggle());
	}

  function toggleThreeWin(){
		bringToFront($("#threeWindow").toggle());
    three.onWindowResize();
	}


  function bringToFront(win){
    if(win.attr("maximized") != "true"){
      var dwnZ = win.css("z-index");
      $('.window').each(function( index ) {
        if($(this).css("z-index") > dwnZ){
          $(this).attr("_zidx", "-=1");
          $(this).css("z-index", "-=1");
        }
      });
      win.css("z-index", 100 + $('.window').length+10);
    }
  }

  function resetWorkspace(){
    $(".window").removeAttr("style");
    $(".window").removeAttr("style");
    $(".window").removeAttr("style");
    $(".window").removeAttr("style");
  }





  	function toggfullscreen(){
  	  if(isFullscreenMode){
  	    closeFullscreen();
  	    isFullscreenMode = false;
  	  }else{
  	    openFullscreen();
  	    isFullscreenMode = true;
  	  }
  	}
  	/* View in fullscreen */
  	function openFullscreen() {
  	  var elem = document.documentElement;
  	  if (elem.requestFullscreen) {
  	    elem.requestFullscreen();
  	  } else if (elem.mozRequestFullScreen) { /* Firefox */
  	    elem.mozRequestFullScreen();
  	  } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
  	    elem.webkitRequestFullscreen();
  	  } else if (elem.msRequestFullscreen) { /* IE/Edge */
  	    elem.msRequestFullscreen();
  	  }
  	}


  	/* Close fullscreen */
  	function closeFullscreen() {
  	  if (document.exitFullscreen) {
  	    document.exitFullscreen();
  	  } else if (document.mozCancelFullScreen) { /* Firefox */
  	    document.mozCancelFullScreen();
  	  } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
  	    document.webkitExitFullscreen();
  	  } else if (document.msExitFullscreen) { /* IE/Edge */
  	    document.msExitFullscreen();
  	  }
  	}




  //////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////
  ////////////////// INIT WINDOWS //////////////////////////
  //////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////









  ////////////////////////////////////////////
	// INIT CODE WINDOW
	function initCodeWindow(){
		editor = ace.edit('utoPgm');
		editor.session.setMode("ace/mode/glsl");
		editor.setOption("showGutter", false);
		editor.setTheme("ace/theme/iplastic");
		// editor.setTheme("ace/theme/terminal");
		editor.session.setMode("ace/mode/glsl");
		editor.renderer.setShowPrintMargin(false);
		editor.setOption("showInvisibles", false);
		editor.setOption("selectionStyle", "text");
		editor.setOption("highlightActiveLine", false);
		editor.setOption("highlightSelectedWord", true);
		editor.setOption("cursorStyle", "wide");
		editor.setOption("useSoftTabs", false);
		editor.setOption("tabSize", 3);
		editor.setOption("fontSize", 16);
		editor.getSession().setUseWrapMode(true);
		editor.setAutoScrollEditorIntoView(true);
		editor.setOption("maxLines", "Infinity");

		editor.getSession().on("change", function(){
			editor.resize();
			if(isRunning){
				clearTimeout(editorTimeOut);
				editorTimeOut = setTimeout(function(){
          runPgm(true);
          // analyzer.VisualizePgm( editor.getValue(), "programTreeContainer");
				}, 300);
			}
		});

		//editor.renderer.on("beforeRender", updateSize)
		//updateSize(null, editor.renderer)

		//var rules = editor.session.$mode.$highlightRules.getRules();
		//console.log(rules);
		// TODO: add utomata keywords

		// for (var stateName in rules) {
		// 		if (Object.prototype.hasOwnProperty.call(rules, stateName)) {
		// 				rules[stateName].unshift({
		// 						token: 'my_token',
		// 						regex: 'two'
		// 				});
		// 		}
		// }

		// force recreation of tokenizer
		// editor.session.$mode.$tokenizer = null;
		// editor.session.bgTokenizer.setTokenizer(editor.session.$mode.getTokenizer());
		// force re-highlight whole document
		// editor.session.bgTokenizer.start(0);


		editor.clearSelection();
    editor.resize();
	}


  function initSynthWindow(){

    synthesizer = new UTOsynthesizer();

    synthUto = new utomata(64,64, "synthUto");
    synthUto.setParent(document.getElementById("synthUtoContainer"));

    seedDial = JogDial(document.getElementById('synthSeedDial'), {debug:true,knobSize: "30%", wheelSize:"100%",touchMode:"wheel"});

    seedDial.on("mousedown", function(event){
      seedDialProxy = Math.round(event.target.rotation);
      if(!seedDialFlag){
          seedProxy =  document.getElementById("synthSeedInput").value ;
          seedDialFlag = true;
      }
    });

    seedDial.on("mousemove", function(event){
       var n = Math.round(event.target.rotation) - seedDialProxy;
       var res = parseInt(seedProxy) + n;
       if(seedDialFlag){
         document.getElementById("synthSeedInput").value =  res ;
       }
       generateProgram();
    });
    seedDial.on("mouseup", function(event){
      seedDialFlag = false;
    });

    $("#synthSeedInput").change(function(){
      generateProgram();
    });


    $("#autoGenSynthBtn").click(function(){
      if(autoGenerating){
        $(this).text("Start");
        autoGenerating = false;
      }else{
        autoGenerating = true;
        autoGenerateProgram();
        $(this).text("Stop");
      }
    });

    $( ".opSlider" ).slider({
      create: function() {
        $(this).find( ".custom-handle" ).text( $( this ).slider( "value" ) );
      },
      slide: function( event, ui ) {
        $(this).find( ".custom-handle" ).text( ui.value );
        var k = $(this).find("div").attr("id");
        k = k.substr(9); // remove  "opSlider-"
        synthesizer.setParam(k, ui.value);
      },
      min: 0,
      max: 9,
      step: 1,
    });


    $("#synthInput-setup").change(function(){
      synthesizer.setParam("setup",$(this).val());
    });

    $("#synthInput-minVal").change(function(){
      synthesizer.setParam("minVal",$(this).val());
    });
    $("#synthInput-maxVal").change(function(){
      synthesizer.setParam("maxVal",$(this).val());
    });

    $("#synthPresetInput").change(function(){
        applySynthPreset($(this).children("option:selected").val());
    });

    applySynthPreset("BASIC");
  }


  function applySynthPreset(preset){

    synthesizer.preset(preset);
    // update UI
    var params = synthesizer.getParams();

    for (const prop in params.unaryOP){
      $("#synthInput-" + prop).slider('value', params.unaryOP[prop]);
      $("#synthInput-" + prop).find( ".custom-handle" ).text(params.unaryOP[prop]);
    }
    for (const prop in params.binaryOP){
      $("#synthInput-" + prop).slider('value', params.binaryOP[prop]);
      $("#synthInput-" + prop).find( ".custom-handle" ).text(params.binaryOP[prop]);
    }
    for (const prop in params.vars){
      $("#synthInput-" + prop).slider('value', params.vars[prop]);
      $("#synthInput-" + prop).find( ".custom-handle" ).text(params.vars[prop]);
    }

    $("#synthInput-setup").val(params.setup);
    $("#synthInput-minVal").val(params.minVal);
    $("#synthInput-maxVal").val(params.maxVal);

  }

  function initAnalysisWindow(){
    analyzer = new Analyzer('analysisCanvasContainer');
  }

  function initCollectionWindow(){
    collectionUto = new utomata(64, 64, "collectionUtoCanvas");
    collectionUto.setParent(document.getElementById("collectionUtoContainer"));

    $("#collectionUtoContainer").hide();
    $( "#collectionGrid" ).sortable();

    $("#removeCollectionItem").click(function(){
        $("#collectionGrid").append($("#collectionUtoContainer").hide());
        currentCollectionItem.remove();
    });
    $("#editCollectionItem").click(function(){
        editor.setValue(currentCollectionItem.find("pre").text());
        uto.config();
    });

    $("#resetCollectionItem").click(function(){
        currentCollectionItemreset = true;
        currentCollectionItem.find("img").remove();
        collectionUto.setStepLimit(-1);
        collectionUto.run(currentCollectionItem.find("pre").text());
        collectionUto.config();
    });

    $("#rankCollectionItem" ).slider({
        change: function(event, ui) {
            currentCollectionItem.attr("fitness", $( this ).slider( "value" ));
        }
    });
  }



	////////////////////////////////////////////
	// INIT GL WINDOW
	function initGLWindow(){

		uto = new utomata( wid, hei);
		uto.setParent(document.getElementById("utomataContainer"));
    uto.setExternalStepCounter(document.getElementById("stepCounter"));
    // uto.setExternalInfoText(document.getElementById("infoPanel"));

		var param = getParameterByName("wid");
		if(param !== null){
			wid = param;
		}
		param = getParameterByName("hei");
		if(param !== null){
			hei = param;
		}

		param = getParameterByName("zoom");
		if(param !== null){
			zoom = param;
		}
		param = getParameterByName("fps");
		if(param !== null){
			fps = param;
		}
		param = getParameterByName("pgm");
		if(param !== null){
			pgm = param;
			editor.setValue(pgm);
		}

		param = getParameterByName("restore");
		if(parseInt(param) == 1){
			restoreFromLocal();
		}


    // document.getElementById("mainCanvas").addEventListener("mousemove", function(e){
    //
    //   var x = Math.round(uto.getMouseX() * 10000)/10000 ;
    //   var y = Math.round(uto.getMouseY() * 10000)/10000 ;
    //   var info = "mouse: [ " + x + " , " + y + " ]";
    //   document.getElementById("mouseCoords").innerHTML = info;
    // })


    document.getElementById("mainCanvas").addEventListener("mousemove", function(e){
      var x = Math.round(uto.getMouseX() * 10000)/10000 ;
      var y = Math.round(uto.getMouseY() * 10000)/10000 ;
      var info = "Cursor: [ " + x + " , " + y + " ]";
      document.getElementById("mouseCoords").innerHTML = info;
    });

    document.getElementById("mainCanvas").addEventListener('mouseleave', e => {
      document.getElementById("mouseCoords").innerHTML = "";
    });

		resetUtomata();
	}


  function initThreeWindow(){
    three = new ThreeWindow();
    three.init("threeContainer");
    $(".threeInput").keydown(function(){
      this.style.width = this.value.length + "ch";
    })
    $(".threeInput").change(function(){
      three.setParams(  $(thR).val(), $(thG).val(), $(thB).val(), $(thX).val(), $(thY).val(), $(thZ).val(), $(thW).val(), $(thI).val(),$(thJ).val() );
      this.style.width = this.value.length + "ch";
    })
    threeIsSetup = true;
    // three.init("threeContainer");
  }



  //////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////
  ////////////////// GENERAL FUNCTIONS  ////////////////////
  //////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////



  function runPgm(val){
		if(val == true){
      // RUN!
      if(mainNeedsConfig){
        uto.config();
        mainNeedsConfig = false;
      }

			uto.run( editor.getValue() );
			errors = uto.errors();

			if(errors.length > 0){
				document.getElementById("statusBulb").classList.add("redBack");
        document.getElementById("statusText").classList.add("redCol");
				println(errors[1], "error");
        if (infoInterval)clearInterval(infoInterval);
        document.getElementById("statusText").innerHTML = "Error. Running last valid program";
			}else{
				println("Compiling");
				document.getElementById("statusBulb").classList.remove("redBack");
        document.getElementById("statusText").classList.remove("redCol");

        infoInterval = setInterval(function(){
          if(isRunning && errors.length == 0){
            document.getElementById("statusText").innerHTML = "Running at " + uto.getFps() + " fps.";
          }
        }, 1000);

			}
			isRunning = true;
      $("#runBtn").removeClass("play").addClass("pause");
      $("#nextBtn").addClass("btnInset");
      $("#menuRunBtn").text("Stop");
		}else{
      // stop
			if (infoInterval)clearInterval(infoInterval);
			uto.stop();

      // analyze THIS
      analyzer.calcHistogram(getImgFromUTO(uto).src);

			println("Stopped");
			document.getElementById("statusText").innerHTML = "Stopped";
			isRunning = false;
      $("#menuRunBtn").text("Run");
      $("#runBtn").removeClass("pause").addClass("play");
      $("#nextBtn").removeClass("btnInset");
		}
	}


	function resetUtomata(){

		uto.size( wid, hei);
    mainNeedsConfig = true;
		runPgm(isRunning);
		uto.zoom(zoom);
		uto.fps(fps);

    if(threeIsSetup)three.reset(wid, hei);

    $("#thI").val(wid);
    $("#thJ").val(hei);

    if(!isRunning){
      uto.step();
    }
	}



  // works on main editor only
  function generateProgram(){

    // synthesizer.setConfig("vec(stp(0.9,random()))");
    synthesizer.setSeed(document.getElementById("synthSeedInput").value);

    var pgm = synthesizer.generateProgram();

    editor.setValue(pgm);
    mainNeedsConfig = true;
    runPgm(true);
  }


  // works on collection only
  function autoGenerateProgram(){

    // synthesizer.setConfig("vec(stp(0.9,random()))");
    synthesizer.setSeed(""); // do not seed on autogen mode
    var pgm = synthesizer.generateProgram();

    // TODO: this should also be validated
    var stepCount = Math.max($("#synthIntervalInput").val(), 30);

    synthUto.run(pgm);
    synthUto.config();

    synthUto.setStepLimit(stepCount,function(){
      var img = getImgFromUTO(synthUto);
      var newImg = $( img );
      addPgmToCollection(synthUto.getTransition(), newImg);

      if(autoGenerating){
        console.log("regenerate");
        autoGenerateProgram();
      }
    });
  }

  // add to collection shortcut
  function collectPgm(){
    addPgmToCollection(editor.getValue());
  }

  function clearCollection(){
    $("#collectionWindow").append( $("#collectionUtoContainer").hide() );
    $("#collectionGrid").empty();
    $("#collectionGrid").append( $("#collectionUtoContainer") ) ;
  }

  function addPgmToCollection(_pgm, img = null){

    currentCollectionItem = $('<div config="false" class="collectionItem" fitness="0"><pre>'+_pgm+'</pre></div>');

    if(img != null){
      // use the (64x64!) image provided
      currentCollectionItem.prepend(img);
    }else{
      // try to make a new image
      collectionUto.run(_pgm);
      collectionUto.config();
      collectionUto.setStepLimit(30, function(){
        var _img = getImgFromUTO(collectionUto);
        var newImg = $( _img );
        currentCollectionItem.prepend(newImg);
        currentCollectionItem = undefined;
        collectionUto.stop();
      });
    }

    currentCollectionItem.mouseenter(function(){
      if(autoConfiguringCollection)return;
      $(this).prepend( $("#collectionUtoContainer").show());
      $(".collectionItem").css("z-index", 200);
      $(this).css("z-index", 210);
      currentCollectionItem = $(this);
      $("#rankCollectionItem" ).slider("option","value",currentCollectionItem.attr("fitness"));
      $("#rankCollectionItem" ).find( ".custom-handle" ).text( currentCollectionItem.attr("fitness") );
    });

    currentCollectionItem.mouseleave(function(){
      if(autoConfiguringCollection)return;
      if(currentCollectionItemreset){
        collectionUto.stop();
        var img = getImgFromUTO(collectionUto);
        var newImg = $( img );
        $(this).prepend(newImg);
        currentCollectionItemreset = false;
      }
      $("#collectionUtoContainer").hide();
      currentCollectionItem = undefined;
    });

    $("#collectionGrid").prepend(currentCollectionItem);

  }

  function configCollectionRecursive(item){

    var pgm = item.find("pre").text();
    item.prepend( $("#collectionUtoContainer").show());
    $(".collectionItem").css("z-index", 200);
    item.css("z-index", 210);
    currentCollectionItem = item;

    // try to make a new image
    collectionUto.run(pgm);
    collectionUto.config();
    collectionUto.setStepLimit(10, function(){
      var _img = getImgFromUTO(collectionUto);
      var newImg = $( _img );
      currentCollectionItem.prepend(newImg);
      currentCollectionItem = undefined;
      collectionUto.stop();
      if(!item.is(':last-child')){
          configCollectionRecursive(item.next());
      }else{
        autoConfiguringCollection = false;
        console.log("completed collection import");
      }
    });


  }


  function getImgFromUTO(_uto) {
      var dataURL = document.getElementById(_uto.getCanvasId()).toDataURL("image/png");
      var imgObj = new Image();
      imgObj.src = dataURL;
      return imgObj;
  }

	function println(msg, msgType){
		var typeclass = "consleMsg";
		if(msgType == "error"){
				typeclass = "consleErr";
		}
		var newline = document.createElement("p");
		newline.classList.add(typeclass);
		newline.innerHTML = msg;
		document.getElementById("console").prepend(newline);
	}

	function clearConsole(){
		document.getElementById("console").innerHTML = "";
	}






  //////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////
  ////////////////// INPUT OUTPUT  /////////////////////////
  //////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////




	function duplicatePage(fresh){
		var win;
		if(fresh){
			win = window.open(window.location.href, '_blank');
		}else{
			saveToLocal();
		  win = window.open(window.location.href + "?restore=1", '_blank');
		}
		win.focus();
	}


 function copyProgramLink(){
		var _pgm = editor.getValue();

		_pgm = _pgm.replaceAll('%', '%25');
		_pgm = _pgm.replace(/\t/gm,'%09');
		_pgm = _pgm.replace(/(\r\n|\n|\r)/gm,'%0A');
		_pgm = _pgm.replaceAll('+', '%2B');
		_pgm = _pgm.replaceAll(" ", '%20');

		// _pgm = _pgm.replaceAll('-', '%2D');
		// _pgm = _pgm.replaceAll('*', '%2A');
		// _pgm = _pgm.replaceAll('/', '%2F');

		var url = "https://soogbet.github.io/utomata/?wid="+wid+"&hei="+hei+"&zoom="+zoom+"&fps="+fps+"&pgm=" + _pgm;
		const el = document.createElement('textarea');
	  el.value = url;
	  document.body.appendChild(el);
	  el.select();
	  document.execCommand('copy');
	  document.body.removeChild(el);
	}


	function saveHTML(){

		var data = "<!DOCTYPE html><html lang='en' dir='ltr'><head><meta charset='utf-8'>";
		data += '<style media="screen">*,*::before,*::after {box-sizing: border-box;margin: 0;padding: 0;}body{background:#222;}img, canvas{display:block; image-rendering: pixelated;image-rendering: -moz-crisp-edges; image-rendering: crisp-edges;}</style>';
		data += "<" + "script src='https://soogbet.github.io/utomata/utomata.js'></"+"script></head><body><pre style='display:none;' id='utoPgm'>";

		data +=  editor.getValue();

		data += "</pre></body><"+"script type='text/javascript'>";
		data += 'var uto;uto = new utomata(' + wid + ', ' + hei + ');';
		data += 'uto.zoom(' + zoom + ');';
		data += 'uto.fps(' + fps + ');';
		data += 'uto.config();';
		data += 'uto.run(document.getElementById("utoPgm").innerHTML);';
		data += "</" + "script></html>";

		var d = new Date();

		var file = new Blob([data], {type: "text/plain"});

		if (window.navigator.msSaveOrOpenBlob) // IE10+
				window.navigator.msSaveOrOpenBlob(file, filename);
		else { // Others

			var ds = d.getFullYear() + '-' + d.getMonth() + '-' + d.getDay() + '-' + d.getHours() + '-' + d.getMinutes() + '-' + d.getSeconds();
			var filename = "utoPgm-" + ds;

			// prompt for file name
			var prompter = prompt("Please enter file name:", filename);
		  if (prompter == null || prompter == "") {
				//filename = "utoPgm-" + ds + ".html";
				return;
		  } else {
				filename = prompter + ".html";
		  }

			var a = document.createElement("a"),
			url = URL.createObjectURL(file);
			a.href = url;
			a.download = filename;
			document.body.appendChild(a);
			a.click();
			setTimeout(function() {
					document.body.removeChild(a);
					window.URL.revokeObjectURL(url);
			}, 0);
		}
	};

  // SAVE CAMVAS AS PNG IN NEW TAB
  function saveImage(fileName, returnType) {
    // if(!isRunning){
    //   return;
    // }
    var dataURL = document.getElementById("mainCanvas").toDataURL("image/png");

    switch(returnType) {
      case 'obj':
        var imgObj = new Image();
        imgObj.src = dataURL;
        document.getElementById('imageContainer').appendChild(imgObj);
        break;
      case 'window':
        window.open(dataURL, "utomata export");
        break;
      case 'download':

      var dlLink = document.createElement('a');
      dlLink.download = fileName;
      dlLink.href = dataURL;//dataURL.replace("image/png", "image/octet-stream");
      dlLink.dataset.downloadurl = ["image/png", dlLink.download, dlLink.href].join(':');

      document.body.appendChild(dlLink);
      dlLink.click();
      document.body.removeChild(dlLink);

      break;
    }
  }




	function dropHandler(ev) {

	  console.log('File(s) dropped');

	  // Prevent default behavior (Prevent file from being opened)
	  ev.preventDefault();

	  if (ev.dataTransfer.items) {
	    // Use DataTransferItemList interface to access the file(s)
	    for (var i = 0; i < ev.dataTransfer.items.length; i++) {
	      // If dropped items aren't files, reject them
	      if (ev.dataTransfer.items[i].kind === 'file') {
	        var file = ev.dataTransfer.items[0].getAsFile();

	        var extension = file.name
	        var reader = new FileReader();

	        let ext = file.name.split('.').pop().toLowerCase();
	        if(ext == 'js'){
	          reader.readAsText(file,"UTF-8");
	        }else if(ext == 'html'){
	          reader.onload = function(event) {

	            let _script = getTagContent(event.target.result, 'utoPgm');

	            if(_script == ""){
	              alert('Error loading file');
	            }else{
	                editor.setValue(_script, -1);
	            }
	          }
						reader.readAsText(file,"UTF-8");

	        }else if(ext == 'png' || ext == 'jpg'){
	          var img = document.createElement("img");
	          img.classList.add("hidden");
	          img.file = file;

	          reader.onload = (
	            function (aImg) { return function (e) {
	             aImg.src = e.target.result;
	             uto.input(aImg);
							 wid = uto.getWidth();
							 hei = uto.getHeight();
	             resetUtomata();
							 $("#clearInputImage").removeClass("ui-state-disabled");
	            };
	          })(img);
	          reader.readAsDataURL(file);
	        }else if(ext == "csv"){
            // it's a collection
            reader.onload = function(event) {
              var res = event.target.result;
              var arr = parseCSV(res);
              for(var i = 0; i < arr.length; i++){
                if(Array.isArray(arr)){
                  addPgmToCollection(arr[i][0]);
                }else{
                  addPgmToCollection(arr[i]);
                }
              }
              configCollectionRecursive($(".collectionItem").first());
              autoConfiguringCollection = true;
            }
            reader.readAsBinaryString(file,"UTF-8");
          }
	      }
	    }
	  } else {
	    // Use DataTransfer interface to access the file(s)
	    // for (var i = 0; i < ev.dataTransfer.files.length; i++) {
	    //   var file = ev.dataTransfer.files[0].getAsFile();
	    //   // same as above?
	    // }
	  }
	}



	function clearInputImage(e){
		uto.input(false);
		$("#clearInputImg").addClass("ui-state-disabled");
	}

	function getTagContent (html, id){

	    var temporalDivElement = document.createElement("div");

	    temporalDivElement.innerHTML = html;
	    let res = temporalDivElement.querySelectorAll("#" + id)[0];
	    if(typeof res === "undefined"){
	      return "";
	    }
	    return res.innerHTML;
	}

	function dragOverHandler(ev) {
	  // Prevent default behavior (Prevent file from being opened)
	  ev.preventDefault();
	}

	window.onbeforeunload = function(){
	  // Store current state
	  saveToLocal();
	  // keeping the program so no real need for this:
	  return 'there are unsaved changes -are you sure you want to leave?';
	};

	function saveToLocal(){
		if (typeof(Storage) !== "undefined") {
	    localStorage.setItem("utomataProgram", editor.getValue());
			localStorage.setItem("utomataWidth", wid);
			localStorage.setItem("utomataHeight", hei);
			localStorage.setItem("utomataZoom", zoom);
			localStorage.setItem("utomataFps", fps);
      console.log("SAVE");
	  }
	}

  function restoreFromLocal(){
		var success = true;

		if (typeof(Storage) !== "undefined" && useLocalStorage) {

      if(localStorage.getItem("utomataProgram") !== null){
        // load last program
        pgm = localStorage.getItem("utomataProgram");
				editor.setValue(pgm);
				editor.clearSelection();
      }
			if(localStorage.getItem("utomataWidth") !== null){
        // load last program
        wid = localStorage.getItem("utomataWidth");
				document.getElementById("widthInput").value = wid;
      }
			if(localStorage.getItem("utomataHeight") !== null){
        // load last program
        hei = localStorage.getItem("utomataHeight");
				document.getElementById("heightInput").value = hei;
      }
			if(localStorage.getItem("utomataZoom") !== null){
        // load last program
        zoom = localStorage.getItem("utomataZoom");
				document.getElementById("zoomInput").value = zoom;
      }
			if(localStorage.getItem("utomataFps") !== null){
        // load last program
        fps = localStorage.getItem("utomataFps");
				document.getElementById("fpsInput").value = fps;
      }
		}else{
			return;
		}
		resetUtomata();
	}


	function getParameterByName(name, url) {
	    if (!url) url = window.location.href;
	    name = name.replace(/[\[\]]/g, '\\$&');
	    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
	        results = regex.exec(url);
	    if (!results) return null;
	    if (!results[2]) return '';
	    return decodeURIComponent(results[2].replace(/\+/g, ' '));
	}






  function saveCollection() {

    var d = new Date();
    var ds = d.getFullYear() + '-' + d.getMonth() + '-' + d.getDay() + '-' + d.getHours() + '-' + d.getMinutes() + '-' + d.getSeconds();
    var filename = "utoCollection-" + ds;

    var csv = '';

    var programs = $(".collectionItem pre");

    var counter = 0;
    for(var i = programs.length-1; i >=0 ; i--){

      var pgm = programs.eq(i).text();
      csv += '"' + pgm + '"' + ","
      csv += "\n";
    }
    console.log(csv);

    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
    hiddenElement.target = '_blank';
    hiddenElement.download = filename+'.csv';
    hiddenElement.click();

  }






	// function updateSize(e, renderer) {
	// 	var text = renderer.session.getLine(0);
	// 	var chars = renderer.session.$getStringScreenWidth(text)[0];
  //
	// 	var width = Math.max(chars, 2) * renderer.characterWidth // text size
	// 		+ 2 * renderer.$padding // padding
	// 		+ 2 // little extra for the cursor
	// 		+ 0 // add border width if needed
  //
	// 	// update container size
	// 	renderer.container.style.width = width + "px";
	// 	// update computed size stored by the editor
	// 	renderer.onResize(false, 0, width, renderer.$size.height);
	// }






    function parseCSV(str) {
      var arr = [];
      var quote = false;  // 'true' means we're inside a quoted field

      // Iterate over each character, keep track of current row and column (of the returned array)
      for (var row = 0, col = 0, c = 0; c < str.length; c++) {
        var cc = str[c], nc = str[c+1];        // Current character, next character
        arr[row] = arr[row] || [];             // Create a new row if necessary
        arr[row][col] = arr[row][col] || '';   // Create a new column (start with empty string) if necessary

        // If the current character is a quotation mark, and we're inside a
        // quoted field, and the next character is also a quotation mark,
        // add a quotation mark to the current column and skip the next character
        if (cc == '"' && quote && nc == '"') { arr[row][col] += cc; ++c; continue; }

        // If it's just one quotation mark, begin/end quoted field
        if (cc == '"') { quote = !quote; continue; }

        // If it's a comma and we're not in a quoted field, move on to the next column
        if (cc == ',' && !quote) { ++col; continue; }

        // If it's a newline (CRLF) and we're not in a quoted field, skip the next character
        // and move on to the next row and move to column 0 of that new row
        if (cc == '\r' && nc == '\n' && !quote) { ++row; col = 0; ++c; continue; }

        // If it's a newline (LF or CR) and we're not in a quoted field,
        // move on to the next row and move to column 0 of that new row
        if (cc == '\n' && !quote) { ++row; col = 0; continue; }
        if (cc == '\r' && !quote) { ++row; col = 0; continue; }

        // Otherwise, append the current character to the current column
        arr[row][col] += cc;
      }
      return arr;
    }







      //////////////////////////////////////////////////////////
      //////////////////////////////////////////////////////////
      //////////////////////////////////////////////////////////
      ////////////////// KEYBOARD HANDLERS  ////////////////////
      //////////////////////////////////////////////////////////
      //////////////////////////////////////////////////////////
      //////////////////////////////////////////////////////////





    // keyboard handler
  	document.addEventListener("keydown", function(e) {
  	  //CMD+S
  	  if ((window.navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)  && e.keyCode == 83) {
  	    e.preventDefault();
  			saveHTML();
  	  }

  	  //CMD+B
  	  if ((window.navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)  && e.keyCode == 66) {
  	    e.preventDefault();
  	    runPgm(!isRunning);
  	  }

  	  //CMD+H
  	  if ((window.navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)  && e.keyCode == 72) {
  	    e.preventDefault();
  	    hidePanel();
  	  }

  		//CMD+U
  	  if ((window.navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)  && e.keyCode == 85) {
  			e.preventDefault();
  	    uto.config();
  	  }

  		//CMD+D
  	  if ((window.navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)  && e.keyCode == 68) {
  	    e.preventDefault();
  	    duplicatePage(false);
  	  }

  	  //CMD+A
  	  if ((window.navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)  && e.keyCode == 65) {
  	    e.preventDefault();
  	    toggfullscreen();
  	  }

      // //CMD+PLUS
  	  // if ((window.navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)  && e.keyCode == 43) {
      //
      //   zoom += 1;
      //   if(zoom > 128) zoom = 128;
      //   uto.zoom(zoom);
      //   $("#zoomInput").value(zoom);
      //   e.preventDefault();
  	  // }
      //
      // //CMD+MINUS
  	  // if ((window.navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)  && (e.keyCode === 109 || e.keyCode === 189)) {
      //
  	  //   zoom -= 1;
      //   if(zoom < 1) zoom = 1;
      //   uto.zoom(zoom);
      //   $("#zoomInput").value(zoom);
      //   e.preventDefault();
  	  // }



  	  // ...
  	}, false);
