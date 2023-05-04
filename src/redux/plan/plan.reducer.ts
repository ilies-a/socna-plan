import PlanActionTypes from "./plan.types";
import { PlanElement, PlanProps } from "@/entities";
import { updatePlanProps, addPlanElement, removePlanElement, setPlanElements, updatePlanElement } from "./plan.utils";

const INITIAL_STATE = {
  planProps: new PlanProps(),
  planElements: {} as { [key: string]: PlanElement },
  selectingPlanElement: false,
  unselectAllOnPlanMouseUp: true,
};

const planReducer = (state = INITIAL_STATE, action: { type: any; payload: any; }) => {
  switch (action.type) {
    case PlanActionTypes.UPDATE_PLAN_PROPS:
      return {
        ...state,
        planProps: updatePlanProps(action.payload)
      };
    case PlanActionTypes.SET_PLAN_ELEMENTS:
      return {
        ...state,
        planElements: setPlanElements(action.payload)
      };
    case PlanActionTypes.ADD_PLAN_ELEMENT:
      return {
        ...state,
        planElements: addPlanElement(state.planElements, action.payload)
      };
    case PlanActionTypes.REMOVE_PLAN_ELEMENT:
      return {
        ...state,
        planElements: removePlanElement(state.planElements, action.payload)
      };
    case PlanActionTypes.UPDATE_PLAN_ELEMENT:
      return {
        ...state,
        planElements: updatePlanElement(state.planElements, action.payload)
      };
    case PlanActionTypes.SET_SELECTING_PLAN_ELEMENT:
      return {
        ...state,
        selectingPlanElement: action.payload
      };
    case PlanActionTypes.SET_UNSELECT_ALL_ON_PLAN_MOUSE_UP:
      return {
        ...state,
        unselectAllOnPlanMouseUp: action.payload
      };
    default:
      return state;
  }
};

export default planReducer;


