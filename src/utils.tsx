import { MagnetData, Position, Vector2D, Seg, SegNode, linePoints, CoordSize, Size } from "./entities";
import { BIG_NUMBER } from "./global";

export const objToArr = (obj:{[key:string | number | symbol]:any}):any[]=>{
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

export const getDistance = (p1:Vector2D, p2:Vector2D): number=> {
  return Math.sqrt( Math.pow(p2.x - p1.x ,2) +  Math.pow(p2.y - p1.y ,2));
}


interface Point {
    x: number;
    y: number;
}
  
interface Segment {
    p1: Point;
    p2: Point;
}


export function doSegmentsIntersect(seg1: Segment, seg2: Segment): boolean {
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



  export function calculateAngle(p1: Point, p2: Point): number {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x);
  }

  export function radiansToDegrees(angleRadians: number): number {
    // Convert radians to degrees
    let angleDegrees = (angleRadians * 180) / Math.PI;
  
    // Adjust the angle to be between 0 and 360 degrees
    angleDegrees = angleDegrees % 360;
    if (angleDegrees < 0) {
      angleDegrees += 360;
    }
    return angleDegrees;
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

export const getMovingNodePositionWithMagnet = (fixedNode:SegNode, movingNodePosition:Vector2D, magnetData:MagnetData):[Vector2D, linePoints | null] => {
  // node.position = new Position(newCursorPos.x, newCursorPos.y);
  // dispatch(updatePlanElement(addSegSession.joinedSegs));

  if(magnetData.node){
      return [new Position(magnetData.node.position.x, magnetData.node.position.y), null];
  }else if(magnetData.seg){
      const op = getOrthogonalProjection(magnetData.seg.nodes[0].position, magnetData.seg.nodes[1].position, movingNodePosition);
      return [new Position(op.x, op.y), null];
  }else if(magnetData.activeOnAxes){
    let lockHorizontally: SegNode | null = null;
    let lockVertically: SegNode | null = null;
    let lockDiagonallyTopLeftBottomRight: SegNode | null = null;
    let lockDiagonallyTopRightBottomLeft: SegNode | null = null;
    let lineP1: Vector2D | null = null;
    let lineP2: Vector2D | null = null;

    for(const linkedNode of fixedNode.linkedNodes){
        const angle = Math.atan2(linkedNode.position.y - movingNodePosition.y, linkedNode.position.x - movingNodePosition.x);
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
  
  
        if(fixedNode.linkedNodes.length === 1){
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
      if(lockVertically){
        lineP1 = new Position(lockVertically.position.x, -BIG_NUMBER);
        lineP2 = new Position(lockVertically.position.x, BIG_NUMBER);
        newX = lockVertically.position.x;
      }else{
        newX = movingNodePosition.x;
      }
      if(lockHorizontally){
        lineP1 = new Position(-BIG_NUMBER, lockHorizontally.position.y);
        lineP2 = new Position(BIG_NUMBER, lockHorizontally.position.y);
        newY = lockHorizontally.position.y;
      }else{
        newY =  movingNodePosition.y;
      }
        // newX = lockVertically ? lockVertically.position.x : movingNodePosition.x;
        // newY = lockHorizontally ? lockHorizontally.position.y : movingNodePosition.y;
    }
    else if(lockDiagonallyTopLeftBottomRight || lockDiagonallyTopRightBottomLeft){
      const linkedNode = fixedNode.linkedNodes[0];
      const slope = lockDiagonallyTopLeftBottomRight? 1 : -1;
      let b = linkedNode.position.y - slope * linkedNode.position.x;
      const orthogonalSlope = -1 / slope; // Calculate the slope of the orthogonal line
      const orthogonalIntercept = movingNodePosition.y - orthogonalSlope * movingNodePosition.x; // Calculate the y-intercept of the orthogonal line
      const projectionX = (orthogonalIntercept - b) / (slope - orthogonalSlope); // Calculate the x-coordinate of the projection
      const projectionY = orthogonalSlope * projectionX + orthogonalIntercept; // Calculate the y-coordinate of the projection

      newX = projectionX;
      newY = projectionY;

      lineP1 = new Position(-BIG_NUMBER, -BIG_NUMBER * slope + b);
      lineP2 = new Position(BIG_NUMBER, BIG_NUMBER * slope + b);
  
    }
    else{
      newX = movingNodePosition.x;
      newY = movingNodePosition.y;
    }

    return [new Position(newX, newY), lineP1 && lineP2?{p1:lineP1, p2:lineP2} : null];
  }
  else{
    return [new Position(movingNodePosition.x, movingNodePosition.y), null]; //default position (no magnet)
  }
}


export function isPointInPolygon (p:Vector2D, polygon:Point[]) {
  const x = p.x; const y = p.y

  if (typeof x !== 'number' || typeof y !== 'number') {
    throw new TypeError('Invalid latitude or longitude. Numbers are expected')
  } else if (!polygon || !Array.isArray(polygon)) {
    throw new TypeError('Invalid polygon. Array with locations expected')
  } else if (polygon.length === 0) {
    throw new TypeError('Invalid polygon. Non-empty Array expected')
  }


  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x; const yi = polygon[i].y
    const xj = polygon[j].x; const yj = polygon[j].y

    const intersect = ((yi > y) !== (yj > y)) &&
            (x < (xj - xi) * (y - yi) / (yj - yi) + xi)
    if (intersect) inside = !inside
  }

  return inside
};

export function shrinkOrEnlargeSegment(segment: Segment, percentage: number): Segment {
    const { p1, p2 } = segment;
    
    // Calculate the midpoint of the segment
    const midpoint: Point = {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
    };

    // Calculate the distance between the p1 and p2 points
    const distanceX: number = p2.x - p1.x;
    const distanceY: number = p2.y - p1.y;

    // Calculate the new distance based on the percentage
    const newDistanceX: number = distanceX * (percentage / 100);
    const newDistanceY: number = distanceY * (percentage / 100);

    // Calculate the new p1 and p2 points
    const newP1: Point = {
    x: midpoint.x - newDistanceX / 2,
    y: midpoint.y - newDistanceY / 2,
    };

    const newP2: Point = {
    x: midpoint.x + newDistanceX / 2,
    y: midpoint.y + newDistanceY / 2,
    };

    // Create and return the new segment
    const newSegment: Segment = {
    p1: newP1,
    p2: newP2,
    };

    return newSegment;
}

export function calculateSidelinesPoints(p1:Vector2D, p2:Vector2D, p1p2Distance:number): [[Vector2D, Vector2D], [Vector2D, Vector2D]]{
  const p1p2Angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);


  const p1p2AngleMinHalfPI = p1p2Angle - Math.PI/2;
  let diff = p1p2AngleMinHalfPI;
  diff += (diff>Math.PI) ? -Math.PI*2 : (diff<-Math.PI) ? Math.PI*2 : 0;

  // console.log("diff = "+diff);

  const d = p1p2Distance / 2;
  const hyp = d;
  const a = diff;
  const adj = Math.cos(a) * hyp;
  const opp = Math.sin(a) * hyp;

  // console.log("adj = "+adj);
  // console.log("opp = "+opp);

  const sl1p1X = p1.x + adj; 
  const sl1p1Y = p1.y + opp; 

  const sl2p1X = p1.x - adj; 
  const sl2p1Y = p1.y - opp; 

  // console.log("node1 = "+this.nodes[0].id, ", node2 = "+this.nodes[1].id)

  const sl1p1 = new Position(sl1p1X, sl1p1Y);
  const sl2p1 = new Position(sl2p1X, sl2p1Y);


  //l1s1p2 and l1s1p2 

  const sl1p2X = p2.x + adj; 
  const sl1p2Y = p2.y + opp; 

  const sl2p2X = p2.x - adj; 
  const sl2p2Y = p2.y - opp; 


  const sl1p2 = new Position(sl1p2X, sl1p2Y);
  const sl2p2 = new Position(sl2p2X, sl2p2Y);
  
  return [[sl1p1, sl1p2],[sl2p1, sl2p2]];
}

export function createShrinkedSegment(seg: Segment, start: Point, d: number): Segment {
  const { p1: segP1, p2: segP2 } = seg;

  // Calculate the length of the original segment
  const segLength = Math.sqrt(
    Math.pow(segP2.x - segP1.x, 2) + Math.pow(segP2.y - segP1.y, 2)
  );

  // Calculate the ratio of the desired length to the original length
  const ratio = (segLength - d) / segLength;

  // Calculate the new end point based on the desired length
  const newP2: Point = {
    x: segP1.x + (segP2.x - segP1.x) * ratio,
    y: segP1.y + (segP2.y - segP1.y) * ratio
  };

  // Create and return the new segment
  const newSegment: Segment = {
    p1: start,
    p2: newP2
  };

  return newSegment;
}


export function getPointAlongSegment(seg: Segment, idx: number, d: number): Vector2D {


  const p0 = idx? seg.p2 : seg.p1;
  const p1 = idx? seg.p1 : seg.p2; //seg[idx === seg.length - 1 ? idx - 1 : idx + 1];

  const dx = p1.x - p0.x;
  const dy = p1.y - p0.y;
  const length = Math.sqrt(dx * dx + dy * dy);

  // if (length === 0) {
  //   return null; // Invalid segment (zero length)
  // }

  const ux = dx / length;
  const uy = dy / length;

  const qx = p0.x + (d * uy);
  const qy = p0.y - (d * ux);

  return { x: qx, y: qy };
}

export function calculateSlope(p1: Point, p2: Point): number {
  if (p1.x === p2.x) {
      // Handle vertical line case to avoid division by zero
      return Infinity;
  }
  // console.log("p2.y - p1.y", p2.y - p1.y)

  return (p2.y - p1.y) / (p2.x - p1.x);
}

export function getPositionOnSegment(s: Segment, p: Point, d: number): Point | null {
  const length = Math.sqrt(Math.pow(s.p2.x - s.p1.x, 2) + Math.pow(s.p2.y - s.p1.y, 2));
  
  if (length === 0) {
    return null; // Segment has zero length, cannot determine position
  }
  
  const t = d / length;
  const position = {
    x: p.x + t * (s.p2.x - s.p1.x),
    y: p.y + t * (s.p2.y - s.p1.y),
  };
  
  return position;
}

export function getOrthogonalPoints(segment: Segment, point: Point, distance: number): [Point, Point] {
  const { p1, p2 } = segment;

  // Calculate the vector representing the segment
  const segmentVector = { x: p2.x - p1.x, y: p2.y - p1.y };

  // Normalize the segment vector
  const segmentLength = Math.sqrt(segmentVector.x ** 2 + segmentVector.y ** 2);
  const normalizedSegmentVector = {
    x: segmentVector.x / segmentLength,
    y: segmentVector.y / segmentLength,
  };

  // Calculate the orthogonal vector
  const orthogonalVector = {
    x: -normalizedSegmentVector.y,
    y: normalizedSegmentVector.x,
  };

  // Calculate the offset points
  const offsetDistance = distance;
  const offsetPoint1 = {
    x: point.x + orthogonalVector.x * offsetDistance,
    y: point.y + orthogonalVector.y * offsetDistance,
  };
  const offsetPoint2 = {
    x: point.x - orthogonalVector.x * offsetDistance,
    y: point.y - orthogonalVector.y * offsetDistance,
  };

  return [offsetPoint1, offsetPoint2];
}

// export const coordSizeToSize = (coordSize:CoordSize):Size=>{
//   let width;
//   if(coordSize.x1 * coordSize.x2<0){
//     width = Math.abs(coordSize.x1) + Math.abs(coordSize.x2); 
//   }else{
//     width = Math.abs(Math.abs(coordSize.x2) - Math.abs(coordSize.x1)); 
//   }
// }