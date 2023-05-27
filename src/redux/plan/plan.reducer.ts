import PlanActionTypes from "./plan.types";
import { Line, PlanElement, PlanElementsRecordsHandler, PlanMode, PlanPointerUpActionsHandler, PlanProps, Point, Position, TestPoint, Vector2D } from "@/entities";
import { updatePlanProps, addPlanElement, removePlanElement, setPlanElements, updatePlanElement } from "./plan.utils";
import { setPlanPointerUpActionsHandler } from "./plan.actions";
import { v4 } from "uuid";
import { initialPlanElements } from "@/global";

const INITIAL_STATE = {
  planProps: new PlanProps(),
  // planIsScaling: false,
  planIsDragging: false,
  planElements: initialPlanElements as PlanElement[],
  planElementsTemp: [] as PlanElement[],
  planMode: PlanMode.MovePoint,
  selectingPlanElement: false,
  unselectAllOnPlanMouseUp: true,
  planElementsRecords: new PlanElementsRecordsHandler(),
  planPointerUpActionsHandler: new PlanPointerUpActionsHandler(),
  addingPointLineIdPointId: null as [string, string] | null,
  planCursorPos: new Position(0,0) as Vector2D,
  // planElementsRecords: [] as PlanElement[][],
  // currentPlanElementRecordIndex: -1
  lineToAdd: null as Line | null,
  testPoints: [new TestPoint("", 100, 100, "")] as Point[]
};

const planReducer = (state = INITIAL_STATE, action: { type: any; payload: any; }) => {
  switch (action.type) {
    case PlanActionTypes.UPDATE_PLAN_PROPS:
      return {
        ...state,
        planProps: updatePlanProps(action.payload)
      };
    // case PlanActionTypes.SET_PLAN_IS_SCALING:
    //   return {
    //     ...state,
    //     planIsScaling: action.payload
    //   };
    case PlanActionTypes.SET_PLAN_IS_DRAGGING:
      return {
        ...state,
        planIsDragging: action.payload
      };
    case PlanActionTypes.SET_PLAN_CURSOR_POS:
      return {
        ...state,
        planCursorPos: action.payload
      };
    case PlanActionTypes.SET_PLAN_ELEMENTS:
      return {
        ...state,
        planElements: setPlanElements(action.payload)
      };
    case PlanActionTypes.SET_PLAN_POINTER_UP_ACTIONS_HANDLER:
      return {
        ...state,
        PlanPointerUpActionsHandler: setPlanPointerUpActionsHandler(action.payload)
      };
    case PlanActionTypes.SET_PLAN_ELEMENTS_RECORDS:
      return {
        ...state,
        planElementsRecords: action.payload
      };
    case PlanActionTypes.SET_PLAN_MODE:
      return {
        ...state,
        planMode: action.payload
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
    case PlanActionTypes.SET_ADDING_POINT_LINE_ID_POINT_ID:
      return {
        ...state,
        addingPointLineIdPointId: action.payload
      };
    case PlanActionTypes.SET_LINE_TO_ADD:
      return {
        ...state,
        lineToAdd: action.payload
      };
    case PlanActionTypes.SET_TEST_POINTS:
      return {
        ...state,
        testPoints: action.payload
      };
    default:
      return state;
  }
};

export default planReducer;


