import { Injectable } from "./abstract/Injectable";
import { InjectionTarget, InjectionTargetType } from "./abstract/InjectionTarget";
import { PlacesService } from "./logic/PlacesService";
import { FSSearchAPI } from "./apis/foursquare/FSSearchAPI";

export const DependencyContainer: DependencyMap = {
  instancesCache: {},
  views: {
    PlacesView: {
      PlacesService
    }
  },
  services: {
    PlacesService: {
      FSSearchAPI
    },
    FSSearchAPI: {},
  },

  getDependenciesFor(target: InjectionTarget): Record<string, Injectable<object>> {
    const depsType = target.targetType === InjectionTargetType.View ? 'views': 'services';
    const depsListOfType = this[depsType];
    const targetName = target.constructor.name;
    const targetDepsList = depsListOfType[target.constructor.name];
    if (!targetDepsList) // why not 'return {}? Because I want to ensure all targets are listed in this file
      throw new ReferenceError(`Attempt to get dependencies of not-listed injection target '${targetName}'`);
    /*
      targetDepsList = { 'dep1': dep1_class, 'dep2': dep2_class }
    */
    const depsConstructors  = Object.values(targetDepsList);
    for (const constr of depsConstructors) {
      new 
    }
    return {};
  },

};

type DependencyList = { [target: string]: { [dependency: string]: typeof Injectable<object> }};

type DependencyMap = {
  instancesCache: Record<string, Injectable<object>>,
  views: DependencyList,
  services: DependencyList,
  getDependenciesFor: (target: InjectionTarget) => Record<string, Injectable<object>>;
};