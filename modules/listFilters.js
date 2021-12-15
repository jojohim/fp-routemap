export let settings = {
    searchQuery: ""
  }

export function filterDestBySearch(destinations) {
    return destinations.filter(function(destination) {
      return (
        destination.airport.toLowerCase().includes(settings.searchQuery.toLowerCase())
      );
  });
  }

  export function filterListByDest(destinations, fromLocation){

    if (fromLocation.country == "Denmark" || fromLocation.country == "Iceland"){
    const filteredDestinations = destinations.filter(destination => destination.country == "Greenland")
    return filteredDestinations;
  
    } else if (fromLocation.country == "Greenland"){
      const filteredDestinations = destinations.filter(destination => destination.airport !== fromLocation.airport);
      return filteredDestinations;
    }

  }