import { v4 } from 'uuid';

export enum PlanElementTypeName {Line}

export class PlanProps {
    dimensions:Dimensions = new Dimensions(0,0);
    position:Position = new Position(0,0);
    scale: number = 1;
    
    // constructor(dimensions:Dimensions, position:Position){
    //     this.dimensions = dimensions;
    //     this.position = position;

    // } 
}


export class Dimensions{
    w:number;
    h:number;

    constructor(w:number, h:number){
        this.w = w;
        this.h = h;
    } 
}

export class Point{
    id:string = v4();
    x:number;
    y:number;

    constructor(x:number, y:number){
        this.x = x;
        this.y = y;
    } 
}


export class Position{
    x:number;
    y:number;

    constructor(x:number, y:number){
        this.x = x;
        this.y = y;
    } 
}

export class Scale{
    x:number;
    y:number;

    constructor(x:number, y:number){
        this.x = x;
        this.y = y;
    } 
}

class Offsets{
    left:number;
    right:number;
    top:number;
    bottom:number;

    constructor(left:number, right:number, top:number, bottom:number){
        this.left = left;
        this.right = right;
        this.top = top;
        this.bottom = bottom;
    }
}

export abstract class PlanElement {
    id:string;
    protected selected:boolean = false;
    onPointerDown:boolean = false;
    typeName:PlanElementTypeName;

    constructor(id:string, typeName:PlanElementTypeName){
        this.id = id;
        this.typeName = typeName;
    }

    getSelected():boolean {
        return this.selected;
    }

    setSelected(selected:boolean) {
        this.selected = selected;
    }

    setOnPointerDown(value: boolean) {
        this.onPointerDown = value;
    }
}

export class Rectangle extends PlanElement{
    private x:number;
    private y:number;
    private w:number;
    private h:number;
    private x1:number;
    private y1:number;
    private x2:number;
    private y2:number;

    constructor(id:string, typeName:PlanElementTypeName, x:number, y:number, w:number, h:number){
        super(id, typeName);
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.x1 = x;
        this.y1 = y;
        this.x2 = x + w;
        this.y2 = y + h;
    }

    setX(x:number){
        this.x = x;
        this.x1 = x;
        this.x2 = x + this.w;
    }

    setY(y:number){
        this.y = y;
        this.y1 = y;
        this.y2 = y + this.h;
    }

    setPos(x:number, y:number){
        this.setX(x);
        this.setY(y);
    }

    getX():number{
        return this.x;
    }

    getX1():number{
        return this.x1;
    }

    getX2():number{
        return this.x2;
    }

    getY():number{
        return this.y;
    }

    getY1():number{
        return this.y1;
    }

    getY2():number{
        return this.y2;
    }

    getW():number{
        return this.w;
    }

    getH():number{
        return this.h;
    }
}

export enum LinePointMode {MovePoint, AddPoint, RemovePointThenJoin, RemovePointNoJoin}

export class Line extends PlanElement {
    path:Point[];
    pathIsClose:boolean = false;
    defaultLinePointMode:LinePointMode = LinePointMode.MovePoint;
    linePointMode:LinePointMode = this.defaultLinePointMode;
    // selectedPointIndex:number | null = null;
    selectedPointId:string | null = null;
    addPointSession:AddPointSession | null = null;
    // pointIndexCursorIsOver:number | null = null;
    pointIdCursorIsOver:string | null = null;
    pointIdPointingDownOn:string | null = null;
    pointRadius = 20;
    memoizedMoveOrAddMode:LinePointMode = this.defaultLinePointMode;
    width:number;

    constructor(id:string, path:Point[], width:number){
        super(id, PlanElementTypeName.Line);
        this.path = path;
        this.width = width;
    }

    toggleMoveAddModes(){
        this.linePointMode = this.linePointMode === LinePointMode.MovePoint ? LinePointMode.AddPoint : LinePointMode.MovePoint;
    }

    // toNextLinePointMode(){
    //     const sortedModes = [LinePointMode.MovePoint, LinePointMode.AddPoint];
    //     for(let i=0; i<sortedModes.length; i++){
    //         const loopState = sortedModes[i];
    //         if(this.linePointMode === loopState){
    //             if(i<sortedModes.length-1){
    //                 this.linePointMode = sortedModes[i+1];
    //                 return;
    //             }
    //             this.linePointMode = sortedModes[0];
    //             return
    //         }
    //     }
    // }

    // selectPointIndex(pointIndex:number){
    //     this.selectedPointIndex = pointIndex;
    // }
    selectPointId(pointId:string | null){
        this.selectedPointId = pointId;
    }
    getPathPointById(pointId:string): Point | undefined {
        return this.path.find(p => p.id === pointId);
    }
    getPathPointIndexById(pointId:string): number {
        return this.path.findIndex(p => p.id === pointId);
    }
    updatePathPointPositionById(pointId:string, newPoint:Point) {
        let pointToUpdate = this.getPathPointById(pointId);
        if(!pointToUpdate) return;
        pointToUpdate.x = newPoint.x;
        pointToUpdate.y = newPoint.y;
    }
    // unselectPointIndex(){
    //     this.selectedPointIndex = null;
    // }

    // unselectPointId(){
    //     this.selectedPointId = null;
    // }

    startAddPointSession(startPointId:string){
        this.addPointSession = new AddPointSession(this.id, startPointId);
    }

    endAddPointSession(){
        this.addPointSession = null;
        this.pointIdCursorIsOver = null;
        // alert(this.pointIdCursorIsOver)
        // this.selectedPointIndex = null;
    }

    removePoint(id:string, join:boolean){
        console.log("join", join)
        const pIndex = this.getPathPointIndexById(id);
        if(join){
            this.path.splice(pIndex, 1);
            if(this.path.length == 2 && this.pathIsClose){
                this.pathIsClose = false;
            }
            return;
        }
        const newPath:Point[] = [];

        let offset = 1;
        let minimumValue = 0;
        let modulus = this.path.length;

        for(let i=0; i<this.path.length; i++){
            const index = (pIndex + i - 1 - minimumValue + (offset % modulus) + modulus) % modulus + minimumValue;
            newPath.push(this.path[index]);
        }
        this.path = newPath;
        this.pathIsClose = false;
        this.path.splice(0, 1);
    }

    removeSubPath(idStart:string, idEnd:string){
        this.pathIsClose = false;
    }

    addPointAndEndAddPointSession(point:Point, startingFromPointId:string){
        console.log("startingFromPointId",startingFromPointId)
        // if(this.addPointSession?.pointIndexCursorIsOver !== null){
        const startingFromPointIndex = this.getPathPointIndexById(startingFromPointId);
        console.log("startingFromPointIndex",startingFromPointIndex)
        if(this.pointIdCursorIsOver === startingFromPointId){
            this.endAddPointSession();
            return;
        }
        else if(this.pointIdCursorIsOver !== null){
            const pointIndexCursorIsOver = this.getPathPointIndexById(this.pointIdCursorIsOver);
            //if starting point and target are extremity points we close the path
            if( (startingFromPointIndex === 0 && pointIndexCursorIsOver === this.path.length - 1) ||
                (pointIndexCursorIsOver === 0 && startingFromPointIndex === this.path.length - 1)){
                this.pathIsClose = true;
                //if we close path we also remove the LinePointMode.AddPoint mode for a better user experience;
                if(this.linePointMode === LinePointMode.AddPoint){
                    this.linePointMode = LinePointMode.MovePoint;
                }
                this.endAddPointSession();
                return;
            }
            // this.endAddPointSession();
            // return;
        }
        
        let newPointIndex = startingFromPointIndex === 0 ? 0 : startingFromPointIndex + 1;

        if(startingFromPointIndex === 0){
            newPointIndex = startingFromPointIndex;
        }else if(startingFromPointIndex === this.path.length - 1){
            newPointIndex = startingFromPointIndex + 1;
        }else{
            //determining adding before or after startingFromPoint
            const pN = point;
            const pS = this.path[startingFromPointIndex];
            const pB = this.path[startingFromPointIndex - 1];
            const pA = this.path[startingFromPointIndex + 1];

            const pSpBAngle = Math.atan2(pB.y - pS.y, pB.x - pS.x);
            const pSpNAngle = Math.atan2(pN.y - pS.y, pN.x - pS.x);
            let diff1 = pSpNAngle - pSpBAngle;
            diff1 += (diff1>Math.PI) ? -Math.PI*2 : (diff1<-Math.PI) ? Math.PI*2 : 0;

            const pSpAAngle = Math.atan2(pA.y - pS.y, pA.x - pS.x);
            let diff2 = pSpNAngle - pSpAAngle;
            diff2 += (diff2>Math.PI) ? -Math.PI*2 : (diff2<-Math.PI) ? Math.PI*2 : 0;

            newPointIndex = Math.abs(diff1) < Math.abs(diff2) ? startingFromPointIndex : startingFromPointIndex + 1;
        }
        // const newPointIndex = startingFromPointIndex === 0 ? 0 : startingFromPointIndex + 1;
        // const newPointIndex = Math.abs(diff1) < Math.abs(diff2) ? startingFromPointIndex : startingFromPointIndex + 1;

        this.path.splice(newPointIndex, 0, point);
        this.selectPointId(this.path[newPointIndex].id);
        this.endAddPointSession();
    }

    // updatePointIndexCursor(cursor:Point):boolean{
    //     const pointIndexCursorIsOverBefore = this.pointIndexCursorIsOver;
    //     for(let i=0; i<this.path.length; i++){
    //         if(Math.sqrt( Math.pow(cursor.x - this.path[i].x, 2) +  Math.pow(cursor.y - this.path[i].y, 2)) < this.pointRadius){
    //             this.pointIndexCursorIsOver = i;
    //             return (!(this.pointIndexCursorIsOver === pointIndexCursorIsOverBefore));
    //         }
    //     }
    //     this.pointIndexCursorIsOver = null;
    //     return (!(this.pointIndexCursorIsOver === pointIndexCursorIsOverBefore));
    // }

    pointOverJoinablePoint = (pointId:string, planScale:number):boolean => {
        const point = this.getPathPointById(pointId) as Point;
        if(!point) return false;

        const lastPoint = this.path[this.path.length-1];
        const firstPoint = this.path[0];
        const pointRadius = this.pointRadius * 1/planScale;
        if(firstPoint.id === pointId){
          const d = Math.sqrt( Math.pow(point.x - lastPoint.x, 2) +  Math.pow(point.y - lastPoint.y, 2))
          if(d < pointRadius){
            return true;
          }
        }
        else if(lastPoint.id === pointId){
          const d = Math.sqrt( Math.pow(point.x - firstPoint.x, 2) +  Math.pow(point.y - firstPoint.y, 2))
          if(d < pointRadius){
            return true;
          }
        }
        return false;
    }

    joinExtremePoints(){
        this.path.splice(this.path.length - 1, 1);
        this.pathIsClose = true;
    }

    onRemovePointMode():boolean{
        return this.linePointMode === LinePointMode.RemovePointNoJoin || this.linePointMode === LinePointMode.RemovePointThenJoin;
    }

    toDefaultMode(){
        this.linePointMode = this.defaultLinePointMode;
    }
    
    override setSelected(selected:boolean){
        this.selected = selected;
        if(!selected){
            this.selectedPointId = null;
            if(this.linePointMode != LinePointMode.RemovePointNoJoin && this.linePointMode != LinePointMode.RemovePointThenJoin) return;
            this.linePointMode = this.defaultLinePointMode;
        }
    }
}

class AddPointSession{
    lineId:string;
    startPointId:string;
    // pointIndexCursorIsOver:number | null = null;
    // active:boolean= false; //when cursor is over a point, the addPointSession becomes unactive so we can click on that point

    constructor(lineId:string, startPointId:string){
        this.lineId = lineId;
        this.startPointId = startPointId;
    }
}