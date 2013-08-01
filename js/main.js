var emulabeller = (function() {
    'use strict';

    // autoload wav file and TextGrid for testing
    // will only work if running on server...
    var autoLoad = true;


    var tierInfos = {
        "tiers": [],
        "canvases": []
    };

    var osciCanvas = document.querySelector('#wave');
    var specCanvas = document.querySelector('#spectrogram');
    var scrollCanvas = document.querySelector('#scrollbar');
    var draggableBar = document.querySelector('#resizer');
    var timeline = document.querySelector('#timeline');
    var tiers = document.querySelector('#tiers');
    var cans = document.getElementById('cans');
    var fileSelect = document.querySelector('#fileSelect');
    var showLeftPush = document.getElementById('serverSelect');
    var spectroworker = document.querySelector('#spectroworker');
    var labeller = Object.create(EmuLabeller);


    labeller.init({
        osciCanvas: osciCanvas,
        specCanvas: specCanvas,
        scrollCanvas: scrollCanvas,
        // waveColor: 'white',
        // progressColor: 'grey',
        // selectLineColor: 'black',
        // loadingColor: 'purple',
        // cursorColor: 'red',
        // selectAreaColor: 'rgba(22, 22, 22, 0.25)',
        // font: '12px Verdana',
        tierInfos: tierInfos,
        draggableBar: draggableBar,
        timeline: timeline,
        tiers: tiers,
        cans: cans,
        fileSelect: fileSelect,
        showLeftPush: showLeftPush,
        spectroworker: spectroworker,
        internalCanvasWidth: '2048', // in pixel
        internalCanvasHeightSmall: '128', // in pixel -> Cans
        internalCanvasHeightBig: '64', // in pixel -> Wave & Spectro
        mode: 'standalone' // or standalone
    });


    // see if on iPad... if so preload data... just for testing
    var isiPad = navigator.userAgent.match(/iPad/i) !== null;
    if (isiPad || autoLoad) {
        labeller.iohandler.xhrLoad('data/msajc003.TextGrid', 3);
        labeller.load('data/msajc003.wav');
    }


    // initial  launch

    $('#fileGetterBtn')[0].addEventListener('change', labeller.fileAPIread, false);

    // hack for hiding inputs of dialogs.. SIC!!!
    $("#dialog-messageSh").hide();
    $("#dialog-messageSetLabel").hide();
    $('#specSettings').click(function() {
        var isOpen = $('#specDialog').dialog('isOpen');
        if (!isOpen) {
            $('#specDialog').dialog('open');
            $("#specDialog").dialog('moveToTop');
            isOpen = true;
        } else {
            $('#specDialog').dialog('close');
            isOpen = false;
        }
    });


    // event redirect for Open File Button
    document.querySelector('#fileSelect').addEventListener('click', function(e) {
            // Use the native click() of the file input.
            document.querySelector('#fileGetterBtn').click();
        },
        false);


    $(document).bind("keydown", function(e){
        var code = (e.keyCode ? e.keyCode : e.which);
        if( code== 8 && emulabeller.keyBindingAllowed() ){ // 8 == backspace
            e.preventDefault();
            if(emulabeller.tierHandler.getSelectedTierType()=="seg" || emulabeller.tierHandler.getSelectedTierType()=="point")
                emulabeller.tierHandler.deleteSelected();
            else 
                alert("Bitte markieren Sie zuerst ein oder mehrere Segmente!"); 
        }       
        if( code == 13 && emulabeller.keyBindingAllowed()){ // 13 == enter
            emulabeller.tierHandler.addSegmentAtSelection();
            e.preventDefault();
        }   
        if( code == 16 && emulabeller.keyBindingAllowed()){ // 16 == ???
            emulabeller.tierHandler.history();
            e.preventDefault();
        }
        if( code == 18 && emulabeller.keyBindingAllowed()){ // 18 == ???
            emulabeller.tierHandler.history();
            e.preventDefault();
        }   
        if( code == 27 && emulabeller.internalMode == labeller.EDITMODE.LABEL_RENAME ){ // 27 == escape
            emulabeller.tierHandler.removeLabelDoubleClick();
            e.preventDefault();
        }  
        if( code == 32 && emulabeller.keyBindingAllowed()) {  // 32 == SPACE
            emulabeller.playPauseInView();
            e.preventDefault();
        }
        if( code == 46 && emulabeller.keyBindingAllowed()){ // 46 == entfernen
            emulabeller.tierHandler.deleteBorder();
            e.preventDefault();
        }  
        if( code == 65 && emulabeller.keyBindingAllowed()) {  // 65 == a
            emulabeller.shiftViewP(0);
            e.preventDefault();
        }  
        if( code == 66 && emulabeller.keyBindingAllowed()) {  // 66 == b
            emulabeller.snapSelectedSegmentToNearestBottom();
            e.preventDefault();
        }  
        if( code == 68 && emulabeller.keyBindingAllowed()) {  // 68 == d
            emulabeller.shiftViewP(1);
            e.preventDefault();
        } 
        if( code == 69 && emulabeller.keyBindingAllowed()) {  // 69 == e
            emulabeller.zoomSel(); 
            e.preventDefault();
        }
        if( code == 70 && emulabeller.keyBindingAllowed()) {  // 70 == f
            emulabeller.playInMode("all");
            e.preventDefault();
        }  
        if( code == 78 && emulabeller.keyBindingAllowed()) {  // 78 == n
            emulabeller.tierHandler.renameTier();
            e.preventDefault();
        }
        if( code == 79 && emulabeller.keyBindingAllowed()) {  // 79 == o
            if (emulabeller.externalMode == labeller.USAGEMODE.STANDALONE)
                $('#fileGetterBtn').click();
            if (emulabeller.externalMode == labeller.USAGEMODE.SERVER)
                emulabeller.openSubmenu();
            e.preventDefault();
        }
        if( code == 81 && emulabeller.keyBindingAllowed()) {  // 81 == q
            emulabeller.setView(-Infinity, Infinity);
            e.preventDefault();
        }
        if( code == 82 && emulabeller.keyBindingAllowed()) {  // 82 == r
            emulabeller.playInMode("sel");
            e.preventDefault();
        }
        if( code == 83 && emulabeller.keyBindingAllowed()) {  // 83 == s
            emulabeller.zoomViewPort(0);
            e.preventDefault();
        }  
        if( code == 84 && emulabeller.keyBindingAllowed()) {  // 84 == t
            emulabeller.snapSelectedSegmentToNearestTop();
            e.preventDefault();
        }      
        if( code == 87 && emulabeller.keyBindingAllowed()) {  // 87 == w
            emulabeller.zoomViewPort(1);
            e.preventDefault();
        }  
        if( code == 90 && emulabeller.keyBindingAllowed()) {  // 90 == z
            emulabeller.tierHandler.goBackHistory();
            e.preventDefault();
        }      
        
        console.log(code);
    });


    // touch events 
    // var element = document.getElementById('timeline');
    // var hammertime = Hammer(element).on("touch", function(event) {
    //     console.log('stop touching me says the timeline');
    // });

    // var hammertime = Hammer(element).on("doubletap", function(event) {
    //     // alert('stop touching me says the timeline');
    //     emulabeller.zoomSel();
    // });

    return labeller;
}());