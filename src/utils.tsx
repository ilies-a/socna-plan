import { Line, PlanElement, Point, Rectangle } from "./entities";
import { v4 } from "uuid";

// const id1 = v4();
// const id2 = v4();

// export const line = new Line(v4(), [new Point(50,50), new Point(300,50), new Point(400,300)], 25);

export const initialPlanElements: PlanElement[] = [
    // line,
    // new Line(v4(), [new Point(50,50), new Point(300,50), new Point(400,300)], 25),
    // new Line(v4(), [new Point(500,500), new Point(600,510), new Point(700,530)], 25),

    // new Rectangle(v4(), 500, 110, 100, 100)
];

const objToArr = (obj:{[key:string | number | symbol]:any}):any[]=>{
    return Object.keys(obj).map(key => obj[key]);
};

// export const getSelectedPlanElement = (planElements: PlanElement[]): PlanElement | undefined=>{
//     return planElements.find(el => el.getSelected());
// };


export const cloneArray = (arr: any[]): any[] => {
    const result = [];
    for(const item of arr){
        result.push(item);
    }
    return result;
}