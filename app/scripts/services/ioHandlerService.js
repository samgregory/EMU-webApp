'use strict';

angular.module('emuwebApp')
	.service('Iohandlerservice', function Iohandlerservice($rootScope, $http, $location, $q, HistoryService, viewState, Soundhandlerservice, Ssffparserservice, Wavparserservice, Textgridparserservice, ConfigProviderService, Espsparserservice, Ssffdataservice, Websockethandler) {
		// shared service object
		var sServObj = {};

		sServObj.wsH = Websockethandler;

		/**
		 * default config is always loaded from same origin
		 */
		sServObj.httpGetDefaultConfig = function () {
			var prom = $http.get('configFiles/defaultConfig.json');
			return prom;
		};

		/**
		 * default config is always loaded from same origin
		 */
		sServObj.httpGetPath = function (path, respType) {
			var prom = $http.get(path, {
				responseType: respType
			});
			return prom;
		};

		////////////////////////////
		// EMU-webApp protocol begins here
		//

		/**
		 *
		 */
		sServObj.getProtocol = function () {
			var getProm;

			if (ConfigProviderService.vals.main.comMode === 'CORS') {
				alert('CORS version of getProtocol not implemented');
			} else if (ConfigProviderService.vals.main.comMode === 'WS') {
				getProm = Websockethandler.getProtocol();
			}

			return getProm;
		};

		/**
		 *
		 */
		sServObj.getDoUserManagement = function () {
			var getProm;

			if (ConfigProviderService.vals.main.comMode === 'CORS') {
				alert('CORS version of getDoUserManagement not implemented');
			} else if (ConfigProviderService.vals.main.comMode === 'WS') {
				getProm = Websockethandler.getDoUserManagement();
			}

			return getProm;
		};

		/**
		 *
		 */
		sServObj.getDBconfigFile = function (nameOfDB) {
			var getProm;

			if (ConfigProviderService.vals.main.comMode === 'CORS') {
				alert('CORS version of getDBconfigFile not implemented');
			} else if (ConfigProviderService.vals.main.comMode === 'WS') {
				getProm = Websockethandler.getDBconfigFile();
			} else if (ConfigProviderService.vals.main.comMode === 'DEMO') {
				getProm = $http.get('demoDBs/' + nameOfDB + '/' + nameOfDB + '_DBconfig.json');
			}

			return getProm;
		};

		/**
		 *
		 */
		sServObj.getBundleList = function (nameOfDB) {
			var getProm;

			if (ConfigProviderService.vals.main.comMode === 'CORS') {
				alert('CORS version of getBundleList not implemented');
			} else if (ConfigProviderService.vals.main.comMode === 'WS') {
				getProm = Websockethandler.getBundleList();
			} else if (ConfigProviderService.vals.main.comMode === 'DEMO') {
				getProm = $http.get('demoDBs/' + nameOfDB + '/' + nameOfDB + '_bundleList.json');
			}

			return getProm;
		};

		/**
		 *
		 */
		sServObj.getBundle = function (name, nameOfDB) {
			var getProm;

			if (ConfigProviderService.vals.main.comMode === 'CORS') {
				alert('CORS version of getBundle not implemented');
			} else if (ConfigProviderService.vals.main.comMode === 'WS') {
				getProm = Websockethandler.getBundle(name);
			} else if (ConfigProviderService.vals.main.comMode === 'DEMO') {
				// getProm = $http.get('testData/newAE/SES0000/' + name + '/' + name + '.json');
				getProm = $http.get('demoDBs/' + nameOfDB + '/' + name + '_bndl.json');
			}

			return getProm;
		};


		/**
		 *
		 */
		sServObj.saveBundle = function (bundleData) {
			var getProm;

			if (ConfigProviderService.vals.main.comMode === 'CORS') {
				alert('CORS version of saveBundle not implemented');
			} else if (ConfigProviderService.vals.main.comMode === 'WS') {
				getProm = Websockethandler.saveBundle(bundleData);
			}
			// else if (ConfigProviderService.vals.main.comMode === 'DEMO') {
			// getProm = $http.get('testData/newAE/SES0000/' + name + '/' + name + '.json');
			// 	getProm = $http.get('testData/testAeBundle.json'); // SIC SIC SIC HARDCODED -> name is ignored
			// }

			return getProm;
		};

		//
		// EMU-webApp protocol ends here
		////////////////////////////

		/**
		 * pass through to according parser
		 */
		sServObj.parseLabelFile = function (string, annotates, name, fileType) {
			var prom;
			if (fileType === 'ESPS') {
				prom = Espsparserservice.asyncParseEsps(string, ConfigProviderService.embeddedVals.labelGetUrl, 'embeddedESPS');
			} else if (fileType === 'TEXTGRID') {
				prom = Textgridparserservice.asyncParseTextGrid(string, ConfigProviderService.embeddedVals.labelGetUrl, 'embeddedTEXTGRID');
			}

			return prom;
		};


		return sServObj;
	});