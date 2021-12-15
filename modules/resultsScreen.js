export function resultLoadAnimation(){
    setTimeout(function() {
      document.getElementById("resultLoaderScreen").classList.add("hidden");
    }, 2000);
  }

export function findMachineImage(machine, airline){
    if (machine === "Dash 8-200" && airline === "Air Greenland"){
      return "machine-cutouts/dash8-ag.png";
    } else if (machine === "Dash 8-200" && airline === "Icelandair"){
      return "machine-cutouts/dash8-ia.png";
    } else if (machine === "Boeing 737 All Series" || machine === "Airbus A330-200"){
      return "machine-cutouts/airbus-ag.png";
    } else if (machine === "Bell 212 Helicopter"){
      return "machine-cutouts/bell-212-ag.png";
    } else if (machine === "Eurocopter Ec155"){
      return "machine-cutouts/eurocopter-ag.png";
    }
}

export function getImageSize(machine, imgEl){
  if (machine === "Dash 8-200"){
    imgEl.classList.add("medium");
  } else if(machine == "Boeing 737 All Series" || machine === "Airbus A330-200"){
    imgEl.classList.add("big");
  } else if (machine === "Bell 212 Helicopter" || machine === "Eurocopter Ec155"){
    imgEl.classList.add("small");
  }
}

export function addAirlineButton(routes){

    const agButton = document.getElementById("agButton");
    const iaButton = document.getElementById("iaButton");
    const containsAGRoute = routes.some(e => e.airline === "Air Greenland");
    const containsIARoute = routes.some(e => e.airline === "Icelandair");
  
    if (containsAGRoute && !containsIARoute){
      iaButton.classList.add("hidden");
  
    } else if (!containsAGRoute && containsIARoute){
      agButton.classList.add("hidden");
  
    } else if (containsAGRoute && containsIARoute){
      return;
    }

  }


  export function addIcons(route, copy){

    if (!route.entertainment){
      copy.querySelector(".entertainment").classList.add("hidden");
    } 
    if (!route.food){
      copy.querySelector(".food").classList.add("hidden");
    }
    if (!route.luggage){
      copy.querySelector(".luggage").classList.add("hidden");
    }
  
    document.querySelector(".routeContainer").appendChild(copy);
  }