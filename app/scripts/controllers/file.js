'use strict';

angular.module('emuwebApp')
  .controller('FileCtrl', function ($scope, Binarydatamaniphelper, Textgridparserservice, ConfigProviderService) {

    $scope.dropzone = document.getElementById('dropzone');
    $scope.fileInput = document.getElementById('fileDialog');
    $scope.dropDefault = 'Drop your files here or click here to open a file';
    $scope.dropErrorFileType = 'Error: Could not parse file. You can drop multiple files, but you have to select at least one .WAV file. The following file types are supported: .WAV .TEXTGRID';
    $scope.dropErrorAPI = 'Sorry ! The File APIs are not fully supported in your browser.';
    $scope.dropNotAllowed = 'File is not allowed';
    $scope.dropAllowed = 'Drop files to start loading';
    $scope.dropParsingStarted = 'Parsing started';
    $scope.wavLoaded = 0;
    $scope.txtGridLoaded = 0;
    $scope.labelLoaded = 0;
    $scope.newfiles = {};
    
    $scope.dropText = $scope.dropDefault;
    
    $scope.dropzone.addEventListener('dragenter', dragEnterLeave, false);
    $scope.dropzone.addEventListener('dragleave', dragEnterLeave, false);
    $scope.dropzone.addEventListener('dragover', handleDragOver, false);
    $scope.fileInput.addEventListener('change', handleFilesonChange, false);


    $scope.loadFiles = function () {
        setTimeout(function() {
            $scope.fileInput.click();
        }, 0);    
    };

    
    function handleFilesonChange() {
        var doLoad = false;
        var loadedFiles = $scope.fileInput;
        for (var i = 0; i < loadedFiles.files.length; i++) {
            var file = loadedFiles.files[i];
            var extension = file.name.substr(file.name.lastIndexOf('.') + 1).toUpperCase();
            if(extension==="WAV" && file.type.match('audio/wav') ) {
                doLoad = true;
                $scope.newfiles.wav = file;
            }
            if(extension==="TEXTGRID" ) {
                $scope.newfiles.textgrid = file;
            }            
            
        }
    }
    

    function dragEnterLeave(evt) {
      evt.preventDefault();
      var files = evt.target.files || evt.dataTransfer.files;
      $scope.$apply(function () {
        $scope.dropText = $scope.dropDefault;
        $scope.dropClass = '';
      });
    }

    
    
    function  handleDragOver(evt) {
       evt.preventDefault();
       var ok = evt.dataTransfer && evt.dataTransfer.types && evt.dataTransfer.types.indexOf('Files') >= 0;
       $scope.$apply(function () {
         $scope.dropClass = ok ? 'over' : 'not-available';
       });
    }
    

     $scope.$watch('newfiles', function () {
         if (!$.isEmptyObject($scope.newfiles.wav)) {
             $scope.handleLocalFiles();
          }
     }, true);    


    $scope.handleLocalFiles = function () {
        $scope.$parent.showDropZone = false;
        $scope.$parent.cps.vals.main.comMode = 'FileAPI';
        $scope.$parent.vs.setState('loadingSaving');
        // reset history
        $scope.$parent.hists.resetToInitState();
        $scope.$parent.vs.somethingInProgress = true;
        $scope.$parent.vs.somethingInProgressTxt = 'Loading local File: ' + $scope.newfiles.wav.name;
        // empty ssff files
        $scope.$parent.ssffds.data = [];
        $scope.$parent.tds.data = {};
        //arrBuff = Binarydatamaniphelper.base64ToArrayBuffer(bundleData.mediaFile.data);
		$scope.$parent.vs.somethingInProgressTxt = 'Parsing WAV file...';
		
		var reader = new FileReader();
		reader.readAsArrayBuffer($scope.newfiles.wav);
		reader.onloadend = function(evt) {
		  if (evt.target.readyState == FileReader.DONE) { 
		    $scope.$parent.io.httpGetPath('configFiles/embedded_config.json').then(function (resp) {
					// first element of perspectives is default perspective
					$scope.$parent.vs.curPerspectiveIdx = 0;
					$scope.$parent.cps.setVals(resp.data.EMUwebAppConfig);
					delete resp.data.EMUwebAppConfig; // delete to avoid duplicate
					$scope.$parent.cps.curDbConfig = resp.data;
					// then get the DBconfigFile
		    
		        
    		    $scope.$parent.wps.parseWavArrBuf(evt.currentTarget.result).then(function (wavJSO) {
    		      console.log(wavJSO);
		    	  $scope.$parent.vs.curViewPort.sS = 0;
			      $scope.$parent.vs.curViewPort.eS = wavJSO.Data.length;
    			  $scope.$parent.vs.curViewPort.bufferLength = wavJSO.Data.length;
  	    		  $scope.$parent.vs.resetSelect();
	    		  $scope.$parent.vs.curPerspectiveIdx = 0;
		    	  $scope.$parent.shs.wavJSO = wavJSO;	
			      // parsing of Textgrid Data
			      if($scope.newfiles.textgrid !== undefined) {
			        var reader = new FileReader();
    			    reader.readAsText($scope.newfiles.textgrid);
	    		    reader.onloadend = function(evt) {
		    	        if (evt.target.readyState == FileReader.DONE) { 
		    	            var extension = $scope.newfiles.wav.name.substr(0,$scope.newfiles.wav.name.lastIndexOf('.'));
		    	            Textgridparserservice.asyncParseTextGrid(evt.currentTarget.result, $scope.newfiles.wav.name, extension).then(function (parseMess) {
								var annot = parseMess.data;
								$scope.$parent.tds.setData(annot);
								// console.log(JSON.stringify(l, undefined, 2));
								var lNames = [];
								annot.levels.forEach(function (l) {
									lNames.push(l.name);
								});
								console.log($scope.$parent.cps.vals.perspectives[$scope.$parent.vs.curPerspectiveIdx]);
								$scope.$parent.cps.vals.perspectives[$scope.$parent.vs.curPerspectiveIdx].levelCanvases.order = lNames;
								$scope.$parent.vs.somethingInProgressTxt = 'Done!';
								$scope.$parent.vs.somethingInProgress = false;
								$scope.$parent.vs.setState('labeling');
								$scope.$parent.openSubmenu();
			                });
    			        }
	    		    }, function (errMess) {
		    	        $scope.$parent.dials.open('views/error.html', 'ModalCtrl', 'Error parsing textgrid file: ' + errMess.status.message);
			        };
			      }
			      else {
			        $scope.$parent.vs.setState('labeling');
			        $scope.$parent.vs.somethingInProgress = false;
			        $scope.$parent.vs.somethingInProgressTxt = 'Done!';		            
	                $scope.$parent.openSubmenu();		    
			      }
			      
        });
			}, function (errMess) {
			    $scope.$parent.dials.open('views/error.html', 'ModalCtrl', 'Error parsing wav file: ' + errMess.status.message);
			});
               
            }
            
        };
    };
    
     $scope.dropzone.addEventListener('drop', function (evt) {
       evt.stopPropagation();
       evt.preventDefault();
       $scope.$apply(function () {
         $scope.dropText = $scope.dropParsingStarted;
         $scope.dropClass = '';        
       });
       if (window.File && window.FileReader && window.FileList && window.Blob) {
           var items = evt.dataTransfer.items;
           for (var i = 0; i < items.length; i++) {
             var item = items[i].webkitGetAsEntry();
             if (item) {
               $scope.traverseFileTree(item);       
             }
           }       
        }
        else {
            $scope.$parent.dials.open('views/error.html', 'ModalCtrl', $scope.dropErrorAPI);
            $scope.dropText = $scope.dropDefault;
        }
     }, false);

    $scope.traverseFileTree = function (item, path) {
      path = path || '';
      var doLoad = false;
      if (item.isFile) {
        item.file(function (file) {
          var extension = file.name.substr(file.name.lastIndexOf('.') + 1).toUpperCase();
          if (extension === 'WAV') {
            if (file.type.match('audio/wav')) {
                $scope.newfiles.wav = file;  
                doLoad = true
                $scope.$apply();
            }
          }
          if (extension === 'TEXTGRID') {
            $scope.newfiles.textgrid = file;  
            $scope.$apply();     
          }
          if (extension === 'LAB' || extension === 'TONE') {
            $scope.newfiles.lab = file;    
            $scope.$apply();
          }                    
        });
      } else if (item.isDirectory) {
        var dirReader = item.createReader();
        dirReader.readEntries(function (entries) {
          for (var i = 0; i < entries.length; i++) {
            $scope.traverseFileTree(entries[i], path + item.name + '/');
          }
        });
      }
    };
    
    
  });