var csvData = []

// see https://stackoverflow.com/a/3067896
Date.prototype.yyyymmdd = function() {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();
  
    return [this.getFullYear(),
            "-",
            (mm>9 ? '' : '0') + mm,
            "-",
            (dd>9 ? '' : '0') + dd
           ].join('');
  };

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
    "Samtgemeinde Dörpen": 16956,
    "Einheitsgemeinde Emsbüren": 10308,
    "Samtgemeinde Freren": 10406,
    "Einheitsgemeinde Geeste": 11453,
    "Stadt Haren (Ems)": 24010,
    "Stadt Haselünne": 13068,
    "Samtgemeinde Herzlake": 10391,
    "Samtgemeinde Lathen": 12007,
    "Samtgemeinde Lengerich": 9223,
    "Stadt Lingen (Ems)": 54992,
    "Stadt Meppen": 35425,
    "Samtgemeinde Nordhümmling": 12275,
    "Stadt Papenburg": 38198,
    "Einheitsgemeinde Rhede (Ems)": 4321,
    "Einheitsgemeinde Salzbergen": 7838,
    "Samtgemeinde Sögel": 16950,
    "Samtgemeinde Spelle": 13977,
    "Einheitsgemeinde Twist": 9632,
    "Samtgemeinde Werlte": 17188,
    "Gesamt": 328006,
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

function fetchCSVData(url) {
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
        calculate7DayIncidence(data);
        csvData = data
    });
}

function filterByDate(data){
    var minDate = getMinDate();
    var maxDate = getMaxDate();
    var newData = data.filter(function (e){
        return e.datumDate >= minDate && e.datumDate <= maxDate;
    });
    return newData;
}

function generateAllDataGraph(data, dataType, regions) {

    // filter data by date
    data = filterByDate(data);
    
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
                        label = d[0] + " - Faelle";
                        data = d[1].map(d => d.faelle)
                        break; 
                    case 'faelle100k':
                        label = d[0] + " - Faelle/100k";
                        data = d[1].map(d => d.faelle100k)
                        break;
                    case 'genesen':
                        label = d[0] + " - Genesene";
                        data = d[1].map(d => d.genesen)
                        break;
                    case 'verstorben':
                        label = d[0] + " - Verstorbene";
                        data = d[1].map(d => d.verstorben)
                        break;
                    case 'aktuell':
                        label = d[0] + " - Aktuell Infizierte";
                        data = d[1].map(d => d.current)
                        break;
                    case 'genesen100k':
                        label = d[0] + " - Genesene/100k";
                        data = d[1].map(d => d.genesen100k)
                        break;
                    case 'verstorben100k':
                        label = d[0] + " - Verstorbene/100k";
                        data = d[1].map(d => d.verstorben100k)
                        break;
                    case 'aktuell100k':
                        label = d[0] + " - Aktuell Infizierte/100k";
                        data = d[1].map(d => d.current100k)
                        break;
                    default:
                }

                if (data.length > 0) {
                    var newDataset = {
                        label: label,
                        backgroundColor: "#"+col,
                        borderColor: "#"+col,
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

function getMinDate(){
    var retValue = new Date("2020-03-08T00:00:00");
    var selectedDate = document.querySelector(".mindate").value;
    if(selectedDate)
    {
        retValue = new Date(selectedDate);
    }
    return retValue;
}

function getMaxDate(){
    var retValue = new Date();
    var selectedDate = document.querySelector(".maxdate").value;
    if(selectedDate)
    {
        retValue = new Date(selectedDate);
    }
    return retValue;
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
    var dataType = getSelectedDataType();
    var regions = getSelectedRegions();
    generateAllDataGraph(csvData, dataType, regions);
}

function calculate7DayIncidence(data){
    var incDiv = document.querySelector("#incidenceDiv");
    var checkDate = getLatestDate(data);
        
    var checkOldDate = new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate()-7);
    var checkCurrentDate = new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate());
    
    dataSets = Array.from(d3.group(data, d => d.kommune));
    
    //console.log("Incidence for date: " + checkDate);
    incDiv.innerHTML = incDiv.innerHTML + "<br><b> Incidence for date: " + checkDate.yyyymmdd() + "</b><br>";
    
    dataSets.forEach(function (e){

        // get data from 7 days ago
        var filterdOld = e[1].filter(function (f){
            return f.datumDate.getTime() === checkOldDate.getTime();
        });
        
        // get current data
        var filterdNow = e[1].filter(function (f){
            return f.datumDate.getTime() === checkCurrentDate.getTime();
        });
        
        //console.log("Incidence " + e[0] + ": " + Math.ceil((((filterdNow[0].faelle-filterdOld[0].faelle))/population[e[0]] * 100000)));
        incDiv.innerHTML = incDiv.innerHTML + "<br>" + e[0] + ": " + Math.ceil((((filterdNow[0].faelle-filterdOld[0].faelle))/population[e[0]] * 100000)) 
    });
}

function getLatestDate(data){
    return new Date(Math.max.apply(null, data.map(function (e){
        return new Date(e.datumDate);
    })));
}