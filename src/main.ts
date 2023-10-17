import "./styles/default.css";
import "./styles/custom.css";
import { enforceMinMax } from "./validators/enforceMinMax.ts";
import { PlacesView } from "./view/PlaceView.ts";
import { UserPlacementRecord } from "./view/UserPlacementRecord.ts";
import { DependencyContainer } from "./DependencyContainer.ts";

const llInputs = document.querySelectorAll<HTMLInputElement>(".coords");
llInputs.forEach((input) => input.addEventListener("input", enforceMinMax));

const llForm = document.querySelector<HTMLFormElement>("#llForm");

if (llForm) {
  const placesView = DependencyContainer.bootstrapInstance<PlacesView>(PlacesView);

  llForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    
    const formData = new FormData(llForm);
    const viewParams: UserPlacementRecord = {
      latitude: formData.get("lat")!.toString(),
      longtitude: formData.get("long")!.toString(),
    };
    
    await placesView.updatePlaces(viewParams);
  });
}

// // Examples:41.87810, -87.629800
// //          41.87234, -87.677876

// /* Geo constraints: 
//   latitude:   [-90, +90] °
//   longtitude: [-180, +180]*/
