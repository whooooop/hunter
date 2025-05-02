import { ForestLocation } from "./ForestLocation/ForestLocation";
import { Location } from "../core/types/Location";

export const LocationCollections: Record<Location.Id, new (scene: Phaser.Scene) => Location.BaseClass> = {
  [Location.Id.FOREST]: ForestLocation,
  [Location.Id.DESERT]: ForestLocation,
}

export function getLocationClass(locationId: Location.Id): new (scene: Phaser.Scene) => Location.BaseClass {
  return LocationCollections[locationId];
}

export function getLocation(scene: Phaser.Scene, locationId: Location.Id): Location.BaseClass {
  return new LocationCollections[locationId](scene);
}