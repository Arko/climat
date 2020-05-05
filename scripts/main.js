// Paramètres des visualisations
const width = 600;
const height = 300;
const margin = { top: 20, right: 0, bottom: 20, left: 20 };

// Données complètes
let meteoData;

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
	d3.dsv(';', 'data/NBCN-m_1864-2018.csv', function (d) {
		return {
			station: d.stn,
			year: parseInt(d.time.substr(0, 4)),
			month: parseInt(d.time.substr(4, 2)),
			temp_moy: parseFloat(d.tre200m0)
		}
	}).then(onDataLoaded);
}

function onDataLoaded(data) {
	// Stocker ces données dans une variable déclarée dans le scope de ce
	// script. Permettant ainsi d'utiliser ces données dans d'autres fonctions
	meteoData = data;
	
	// Executer le code D3 des visualisations avec des paramètres par défaut
	graphMonthlyAverageTemperatures('NEU', 2018);
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
}

// Fonction d'affichage de la visualisation
// "MonthlyAverageTemperatures" ("mat") - Execution potentiellement multiple
function graphMonthlyAverageTemperatures(station, year) {
	
	// Filtrer les données pour isoler la station et l'année
	const data = meteoData.filter(d => d.station === station && d.year === year);

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
// [ ] Implement station selection menu
// [ ] Implement year change with slider
// [ ] Implement swiss map for station selection
// [ ] yearlyAverageTemperatures viz
// [ ] Animate visualizations
