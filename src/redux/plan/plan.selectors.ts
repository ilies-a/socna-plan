import { createSelector } from "reselect";

export const selectPlan = (state: { plan: any; }) => state.plan;

export const selectPlanProps = createSelector(
  [selectPlan],
  (plan) => plan.planProps
);

// export const selectPlanIsScaling= createSelector(
//   [selectPlan],
//   (plan) => plan.planIsScaling
// );

export const selectPlanIsDragging= createSelector(
  [selectPlan],
  (plan) => plan.planIsDragging
);

export const selectPlanCursorPos = createSelector(
  [selectPlan],
  (plan) => plan.planCursorPos
);

export const selectPlanElements = createSelector(
  [selectPlan],
  (plan) => plan.planElements
);

export const selectPlanPointerUpActionsHandler = createSelector(
  [selectPlan],
  (plan) => plan.planPointerUpActionsHandler
);

export const selectPlanMode= createSelector(
  [selectPlan],
  (plan) => plan.planMode
);

export const selectSelectingPlanElement = createSelector(
  [selectPlan],
  (plan) => plan.selectingPlanElement
);

export const selectUnselectAllOnPlanMouseUp = createSelector(
  [selectPlan],
  (plan) => plan.unselectAllOnPlanMouseUp
);

export const selectPlanElementsRecords = createSelector(
  [selectPlan],
  (plan) => plan.planElementsRecords
);

export const selectAddingPointLineIdPointId = createSelector(
  [selectPlan],
  (plan) => plan.addingPointLineIdPointId
);

export const selectLineToAdd = createSelector(
  [selectPlan],
  (plan) => plan.lineToAdd
);

export const selectPlanElementSheetData = createSelector(
  [selectPlan],
  (plan) => plan.planElementSheetData
);

export const selectTestPoints = createSelector(
  [selectPlan],
  (plan) => plan.testPoints
);

export const selectMagnetData= createSelector(
  [selectPlan],
  (plan) => plan.magnetData
);

export const selectAddWallSession= createSelector(
  [selectPlan],
  (plan) => plan.addWallSession
);

export const selectPlanElementsSnapshot= createSelector(
  [selectPlan],
  (plan) => plan.planElementsSnapshot
);