var csvData = []

const population = {
    "Samtgemeinde Dörpen": 15672,
    "Einheitsgemeinde Emsbüren": 9886,
    "Samtgemeinde Freren": 5113,
    "Einheitsgemeinde Geeste": 11337,
    "Stadt Haren (Ems)": 23029,
    "Stadt Haselünne": 12840,
    "Samtgemeinde Herzlake": 4097,
    "Samtgemeinde Lathen": 11122,
    "Samtgemeinde Lengerich": 22234,
    "Stadt Lingen (Ems)": 54708,
    "Stadt Meppen": 34862,
    "Samtgemeinde Nordhümmling": 12226,
    "Stadt Papenburg": 35268,
    "Einheitsgemeinde Rhede (Ems)": 4218,
    "Einheitsgemeinde Salzbergen": 7590,
    "Samtgemeinde Sögel": 15923,
    "Samtgemeinde Spelle": 8442,
    "Einheitsgemeinde Twist": 9621,
    "Samtgemeinde Werlte": 9407,
    "Gesamt": 325657,
};

function fetchCSVData(url){
    console.log("fetch data start");
    return d3.csv(url, function (data) {
        var parseTime = d3.timeParse("%Y-%m-%d")
        var factor100k = (population[data.kommune] / 100000)
        return {
            datumDate:  parseTime(data['#datum']),
            datumString: data['#datum'],
            kommune: data.kommune,
            faelle: +data.faelle,
            faelle100k: +data.faelle/factor100k,
            genesen: +data.genesen,
            genesen: +data.genesen/factor100k,
            verstorben: +data.verstorben,
            verstorben100k: +data.verstorben/factor100k,
            current: +data.current,
            current100k: +data.current/factor100k
        };
    }).then(function (data) {
        generateAllDataGraph(data);
        csvData = data
        console.log("fetch data end");
    });
}

function generateAllDataGraph(data) {
    console.log("START generateAllDataGraph");
    var xValues = Array.from(d3.group(data, d => d.datumString).keys())
    var dataSets = Array.from(d3.group(data, d => d.kommune));

    window.chartColors = {
        red: 'rgb(255, 99, 132)',
        orange: 'rgb(255, 159, 64)',
        yellow: 'rgb(255, 205, 86)',
        green: 'rgb(75, 192, 192)',
        blue: 'rgb(54, 162, 235)',
        purple: 'rgb(153, 102, 255)',
        grey: 'rgb(201, 203, 207)',
    };

    var chart = {
        type: 'line',
        data: {
            labels: xValues,
            datasets: []
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: 'Fälle (kummuliert) aller Kommunen'
            },
            tooltips: {
                mode: 'index',
                intersect: false,
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            scales: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Month'
                    }
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Value'
                    }
                }]
            }
        }
    };

    var ds = dataSets.forEach(function(d){
        var colorNames = Object.keys(window.chartColors);
        var col = colorNames[chart.data.datasets.length % colorNames.length];
        // if(isKommuneSelected(d[0]))
        // {
            var newDataset = {
				label: d[0],
				backgroundColor: col,
				borderColor: col,
				data: d[1].map(d => d.faelle),
                fill: false,
                hidden: true
            }
            chart.data.datasets.push(newDataset);
        // }
    })
    
	var ctx = document.getElementById('canvas').getContext('2d');
    window.myLine = new Chart(ctx, chart);

    console.log("END generateAllDataGraph");
}

window.addEventListener("load", function () {
    console.log("START");
    var csvRawUrl = "https://raw.githubusercontent.com/quatzli/quatzli.github.io/main/corona/zahlen_emsland.csv";
    fetchCSVData(csvRawUrl);
    console.log("END");
});

function loadData(){
    console.log("START loadData")
    generateAllDataGraph(csvData)
    console.log("END loadData")
}