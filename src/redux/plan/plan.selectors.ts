import { createSelector } from "reselect";

export const selectPlan = (state: { plan: any; }) => state.plan;

export const selectPlanProps = createSelector(
  [selectPlan],
  (plan) => plan.planProps
);

export const selectPlanElements = createSelector(
  [selectPlan],
  (plan) => plan.planElements
);

export const selectSelectingPlanElement = createSelector(
  [selectPlan],
  (plan) => plan.selectingPlanElement
);

export const selectUnselectAllOnPlanMouseUp = createSelector(
  [selectPlan],
  (plan) => plan.unselectAllOnPlanMouseUp
);