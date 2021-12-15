//HEADER FOR DESTINATION DATA

export let globalDestinations = [];
export let globalRoutes = [];

const apiKey = "61a623ce81b6874e24b2ea01";

const restdbHeaders = {
    "Content-Type": "application/json; charset=utf-8",
    "x-apikey": apiKey,
    "cache-control": "no-cache"
};

async function getAllRoutes(routesURL) {
    const response = await fetch(routesURL, {
      method: "get",
      headers: restdbHeaders,
    });
    const routesData = await response.json();
    return routesData;
  }

async function getAllDestinations(destinationsURL) {
    const response = await fetch(destinationsURL, {
        method: "get",
        headers: restdbHeaders,
    });
    const destinationsData = await response.json();
    return destinationsData;
  }

export async function fetchData(){
    // Fetching data and drawing svg data
    const destinationsURL = "https://routemap-fa64.restdb.io/rest/destinations";
    let destResponseArray = await getAllDestinations(destinationsURL);
  
    const routesURL = "https://routemap-fa64.restdb.io/rest/routes"
    let routesResponseArray = await getAllRoutes(routesURL);
  
    // More setup (eventlistners, data parsing)
    handleRoutes(routesResponseArray);
    handleDest(destResponseArray);
}

function handleRoutes(routesResponseArray){
    routesResponseArray.forEach(route =>{
      //const routeObject = getRouteItems(route);
      globalRoutes.push(route);
    });
    console.log(globalDestinations);
  }

//HANDLE DESTINATIONS
function handleDest(destResponseArray){
    destResponseArray.forEach(destination =>{
    //const destinationObject = getItems(destination);
    globalDestinations.push(destination);
  });
}






