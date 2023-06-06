import { Position, Vector2D, WallNode } from "./entities";
import { BIG_NUMBER } from "./global";

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


export const getOrthogonalProjection = (lp1:Vector2D, lp2:Vector2D, p:Vector2D): Vector2D =>{
  const slope = lp2.x - lp1.x != 0 ? (lp2.y - lp1.y) / (lp2.x - lp1.x) : BIG_NUMBER;
  const b = lp1.y - slope * lp1.x;
  const orthogonalSlope = slope != 0 ? -1 / slope : BIG_NUMBER; // Calculate the slope of the orthogonal line
  const orthogonalIntercept = p.y - orthogonalSlope * p.x; // Calculate the y-intercept of the orthogonal line
  const projectionX = (orthogonalIntercept - b) / (slope - orthogonalSlope); // Calculate the x-coordinate of the projection
  const projectionY = orthogonalSlope * projectionX + orthogonalIntercept; // Calculate the y-coordinate of the projection
  return new Position(projectionX, projectionY);
}

export const getNodePositionWithMagnet = (node:WallNode, p:Vector2D) => {
  // node.position = new Position(newCursorPos.x, newCursorPos.y);
  // dispatch(updatePlanElement(addWallSession.joinedWalls));




  let lockHorizontally: WallNode | null = null;
  let lockVertically: WallNode | null = null;
  let lockDiagonallyTopLeftBottomRight: WallNode | null = null;
  let lockDiagonallyTopRightBottomLeft: WallNode | null = null;

  for(const linkedNode of node.linkedNodes){
      const angle = Math.atan2(linkedNode.position.y - p.y, linkedNode.position.x - p.x);
      const maxOffsetAngle = 0.08;

      if(!lockHorizontally){              
      lockHorizontally = 
      (angle > 0 ?
          angle < Math.PI /2 ?
          angle < maxOffsetAngle 
          :
          angle > Math.PI - maxOffsetAngle 
          :
          angle > - Math.PI /2? 
          angle > - maxOffsetAngle
          :
          angle <  - Math.PI + maxOffsetAngle) ? linkedNode : null;
      }

      if(!lockVertically){
      lockVertically = 
      (Math.abs(angle) > Math.PI / 2 ? //if right
          angle > 0 ? //if top
          //if top right
          angle < Math.PI / 2 + maxOffsetAngle
          :
          //if bottom right
          angle > - Math.PI / 2 - maxOffsetAngle
      : //if left
          angle > 0 ? //if top
          //if top left
          angle > Math.PI / 2 - maxOffsetAngle
          :
          //if bottom left
          angle < - Math.PI / 2 + maxOffsetAngle) ? linkedNode : null;
      }


      if(node.linkedNodes.length === 1){
      if(!lockDiagonallyTopLeftBottomRight && !lockDiagonallyTopRightBottomLeft){
          lockDiagonallyTopLeftBottomRight = 
          (angle > Math.PI / 4 || angle <  - Math.PI * (3/4) ? //if right
          angle > 0 ? //if top
              //if top right
              angle < Math.PI / 4 + maxOffsetAngle
          :
          //if bottom right
          angle > - Math.PI * (3/4) - maxOffsetAngle
          : //if left
          angle > 0 ? //if top
          //if top left
          angle > Math.PI / 4 - maxOffsetAngle
          :
          //if bottom left
          angle < - Math.PI * (3/4) + maxOffsetAngle) ? linkedNode : null;
      }
      if(!lockDiagonallyTopRightBottomLeft && !lockDiagonallyTopLeftBottomRight){
          lockDiagonallyTopRightBottomLeft = 
          (angle > Math.PI * (3/4) || angle <  - Math.PI / 4 ? //if right
          angle > 0 ? //if top
              //if top right
              angle < Math.PI * (3/4) + maxOffsetAngle
          :
          //if bottom right
          angle > - Math.PI / 4 - maxOffsetAngle
          : //if left
          angle > 0 ? //if top
          //if top left
          angle > Math.PI * (3/4) - maxOffsetAngle
          :
          //if bottom left
          angle < - Math.PI * (1/4) + maxOffsetAngle) ? linkedNode : null;
      }

      }
      
  }
  let newX;
  let newY;

  if(lockVertically || lockHorizontally){
      newX = lockVertically ? lockVertically.position.x : p.x;
      newY = lockHorizontally ? lockHorizontally.position.y : p.y;
  }
  else if(lockDiagonallyTopLeftBottomRight || lockDiagonallyTopRightBottomLeft){
      const linkedNode = node.linkedNodes[0];
      const slope = lockDiagonallyTopLeftBottomRight? 1 : -1;
      let b = linkedNode.position.y - slope * linkedNode.position.x;
      const orthogonalSlope = -1 / slope; // Calculate the slope of the orthogonal line
      const orthogonalIntercept = p.y - orthogonalSlope * p.x; // Calculate the y-intercept of the orthogonal line
      const projectionX = (orthogonalIntercept - b) / (slope - orthogonalSlope); // Calculate the x-coordinate of the projection
      const projectionY = orthogonalSlope * projectionX + orthogonalIntercept; // Calculate the y-coordinate of the projection

      newX = projectionX;
      newY = projectionY;

  }
  else{
      newX = p.x;
      newY = p.y;
  }
  return new Position(newX, newY)
}