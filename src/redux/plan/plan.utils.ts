import { Line, PlanElement, PlanProps, Point } from "@/entities";

// export const setPlanElements = (planElements:{ [key: string]: PlanElement }):{ [key: string]: PlanElement } => {
//   const initialPlanElements: {[key:string]: PlanElement} = {
//         id1: new Line("123", [new Point(50,50), new Point(300,50), new Point(400,300)]),
//         // id2: new Rectangle(id2, 500, 110, 100, 100),
//     };
//       return initialPlanElements
//   };

export const updatePlanProps = (planProps: PlanProps):PlanProps => {
  return {...planProps};
};

export const setPlanElements = (planElements:{ [key: string]: PlanElement}):{ [key: string]: PlanElement } => {
  return {...planElements};
};

export const addPlanElement = (planElements:{ [key: string]: PlanElement }, planElement:PlanElement):{ [key: string]: PlanElement } => {
    return {...planElements, [planElement.id]:planElement};
};

export const removePlanElement = (planElements:{ [key: string]: PlanElement }, planElementId:string):{ [key: string]: PlanElement } => {
  if(planElements[planElementId]){
    delete planElements[planElementId];
    return {...planElements};
  }
  return planElements;
};

export const updatePlanElement = (planElements:{ [key: string]: PlanElement }, planElement:PlanElement):{ [key: string]: PlanElement } => {
    if(planElements[planElement.id]){
      return {...planElements, [planElement.id]:planElement};
    }
    return planElements;
  };