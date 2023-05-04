import { PlanElement, PlanProps } from "@/entities";
import PlanActionTypes from "./plan.types";

export const updatePlanProps = (planProps: PlanProps) => ({
  type: PlanActionTypes.UPDATE_PLAN_PROPS,
  payload: planProps,
});

export const setPlanElements = (planElements: {[key:string]: PlanElement}) => ({
  type: PlanActionTypes.SET_PLAN_ELEMENTS,
  payload: planElements,
});

export const addPlanElement = (planElement: PlanElement) => ({
  type: PlanActionTypes.ADD_PLAN_ELEMENT,
  payload: planElement,
});

export const removePlanElement = (planElementId: string) => ({
  type: PlanActionTypes.REMOVE_PLAN_ELEMENT,
  payload: planElementId,
});

export const updatePlanElement = (planElement: PlanElement) => ({
  type: PlanActionTypes.UPDATE_PLAN_ELEMENT,
  payload: planElement,
});

export const setSelectingPlanElement = (selecting: boolean) => ({
  type: PlanActionTypes.SET_SELECTING_PLAN_ELEMENT,
  payload: selecting,
});

export const setUnselectAllOnPlanMouseUp = (unselect: boolean) => ({
  type: PlanActionTypes.SET_UNSELECT_ALL_ON_PLAN_MOUSE_UP,
  payload: unselect,
});