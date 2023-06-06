import { AddWallSession, Line, PlanElement, PlanElementSheetData, PlanElementsRecordsHandler, PlanMode, PlanPointerUpActionsHandler, PlanProps, Point, TestPoint, Vector2D } from "@/entities";
import PlanActionTypes from "./plan.types";

export const updatePlanProps = (planProps: PlanProps) => ({
  type: PlanActionTypes.UPDATE_PLAN_PROPS,
  payload: planProps,
});

// export const setPlanIsScaling = (scaling: boolean) => ({
//   type: PlanActionTypes.SET_PLAN_IS_SCALING,
//   payload: scaling,
// });

export const setPlanIsDragging= (dragging: boolean) => ({
  type: PlanActionTypes.SET_PLAN_IS_DRAGGING,
  payload: dragging,
});

export const setPlanCursorPos = (planCursorPos: Vector2D) => ({
  type: PlanActionTypes.SET_PLAN_CURSOR_POS,
  payload: planCursorPos,
});

export const setPlanElements = (planElements: PlanElement[]) => ({
  type: PlanActionTypes.SET_PLAN_ELEMENTS,
  payload: planElements,
});

export const setAddingPointLineIdPointId = (addingPointLineIdPointId: [string, string] | null) => ({
  type: PlanActionTypes.SET_ADDING_POINT_LINE_ID_POINT_ID,
  payload: addingPointLineIdPointId,
});

export const setPlanPointerUpActionsHandler = (planPointerUpActionsHandler: PlanPointerUpActionsHandler) => ({
  type: PlanActionTypes.SET_PLAN_POINTER_UP_ACTIONS_HANDLER,
  payload: planPointerUpActionsHandler,
});

export const setPlanElementsRecords = (planElementsRecords: PlanElementsRecordsHandler) => ({
  type: PlanActionTypes.SET_PLAN_ELEMENTS_RECORDS,
  payload: planElementsRecords,
});

export const setPlanMode = (planMode: PlanMode) => ({
  type: PlanActionTypes.SET_PLAN_MODE,
  payload: planMode,
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

export const setLineToAdd = (line: Line | null) => ({
  type: PlanActionTypes.SET_LINE_TO_ADD,
  payload: line,
});

export const setPlanElementSheetData= (planElementSheetData: PlanElementSheetData | null) => ({
  type: PlanActionTypes.SET_PLAN_ELEMENT_SHEET_DATA,
  payload: planElementSheetData,
});

export const setTestPoints= (testPoints: TestPoint[]) => ({
  type: PlanActionTypes.SET_TEST_POINTS,
  payload: testPoints,
});

export const setMagnetActivated= (magnetActivated: boolean) => ({
  type: PlanActionTypes.SET_MAGNET_ACTIVATED,
  payload: magnetActivated,
});

export const setAddWallSession= (addWallSession: AddWallSession | null) => ({
  type: PlanActionTypes.SET_ADD_WALL_SESSION,
  payload: addWallSession,
});