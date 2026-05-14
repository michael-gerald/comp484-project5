// google maps
let map;

// quiz variables
let question = 0;
let score = 0;

// timer variables
// using same one as project 4
let timer = [0,0,0];
let interval;
let timerRunning = false;

// csun quiz locations
//radius in meters 
const locations = [
    {
        name: "Chaparral Hall",
        lat: 34.23816403767169,
        lng: -118.52705337031942,
        radius: 75
    },
    {
        name: "Citrus Hall",
        lat: 34.239035017998006, 
        lng: -118.5281067243685,
        radius: 75
    } ,
    {
        name: "Manzanita Hall",
        lat: 34.23769502505349, 
        lng: -118.53014607250506,
        radius: 75
    }, 
    {
        name: "Juniper Hall",
        lat: 34.24192979104759, 
        lng: -118.53059119822123,
        radius: 75
    }, 
    {
       name: "Bayramian Hall",
       lat: 34.240425443921986, 
       lng: -118.5308273472655,
       radius: 75 
    } 
]

// called by Google Maps API
function initMap() {
    const csun = {
        lat: 34.240638220999706, 
        lng: -118.53003773250862
    };

    map = new google.maps.Map(document.getElementById("map"), {
        center: csun,
        zoom: 17,

        disableDefaultUI: true,
        draggable: false,
        scrollwheel: false,
        disableDoubleClickZoom: true,

        // removes name and place off Google Map
        styles: [
            {
                featureType: "all",
                elementType: "labels",
                stylers: [
                    { visibility: "off" }
                ]
            },
            {
                featureType: "poi",
                stylers: [
                    { visibility: "off" }
                ]
            },
            {
                featureType: "transit",
                stylers: [
                    { visibility: "off"}
                ]
            }  
        ]

    });
    
    //start timer
    start();
    //shows question
    showQuestion();
    // double click
    map.addListener("click", function(clickedLocation) {
        console.log("MAP CLICKED");
        if(!clickedLocation || !clickedLocation.latLng) return
        checkAnswer(clickedLocation.latLng);
    });
}

//----- TIMER SET UP ----
//same timer functions as project 4
//leading 0s for <= 9 
function leadingZero(time) {
    return (time <= 9 ? "0" : "") + time;
}
//runs timer
function runTimer() {
    let currentTime =
        leadingZero(timer[0]) + ":" +
        leadingZero(timer[1]) + ":" +
        leadingZero(timer[2]);
        document.getElementById("timer").innerHTML = currentTime;

    timer[2]++; //hundredths
    if (timer[2] === 100) {
        timer[2] = 0;
        timer[1]++; //seconds
    }
    if (timer[1] === 60) {
        timer[1] = 0;
        timer[0]++; //minutes
    }
}

//starts timer
function start() {
    if (!timerRunning) {
        timerRunning = true;
        interval = setInterval(runTimer, 10);
    }
}
//stops timer
function stopTimer() {
    clearInterval(interval);
    timerRunning = false;

    document.getElementById("timer").innerHTML =
        formatTime(timer);
}

function formatTime(t) {
    return leadingZero(t[0]) + ":" + leadingZero(t[1]) + ":" + leadingZero(t[2]);
}

function getTotalTime() { //total time in seconds
    return timer[0] * 60 + timer[1] + timer[2] / 100;
}
//----- TIMER SET UP ----

//shows current question
function showQuestion() {
    const result = document.getElementById("location-question");

    if (question < locations.length) {
        result.innerHTML = `
            <h3>Question ${question + 1}</h3>
            <p>Where is: ${locations[question].name}</p>
        `;
    }   
}

//checks answer
function checkAnswer(clickedLocation) {
    if (question >= locations.length) return;

    const target = locations[question];
    const clicked = {
        lat: clickedLocation.lat(),
        lng: clickedLocation.lng()
    };
    const distance = getDistance(clicked, target);
    const result = document.getElementById("result");

    // correct within 50 meters
    if (distance < target.radius) {
        result.innerHTML = `
            <h3>Correct!</h3>
            <p>You found: ${target.name}</p>
        `;
        score++;
        drawCircle(target, "green");

    } else {
        result.innerHTML = `
            <h3>Wrong!</h3>
            <p>The correct location was: ${target.name}</p>
        `;
        drawCircle(target, "red");
    }
    question++;
    // quiz/game finished
        if (question === locations.length) {
            stopTimer();
            savesScores();
            result.innerHTML = `
                <h3>Game Over!</h3>
                <p>Final Score: ${score}/${locations.length}</p>

            `;
        } else {
            showQuestion();
        }

}

//distance formula
//calculate two points using
//their latitude and longitude
//with a being the clicked location by the user
//b being the correct location
function getDistance(a, b) {
    const R = 6371000; // Earth radius in meters
    //degree to radians conversion
    const lat1 = a.lat * Math.PI / 180;
    const lat2 = b.lat * Math.PI / 180;

    // difference between the two points
    const deltaLat = (b.lat - a.lat) * Math.PI / 180;
    const deltaLng = (b.lng - a.lng) * Math.PI / 180;

    const haversine =
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) *
        Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));

    return R * c;
}

// shows correct location area on map
function drawCircle(location, color) {
    new google.maps.Circle({
        map: map,
        center: location,
        radius: 40,
        strokeColor: color,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: color,
        fillOpacity: 0.3
    });
}

//saves scores
//same as my project 4
function savesScores() {
    let totalTime = getTotalTime();
    let scores = JSON.parse(localStorage.getItem("scores")) || [];

    scores.push(totalTime);

    scores.sort((a, b) => a - b); //sorts by ascending order
    scores = scores.slice(0, 3); //only shows top 3 scores

    localStorage.setItem("scores", JSON.stringify(scores));
    showScores();
}
//show scores
//also same as project 4
function showScores() {
    let scores = JSON.parse(localStorage.getItem("scores")) || [];
    let list = document.querySelector("#top-scores");

    list.innerHTML = "";

    scores.forEach(score => {
        let li = document.createElement("li");
        li.textContent = score.toFixed(2) + " seconds";
        list.appendChild(li);
    })
}


