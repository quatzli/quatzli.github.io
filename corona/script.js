var csvData = []

var chart = {
    type: 'line',
    data: {
        labels: [],
        datasets: []
    },
    options: {
        responsive: true,
        title: {
            display: true,
            text: 'Corona im Emsland'
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

window.chartColors = [ 
    "FF0000", "00FF00", "0000FF", "FFFF00", "FF00FF", "00FFFF", "000000", 
    "800000", "008000", "000080", "808000", "800080", "008080", "808080", 
    "C00000", "00C000", "0000C0", "C0C000", "C000C0", "00C0C0", "C0C0C0", 
    "400000", "004000", "000040", "404000", "400040", "004040", "404040", 
    "200000", "002000", "000020", "202000", "200020", "002020", "202020", 
    "600000", "006000", "000060", "606000", "600060", "006060", "606060", 
    "A00000", "00A000", "0000A0", "A0A000", "A000A0", "00A0A0", "A0A0A0", 
    "E00000", "00E000", "0000E0", "E0E000", "E000E0", "00E0E0", "E0E0E0", 
];

{ // comment window.charColors
// window.chartColors = {
//     red: 'rgb(255, 99, 132)',
//     orange: 'rgb(255, 159, 64)',
//     lightblue: 'rgb(37, 182, 247)',
//     green: 'rgb(75, 192, 192)',
//     blue: 'rgb(54, 162, 235)',
//     purple: 'rgb(153, 102, 255)',
//     grey: 'rgb(201, 203, 207)',
//     pink: 'rgb(250, 6, 175)',
//     lila: 'rgb(70, 1, 224)',
//     black: 'rgb(0, 0, 0)'
// };
}

function fetchCSVData(url) {
    console.log("fetch data start");
    return d3.csv(url, function (data) {
        var parseTime = d3.timeParse("%Y-%m-%d")
        var factor100k = (population[data.kommune] / 100000)
        return {
            datumDate: parseTime(data['#datum']),
            datumString: data['#datum'],
            kommune: data.kommune,
            faelle: +data.faelle,
            faelle100k: +data.faelle / factor100k,
            genesen: +data.genesen,
            genesen100k: +data.genesen / factor100k,
            verstorben: +data.verstorben,
            verstorben100k: +data.verstorben / factor100k,
            current: +data.current,
            current100k: +data.current / factor100k
        };
    }).then(function (data) {
        generateAllDataGraph(data, "faelle", []);
        csvData = data
        console.log("fetch data end");
    });
}

function generateAllDataGraph(data, dataType, regions) {
    console.log("START generateAllDataGraph");

    var xValues = Array.from(d3.group(data, d => d.datumString).keys())
    var dataSets = Array.from(d3.group(data, d => d.kommune));

    chart.data.datasets = []
    chart.data.labels = xValues;

    var ds = dataSets.forEach(function (d) {

        var data = {}
        var labell = {}
        var chartTitle = ""

        // if region is in the selection, add to chart
        if (regions.indexOf(d[0]) > -1) {

            dataType.forEach(function (e){

                // get color for next diagram. 
                var col = window.chartColors[chart.data.datasets.length % window.chartColors.length];

                switch (e) {
                    case 'faelle':
                        label = d[0] + " faelle";
                        data = d[1].map(d => d.faelle)
                        break; 
                    case 'faelle100k':
                        label = d[0] + " faelle/100k";
                        data = d[1].map(d => d.faelle100k)
                        break;
                    case 'genesen':
                        label = d[0] + " genesene";
                        data = d[1].map(d => d.genesen)
                        break;
                    case 'verstorben':
                        label = d[0] + " verstorbene";
                        data = d[1].map(d => d.verstorben)
                        break;
                    case 'aktuell':
                        label = d[0] + " aktuell Infizierte";
                        data = d[1].map(d => d.current)
                        break;
                    case 'genesen100k':
                        label = d[0] + " genesene/100k";
                        data = d[1].map(d => d.genesen100k)
                        break;
                    case 'verstorben100k':
                        label = d[0] + " verstorbene/100k";
                        data = d[1].map(d => d.verstorben100k)
                        break;
                    case 'aktuell100k':
                        label = d[0] + " aktuell Infizierte/100k";
                        data = d[1].map(d => d.current100k)
                        break;
                    default:
                }

                if (data.length > 0) {
                    var newDataset = {
                        label: label,
                        backgroundColor: col,
                        borderColor: col,
                        data: data,
                        fill: false,
                        hidden: false
                    }
                    chart.options.title.text = chartTitle;
                    chart.data.datasets.push(newDataset);
                }
            });
        }
    })

    window.myLine.update()
    console.log("END generateAllDataGraph");
}

function getSelectedDataType() {
    var e = document.getElementById("selectDataType");
    var a = Array.from(e.selectedOptions).map(v => v.value);
    return a;
}

function getSelectedRegions() {
    var e = document.getElementById("selectRegion")
    var a = Array.from(e.selectedOptions).map(v => v.text);
    return a;
}

window.addEventListener("load", function () {
    console.log("START");
    var ctx = document.getElementById('canvas').getContext('2d');
    window.myLine = new Chart(ctx, chart);
    var csvRawUrl = "https://raw.githubusercontent.com/quatzli/quatzli.github.io/main/corona/zahlen_emsland.csv";
    fetchCSVData(csvRawUrl);
    console.log("END");
});

function loadData() {
    console.log("START loadData");
    var dataType = getSelectedDataType();
    var regions = getSelectedRegions();
    generateAllDataGraph(csvData, dataType, regions);
    console.log("END loadData")
}