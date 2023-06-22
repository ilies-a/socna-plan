import { AddSegSession, AppDynamicProps, CoordSize, MagnetData, PlanElement, PlanElementSheetData, PlanElementsRecordsHandler, PlanMode, PlanProps, Point, SegClassName, SegOnCreationData, TestPoint, Vector2D } from "@/entities";
import PlanActionTypes from "./plan.types";

export const setAppDynamicProps = (appDynamicProps: AppDynamicProps) => ({
  type: PlanActionTypes.SET_APP_DYNAMIC_PROPS,
  payload: appDynamicProps,
});

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

export const setPlanElementSheetData= (planElementSheetData: PlanElementSheetData | null) => ({
  type: PlanActionTypes.SET_PLAN_ELEMENT_SHEET_DATA,
  payload: planElementSheetData,
});

export const setTestPoints= (testPoints: TestPoint[]) => ({
  type: PlanActionTypes.SET_TEST_POINTS,
  payload: testPoints,
});

export const setMagnetData= (magnetData: MagnetData) => ({
  type: PlanActionTypes.SET_MAGNET_DATA,
  payload: magnetData,
});

export const setAddSegSession= (addSegSession: AddSegSession | null) => ({
  type: PlanActionTypes.SET_ADD_SEG_SESSION,
  payload: addSegSession,
});

export const setSegOnCreationData= (segOnCreationData: SegOnCreationData | null) => ({
  type: PlanActionTypes.SET_SEG_ON_CREATION_DATA,
  payload: segOnCreationData,
});

export const setPlanElementsSnapshot= (planElements: PlanElement[] | null) => ({
  type: PlanActionTypes.SET_PLAN_ELEMENT_SNAPSHOT,
  payload: planElements,
});

export const setAllElementsWrapperCoordSize = (allElementsWrapperCoordSize: CoordSize) => ({
  type: PlanActionTypes.SET_ALL_ELEMENTS_WRAPPER_COORD_SIZE,
  payload: allElementsWrapperCoordSize,
});
