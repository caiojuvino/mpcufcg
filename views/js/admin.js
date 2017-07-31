// $('#mouse-position').hide();

var typeMap = {
	'ARVORE':'Árvore',
	'BANCO':'Banco',
	'BURACO':'Buraco',
	'DEGRAU':'Degrau',
	'ESCADA':'Escada',
	'HIDRANTE':'Hidrante',
	'OBJETO_ELEVADO':'Objeto Elevado',
	'OBJETO_RASTEIRO':'Objeto Rasteiro',
	'ORELHAO':'Orelhão',
	'PILAR':'Pilar',
	'POSTE':'Poste',
	'PLACA':'Placa',
	'POSTE_PILAR_PLACA':'Pilar, Placa ou Poste',
	'TERRENO_DESNIVELADO':'Terreno Desnivelado',
	'OUTRO':'Outro'
}

var riskMap = {
	'MUITO_BAIXO':'Muito Baixo',
	'BAIXO':'Baixo',
	'MEDIO':'Médio',
	'ALTO':'Alto',
	'MUITO_ALTO':'Muito Alto'
}

boxBarreiraState = {
	'ARVORE':true,
	'BANCO':true,
	'BURACO':true,
	'DEGRAU':true,
	'ESCADA':true,
	'HIDRANTE':true,
	'OBJETO_ELEVADO':true,
	'OBJETO_RASTEIRO':true,
	'ORELHAO':true,
	'PILAR':true,
	'POSTE':true,
	'PLACA':true,
	'POSTE_PILAR_PLACA':true,
	'TERRENO_DESNIVELADO':true,
	'OUTRO':true
}

boxOficialState = {
	'ARVORE':true,
	'BANCO':true,
	'BURACO':true,
	'DEGRAU':true,
	'ESCADA':true,
	'HIDRANTE':true,
	'OBJETO_ELEVADO':true,
	'OBJETO_RASTEIRO':true,
	'ORELHAO':true,
	'PILAR':true,
	'POSTE':true,
	'PLACA':true,
	'POSTE_PILAR_PLACA':true,
	'TERRENO_DESNIVELADO':true,
	'OUTRO':true
}

$('#gToggler, #gen, #alg').hide()

//-------------------------------

var mousePositionControl = new ol.control.MousePosition({
	coordinateFormat: ol.coordinate.createStringXY(6),
	projection: 'EPSG:4326',
	// comment the following two lines to have the mouse position be placed within the map.
	className: 'custom-mouse-position',
	target: document.getElementById('mouse-position'),
	undefinedHTML: '&nbsp;'
});

const sel = 'Selecionar';
const fin = 'Concluir';

function activatePol(){
	if($('#drawBtn').html() == fin){
		$('#drawBtn').html(sel);
		source.clear();
	}
	else {
		$('#drawBtn').html(fin);
	}
	map.removeInteraction(draw);
	addInteraction();
}

var draw; // global so we can remove it later

/** Elementos que formam o popup. */
var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');

/** Cria um overlay para fixar popup ao mapa. */
var overlay = new ol.Overlay(/** @type {olx.OverlayOptions} */ ({
	element: container, autoPan: true, autoPanAnimation: {duration: 250}}));

/** Adiciona um click handler para esconder o popup.
* @return {boolean} Não seguir o href. */
closer.onclick = function() {
	overlay.setPosition(undefined);
	closer.blur();
	return false;
};

// camada do mapa
var raster = new ol.layer.Tile({
	preload: 4,
	source: new ol.source.OSM()
});

var source = new ol.source.Vector({
	wrapX: false
});

var vector = new ol.layer.Vector({
	source: source
});

/** Cria o mapa. */
var ufcg = ol.proj.fromLonLat([-35.9095, -7.2144]);// todas barreiras: [-35.911, -7.2343]
var view = new ol.View({center: ufcg, zoom: 17}); //zoom = 17
var map = new ol.Map({
	controls: ol.control.defaults({
		attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
			collapsible: false
		})
    }).extend([mousePositionControl]),
	layers: [raster, vector],
	overlays: [overlay],
	target: 'map',
	loadTilesWhileAnimating: true,
	view: view
});

var arr = [];
var idsBarreiras = [];
var idsOficiais = [];
var startPos;
var endPos;

function addInteraction() {
	var value = $('#drawBtn').html();
	
	if (value !== sel) {
		draw = new ol.interaction.Draw({
		    source: source,
		    type: /** @type {ol.geom.GeometryType} */ ('Circle'),
		    geometryFunction: ol.interaction.Draw.createBox()
		});

		draw.on('drawstart', function(){
			startPos = document.getElementById('mouse-position').textContent.split(', ');
			source.clear();
			arr = [];
			idsBarreiras = [];
			idsOficiais = [];
		});
		
		draw.on('drawend', function(){
			endPos = document.getElementById('mouse-position').textContent.split(', ');
			
			$('.dadoOficial, .barreira').each(function(){

				var mrk;
				var coord2;
				var coord1;
				var isBarreira = false;
				var isOficial = false;

				if (this.classList.contains('barreira') && !this.classList.contains('geradora')){
					for(i = 0; i < BArray.length; i++){
						if(BArray[i].id_barreita === this.id.substring(1)){
							mrk = BArray[i];
							break;
						}
					}
					coord2 = Number((mrk.posicaoMedia.mLatitudeE6 * decPoint).toFixed(7));
					coord1 = Number((mrk.posicaoMedia.mLongitudeE6 * decPoint).toFixed(7));
					isBarreira = true;
				}
				else if(this.classList.contains('dadoOficial')){
					for (i = 0; i < DOArray.length; i++) {
						if(DOArray[i].id === this.id){
							mrk = DOArray[i];
							break;
						}
					}
					coord2 = mrk.latitude;
					coord1 = mrk.longitude;
					isOficial = true;
				}
				else {
					return;
				}

				if(between(coord1, parseFloat(startPos[0]), parseFloat(endPos[0])) &&
					between(coord2, parseFloat(startPos[1]), parseFloat(endPos[1])) &&
					$(this).is(":visible")) {
					arr.push(mrk);
					
					if(isBarreira){
						idsBarreiras.push(mrk.id_barreita);
						//console.log(mrk.id_barreita);
					}
					else if(isOficial){
						idsOficiais.push(mrk.id);
						//console.log(mrk.id);
					}
				}
			});
			console.log(arr);
			console.log(idsBarreiras);
			console.log(idsOficiais);
		});
		map.addInteraction(draw);
	}
}
addInteraction();

function logSelected(){
	arr = [];
	$('.dadoOficial, .barreira').each(function() {
		var mrk;
		var coord2;
		var coord1;

		if (this.classList.contains('barreira') && !this.classList.contains('geradora')){
			for(i = 0; i < BArray.length; i++){
				if(BArray[i].id_barreita === this.id.substring(1)){
					mrk = BArray[i];
					break;
				}
			}
			coord2 = Number((mrk.posicaoMedia.mLatitudeE6 * decPoint).toFixed(7));
			coord1 = Number((mrk.posicaoMedia.mLongitudeE6 * decPoint).toFixed(7));
		}
		else if(this.classList.contains('dadoOficial')){
			for (i = 0; i < DOArray.length; i++) {
				if(DOArray[i].id === this.id){
					mrk = DOArray[i];
					break;
				}
			}
			coord2 = mrk.latitude;
			coord1 = mrk.longitude;
		}
		else {
			return;
		}

		if(startPos != null && between(coord1, parseFloat(startPos[0]), parseFloat(endPos[0])) &&
			between(coord2, parseFloat(startPos[1]), parseFloat(endPos[1])) &&
			$(this).is(":visible")) {
			
			arr.push(mrk);
		}
	});
}

function between(val, n1, n2){
	return val <= Math.max(n1, n2) && val >= Math.min(n1, n2);
}

/** Adiciona um overlay ao mapa */
function addDivToMap(map, div, lon, lat){
	document.getElementsByTagName('body')[0].appendChild(div);
	map.addOverlay(new ol.Overlay({
		position: ol.proj.fromLonLat([lon, lat]),
		positioning: 'center-center',
		element: div,
		stopEvent: false
	}));
}

/** Adiciona dados oficiais ao mapa. */
function addDadoOficial(id, lon, lat, tipo, visivel) {
	var newDiv = document.createElement('div');
	newDiv.id =  id;
	
	if ($.inArray(tipo, [ 'PILAR', 'PLACA', 'POSTE']) > -1) {
		tipo = 'POSTE_PILAR_PLACA';
	}
	
	newDiv.classList.add('dadoOficial', 'marker', tipo, visivel);
	addDivToMap(map, newDiv, lon, lat);
}

/** Pede json de dados oficiais do servidor. */
$.ajax({
	dataType: 'json',
	url: '/dadosOficiais',
	complete: function(data) {
		DOArray = JSON.parse(data.responseText);	
		
		for (i = 0; i < DOArray.length; i++) {
			addDadoOficial(DOArray[i].id, DOArray[i].longitude, DOArray[i].latitude, DOArray[i].tipo, DOArray[i].visivelAplicacao);
		}
		
		$('.dadoOficial').click(function(){
			removerGeradoras();
			
			$('#gToggler, #alg').fadeOut();
			var obj;
			
			for (i = 0; i < DOArray.length; i++) {
				if(DOArray[i].id === this.id){
					obj = DOArray[i];
					break;
				}
			}
			
			content.innerHTML = 
				`<b>Dado Oficial</b><br/> 
				ID: ${obj.id} <br/>
				Tipo: ${typeMap[obj.tipo]} <br/>
				Latitude: ${obj.latitude} <br/>
				Longitude: ${obj.longitude} <br/>
				Data de Identificação:<br/> ${obj.dataIdentificacao}<br/>
				Disponível no App Móvel: ${fixMap[obj.visivelAplicacao]}`;
			overlay.setPosition(ol.proj.fromLonLat([obj.longitude, obj.latitude]));
		});
	}
})

/** Adiciona barreiras ao mapa. */
function addBarreira(id, lon, lat, tipo, nivel, visivel) {
	if (nivel != undefined) {
		var newDiv = document.createElement('div');
		newDiv.id = 'b' + id;
		newDiv.classList.add('barreira', 'marker', tipo, nivel, visivel);
		addDivToMap(map, newDiv, lon, lat);
	}
}

var decPoint = 0.000001;
var selected = null;
var fixMap = {
	'true':'Sim',
	'false':'Não'
}

/** Pede json de barreiras do servidor. */
$.ajax({
	dataType: 'json',
	url: '/barreiras',
	complete: function(data) {
		BArray = JSON.parse(data.responseText);

		/** Adiciona barreiras do json. */
		for (i = 0; i < BArray.length; i++) {
			addBarreira(BArray[i].id_barreita, BArray[i].posicaoMedia.mLongitudeE6 * decPoint, 
				BArray[i].posicaoMedia.mLatitudeE6 * decPoint, BArray[i].tipo, BArray[i].nivelDePerigo, BArray[i].visivelAplicacao);
		}

		/** Evento de clique numa barreira. */
		$('.barreira').click(function(){
			removerGeradoras();
			document.getElementById('gToggler').innerHTML = 'Mostrar Barreiras Geradoras';
			$('#gToggler, #alg').fadeIn();

			
			$('#posicaoConvexHull').prop('checked', false);
			$('#posicaoMediana').prop('checked', false);

			if(selected != null){
				document.getElementById(selected.id).setAttribute('style', "background-image: url('../img/bMarker.png');");
			}
			
			this.setAttribute('style', "background-image: url('../img/meanMarker.png');");
			selected = this;
			var obj;
			
			for (i = 0; i < BArray.length; i++) {
				if(BArray[i].id_barreita === this.id.substring(1)){
					obj = BArray[i];
					break;
				}
			}

			var latd = obj.posicaoMedia.mLatitudeE6 * decPoint;
			var lngd = obj.posicaoMedia.mLongitudeE6 * decPoint
			content.innerHTML = 
				`<b>Barreira</b><br/>
				ID: ${obj.id_barreita} <br/>
				Fixa: ${fixMap[obj.fixa]} <br/>
				Nível: ${riskMap[obj.nivelDePerigo]} <br/>
				Tipo: ${typeMap[obj.tipo]} <br/>
				Latitude: ${Number((latd).toFixed(7))} <br/>
				Longitude: ${Number((lngd).toFixed(7))} <br/>
				Disponível no App Móvel: ${fixMap[obj.visivelAplicacao]}`;
			overlay.setPosition(ol.proj.fromLonLat([lngd, latd]));
		});
	}
})

/** Adiciona POIs ao mapa. */
function addPOI(id, lon, lat) {
	var newDiv = document.createElement('div');
	newDiv.id =  id;
	newDiv.classList.add('poi');
	newDiv.classList.add('marker');
	document.getElementsByTagName('body')[0].appendChild(newDiv);
	marker = new ol.Overlay({
			position: ol.proj.fromLonLat([lon, lat]), positioning: 'center-center', element: document.getElementById(newDiv.id),
			stopEvent: false});
	map.addOverlay(marker);
}

/** Pede json de POIs do servidor. */
$.ajax({
	dataType: 'json',
	url: '/googleMaps',
	complete: function(data) {
		var gMapGet = JSON.parse(data.responseText);
		var poiArray = gMapGet.results;
		
		for (i = 0; i < poiArray.length; i++) {
			var loctn = poiArray[i].geometry.location;
			addPOI(poiArray[i].id, loctn.lng, loctn.lat);
		}		
		
		$('.poi').click(function(){
			removerGeradoras();
			
			$('#gToggler, #alg').fadeOut();
			var obj;
			
			for (i = 0; i < poiArray.length; i++) {
				if(poiArray[i].id === this.id){
					obj = poiArray[i];
					break;
				}
			}
			
			var location = poiArray[i].geometry.location;
			var latd = location.lat;
			var lngd = location.lng;	
			content.innerHTML = 
				`<b>Ponto de Interesse </b><img src='${obj.icon}'/><br/>
				Nome: ${poiArray[i].name}<br/>
				Latitude: ${Number((latd).toFixed(7))}<br/>
				Longitude: ${Number((lngd).toFixed(7))}`;
			overlay.setPosition(ol.proj.fromLonLat([lngd, latd]));
		});
	}
})

/** Muda estado de um grupo de checkboxes. */
function toggleFilter(id, boolean){
	$(`#${id} > input`).each(function() {
		$(this).prop('checked', boolean);
	});
}

function filterByVisibility(element) {
	/*
	if (!$('#disp').prop('checked') && !$('#indisp').prop('checked')){
		$('#bChecker').prop('checked', false);
	}
	else if ($('#disp').prop('checked') && $('#indisp').prop('checked')	){
		$('#bChecker').prop('checked', true);
	}
	*/
	
	if (element.id === 'disp') {
		if(element.checked) {
			$('.true').fadeIn();
		}
		else {
			$('.true').fadeOut();
			// $('.barreira').fadeOut();
		}
	} else if (element.id === 'indisp') {
		if(element.checked) {
			$('.false').fadeIn();
		}
		else {
			$('.false').fadeOut();
			// $('.barreira').fadeOut();
		}
	}
}


/** Filtra markers por tipo. */
function filterByMarker(element) {
	/*
	if (!$('#bChecker').prop('checked') && !$('#dChecker').prop('checked')){
		toggleFilter('typeFilter', false);
	}
	else if ($('#bChecker').prop('checked') && $('#dChecker').prop('checked')	){
		toggleFilter('typeFilter', true);
	}
	*/

	if (element.className === 'b') {
		if(element.checked) {
			// $('#disp').prop('checked', true);
			// $('#indisp').prop('checked', true);
			for (var key in boxBarreiraState){
				if(boxBarreiraState[key]){
					//console.log(key);
					//console.log(boxBarreiraState[key]);
					$(`.barreira.${key}`).fadeIn();
				}
			} 
			//$('.barreira').fadeIn();
			//toggleFilter('riskFilter', true);
		}
		else {
			$('.barreira').fadeOut();
			// $('#disp').prop('checked', false);
			// $('#indisp').prop('checked', false);
			//toggleFilter('riskFilter', false);
		}
	}
	else if (element.className === 'd') {
		if(element.checked) {
			for (var key in boxOficialState){
				if(boxOficialState[key]){
					$(`.dadoOficial.${key}`).fadeIn();
				}
			} 
		}
		else {
			$('.dadoOficial').fadeOut();
		}
	}
	else if (element.className === 'p') {
		if(element.checked) {
			$('.poi').fadeIn();
		}
		else {
			$('.poi').fadeOut();
		}
	}
	
	setTimeout(function(){
		logSelected();
		console.log(arr);
	}, 500);
	
}

function runAlg(element) {
	var newDiv = document.createElement('div');
	newDiv.id = element.classList[0];
	console.log(newDiv.id);

	if (element.checked) {
		var prop =  element.id;
		newDiv.classList.add('marker', 'pos');

		for (i = 0; i < BArray.length; i++) {
			if(BArray[i].id_barreita === selected.id.substring(1)){
				obj = BArray[i];
				break;
			}
		}

		var lat = obj[prop].mLatitudeE6 * decPoint;
		var long = obj[prop].mLongitudeE6 * decPoint;
		
		addDivToMap(map, newDiv, long, lat);
	}
	else {
		$(`#${newDiv.id}`).remove();
	}
}

function removerGeradoras() {
	$('.geradora, .pos, #gen').fadeOut();
	$('.geradora, .pos').remove();
	
	if(selected != null){
		selected.setAttribute('style', "background-image: url('../img/bMarker.png');");
		//console.log(selected);
		//document.getElementById(selected.id).setAttribute('style', "background-image: url('../img/meanMarker.png');");
	}
}

$('#commit').click(function() {

	var consulta = '';
	var consultaOficiais = '';

	for(i = 0; i < idsBarreiras.length; i++) {
		if(i == idsBarreiras.length - 1){
			consulta = consulta + "id_barreira = " + idsBarreiras[i] + ";";
		}
		else {
			consulta = consulta + "id_barreira = " + idsBarreiras[i] + " OR ";
		}
	}

	for(i = 0; i < idsOficiais.length; i++) {
		if(i == idsOficiais.length - 1){
			consultaOficiais = consultaOficiais + "id = " + idsOficiais[i] + ";";
		}
		else {
			consultaOficiais = consultaOficiais + "id = " + idsOficiais[i] + " OR ";
		}
	}

	console.log(consulta);
	console.log();
	console.log(consultaOficiais);

	$.ajax({
		dataType: 'json',
		url: '/atualizarBarreirasDisponiveis?idsBarreiras=' + consulta + '&idsOficiais=' + consultaOficiais,
		complete: function(data) {
			console.log('commit ADMIN');
		}
	});
});

$('#gToggler').click(function() {
	if(this.innerHTML == 'Esconder Barreiras Geradoras'){
		removerGeradoras();
		this.innerHTML = 'Mostrar Barreiras Geradoras';
		selected.setAttribute('style', "background-image: url('../img/meanMarker.png');"); /////
	}
	else {
		this.innerHTML = 'Esconder Barreiras Geradoras';
		$('#gen').fadeIn();

		for(i=0;i<3;i++) {
			$(`#${selected.id}`).fadeTo('slow', 0.6).fadeTo('slow', 1.0);
		}

		$.ajax({
			dataType: 'json',
			url: '/teste?id=' + selected.id.substring(1),
			complete: function(data) {
				var decPoint = 0.000001;
				var GArray = JSON.parse(data.responseText);
				
				for (i = 0; i < GArray.length; i++) {
					var newDiv = document.createElement('div');
					newDiv.id = 'g' + GArray[i].id_barreita;
					newDiv.classList.add('barreira','marker','geradora');
					addDivToMap(map, newDiv, GArray[i].longitude, GArray[i].latitude);
				}

				////////////////////////////

				$('.geradora').click(function(){
					var obj;
					
					for (i = 0; i < GArray.length; i++) {
						console.log(GArray[i].id_barreita + ', ' + this.id.substring(1));
						if(GArray[i].id_barreita === this.id.substring(1)){
							obj = GArray[i];
							break;
						}
					}
						
					content.innerHTML =
						`<b>Geradora </b> <br/>
						ID: ${obj.id_barreita} <br/>
						Fixa: ${fixMap[obj.fixa]} <br/>
						Nível: ${riskMap[obj.nivelDePerigo]} <br/>
						Tipo: ${typeMap[obj.tipo]} <br/>
						Latitude: ${Number((obj.latitude).toFixed(7))} <br/>
						Longitude: ${Number((obj.longitude).toFixed(7))} <br/>
						Erro de GPS: ${obj.erroGPS}`;
					overlay.setPosition(ol.proj.fromLonLat([obj.longitude, obj.latitude]));
				});

				/////////////////////////////////////////////////////////////////

				for(i = 0; i < 3; i++) {
					$('.geradora').fadeTo('slow', 0.6).fadeTo('slow', 1.0);
				}
			}
		})
	}
});

/** Filtra barreiras por tipo. */
function filterByType(element) {
	id = element.id;	
	
	if (element.checked) {
		if ($('#dChecker').prop('checked')) {
			$(`.${id}.dadoOficial`).fadeIn();
		}
		if ($('#bChecker').prop('checked')) {
			$(`.${id}.barreira`).fadeIn();
		}
	}
	else {
		$(`.${id}`).fadeOut();
	}
	boxBarreiraState[id] = element.checked;
	boxOficialState[id] = element.checked;
	console.log(boxBarreiraState);
}

/** Filtra barreiras por dificuldade. */
function filterByRisk(element) {
	id = element.id;

	$('.barreira').each(function() {
		if (this.classList[3] == element.id) {
			if(element.checked && $('#bChecker').prop('checked')) {
				$(`.${id}`).fadeIn();
			}
			else {
				$(`.${id}`).fadeOut();
			}
		}
	});
}