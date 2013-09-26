'use strict';

angular.module('emulvcApp')
	.controller('HandletiersCtrl', function($scope, $http, viewState) {
	
		$scope.viewState = viewState;
		$scope.testValue = '';
		$scope.message = '';

		$http.get('testData/PhoneticTier.json').success(function(data) {
			$scope.viewState.eS = data.events[data.events.length-1].startSample + data.events[data.events.length-1].sampleDur;
			$scope.viewState.bufferLength = $scope.viewState.eS;
			$scope.tierDetails = data;
		});
		
		$scope.updateAllLabels = function() {
		    if ($scope.testValue !== '') {
		        angular.forEach($scope.tierDetails.events, function(evt) {
		            evt.label = $scope.testValue;
		        });
		    }
		};
		
		$scope.$on('renameLabel', function(e) {
		    $scope.renameLabel(viewState.getcurClickTierName(),viewState.getlastID(),$("."+viewState.getlasteditArea()).val());
		    viewState.deleteEditArea();
		});
		
	    $scope.renameLabel = function(tier,id,name) {
	        var i = 0;
            angular.forEach($scope.tierDetails.events, function(evt) {
                if(id==i) {
		            evt.label = name;
		        }
		        ++i;
		    });      
        };
        
        $scope.getPCMpp = function(event) {
            var start = parseInt($scope.viewState.sS,10);
            var end = parseInt($scope.viewState.eS,10);
            return (end-start)/event.originalEvent.srcElement.clientWidth;      
        }
        
        $scope.getEventId = function(x,event) {
            var pcm = parseInt($scope.viewState.sS,10)+(x * $scope.getPCMpp(event)); 
            var id = 0;
            var ret = 0;
            angular.forEach($scope.tierDetails.events, function(evt) {
                if(pcm>=evt.startSample && pcm <= (evt.startSample+evt.sampleDur)) {
		            ret=id;
		        }
		        ++id;
		    });      
		    return ret;
        }
        
        
        $scope.getEvent = function(x,event) {
            var pcm = parseInt($scope.viewState.sS,10)+(x * $scope.getPCMpp(event)); 
            var evtr = null;
		    angular.forEach($scope.tierDetails.events, function(evt) {
		        if(pcm>=evt.startSample && pcm <= (evt.startSample+evt.sampleDur)) {
		            evtr=evt;
		        }
		    });      
            return evtr;
        }        	
		
		
});
