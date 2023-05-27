
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



interface Point {
    x: number;
    y: number;
}
  
interface ISegment {
    p1: Point;
    p2: Point;
}


export function doSegmentsIntersect(seg1: ISegment, seg2: ISegment): boolean {
    const { p1: a, p2: b } = seg1;
    const { p1: c, p2: d } = seg2;
  
    const orientation1 = getOrientation(a, b, c);
    const orientation2 = getOrientation(a, b, d);
    const orientation3 = getOrientation(c, d, a);
    const orientation4 = getOrientation(c, d, b);
  
    if (
      orientation1 !== orientation2 &&
      orientation3 !== orientation4
    ) {
      return true;
    }
  
    if (
      orientation1 === 0 &&
      isPointOnSegment(a, b, c)
    ) {
      return true;
    }
  
    if (
      orientation2 === 0 &&
      isPointOnSegment(a, b, d)
    ) {
      return true;
    }
  
    if (
      orientation3 === 0 &&
      isPointOnSegment(c, d, a)
    ) {
      return true;
    }
  
    if (
      orientation4 === 0 &&
      isPointOnSegment(c, d, b)
    ) {
      return true;
    }
  
    return false;
  }
  
  function getOrientation(p: Point, q: Point, r: Point): number {
    const val =
      (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
  
    if (val === 0) {
      return 0;
    }
  
    return val > 0 ? 1 : -1;
  }
  
  function isPointOnSegment(p: Point, q: Point, r: Point): boolean {
    if (
      r.x <= Math.max(p.x, q.x) &&
      r.x >= Math.min(p.x, q.x) &&
      r.y <= Math.max(p.y, q.y) &&
      r.y >= Math.min(p.y, q.y)
    ) {
      return true;
    }
  
    return false;
  }



  function calculateAngle(p1: Point, p2: Point): number {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x);
  }
  
  export function sortPointsClockwise(points: Point[]): Point[] {
    const center: Point = {
      x: points.reduce((sum, p) => sum + p.x, 0) / points.length,
      y: points.reduce((sum, p) => sum + p.y, 0) / points.length,
    };
  
    return points.sort((a, b) => {
      const angleA = calculateAngle(center, a);
      const angleB = calculateAngle(center, b);
      return angleA - angleB;
    });
  }