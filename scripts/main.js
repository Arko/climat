// Paramètres des visualisations
const width = 600;
const height = 300;
const margin = { top: 20, right: 0, bottom: 20, left: 20 };

// Dictionnaire de stations
const stations = [
	{ id: 'ALT', name: 'Altdorf', pos: '8:37/46:53', alt: 438 },
	{ id: 'ANT', name: 'Andermatt', pos: '8:35/46:38', alt: 1438 },
	{ id: 'RAG', name: 'Bad Ragaz', pos: '9:30/47:01', alt: 496 },
	{ id: 'BAS', name: 'Basel / Binningen', pos: '7:35/47:32', alt: 316 },
	{ id: 'BER', name: 'Bern / Zollikofen', pos: '7:28/46:59', alt: 552 },
	{ id: 'CHD', name: 'Château-d\'Oex', pos: '7:08/46:29', alt: 1028 },
	{ id: 'CHM', name: 'Chaumont', pos: '6:59/47:03', alt: 1136 },
	{ id: 'GSB', name: 'Col du Grand St-Bernard', pos: '7:10/45:52', alt: 2472 },
	{ id: 'DAV', name: 'Davos', pos: '9:51/46:49', alt: 1594 },
	{ id: 'ELM', name: 'Elm', pos: '9:11/46:55', alt: 957 },
	{ id: 'ENG', name: 'Engelberg', pos: '8:25/46:49', alt: 1035 },
	{ id: 'GVE', name: 'Genèvve / Cointrin', pos: '6:08/46:15', alt: 410 },
	{ id: 'GRC', name: 'Grächen', pos: '7:50/46:12', alt: 1605 },
	{ id: 'GRH', name: 'Grimsel Hospiz', pos: '8:20/46:34', alt: 1980 },
	{ id: 'JUN', name: 'Jungfraujoch', pos: '7:59/46:33', alt: 3580 },
	{ id: 'CDF', name: 'La Chaux-de-Fonds', pos: '6:48/47:05', alt: 1017 },
	{ id: 'OTL', name: 'Locarno / Monti', pos: '8:47/46:10', alt: 366 },
	{ id: 'LUG', name: 'Lugano', pos: '8:58/46:00', alt: 273 },
	{ id: 'LUZ', name: 'Luzern', pos: '8:18/47:02', alt: 454 },
	{ id: 'MER', name: 'Meiringen', pos: '8:10/46:44', alt: 588 },
	{ id: 'NEU', name: 'Neuchâtel', pos: '6:57/47:00', alt: 485 },
	{ id: 'PAY', name: 'Payerne', pos: '6:57/46:49', alt: 490 },
	{ id: 'SAM', name: 'Samedan', pos: '9:53/46:32', alt: 1708 },
	{ id: 'SAE', name: 'Säntis', pos: '9:21/47:15', alt: 2502 },
	{ id: 'SBE', name: 'S. Bernardino', pos: '9:11/46:28', alt: 1638 },
	{ id: 'SIA', name: 'Segl-Maria', pos: '9:46/46:26', alt: 1804 },
	{ id: 'SIO', name: 'Sion', pos: '7:20/46:13', alt: 482 },
	{ id: 'STG', name: 'St. Gallen', pos: '9:24/47:26', alt: 775 },
	{ id: 'SMA', name: 'Zürich / Fluntern', pos: '8:34/47:23', alt: 555 },
];

// Données complètes
let meteoData;

// Etat actuel de la visualisation
let currentStation = 'NEU';
let currentYear = 2018;

// Déclarations pour la visualisation monthlyAverageTemperatures ("mat")
// Sélections D3 d'éléments SVG (groupes)
let matBars;
let matTitles;
// Echelles D3
let matScaleX, matScaleY;
let matColorScale;

function setup () {
	// Charger les données (Attention: opération asynchrone !)
	loadData();

	// Préparer les éléments stables des visualisations
	// (élément svg, groupes svg, échelles D3)
	setupMonthlyAverageTemperatures();
}

function loadData() {
	// Attention, il s'agit d'une opération asynchrone !
	// Une fois les données chargées, la promise sera résolue (.then) et
	// le callback `onDataLoaded` sera appelé en passant les données en paramètre
	d3.dsv(';', `data/NBCN-m-${currentStation}-1864-2018.csv`, function (d) {
		return {
			station: d.stn,
			stationLongName: getStationLongName(d.stn),
			year: parseInt(d.time.substr(0, 4)),
			month: parseInt(d.time.substr(4, 2)),
			temp_moy: parseFloat(d.tre200m0)
		}
	}).then(onDataLoaded);
}

function getStationLongName(station) {
	return stations.find(s => s.id === station).name;
}

function onDataLoaded(data) {
	// Stocker ces données dans une variable déclarée dans le scope de ce
	// script. Permettant ainsi d'utiliser ces données dans d'autres fonctions
	meteoData = data;

	// Construire le menu de sélection des stations et maintenir à jour la sélection
	d3.select('#stations')
		.selectAll('option')
		.data(stations)
		.join('option')
			.attr('value', d => d.id)
			.text(d => d.name)
			.each(function (d) {
				const option = d3.select(this);
				if (d.id === currentStation) {
					option.attr('selected', '');
				} else {
					option.attr('selected', null);
				}
			})

	// Executer le code D3 des visualisations avec des paramètres par défaut
	graphMonthlyAverageTemperatures();
}

// Fonction de création et préparation des éléments stables de la visualisation
// "MonthlyAverageTemperatures" ("mat") - Execution unique
// (élément svg, groupes svg, échelles D3)
function setupMonthlyAverageTemperatures() {
	const minTemp = 0;
	const maxTemp = 25;

	// Création du SVG pour cette visualisation
	const svg = d3.select('.mat')
		.append('svg')
		.attr('width', width)
		.attr('height', height)
		.attr('style', 'font: 10px sans-serif');

	// Création de l'échelle horizontale
	matScaleX = d3.scaleBand()
		.domain([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
		.range([margin.left, width - margin.right])
		.padding(0.1)
		.round(true);
	
	// Création de l'échelle verticale
	matScaleY = d3.scaleLinear()
		.domain([minTemp, maxTemp])
		.range([height - margin.bottom - 5, margin.top])
		.interpolate(d3.interpolateRound);
	
	// Création de l'échelle de couleur
	matColorScale = d3.scaleSequential()
		.domain([minTemp, maxTemp])
		.interpolator(d3.interpolateBlues);

	// Création de groupes SVG pour les barres et titres du graphique
	matBars = svg.append('g');
	matTitles = svg.append('g')
		.style('fill', 'white')
		.attr('text-anchor', 'middle')
		.attr('transform', `translate(${matScaleX.bandwidth() / 2}, 6)`);

	// Création de l'axe horizontal
	svg.append('g')
		.attr('transform', `translate(0, ${height - margin.bottom})`)
		.call(d3.axisBottom(matScaleX))
		.call(g => g.select('.domain').remove());
	
	// Création de l'axe vertical
	svg.append('g')
		.attr('transform', `translate(${margin.left}, 0)`)
		.call(d3.axisLeft(matScaleY))
		.call(g => g.select('.domain').remove());

	// Enregistrement de l'événement de changement sur le menu local stations
	d3.select('#stations').on('change', (e) => {
		const station = d3.event.target.value;
		currentStation = station;
		loadData(); // Charger les données correspondantes 
	})
}

// Fonction d'affichage de la visualisation
// "MonthlyAverageTemperatures" ("mat") - Execution potentiellement multiple
function graphMonthlyAverageTemperatures() {
	
	// Filtrer les données pour isoler la station et l'année
	const data = meteoData.filter(d => d.station === currentStation && d.year === currentYear);

	// Barres
	matBars.selectAll('rect')
		.data(data)
		.join('rect') // Voir note
			.attr('width', matScaleX.bandwidth())
			.attr('height', d => matScaleY(0) - matScaleY(d.temp_moy))
			.attr('x', d => matScaleX(d.month))
			.attr('y', d => matScaleY(d.temp_moy))
			.style('fill', d => matColorScale(d.temp_moy));

	// Titres
	matTitles.selectAll('text')
		.data(data)
		.join('text')
			.attr('dy', '0.35em')
			.attr('x', d => matScaleX(d.month))
			.attr('y', d => matScaleY(d.temp_moy))
			.text(d => d.temp_moy);

	// Note (selection.join)
	// https://observablehq.com/@d3/selection-join
	// If the joining selection isn’t empty—as on subsequent iterations of the
	// loop above— selection.join appends entering elements and removes exiting
	// elements to match the data! Entering and updating elements are merged
	// (and ordered), allowing chained operations on the result.
}

// Lancement du script
setup();

// TODO:
// [x] monthlyAverageTemperatures viz
// [x] Implement station selection menu
// [ ] Implement year change with slider
// [ ] Implement swiss map for station selection
// [ ] yearlyAverageTemperatures viz
// [ ] Animate visualizations
