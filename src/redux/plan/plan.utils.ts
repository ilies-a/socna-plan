import { AppDynamicProps, PlanElement, PlanProps, Point } from "@/entities";
import { cloneArray } from "@/utils";

// export const setPlanElements = (planElements:{ [key: string]: PlanElement }):{ [key: string]: PlanElement } => {
//   const initialPlanElements: {[key:string]: PlanElement} = {
//         id1: new Line("123", [new Point(50,50), new Point(300,50), new Point(400,300)]),
//         // id2: new Rectangle(id2, 500, 110, 100, 100),
//     };
//       return initialPlanElements
//   };

// export const setAppDynamicProps = (appDynamicProps : AppDynamicProps):AppDynamicProps => {
//   return {...appDynamicProps};
// };


export const updatePlanProps = (planProps: PlanProps):PlanProps => {
  return {...planProps};
};

export const setPlanElements = (planElements: PlanElement[]): PlanElement[]=> {
  return planElements;
};

export const addPlanElement = (planElements: PlanElement[], planElement:PlanElement): PlanElement[] => {
  planElements.push(planElement);
  return cloneArray(planElements);
};

export const removePlanElement = (planElements: PlanElement[], planElementId:string): PlanElement[] => {
  const planElementIndex = planElements.findIndex(el => el.id === planElementId);
  if(planElementIndex){
    planElements.splice(planElementIndex, 1);
    return cloneArray(planElements);
  }
  return planElements;
};

export const updatePlanElement = (planElements: PlanElement[], planElement:PlanElement): PlanElement[] => {
    let planElementFound = planElements.find(el => el.id === planElement.id);
    if(planElementFound){
      planElementFound = planElement;
      return cloneArray(planElements);
    }
    return planElements;
  };