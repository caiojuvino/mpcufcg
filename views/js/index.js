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

/** Cria o mapa. */
var ufcg = ol.proj.fromLonLat([-35.9095, -7.2144]);// todas barreiras: [-35.911, -7.2343]
var view = new ol.View({center: ufcg, zoom: 17}); //zoom = 17
var map = new ol.Map({
	layers: [new ol.layer.Tile({
		preload: 4,
		source: new ol.source.OSM()
	})],
	overlays: [overlay],
	target: 'map',
	loadTilesWhileAnimating: true,
	view: view
});

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
function addDadoOficial(id, lon, lat, tipo) {
	var newDiv = document.createElement('div');
	newDiv.id =  id;
	
	if ($.inArray(tipo, [ 'PILAR', 'PLACA', 'POSTE']) > -1) {
		tipo = 'POSTE_PILAR_PLACA';
	}
	
	newDiv.classList.add('dadoOficial', 'marker', tipo);
	addDivToMap(map, newDiv, lon, lat);
}

/** Pede json de dados oficiais do servidor. */
$.ajax({
	dataType: 'json',
	url: '/dadosOficiais',
	complete: function(data) {
		var DOArray = JSON.parse(data.responseText);	
		
		for (i = 0; i < DOArray.length; i++) {
			if (DOArray[i].visivelAplicacao == true){
				addDadoOficial(DOArray[i].id, DOArray[i].longitude, DOArray[i].latitude, DOArray[i].tipo);	
			}		
		}
		
		$('.dadoOficial').click(function(){
			var obj;
			
			for (i = 0; i < DOArray.length; i++) {
				if(DOArray[i].id === this.id){
					obj = DOArray[i];
					break;
				}
			}
			
			content.innerHTML = 
				`<b>Dado Oficial</b><br/>
				Tipo: ${typeMap[obj.tipo]} <br/>
				Latitude: ${obj.latitude} <br/>
				Longitude: ${obj.longitude}`;
			overlay.setPosition(ol.proj.fromLonLat([obj.longitude, obj.latitude]));
		});
	}
})

/** Adiciona barreiras ao mapa. */
function addBarreira(id, lon, lat, tipo, nivel) {
	if (nivel != undefined) {
		var newDiv = document.createElement('div');
		newDiv.id = 'b' + id;
		newDiv.classList.add('barreira', 'marker', tipo, nivel);
		addDivToMap(map, newDiv, lon, lat);
	}
}

var selected = null;

/** Pede json de barreiras do servidor. */
$.ajax({
	dataType: 'json',
	url: '/barreiras',
	complete: function(data) {
		var BArray = JSON.parse(data.responseText);	
		var decPoint = 0.000001;

		/** Adiciona barreiras do json. */
		for (i = 0; i < BArray.length; i++) {
			if (BArray[i].visivelAplicacao == true){
				addBarreira(BArray[i].id_barreita, BArray[i].posicaoMedia.mLongitudeE6 * decPoint, 
				BArray[i].posicaoMedia.mLatitudeE6 * decPoint, BArray[i].tipo, BArray[i].nivelDePerigo);
			}
		}

		/** Evento de clique numa barreira. */
		$('.barreira').click(function(){
			if(selected != null){
				document.getElementById(selected.id).setAttribute('style', "background-image: url('../img/bMarker.png');");
			}
			
			///// this.setAttribute('style', "background-image: url('../img/sMarker.png');");
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
				Nível: ${riskMap[obj.nivelDePerigo]} <br/> 
				Tipo: ${typeMap[obj.tipo]} <br/> 
				Latitude: ${Number((latd).toFixed(7))} <br/> 
				Longitude: ${Number((lngd).toFixed(7))}`;
			overlay.setPosition(ol.proj.fromLonLat([lngd, latd]));

			$('#show').click(function() {
				$.ajax({
					dataType: 'json',
					url: '/teste?id=' + obj.id_barreita,
					complete: function(data) {
						var decPoint = 0.000001;
						var GArray = JSON.parse(data.responseText);
						
						for (i = 0; i < GArray.length; i++) {
							console.log('lat: '+ GArray[i].latitude + ', lng: '+ GArray[i].longitude);
							var newDiv = document.createElement("div");
							newDiv.id = 'g' + GArray[i].id_barreita;
							newDiv.classList.add('barreira','marker');
							addDivToMap(map, newDiv, GArray[i].longitude, GArray[i].latitude);
						}
					}
				})
			});
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

/** Checa se nenhuma checkbox de um grupo de id informado está marcada. */
function checkNoneChecked(id){
	// return $(`#${id} > input:checked`).length == $(`#${id} > input`).length; //se todas checkboxes filhas de id tão checked
	console.log($(`#${id} > input:checked`).length == 0);
	return $(`#${id} > input:checked`).length == 0;
}

/** Muda estado de um grupo de checkboxes. */
function toggleFilter(id, boolean){
	$(`#${id} > input`).each(function() {
		$(this).prop('checked', boolean);
	});
}

/** Filtra markers por tipo. */
function filterByMarker(element) {
	if (element.className === 'b') {
		if(element.checked) {
			for (var key in boxBarreiraState){
				if(boxBarreiraState[key]){
					$(`.barreira.${key}`).fadeIn();
				}
			} 
		}
		else {
			$('.barreira').fadeOut();
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
}

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