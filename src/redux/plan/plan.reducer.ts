import PlanActionTypes from "./plan.types";
import { AddSegSession, MagnetData, PlanElement, PlanElementSheetData, PlanElementsRecordsHandler, PlanMode, PlanProps, Point, Position, SegClassName, SegOnCreationData, TestPoint, Vector2D } from "@/entities";
import { updatePlanProps, addPlanElement, removePlanElement, setPlanElements, updatePlanElement } from "./plan.utils";
import { v4 } from "uuid";
import { initialPlanElements } from "@/global-for-tests";

const INITIAL_STATE = {
  planProps: new PlanProps(),
  // planIsScaling: false,
  planIsDragging: false,
  planElements: initialPlanElements as PlanElement[],
  planElementsSnapshot: null as PlanElement[] | null,
  planMode: PlanMode.MovePoint,
  selectingPlanElement: false,
  unselectAllOnPlanMouseUp: true,
  planElementsRecords: new PlanElementsRecordsHandler(),
  addingPointLineIdPointId: null as [string, string] | null,
  planCursorPos: new Position(0,0) as Vector2D,
  // planElementsRecords: [] as PlanElement[][],
  // currentPlanElementRecordIndex: -1
  testPoints: [new TestPoint("", 100, 100, "")] as Point[],
  planElementSheetData: null as PlanElementSheetData | null,
  magnetData: {activeOnAxes:true, node:null, seg:null} as MagnetData,
  addSegSession: null as AddSegSession | null,
  segOnCreationData: null as SegOnCreationData | null
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
    case PlanActionTypes.SET_PLAN_ELEMENT_SHEET_DATA:
      return {
        ...state,
        planElementSheetData: action.payload
      };
    case PlanActionTypes.SET_TEST_POINTS:
      return {
        ...state,
        testPoints: action.payload
      };
    case PlanActionTypes.SET_MAGNET_DATA:
      return {
        ...state,
        magnetData: action.payload
      };
    case PlanActionTypes.SET_ADD_SEG_SESSION:
      return {
        ...state,
        addSegSession: action.payload
      };
    case PlanActionTypes.SET_SEG_ON_CREATION_DATA:
      return {
        ...state,
        segOnCreationData: action.payload
      };
    case PlanActionTypes.SET_PLAN_ELEMENT_SNAPSHOT:
      return {
        ...state,
        planElementsSnapshot: action.payload
      };
    default:
      return state;
  }
};

export default planReducer;


