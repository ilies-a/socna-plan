import { Line, PlanElement, Point, Rectangle } from "./entities";
const {v4} = require("uuid");

const id1 = v4();
const id2 = v4();

export const initialPlanElements: {[key:string]: PlanElement} = {
    [id1]: new Line(id1, [new Point(50,50), new Point(300,50), new Point(400,300)], 25),
    // [id2]: new Line(id2, [new Point(500,500), new Point(600,510), new Point(700,530)], 25),

    // [id2]: new Rectangle(id2, 500, 110, 100, 100),
};

const objToArr = (obj:{[key:string | number | symbol]:any}):any[]=>{
    return Object.keys(obj).map(key => obj[key]);
}

export const getSelectedPlanElement = (planElements:{[key:string]: PlanElement}): PlanElement | null=>{
    for(const elId in planElements){
        const el = planElements[elId];
        if(el.getSelected()){
            return el;
        }
    }
    return null;
};