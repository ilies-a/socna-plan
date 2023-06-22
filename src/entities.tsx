import { v4 } from 'uuid';
import { calculateAngle, calculateSidelinesPoints, calculateSlope, cloneArray, doSegmentsIntersect, getDistance, getOrthogonalPoints, getOrthogonalProjection, getPointAlongSegment, getPositionOnSegment, isPointInPolygon, radiansToDegrees, sortPointsClockwise } from './utils';
import { BIG_NUMBER, NAME_TEXT_DEFAULT_FONT_SIZE, NODE_RADIUS, PRECISION, RES_WIDTH } from './global';

// export enum PlanElementClassName {AllJointSegs};
export enum SegClassName {Wall, REU, REP, AEP, Gutter, Pool, RoadDrain, AgrDrain};
export enum JointSegsClassName {JointWalls, JointREUs, JointREPs, JointAEPs, JointGutters, JointPools, JointRoadDrains, JointAgrDrains};


export class PlanProps {
    dimensions:Dimensions = new Dimensions(0,0);
    position:Position = new Position(0,0);
    scale: number = 1; 
}

export enum PlanMode { Move, AddSeg, AddPlanElement, MovePoint, AddPoint, RemovePointThenJoin, RemovePointNoJoin, Export }

export class PlanElementsHelper {
    static clone(planElements:PlanElement[]):PlanElement[]{
        const planElementsClone:PlanElement[] = [];
        for(const el of planElements){
            planElementsClone.push(el.clone());
        }
        return planElementsClone;
    }

    static findElementById(planElements:PlanElement[], planElementId:string): PlanElement | undefined{
        return planElements.find(el => el.id === planElementId)
    }

    static findElementIndexById(planElements:PlanElement[], planElementId:string): number{
        return planElements.findIndex(el => el.id === planElementId)
    }

    static hasSelectedElement(planElements:PlanElement[]):boolean{
        for(const el of planElements){
            if(el.getSelected()) return true;
        }
        return false;
    }

    static getSelectedElement(planElements:PlanElement[]):PlanElement | null{
        for(const el of planElements){
            if(el.getSelected()) return el;
        }
        return null;
    }


    static unselectAllElements(planElements:PlanElement[]){
        for(const el of planElements){
            el.unselect();
        }
    }

    static getAllJointSegs(planElements:PlanElement[]):AllJointSegs{
        return (planElements[0] as AllJointSegs);
    }

    static getEditableElements(planElements:PlanElement[]):[PlanElement, SheetDataEditable][]{
        const result:[PlanElement, SheetDataEditable][] = [];
        for(const el of planElements){
            if(el instanceof AllJointSegs){
                for(const jointSegs of el.jointSegs){
                    for(const segId in jointSegs.segs){
                        const seg = jointSegs.segs[segId];
                        if(!seg.nameTextVisibility) continue;
                        result.push([el,seg]);
                    }
                }
            }
        }
        return result;
    }

    static selectElement(planElements:PlanElement[], element:SheetDataEditable){
        if(element instanceof PlanElement){

        }
        else{
            const seg = element as Seg;
            const allJointSegs = this.getAllJointSegs(planElements);
            allJointSegs.selectSeg(element as Seg);
            // let jointSegs:JointSegs;
            // if(seg instanceof Wall){
            //     jointSegs = allJointSegs.jointWalls;
            // }
            // else if (seg instanceof REP){
            //     jointSegs = allJointSegs.jointREPs;
            // }
            // else if (seg instanceof REU){
            //     jointSegs = allJointSegs.jointREUs;
            // }
            // else if (seg instanceof AEP){
            //     jointSegs = allJointSegs.jointAEPs;
            // }
            // else{
            //     return; //should throw error
            // }
            // jointSegs.selectSeg(seg.id);
        }
        
    }

    static calculateAllElementsWrapperCoordSize(planElements:PlanElement[]):CoordSize{
        const allJointSegs = this.getAllJointSegs(planElements);
        const allJointSegsCoordSize = allJointSegs.calculateCoordSize();
        //todo: other symbols coordSize and compare them
        return allJointSegsCoordSize;
    } 
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
    id:string;
    x:number;
    y:number;

    constructor(id: string, x:number, y:number){
        this.id = id;
        this.x = x;
        this.y = y;
    } 
}


export interface Vector2D{
    x:number;
    y:number;
}


export class Position{
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
    onPointerDown:boolean = false;
    // typeName:PlanElementTypeName;
    // instantiatedClassName: PlanElementClassName | undefined;

    constructor(id:string){
        this.id = id;
    }

    getSelected():boolean {
        return false;
    }

    // setSelected(selected:boolean) {
    //     this.selected = selected;
    // }

    setOnPointerDown(value: boolean) {
        this.onPointerDown = value;
    }

    clone():PlanElement{
        return this;
    }

    unselect(){
    }

    delete(){

    }
}

export class PlanElementNameText {

}


export class PlanElementsRecordsHandler{
    records: PlanElement[][] = [[]];
    currentRecordIndex: number = 0;
    clone():PlanElementsRecordsHandler {
        const planElementsRecordsHandlerClone = new PlanElementsRecordsHandler();
        planElementsRecordsHandlerClone.currentRecordIndex = this.currentRecordIndex;
        planElementsRecordsHandlerClone.records = this.records.map(planElements => PlanElementsHelper.clone(planElements));
        return planElementsRecordsHandlerClone;
    }
}

export class IconData{
    fileName:string;
    dimensions:Dimensions;
  
    constructor(fileName:string, dimensions:Dimensions){
      this.fileName = fileName;
      this.dimensions = dimensions;
    }
  }
  
export const iconDataArr:IconData[] = [
    new IconData("seg.png", new Dimensions(50,50)),
    new IconData("alim-eau-pot.png", new Dimensions(50,50)),
    new IconData("canal-eau-pluv.png", new Dimensions(50,50)),
    new IconData("canal-eau-use.png", new Dimensions(50,50)),
    new IconData("compass.png", new Dimensions(50,50)),
    new IconData("compt-eau.png", new Dimensions(50,50)),
    new IconData("add-el.png", new Dimensions(50,50)),
    new IconData("add-point.png", new Dimensions(50,50)),
    new IconData("del-el.png", new Dimensions(50,50)),
    new IconData("del-point.png", new Dimensions(50,50)),
    new IconData("del-seg.png", new Dimensions(50,50)),
    new IconData("eau-pluv.png", new Dimensions(50,50)),
    new IconData("fosse.png", new Dimensions(50,50)),
    new IconData("gout.png", new Dimensions(50,50)),
    new IconData("move.png", new Dimensions(50,50)),
    new IconData("puit.png", new Dimensions(50,50)),
    new IconData("regards.png", new Dimensions(50,50)),
    new IconData("text.png", new Dimensions(50,50)),
    new IconData("vanne-aep.png", new Dimensions(50,50)),
    new IconData("arrow-prev.png", new Dimensions(50,50)),
    new IconData("arrow-next.png", new Dimensions(50,50)),
    new IconData("magnet.png", new Dimensions(50,50)),
    new IconData("export.png", new Dimensions(50,50)),
    new IconData("zoom-in.png", new Dimensions(50,50)),
    new IconData("zoom-out.png", new Dimensions(50,50)),

  ];


export class AllJointSegs extends PlanElement{
    // public readonly NAME:PlanElementClassName = PlanElementClassName.AllJointSegs;
    jointWalls: JointWalls = new JointWalls({});
    jointREPs: JointREPs = new JointREPs({});
    jointREUs: JointREUs = new JointREUs({});
    jointAEPs: JointAEPs = new JointAEPs({});
    jointGutters: JointGutters = new JointGutters({});
    jointPools: JointPools = new JointPools({});
    jointRoadDrains: JointRoadDrains = new JointRoadDrains({});
    jointAgrDrains: JointAgrDrains = new JointAgrDrains({});

    jointSegs: JointSegs[] = [
        this.jointWalls,
        this.jointREPs,
        this.jointREUs,
        this.jointAEPs,
        this.jointGutters,
        this.jointPools,
        this.jointRoadDrains,
        this.jointAgrDrains,
    ]; 

    constructor(id:string){
        super(id);
        // this.instantiatedClassName = this.NAME;
    }

    setJointSegs(jointSegs: JointSegs){
        if(jointSegs instanceof JointWalls){
            this.jointWalls = jointSegs as JointWalls;
        }
        else if(jointSegs instanceof JointREPs){
            this.jointREPs = jointSegs as JointREPs;
        }else if(jointSegs instanceof JointREUs){
            this.jointREUs = jointSegs as JointREUs;
        }
        else if(jointSegs instanceof JointAEPs){
            this.jointAEPs = jointSegs as JointAEPs;
        }
        else if(jointSegs instanceof JointGutters){
            this.jointGutters = jointSegs as JointGutters;
        }
        else if(jointSegs instanceof JointPools){
            this.jointPools = jointSegs as JointPools;
        }
        else if(jointSegs instanceof JointRoadDrains){
            this.jointRoadDrains = jointSegs as JointRoadDrains;
        }
        else if(jointSegs instanceof JointAgrDrains){
            this.jointAgrDrains = jointSegs as JointAgrDrains;
        }
    }

    getSelectedJointSegs(): JointSegs | null{
        for(const jointSegsItem of this.jointSegs){
            if(jointSegsItem.selectedSegId!= null) return jointSegsItem;
        }
        return null;
    }

    selectSeg(seg:Seg){
        let jointSegs: JointSegs;
        if(seg instanceof Wall){
            jointSegs = this.jointWalls;
        }
        else if (seg instanceof REP){
            jointSegs = this.jointREPs;
        }
        else if (seg instanceof REU){
            jointSegs = this.jointREUs;
        }
        else if (seg instanceof AEP){
            jointSegs = this.jointAEPs;
        }
        else if (seg instanceof Gutter){
            jointSegs = this.jointGutters;
        }
        else if (seg instanceof Pool){
            jointSegs = this.jointPools;
        }
        else if (seg instanceof RoadDrain){
            jointSegs = this.jointRoadDrains;
        }
        else if (seg instanceof AgrDrain){
            jointSegs = this.jointAgrDrains;
        }
        else{
            return; //should throw error
        }
        jointSegs.selectSeg(seg.id);

    }

    override getSelected():boolean{
        for(const jointSegsItem of this.jointSegs){
            if(jointSegsItem.selectedSegId!= null) return true;
        }
        return false;
    }

    override unselect(): void {
        for(const jointSegsItem of this.jointSegs){
            jointSegsItem.unselect();
        }
    }
    override clone(): AllJointSegs {
        const ajsClone = new AllJointSegs(this.id);
        const jwClone = this.jointWalls.clone();
        const jREPsClone = this.jointREPs.clone();
        const jREUsClone = this.jointREUs.clone();
        const jAEPsClone = this.jointAEPs.clone();
        const jGuttersClone = this.jointGutters.clone();
        const jPoolsClone = this.jointPools.clone();
        const jRoadDrainsClone = this.jointRoadDrains.clone();
        const jAgrDrainsClone = this.jointAgrDrains.clone();

        ajsClone.jointSegs = [];

        ajsClone.jointWalls = jwClone as JointWalls;
        ajsClone.jointSegs.push(ajsClone.jointWalls);

        ajsClone.jointREPs = jREPsClone as JointREPs;
        ajsClone.jointSegs.push(ajsClone.jointREPs);

        ajsClone.jointREUs = jREUsClone as JointREUs;
        ajsClone.jointSegs.push(ajsClone.jointREUs);

        ajsClone.jointAEPs = jAEPsClone as JointAEPs;
        ajsClone.jointSegs.push(ajsClone.jointAEPs);

        ajsClone.jointGutters = jGuttersClone as JointAEPs;
        ajsClone.jointSegs.push(ajsClone.jointGutters);

        ajsClone.jointPools = jPoolsClone as JointAEPs;
        ajsClone.jointSegs.push(ajsClone.jointPools);

        ajsClone.jointRoadDrains = jRoadDrainsClone as JointAEPs;
        ajsClone.jointSegs.push(ajsClone.jointRoadDrains);

        ajsClone.jointAgrDrains = jAgrDrainsClone as JointAEPs;
        ajsClone.jointSegs.push(ajsClone.jointAgrDrains);


        // ajsClone.jointSegs = [
        //     jwClone,
        //     jREPsClone,
        //     jREUsClone,
        //     jAEPsClone
        // ]
        return ajsClone;
    }

    calculateCoordSize():CoordSize{
        let xMin!:number;
        let xMax!:number;
        let yMin!:number;
        let yMax!:number;
        let margin = 50; 
        for(const jointSegsItem of this.jointSegs){
            for(const nodeId in jointSegsItem.nodes){
                const nodePosition = jointSegsItem.nodes[nodeId].position;
                if(!xMin){
                    xMin = nodePosition.x;
                }
                if(!xMax){
                    xMax = nodePosition.x;
                }
                if(!yMin){
                    yMin = nodePosition.y;
                }
                if(!yMax){
                    yMax = nodePosition.y;
                }
                
                if(nodePosition.x < xMin){
                    xMin = nodePosition.x;
                }
                if(nodePosition.x > xMax){
                    xMax = nodePosition.x;
                }
                if(nodePosition.y < yMin){
                    yMin = nodePosition.y;
                }
                if(nodePosition.y > yMax){
                    yMax = nodePosition.y;
                }
            }
        }

        return {x1:xMin! - margin, y1:yMin! - margin, x2:xMax! + margin, y2:yMax! + margin};
    }

}


export abstract class JointSegs {
    nodes: {[nodeId: string]: SegNode;};
    segs: {[id:string]:Seg;};
    // width: number = WALL_WIDTH;
    selectedSegId:string | null = null;
    nodesToPrint:SegNode[][] = [];
    // instantiatedClassName: JointSegsClassName | undefined;

    constructor(nodes: {[nodeId: string]: SegNode;}){
        this.nodes = nodes;
        this.segs = this.getSegs();
    }

    addNode(node:SegNode){
        for(const linkedNode of node.linkedNodes){
            if(linkedNode.linkedNodes.find(iterLinkedNode => iterLinkedNode.id === node.id)) continue;
            linkedNode.linkedNodes.push(node);
        }
        this.nodes[node.id] = node;
    }

    sortNodesByIdInAlphabeticOrder(nodes:[SegNode, SegNode]) {
        (nodes as [SegNode, SegNode]).sort((a, b) => { 
            const sortedIds = [a.id, b.id].sort();
            const aIdIndex = sortedIds.findIndex(id => id === a.id);
            const bIdIndex = sortedIds.findIndex(id => id === b.id);
            return aIdIndex - bIdIndex;
        });
    }

    createSeg(nodes: [SegNode, SegNode]):Seg{
        return new Wall(nodes); //will be overridden, must return a Seg here to to avoid error 
    }

    // createSeg(nodes: [SegNode, SegNode]):Seg{
    //     switch(this.instantiatedClassName){
    //         case(JointSegsClassName.JointREPs):{
    //             return new REP(nodes);
    //         }
    //         case(JointSegsClassName.JointREUs):{
    //             return new REU(nodes);
    //         }
    //         default :
    //             return new Wall(nodes);
    //     }
    // }

    getSegs(): {[id:string]:Seg;} {
        const segs: {[id:string]:Seg;} = {};
        const segmentsDone: {[id: string]: boolean;} = {};
        
        for(const nodeId in this.nodes){
            const node = this.nodes[nodeId];
            for(const linkedNode of node.linkedNodes){
                const sortedNodesById:[SegNode, SegNode] = [node, linkedNode];
                this.sortNodesByIdInAlphabeticOrder(sortedNodesById);
                const sortedConcatenatedIds = sortedNodesById[0].id + sortedNodesById[1].id;
                if(segmentsDone[sortedConcatenatedIds]) continue;
                segs[sortedConcatenatedIds] = this.createSeg([sortedNodesById[0], sortedNodesById[1]]);
                segmentsDone[sortedConcatenatedIds] = true;
            }
        }





        //segs may have some data binded like a numero we need to copy it:
        for(const segId in this.segs){
            if(segs.hasOwnProperty(segId)){
                const seg = segs[segId];
                const thisSeg = this.segs[segId];
                seg.numero = thisSeg.numero;
                seg.elementNameForRendering = thisSeg.elementNameForRendering;
                seg.nameTextVisibility = thisSeg.nameTextVisibility;
                seg.nameTextPosition = thisSeg.nameTextPosition;
                seg.nameTextRotation = thisSeg.nameTextRotation;
                seg.nameTextFontSize = thisSeg.nameTextFontSize;
                if(seg instanceof Wall && thisSeg instanceof Wall){
                    seg.sinister = thisSeg.sinister;
                }
                if(seg instanceof Res){
                    (seg as Res).arrowStatus = (thisSeg as Res).arrowStatus;
                }
            }
        }

        // //if a node is between two nodes and the three nodes are aligned (so two segs in total) then the node is useless
        // //we remove the node and simplify the two aligned segs into a single seg


        // //if two segs are aligned and share a node
        // //if true if this node has only two linked nodes (so one in each seg) then we remove it and join the two extreme nodes


        // const alignedSegs: Seg[][]= [];

        // const visitedSegs: {[segId: string]: boolean;} = {};

        // for(const segId in segs){
        //     if(visitedSegs.hasOwnProperty(segId)) continue;
        //     const seg = segs[segId];
        //     const segNode1 = seg.nodes[0];
        //     const segNode2 = seg.nodes[1];

            
        //     visitedSegs[segId] = true;

        // }

        // //END CHATGPT

        return segs;
    }

    setSegs(){
        this.segs = this.getSegs();
    }

    cleanSegs(selectNewCreatedSegAfterClean:boolean){
        this.setSegs();
        const segs = this.segs;

        interface Point {
            x: number;
            y: number;
          }
          


        function groupAlignedSegs(segs:Seg[]): Seg[][]{
            const alignedSegs: Seg[][] = [];

            const tolerance = 0.05;
            for (const seg of segs) {
                let foundNewGroup = false;
            
                for (const group of alignedSegs) {
                    const referenceSeg = group[0];

                    const referenceSegSlope = parseFloat(calculateSlope(referenceSeg.nodes[0].position, referenceSeg.nodes[1].position).toPrecision(1));
                    const segSlope = parseFloat(calculateSlope(seg.nodes[0].position, seg.nodes[1].position).toPrecision(1));
                    
                    // console.log("referenceSegSlope", referenceSegSlope)
                    // console.log("segSlope", segSlope)

                    if( segSlope === referenceSegSlope
                        // (referenceSegSlope === Infinity && segSlope === Infinity)
                        // ||
                        // (Math.abs(Math.abs(segSlope) - Math.abs(referenceSegSlope)) < tolerance)
                        ){
                        // console.log("foundNewGroup !!");
                        foundNewGroup = true;
                        group.push(seg);
                        break;
                    }
                }

                if (!foundNewGroup) {
                    alignedSegs.push([seg]);
                }
                // console.log("\n\n")

            }



            return alignedSegs;
        }
          

        let segsArr: Seg[] = [];

        for(const segId in segs){
            segsArr.push(segs[segId]);
        }


        const alignedSegsGroups = groupAlignedSegs(segsArr);

        // console.log("")
 
        
        function findFarthestNodes(nodes: SegNode[]): [SegNode, SegNode] | null {
            if (nodes.length < 2) {
            return null; // Not enough points to find a pair
            }
        
            let maxDistance = 0;
            let farthestPoints: [SegNode, SegNode] | null = null;
        
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const distance = getDistance(nodes[i].position, nodes[j].position);
                    if (distance > maxDistance) {
                        maxDistance = distance;
                        farthestPoints = [nodes[i], nodes[j]];
                    }
                }
            }

            return farthestPoints;
        }

        function findChainedSegs(segs: Seg[]): Seg[][] {
            const chains: Seg[][] = [];
            const visited: boolean[] = Array(segs.length).fill(false);
          
            function dfs(seg: Seg, chain: Seg[]): void {
                const nodeA = seg.nodes[0];
                const nodeB = seg.nodes[1];
              chain.push(seg);
              visited[segs.indexOf(seg)] = true;


              function nodeIsValid(node:SegNode){
                return node.linkedNodes.length<3;
              }
          
              const nextSegs = segs.filter(
                (w) =>
                  (
                    (w.nodes[0].id === nodeA.id && nodeIsValid(nodeA))
                    || (w.nodes[1].id === nodeA.id && nodeIsValid(nodeA))
                    || (w.nodes[0].id === nodeB.id && nodeIsValid(nodeB))
                    || (w.nodes[1].id === nodeB.id && nodeIsValid(nodeB))
                    ) &&
                //   segNodesAreValid(w) && // Check if all nodes in the seg are valid
                  !visited[segs.indexOf(w)]
              );
          
              for (const nextSeg of nextSegs) {
                dfs(nextSeg, chain);
              }
            }
          
            for (const seg of segs) {
              if (!visited[segs.indexOf(seg)]) {
                const chain: Seg[] = [];
                dfs(seg, chain);
                chains.push(chain);
              }
            }
          
            return chains;
          }
        

        let updateSegs = false;

        // const chainedSegsGroupsInsideEachAlignedSegsGroup:Seg[][][] = []; 
        for(const alignedSegsGroup of alignedSegsGroups){
            // console.log("alignedSegsGroup.length", alignedSegsGroup.length)

            if(alignedSegsGroup.length>1){
                const alignedAndChainedSegsGroups = findChainedSegs(alignedSegsGroup);
                // console.log("alignedAndChainedSegsGroups.length", alignedAndChainedSegsGroups.length)
                // chainedSegsGroupsInsideEachAlignedSegsGroup.push(chainedSegsGroups);


                // const segsAlignedAndSameDirectionGroups:Seg[] = [];
                for(const alignedAndChainedSegsGroup of alignedAndChainedSegsGroups){
                    //final part: find segs with nodes in successive position
                    // console.log("alignedAndChainedSegsGroup", alignedAndChainedSegsGroup);
                    // console.log("alignedAndChainedAndSameDirectionGroups.length", alignedAndChainedAndSameDirectionGroups.length);

                    const nodesObj:{[nodeId:string]:SegNode;} = {};
                    for(const w of alignedAndChainedSegsGroup){
                        nodesObj[w.nodes[0].id] = w.nodes[0];
                        nodesObj[w.nodes[1].id] = w.nodes[1];
                    }

                    const nodes:SegNode[] = [];

                    for(const nodeId in nodesObj){
                        nodes.push(nodesObj[nodeId]);
                    }

                    const farthestNodes = findFarthestNodes(nodes);

                    // console.log("farthestNodes.length", farthestNodes?.length);
                    if(farthestNodes){
                        const nodesToDelete = nodes.filter(n =>{
                            if(!(n.id != farthestNodes[0].id && n.id != farthestNodes[1].id)) return false;
                            for(const linkedNode of n.linkedNodes){
                                const found = nodes.find(m => m.id === linkedNode.id);
                                if(!found) return false;
                            }

                            //at this point we know the node will be delete so we remove it from linkedNodes of nodes linked to it
                            for(let i=0; i<2; i++){
                                const farthestNode = farthestNodes[i];
                                for(let j=0; j<farthestNode.linkedNodes.length; j++){
                                    if(farthestNode.linkedNodes[j].id === n.id){
                                        farthestNode.linkedNodes.splice(j, 1);
                                        // console.log('OK DELETE')
                                    }   
                                }
                            }
    
                            return true;
                            });
                        // console.log("nodesToDelete", nodesToDelete)

                        this.nodesToPrint.push(nodesToDelete);
                        // console.log("this.nodesToPrint", this.nodesToPrint)
                        if(nodesToDelete.length){
                            updateSegs = true;

                            for(const nodeId in this.nodes){
                                const node = this.nodes[nodeId];
                                node.linkedNodes = node.linkedNodes.filter(linkedNode => {
                                    for(const nodeToDelete of nodesToDelete){
                                        if(nodeToDelete.id === linkedNode.id) return false;
                                    }
                                    return true;
                                })
                            }
                            for(let i=0; i<2; i++){
                                const farthestNode = farthestNodes[i];
                                const otherFarthestNode = farthestNodes[i==0 ? 1:0];
                                const found = farthestNode.linkedNodes.find(n => n.id === otherFarthestNode.id);
                                if(found) continue;
                                farthestNode.linkedNodes.push(otherFarthestNode);
                            }
                            for(const nodeToDelete of nodesToDelete){
                                delete this.nodes[nodeToDelete.id];
                            }
                        }


                    }
                }
            }
        }
        // console.log("\n\n\n")

        if(updateSegs) {
            if(selectNewCreatedSegAfterClean){
                const segsIdsBefore: {[id: string]: boolean;} = {};
                for(const segId in this.segs){
                    segsIdsBefore[segId] = true;
                }
                this.setSegs();
                const segsIdsAfter: {[id: string]: boolean;} = {};
    
                for(const segId in this.segs){
                    segsIdsAfter[segId] = true;
                }
                for(const segIdAfter in segsIdsAfter){
                    if(!segsIdsBefore.hasOwnProperty(segIdAfter)){
                        this.selectedSegId  = segIdAfter;
                        break;
                    }
                }
            }else{
                this.setSegs();
            }
        }

    }

    setSegsPoints() {    
        const segsJointPoints: {[id:string]: [Position[], Position[]]} = {};

        for(const nodeId in this.nodes){
            const node = this.nodes[nodeId];
            const sortedLinkedNodes = node.getClockwiseSortedLinkedNodes();
            const segments:Seg[] = []
            for(const linkedNode of sortedLinkedNodes){
                segments.push(this.createSeg([node, linkedNode]));
            }

            for(let i=0; i<segments.length; i++){
                const seg = segments[i];
                const offset = 1;
                const minimumValue = 0;
                const modulus = segments.length;
                const nextSegIndex = (i - minimumValue + (offset % modulus) + modulus) % modulus + minimumValue;
                const prevSegIndex = i > 0? i - 1 : segments.length - 1;
        
                const nextSeg = segments[nextSegIndex];
                const prevSeg = segments[prevSegIndex];

                let sl:[Position, Position] = seg.sideline2Points;
                const nextSegSl:[Position, Position] = nextSeg.sideline1Points;
        
                let l1p1 = sl[0];
                let l1p2 = sl[1];
        
                let l2p1 = nextSegSl[0];
                let l2p2 = nextSegSl[1];
        
                let m1 = l1p2.x - l1p1.x != 0 ? (l1p2.y - l1p1.y) / (l1p2.x - l1p1.x) : BIG_NUMBER;
                m1 = parseFloat(m1.toPrecision(PRECISION));
                let m2 = l2p2.x - l2p1.x != 0 ? (l2p2.y - l2p1.y) / (l2p2.x - l2p1.x) : BIG_NUMBER;
                m2 = parseFloat(m2.toPrecision(PRECISION));

                let b1 = l1p1.y - m1 * l1p1.x;
                let b2 = l2p1.y - m2 * l2p1.x;

                let intersectionPointWithNextSegLine:Position;

                if(m1 - m2 != 0){
                    let x = (b2 - b1) / (m1 - m2);
                    let y = m1 * x + b1;
                    intersectionPointWithNextSegLine = new Position(x, y);
                }
                else{
                    
                    const p = node.position;
                    const slope = m1;
                    let b = b1;
                    const orthogonalSlope = slope != 0 ? -1 / slope : BIG_NUMBER; // Calculate the slope of the orthogonal line
                    const orthogonalIntercept = p.y - orthogonalSlope * p.x; // Calculate the y-intercept of the orthogonal line
                    const projectionX = (orthogonalIntercept - b) / (slope - orthogonalSlope); // Calculate the x-coordinate of the projection
                    const projectionY = orthogonalSlope * projectionX + orthogonalIntercept; // Calculate the y-coordinate of the projection
                    intersectionPointWithNextSegLine = new Position(projectionX, projectionY);
                }

                //prev point intersection
        
                sl = seg.sideline1Points;
                const prevSegSl:[Position, Position] = prevSeg.sideline2Points;
        
                l1p1 = sl[0];
                l1p2 = sl[1];
        
                l2p1 = prevSegSl[0];
                l2p2 = prevSegSl[1];
        

                m1 = l1p2.x - l1p1.x != 0? (l1p2.y - l1p1.y) / (l1p2.x - l1p1.x) : BIG_NUMBER;
                m1 = parseFloat(m1.toPrecision(PRECISION));
                m2 = l2p2.x - l2p1.x != 0? (l2p2.y - l2p1.y) / (l2p2.x - l2p1.x) : BIG_NUMBER;
                m2 = parseFloat(m2.toPrecision(PRECISION));
        
                b1 = l1p1.y - m1 * l1p1.x;
                b2 = l2p1.y - m2 * l2p1.x;
        
    
                // x = m1 - m2 != 0 ? (b2 - b1) / (m1 - m2) : BIG_NUMBER;
                // y = m1 * x + b1;
        
                // const intersectionPointWithPreviousSegLine = new Position(x, y);


                let intersectionPointWithPreviousSegLine:Position;

                if(m1 - m2 != 0){
                    let x = (b2 - b1) / (m1 - m2);
                    let y = m2 * x + b2;
                    intersectionPointWithPreviousSegLine = new Position(x, y);
                }
                else{

                    const p = node.position;
                    const slope = m2;
                    let b = b2;
                    const orthogonalSlope = slope != 0 ? -1 / slope : BIG_NUMBER; // Calculate the slope of the orthogonal line
                    const orthogonalIntercept = p.y - orthogonalSlope * p.x; // Calculate the y-intercept of the orthogonal line
                    const projectionX = (orthogonalIntercept - b) / (slope - orthogonalSlope); // Calculate the x-coordinate of the projection
                    const projectionY = orthogonalSlope * projectionX + orthogonalIntercept; // Calculate the y-coordinate of the projection
                    intersectionPointWithPreviousSegLine = new Position(projectionX, projectionY);
                }


                // console.log("\n\n")


                const p1 = seg.sideline1Points[0];
                const p2 = seg.sideline1Points[1];
                const p3 = seg.sideline2Points[1];
                const p4 = seg.sideline2Points[0];
        
        
        
                //check if segment position is valid, if not valid segment appears simply with its 4 points
                //position is valid if the farthest segment intersects prev and next side segments
        
        
                let isValid = true;
                //draw for testing
        
                const prevSegClosestSidePoints = prevSeg.sideline2Points;
                const nextSegClosestSidePoints = nextSeg.sideline1Points;
                const segBase = [p2 , p3];
                const prevSegBase = [prevSeg.sideline1Points[1], prevSeg.sideline2Points[1]];
                const nextSegBase = [nextSeg.sideline1Points[1], nextSeg.sideline2Points[1]];
        
                const segSideClosestToPrevSegSide = [p1 , p2];
                const segSideClosestToNextSegSide = [p3 , p4];
        
        
                const segBaseFormated = {
                    "p1": {"x":segBase[0].x, "y":segBase[0].y}, 
                    "p2": {"x":segBase[1].x, "y":segBase[1].y}, 
                };
                const segSideClosestToPrevSegSideFormated = {
                    "p1": {"x":segSideClosestToPrevSegSide[0].x, "y":segSideClosestToPrevSegSide[0].y}, 
                    "p2": {"x":segSideClosestToPrevSegSide[1].x, "y":segSideClosestToPrevSegSide[1].y}, 
                };
        
                const segSideClosestToNextSegSideFormated = {
                    "p1": {"x":segSideClosestToNextSegSide[0].x, "y":segSideClosestToNextSegSide[0].y}, 
                    "p2": {"x":segSideClosestToNextSegSide[1].x, "y":segSideClosestToNextSegSide[1].y}, 
                };
        
        
                const prevSegBaseFormated = {
                    "p1": {"x":prevSegBase[0].x, "y":prevSegBase[0].y}, 
                    "p2": {"x":prevSegBase[1].x, "y":prevSegBase[1].y}, 
                };
                const prevSegClosestSidePointsFormated = {
                    "p1": {"x":prevSegClosestSidePoints[0].x, "y":prevSegClosestSidePoints[0].y}, 
                    "p2": {"x":prevSegClosestSidePoints[1].x, "y":prevSegClosestSidePoints[1].y}, 
                };
        
                const nextSegBaseFormated = {
                    "p1": {"x":nextSegBase[0].x, "y":nextSegBase[0].y}, 
                    "p2": {"x":nextSegBase[1].x, "y":nextSegBase[1].y}, 
                };
                const nextSegClosestSidePointsFormated = {
                    "p1": {"x":nextSegClosestSidePoints[0].x, "y":nextSegClosestSidePoints[0].y}, 
                    "p2": {"x":nextSegClosestSidePoints[1].x, "y":nextSegClosestSidePoints[1].y}, 
                };
        
        
                if(
                    doSegmentsIntersect(segBaseFormated, prevSegClosestSidePointsFormated) 
                    || doSegmentsIntersect(segBaseFormated, nextSegClosestSidePointsFormated)
                    || doSegmentsIntersect(prevSegBaseFormated, segSideClosestToPrevSegSideFormated)
                    || doSegmentsIntersect(nextSegBaseFormated, segSideClosestToNextSegSideFormated)
        
                    ){
                    isValid = false;
                }
                
 
                const jointPointsNode1: Position[] = [];
                const jointPointsNode2: Position[] = [p2, p3]; //Node2 is linked Node 

                if(isValid){
        
                    const pi1 = intersectionPointWithNextSegLine;
                    const pi2 = intersectionPointWithPreviousSegLine;
                    
                    jointPointsNode1.push(pi1.x === BIG_NUMBER ? p4 : pi1, pi2.x === BIG_NUMBER ? p1 : pi2, node.position);
                }
                else{ //if not valid (superposition with other segments)
                    jointPointsNode1.push(p1, p4);
                }
            
                const segJointPoints:[Position[], Position[]] = [jointPointsNode1, jointPointsNode2];
                segsJointPoints[seg.nodes[0].id+"_"+seg.nodes[1].id] = segJointPoints;
            }
        }


        const memo: {[id:string]: boolean} = {};
        
        for(const segJointPointsId in segsJointPoints){
            let points:Position[] = [];

            const segJointPoints = segsJointPoints[segJointPointsId];
            const nodesIds = segJointPointsId.split('_');

            if(nodesIds.length != 2) continue; //todo : throw error

            const reverseSegJointPointsId = nodesIds[1] + "_" + nodesIds[0];
            if(memo.hasOwnProperty(reverseSegJointPointsId)) continue; //already done

            points = points.concat(segJointPoints[0]);

            if(segsJointPoints.hasOwnProperty(reverseSegJointPointsId)){
                points = points.concat(segsJointPoints[reverseSegJointPointsId][0]);                
            }
            else{
                points = points.concat(segJointPoints[1]);
            }
            memo[segJointPointsId] = true;

            sortPointsClockwise(points);

            const sortedNodeIds = [this.nodes[nodesIds[0]].id, this.nodes[nodesIds[1]].id].sort();
            const segId = sortedNodeIds[0] + sortedNodeIds[1];

            this.segs[segId].points = points;

        }
    }



    selectSeg(segId:string){
        // if(this.segIsSelected(nodesIds) != null) return;
        this.selectedSegId = segId;
    }

    unselectSeg(){
        this.selectedSegId = null;
        // const selectedSegIndex = this.segIsSelected(nodesIds);
        // if(selectedSegIndex === null) return;
        // this.selectedSegNodesIds.splice(selectedSegIndex, 1);
        // console.log("unselectSeg selectedSegIndex", selectedSegIndex);

    }
    segIsSelected(segId:string):boolean{ //returns the index of seg if selected
        return this.selectedSegId === segId;
    }

    // segClassNameToString(segClassName: SegClassName): string{
    //     switch(segClassName){
    //         case SegClassName.REP:{
    //             return "REP";
    //         }
    //         case SegClassName.REU:{
    //             return "REU";
    //         }
    //         default:
    //             return "Wall";
    //     }
    // }

    getSelectedSeg():Seg | null{
        return this.selectedSegId? this.segs[this.selectedSegId] : null;
    }

    hasSelectedSeg():boolean{
        return this.selectedSegId? true : false;
    }
    createNode(id:string, position: Vector2D, linkedNodes:SegNode[]):SegNode{
        return new SegNode(id, position, linkedNodes); //will be overridden, must return a Seg here to to avoid error 
    }

    addSegFromSeg(startingSeg:Seg, nodesPositions:[Vector2D, Vector2D]):[Seg, SegNode]{
        const startingSegNode1 = startingSeg.nodes[0];
        const startingSegNode2 = startingSeg.nodes[1];

        //nodesPositions[0] is the point on segNode1-segNode2 segment

        // const newSegNode1 = new SegNode(v4(), nodesPositions[0], [], this.instantiatedClassName!);
        // const newSegNode2 = new SegNode(v4(), nodesPositions[1], [], this.instantiatedClassName!);

        const newSegNode1 = this.createNode(v4(), nodesPositions[0], []);
        const newSegNode2 = this.createNode(v4(), nodesPositions[1], []);

        newSegNode1.linkedNodes = newSegNode1.linkedNodes.concat([startingSegNode1, startingSegNode2, newSegNode2]);
        newSegNode2.linkedNodes = newSegNode2.linkedNodes.concat([newSegNode1]);

        const startingSegNode1Node1UpdatedLinkedNodes = startingSegNode1.linkedNodes.filter(node => node.id != startingSegNode2.id);
        const startingSegNode2UpdatedLinkedNodes = startingSegNode2.linkedNodes.filter(node => node.id != startingSegNode1.id);

        startingSegNode1Node1UpdatedLinkedNodes.push(newSegNode1);
        startingSegNode2UpdatedLinkedNodes.push(newSegNode1);

        startingSegNode1.linkedNodes = startingSegNode1Node1UpdatedLinkedNodes;
        startingSegNode2.linkedNodes = startingSegNode2UpdatedLinkedNodes;


        this.nodes[newSegNode1.id] = newSegNode1;
        this.nodes[newSegNode2.id] = newSegNode2;

        this.setSegs();
        
        const sortedNodesIds = [newSegNode1.id, newSegNode2.id].sort();

        return [this.segs[sortedNodesIds[0] + sortedNodesIds[1]], newSegNode2];
    }

    addSegFromNode(startingNode:SegNode, endingNodePosition:Vector2D):[Seg, SegNode]{
        const endingNode = this.createNode(v4(), endingNodePosition, [startingNode]);
        startingNode.linkedNodes.push(endingNode);
        this.nodes[endingNode.id] = endingNode;
        this.setSegs();
        const sortedNodesIds = [startingNode.id, endingNode.id].sort();
        return [this.segs[sortedNodesIds[0] + sortedNodesIds[1]], endingNode];
    }

    addSegFromVoid(startingNodePosition:Vector2D, endingNodePosition:Vector2D):[Seg, SegNode]{
        const startingNode = this.createNode(v4(), startingNodePosition, []);
        const endingNode = this.createNode(v4(), endingNodePosition, [startingNode]);
        startingNode.linkedNodes.push(endingNode);
        this.nodes[startingNode.id] = startingNode;
        this.nodes[endingNode.id] = endingNode;
        this.setSegs();
        const sortedNodesIds = [startingNode.id, endingNode.id].sort();
        return [this.segs[sortedNodesIds[0] + sortedNodesIds[1]], endingNode];
    }
    getNodeOrSegPenetratedByPoint(p:Vector2D, penetratingNode:SegNode):SegNode | Seg | null{

        //must be ignored : linked nodes, linked nodes of linked nodes, and segs joigning these nodes.
        const nodeIdsToIgnore:{[nodeId:string]:boolean;} = {};
        const linkedNodesOfPenetratingNode:{[nodeId:string]:boolean;} = {};

        for(const n1 of penetratingNode.linkedNodes){
            nodeIdsToIgnore[n1.id] = true;
            linkedNodesOfPenetratingNode[n1.id] = true;
            for(const n2 of n1.linkedNodes){
                nodeIdsToIgnore[n2.id] = true;
            }
        }
    
        const visitedNodes: {[nodeId:string]:boolean;} = {};

        for(const segId in this.segs){
            const seg = this.segs[segId];

            //check nodes
            const node1 = seg.nodes[0];
            const node2 = seg.nodes[1];

            if(!nodeIdsToIgnore.hasOwnProperty(node1.id) && !visitedNodes.hasOwnProperty(node1.id)){
                if(getDistance(node1.position, p) < NODE_RADIUS) return node1;
                visitedNodes[node1.id] = true;
            }
            if(!nodeIdsToIgnore.hasOwnProperty(node2.id) && !visitedNodes.hasOwnProperty(node2.id)){
                if(getDistance(node2.position, p) < NODE_RADIUS) return node2;
                visitedNodes[node2.id] = true;
            }
            //check seg
            if(
                (
                    nodeIdsToIgnore.hasOwnProperty(seg.nodes[0].id) 
                    && nodeIdsToIgnore.hasOwnProperty(seg.nodes[1].id)
                ) 
                &&
                (
                    linkedNodesOfPenetratingNode.hasOwnProperty(seg.nodes[0].id) 
                    || linkedNodesOfPenetratingNode.hasOwnProperty(seg.nodes[1].id)
                )
            ) continue;

            if(isPointInPolygon(p, seg.points)){
                return seg;
            }
            
        }
        return null;
    }

    joinNodes(node1:SegNode, node2:SegNode){
        // const segsFromNode2AndItsLinkedNodes:Seg[] = [];

        for(const linkedNode of node2.linkedNodes){
            node1.linkedNodes.push(linkedNode); //no need to check if already has linkedNode it's theorically impossible
            linkedNode.linkedNodes.push(node1);

            const linkedNodeNode2Idx = linkedNode.linkedNodes.findIndex((node) => node.id === node2.id);
            linkedNode.linkedNodes.splice(linkedNodeNode2Idx, 1);


            //the reaffectation of seg ids is done in setSegs(), but if we don't do this before setSegs(),
            //there will be a problem with data binded to seg like numero
            //because setSegs depends on segs ids, which depends on node ids
            //yet we change nodes and then node ids here so we need to make a temporary fix
            //before the calling of setSegs()

            const sortedNode2LinkedNodeIds = [linkedNode.id, node2.id].sort();
            const concatSortedNode2LinkedNodeIds = sortedNode2LinkedNodeIds[0] + sortedNode2LinkedNodeIds[1];

            const segFromNode2AndItsLinkedNode = this.segs[concatSortedNode2LinkedNodeIds];

            const sortedNode1LinkedNodeIds = [linkedNode.id, node1.id].sort();
            const concatSortedNode1LinkedNodeIds = sortedNode1LinkedNodeIds[0] + sortedNode1LinkedNodeIds[1];

            segFromNode2AndItsLinkedNode.id = concatSortedNode1LinkedNodeIds;

            this.segs[concatSortedNode1LinkedNodeIds] = segFromNode2AndItsLinkedNode;

            delete this.segs[concatSortedNode2LinkedNodeIds];
        }

        delete this.nodes[node2.id];

        this.setSegs();
    }

    joinDraggedNodeAndCreatedNodeOnSeg(node:SegNode, seg:Seg){
        const segNode1 = seg.nodes[0];
        const segNode2 = seg.nodes[1];

        node.linkedNodes.push(segNode1); //no need to check if already has segNode1 it's theorically impossible
        node.linkedNodes.push(segNode2); //no need to check if already has segNode2 it's theorically impossible
        segNode1.linkedNodes.push(node); //no need to check if already has node it's theorically impossible
        segNode2.linkedNodes.push(node); //no need to check if already has node it's theorically impossible

        const linkedNodeSegNode2Idx = segNode1.linkedNodes.findIndex((node) => node.id === segNode2.id);
        segNode1.linkedNodes.splice(linkedNodeSegNode2Idx, 1);
        const linkedNodeSegNode1Idx = segNode2.linkedNodes.findIndex((node) => node.id === segNode1.id);
        segNode2.linkedNodes.splice(linkedNodeSegNode1Idx, 1);

        this.setSegs();
    }

    createJointSegs(nodes: {[nodeId: string]: SegNode;}):JointSegs{
        return new JointWalls(nodes);
    }
    // createJointSegs(nodes: {[nodeId: string]: SegNode;}):JointSegs{
    //     switch(this.instantiatedClassName){
    //         case(JointSegsClassName.JointREPs):{
    //             return new JointREPs(nodes);
    //         }
    //         case(JointSegsClassName.JointREUs):{
    //             return new JointREUs(nodes);
    //         }
    //         default:{
    //             return new JointWalls(nodes);
    //         }
    //     }
    // }
    unselect(){
        // this.setSelected(false);
        this.unselectSeg();
    }

    // updateNameTextPositionAndAngle(nodePositionBeforeMove:Vector2D, node:SegNode){
    //     for(const segId in this.segs){
    //         const seg = this.segs[segId];
    //         if(!seg.hasNode(node.id)) continue;
    //         let angle = radiansToDegrees(calculateAngle(seg.nodes[0].position, seg.nodes[1].position));  
    //         seg.nameTextRotation = angle > 90 && angle < 270 ? angle + 180 : angle;

    //         const nodeIdx = seg.getNodeIndex(node.id) ;
    //         const otherNodeIdx = nodeIdx === 0 ? 1 : 0;
    //         if(nodeIdx === -1) continue; //should throw error

    //         const orthogonalProjection = getOrthogonalProjection(nodePositionBeforeMove, seg.nodes[otherNodeIdx].position,  seg.nameTextPosition);
    //         const d = getDistance(orthogonalProjection, seg.nameTextPosition);

    //         // const distanceTextNodeBeforeNodeMove = getDistance(orthogonalProjection, seg.nameTextPosition);

    //         let segLengthBeforeNodeMove = getDistance(nodePositionBeforeMove, seg.nodes[otherNodeIdx].position);
    //         if(segLengthBeforeNodeMove===0) segLengthBeforeNodeMove = 1;
    //         const node1OrthogonalProjectionDistanceBeforeNodeMove = getDistance(nodePositionBeforeMove, orthogonalProjection);

    //         const node1OrthogonalProjectionDistanceRatioBeforeNodeMove = node1OrthogonalProjectionDistanceBeforeNodeMove / segLengthBeforeNodeMove;
    //         // console.log("node1OrthogonalProjectionDistanceRatioBeforeNodeMove",node1OrthogonalProjectionDistanceRatioBeforeNodeMove)
    //         // if(!node1OrthogonalProjectionDistanceRatioBeforeNodeMove) node1OrthogonalProjectionDistanceRatioBeforeNodeMove = Infinity;
    //         // console.log("afterr node1OrthogonalProjectionDistanceRatioBeforeNodeMove",node1OrthogonalProjectionDistanceRatioBeforeNodeMove)

    //         const segLengthAfterNodeMove = getDistance(seg.nodes[0].position, seg.nodes[1].position);
    //         const calculatedRatioOnSegLengthAfterNodeMoveLength = segLengthAfterNodeMove * node1OrthogonalProjectionDistanceRatioBeforeNodeMove;
    //         // console.log("calculatedRatioOnSegLengthAfterNodeMoveLength",calculatedRatioOnSegLengthAfterNodeMoveLength);

    //         const p = getPositionOnSegment({p1:seg.nodes[nodeIdx].position, p2:seg.nodes[otherNodeIdx].position}, seg.nodes[nodeIdx].position, calculatedRatioOnSegLengthAfterNodeMoveLength);
            
    //         if(!p) continue; //should throw error

    //         const orthogonalPoints = getOrthogonalPoints({p1:seg.nodes[0].position, p2:seg.nodes[1].position}, p, d);

    //         const newTextPosition = getDistance(orthogonalPoints[0], seg.nameTextPosition) < getDistance(orthogonalPoints[1], seg.nameTextPosition) ? 
    //             orthogonalPoints[0] : orthogonalPoints[1];
            
    //         seg.nameTextPosition = newTextPosition;
    //     }
    // }


    updateAllNameTextPositionsAndAngles(jointSegsBeforeMove:JointSegs, jointSegsAfterMove:JointSegs){
        for(const segId in jointSegsBeforeMove.segs){
            const prevSeg = jointSegsBeforeMove.segs[segId];
            const nextSeg = jointSegsAfterMove.segs[segId];

            //calculating angle
            let angle = radiansToDegrees(calculateAngle(nextSeg.nodes[0].position, nextSeg.nodes[1].position));  
            nextSeg.nameTextRotation = angle > 90 && angle < 270 ? angle + 180 : angle;  

            //calculating position
            
            const orthogonalProjectionBeforeMove = getOrthogonalProjection(prevSeg.nodes[0].position, prevSeg.nodes[1].position, prevSeg.nameTextPosition);
            const dBeforeMove = getDistance(orthogonalProjectionBeforeMove, prevSeg.nameTextPosition);

            let prevSegLength = getDistance(prevSeg.nodes[0].position, prevSeg.nodes[1].position);
            if(prevSegLength===0) prevSegLength = 1; //to avoid division by zero
            const node1OrthogonalProjectionDistanceBeforeNodeMove = getDistance(prevSeg.nodes[0].position, orthogonalProjectionBeforeMove);
            const node1OrthogonalProjectionDistanceRatioBeforeNodeMove = node1OrthogonalProjectionDistanceBeforeNodeMove / prevSegLength;
            
            const nextSegLength = getDistance(nextSeg.nodes[0].position, nextSeg.nodes[1].position);
            const calculatedRatioOnSegLengthAfterNodeMoveLength = nextSegLength * node1OrthogonalProjectionDistanceRatioBeforeNodeMove;

            
            
            
            const pOnNextSeg = getPositionOnSegment({p1:nextSeg.nodes[0].position, p2:nextSeg.nodes[1].position}, nextSeg.nodes[0].position, calculatedRatioOnSegLengthAfterNodeMoveLength);
            
            if(!pOnNextSeg) continue; //should throw error

            const orthogonalPoints = getOrthogonalPoints({p1:nextSeg.nodes[0].position, p2:nextSeg.nodes[1].position}, pOnNextSeg, dBeforeMove);
        
            const newTextPosition = getDistance(orthogonalPoints[0], nextSeg.nameTextPosition) < getDistance(orthogonalPoints[1], nextSeg.nameTextPosition) ? 
            orthogonalPoints[0] : orthogonalPoints[1];

            nextSeg.nameTextPosition = newTextPosition;
        }



        // for(const segId in this.segs){
        //     const seg = this.segs[segId];
        //     if(!seg.hasNode(node.id)) continue;
        //     let angle = radiansToDegrees(calculateAngle(seg.nodes[0].position, seg.nodes[1].position));  
        //     seg.nameTextRotation = angle > 90 && angle < 270 ? angle + 180 : angle;

        //     const nodeIdx = seg.getNodeIndex(node.id) ;
        //     const otherNodeIdx = nodeIdx === 0 ? 1 : 0;
        //     if(nodeIdx === -1) continue; //should throw error

        //     const orthogonalProjection = getOrthogonalProjection(nodePositionBeforeMove, seg.nodes[otherNodeIdx].position,  seg.nameTextPosition);
        //     const d = getDistance(orthogonalProjection, seg.nameTextPosition);

        //     // const distanceTextNodeBeforeNodeMove = getDistance(orthogonalProjection, seg.nameTextPosition);

        //     let segLengthBeforeNodeMove = getDistance(nodePositionBeforeMove, seg.nodes[otherNodeIdx].position);
        //     if(segLengthBeforeNodeMove===0) segLengthBeforeNodeMove = 1;
        //     const node1OrthogonalProjectionDistanceBeforeNodeMove = getDistance(nodePositionBeforeMove, orthogonalProjection);

        //     const node1OrthogonalProjectionDistanceRatioBeforeNodeMove = node1OrthogonalProjectionDistanceBeforeNodeMove / segLengthBeforeNodeMove;
        //     // console.log("node1OrthogonalProjectionDistanceRatioBeforeNodeMove",node1OrthogonalProjectionDistanceRatioBeforeNodeMove)
        //     // if(!node1OrthogonalProjectionDistanceRatioBeforeNodeMove) node1OrthogonalProjectionDistanceRatioBeforeNodeMove = Infinity;
        //     // console.log("afterr node1OrthogonalProjectionDistanceRatioBeforeNodeMove",node1OrthogonalProjectionDistanceRatioBeforeNodeMove)

        //     const segLengthAfterNodeMove = getDistance(seg.nodes[0].position, seg.nodes[1].position);
        //     const calculatedRatioOnSegLengthAfterNodeMoveLength = segLengthAfterNodeMove * node1OrthogonalProjectionDistanceRatioBeforeNodeMove;
        //     // console.log("calculatedRatioOnSegLengthAfterNodeMoveLength",calculatedRatioOnSegLengthAfterNodeMoveLength);

        //     const p = getPositionOnSegment({p1:seg.nodes[nodeIdx].position, p2:seg.nodes[otherNodeIdx].position}, seg.nodes[nodeIdx].position, calculatedRatioOnSegLengthAfterNodeMoveLength);
            
        //     if(!p) continue; //should throw error

        //     const orthogonalPoints = getOrthogonalPoints({p1:seg.nodes[0].position, p2:seg.nodes[1].position}, p, d);

        //     const newTextPosition = getDistance(orthogonalPoints[0], seg.nameTextPosition) < getDistance(orthogonalPoints[1], seg.nameTextPosition) ? 
        //         orthogonalPoints[0] : orthogonalPoints[1];
            
        //     seg.nameTextPosition = newTextPosition;
        // }
    }

    clone():JointSegs{



        // nodes: {[nodeId: string]: SegNode;};
        // width: number = WALL_WIDTH;
        // color: string = "grey";
        // selectedSegNodesIds:[string, string][] = []; 


        const cloneNodes: {[nodeId: string]: SegNode;} = {};
        for(const nodeId in this.nodes){
            const nodeClone = this.nodes[nodeId].cloneWithoutLinkedNodes();
            cloneNodes[nodeId] = nodeClone;
        }

        //set linkedNodes for cloned nodes
        for(const nodeId in cloneNodes){
            const linkedNodesIds:string[] = this.nodes[nodeId].linkedNodes.map(node => node.id);
            for(const linkedNodeId of linkedNodesIds){
                cloneNodes[nodeId].linkedNodes.push(cloneNodes[linkedNodeId]);
            }
        }

        const cloneSegs: {[nodeId: string]: Seg;} = {};
        for(const segId in this.segs){
            const segToClone = this.segs[segId];
            const segClone = this.segs[segId].cloneWithoutNodes();
            segClone.nodes = [cloneNodes[segToClone.nodes[0].id], cloneNodes[segToClone.nodes[1].id]];
            cloneSegs[segId] = segClone;
        }

        const jwClone:JointSegs = this.createJointSegs(cloneNodes);
        jwClone.segs = cloneSegs;
        
        // for(const nodeIds of this.selectedSegNodesIds){
        //     jwClone.selectedSegNodesIds.push([nodeIds[0], nodeIds[1]]);
        // }

        jwClone.selectedSegId = this.selectedSegId;
        jwClone.nodesToPrint = this.nodesToPrint;
        return jwClone;
    }

    deleteSeg(segId:string){
        const seg = this.segs[segId];

        for(let i=0; i<seg.nodes.length; i++){
            const node = seg.nodes[i];
            const secondSegNode = seg.nodes[i == 0? 1 : 0];
            const linkedNodeSecondSegNodeIdx = node.linkedNodes.findIndex((n) => n.id === secondSegNode.id);
            node.linkedNodes.splice(linkedNodeSecondSegNodeIdx, 1);
            if(!node.linkedNodes.length){
                delete this.nodes[node.id];
            }
        }
        this.selectedSegId = null;
        this.cleanSegs(false);
    }
  }

export class JointWalls extends JointSegs {
    // public readonly NAME = JointSegsClassName.JointWalls;
    constructor(nodes:{ [nodeId: string]: SegNode;}){
        super(nodes);
        // this.instantiatedClassName = this.NAME;
    }

    override createSeg(nodes: [SegNode, SegNode]):Wall{
        return new Wall(nodes);
    }

    override createNode(id:string, position: Vector2D, linkedNodes:SegNode[]):SegNode{
        return new SegNode(id, position, linkedNodes, JointSegsClassName.JointWalls);
    }

    override createJointSegs(nodes: {[nodeId: string]: SegNode;}):JointSegs{
        return new JointWalls(nodes);
    }
}

export class JointREPs extends JointSegs {
    // public readonly NAME = JointSegsClassName.JointREPs;
    constructor(nodes:{ [nodeId: string]: SegNode;}){
        super(nodes);
        // this.instantiatedClassName = this.NAME;
    }

    override createSeg(nodes: [SegNode, SegNode]):REP{
        return new REP(nodes);
    }

    override createNode(id:string, position: Vector2D, linkedNodes:SegNode[]):SegNode{
        return new SegNode(id, position, linkedNodes, JointSegsClassName.JointREPs);
    }

    override createJointSegs(nodes: {[nodeId: string]: SegNode;}):JointREPs{
        return new JointREPs(nodes);
    }
}

export class JointREUs extends JointSegs {
    // public readonly NAME = JointSegsClassName.JointREUs;
    constructor(nodes:{ [nodeId: string]: SegNode;}){
        super(nodes);
        // this.instantiatedClassName = this.NAME;
    }

    override createSeg(nodes: [SegNode, SegNode]):REU{
        return new REU(nodes);
    }

    override createNode(id:string, position: Vector2D, linkedNodes:SegNode[]):SegNode{
        return new SegNode(id, position, linkedNodes, JointSegsClassName.JointREUs);
    }

    override createJointSegs(nodes: {[nodeId: string]: SegNode;}):JointREUs{
        return new JointREUs(nodes);
    }
}

export class JointAEPs extends JointSegs {
    constructor(nodes:{ [nodeId: string]: SegNode;}){
        super(nodes);
    }

    override createSeg(nodes: [SegNode, SegNode]):AEP{
        return new AEP(nodes);
    }

    override createNode(id:string, position: Vector2D, linkedNodes:SegNode[]):SegNode{
        return new SegNode(id, position, linkedNodes, JointSegsClassName.JointAEPs);
    }

    override createJointSegs(nodes: {[nodeId: string]: SegNode;}):JointAEPs{
        return new JointAEPs(nodes);
    }
}


export class JointGutters extends JointSegs {
    constructor(nodes:{ [nodeId: string]: SegNode;}){
        super(nodes);
    }

    override createSeg(nodes: [SegNode, SegNode]):Gutter{
        return new Gutter(nodes);
    }

    override createNode(id:string, position: Vector2D, linkedNodes:SegNode[]):SegNode{
        return new SegNode(id, position, linkedNodes, JointSegsClassName.JointGutters);
    }

    override createJointSegs(nodes: {[nodeId: string]: SegNode;}):JointGutters{
        return new JointGutters(nodes);
    }
}

export class JointPools extends JointSegs {
    constructor(nodes:{ [nodeId: string]: SegNode;}){
        super(nodes);
    }

    override createSeg(nodes: [SegNode, SegNode]):Pool{
        return new Pool(nodes);
    }

    override createNode(id:string, position: Vector2D, linkedNodes:SegNode[]):SegNode{
        return new SegNode(id, position, linkedNodes, JointSegsClassName.JointPools);
    }

    override createJointSegs(nodes: {[nodeId: string]: SegNode;}):JointPools{
        return new JointPools(nodes);
    }
}

export class JointRoadDrains extends JointSegs {
    constructor(nodes:{ [nodeId: string]: SegNode;}){
        super(nodes);
    }

    override createSeg(nodes: [SegNode, SegNode]):RoadDrain{
        return new RoadDrain(nodes);
    }

    override createNode(id:string, position: Vector2D, linkedNodes:SegNode[]):SegNode{
        return new SegNode(id, position, linkedNodes, JointSegsClassName.JointRoadDrains);
    }

    override createJointSegs(nodes: {[nodeId: string]: SegNode;}):JointRoadDrains{
        return new JointRoadDrains(nodes);
    }
}

export class JointAgrDrains extends JointSegs {
    constructor(nodes:{ [nodeId: string]: SegNode;}){
        super(nodes);
    }

    override createSeg(nodes: [SegNode, SegNode]):AgrDrain{
        return new AgrDrain(nodes);
    }

    override createNode(id:string, position: Vector2D, linkedNodes:SegNode[]):SegNode{
        return new SegNode(id, position, linkedNodes, JointSegsClassName.JointAgrDrains);
    }

    override createJointSegs(nodes: {[nodeId: string]: SegNode;}):JointAgrDrains{
        return new JointAgrDrains(nodes);
    }
}

export class SegNode {
    id: string;
    position: Position;
    linkedNodes: SegNode[];
    // segChildClassName: SegClassName;
    jointSegClassName: JointSegsClassName | undefined;
    // radius: number = WALL_WIDTH / 2;

    constructor(id:string, position:Position, linkedNodes:SegNode[], jointSegClassName?: JointSegsClassName){
        this.id = id;
        this.position = position;
        this.linkedNodes = linkedNodes;
        this.jointSegClassName = jointSegClassName;
    }

    // createSeg(nodes:[SegNode, SegNode]): Seg{
    //     switch(this.jointSegClassName){
    //         default:
    //             return new Wall(nodes);
    //     }
    // }

    // getSegmentsJoinedWithNode(){
    //     const segments: Seg[] = [];
    //     for(const linkedNode of this.linkedNodes){
    //         segments.push(this.createSeg([this, linkedNode]));
    //     }
    //     return segments;
    // }

    // getClockwiseSortedSegment(): Seg[]{
    //     const segments: Seg[] = this.getSegmentsJoinedWithNode();
    //     const angles: [Seg, number][] = [];

    //     for(const seg of segments){
    //         // console.log("seg.nodes[0].id = "+ seg.nodes[0].id +", seg.nodes[1].id = "+ seg.nodes[1].id)

    //         const p1: Position = seg.nodes[0].position;
    //         const p2: Position = seg.nodes[1].position;

    //         const p1p2Angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    //         angles.push([seg, p1p2Angle]);
    //         // console.log("node.id = "+ node.id +", p1p2Angle = "+p1p2Angle+"\n\n\n")

    //     }

    //     return angles.sort((v1, v2) => v1[1] - v2[1]).map(v => v[0]);
    // }

    getClockwiseSortedLinkedNodes(): SegNode[]{
        const angles: [SegNode, number][] = [];

        for(const linkedNode of this.linkedNodes){
            const p1: Position = this.position;
            const p2: Position = linkedNode.position;

            const p1p2Angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
            angles.push([linkedNode, p1p2Angle]);
        }
        return angles.sort((v1, v2) => v1[1] - v2[1]).map(v => v[0]);
    }

    cloneWithoutLinkedNodes():SegNode{
        // id: string;
        // position: Position;
        // linkedNodes: SegNode[];
        // radius: number = 20;
        return new SegNode(this.id, new Position(this.position.x, this.position.y), [], this.jointSegClassName);
    }
}

// type NameTextInfo = {
//     position:Vector2D;
//     visible:boolean;
// }

// interface NameTextInfoHolder {
//     nameTextInfo:NameTextInfo
//     getNameTextContent: ()=>string
// }

export abstract class SheetDataEditable {
    id:string="";
    elementNameForRendering:string = "";
    numero:string = "0";
    nameTextVisibility:boolean = false;
    nameTextPosition:Vector2D = {x:0, y:0};
    nameTextFontSize:number = NAME_TEXT_DEFAULT_FONT_SIZE;
    nameTextRotation:number = 0;

    constructor(id:string){
        this.id = id;
    }

    getRef():string{
        return this.elementNameForRendering+this.numero;
    }

    // getNameTextContent():string{
    //     return "";
    // }



}


export abstract class Seg extends SheetDataEditable{
    id: string;
    // instantiatedSegClassName: SegClassName | undefined;
    // numero: string = "";
    nodes: [SegNode, SegNode];
    sideline1Points: [Position, Position] = [new Position(0,0), new Position(0,0)];
    sideline2Points: [Position, Position] = [new Position(0,0), new Position(0,0)];
    points: Vector2D[] = [];
    width:number = 0;
    color:string = "";
    // nameTextInfo: NameTextInfo = {
    //     position: {x:0, y:0},
    //     visible: false
    // };


    constructor(nodes:[SegNode, SegNode]){
        const id = nodes[0].id + nodes[1].id;
        super(id);
        // this.nodes = nodes.sort((a, b) => { 
        //     const sortedIds = [a.id, b.id].sort();
        //     const aIdIndex = sortedIds.findIndex(id => id === a.id);
        //     const bIdIndex = sortedIds.findIndex(id => id === b.id);
        //     return aIdIndex - bIdIndex;
        // });
        this.nodes = nodes;
        this.id = id;
    }

    // getNameTextContent():string{
    //     return "";
    // };



    sortUUIDs(uuid1: string, uuid2: string): [string, string] {
        const sortedUUIDs = [uuid1, uuid2].sort();
        return [sortedUUIDs[0], sortedUUIDs[1]];
      }

    hasNode(nodeId:string):boolean{
        return this.nodes[0].id === nodeId || this.nodes[1].id === nodeId;
    }

    getNodeIndex(nodeId:string):number{
        return this.nodes.findIndex(node => node.id === nodeId);
    }

    setSidelinesPoints(){
        const p1 = this.nodes[0].position;
        const p2 = this.nodes[1].position;

        const sideLinePoints = calculateSidelinesPoints(p1, p2, this.width);
        
        
        // const p1p2Angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    
    
        // const p1p2AngleMinHalfPI = p1p2Angle - Math.PI/2;
        // let diff = p1p2AngleMinHalfPI;
        // diff += (diff>Math.PI) ? -Math.PI*2 : (diff<-Math.PI) ? Math.PI*2 : 0;
    
        // // console.log("diff = "+diff);
    
        // const d = this.width / 2;
        // const hyp = d;
        // const a = diff;
        // const adj = Math.cos(a) * hyp;
        // const opp = Math.sin(a) * hyp;
    
        // // console.log("adj = "+adj);
        // // console.log("opp = "+opp);
    
        // const sl1p1X = p1.x + adj; 
        // const sl1p1Y = p1.y + opp; 
    
        // const sl2p1X = p1.x - adj; 
        // const sl2p1Y = p1.y - opp; 
    
        // // console.log("node1 = "+this.nodes[0].id, ", node2 = "+this.nodes[1].id)
    
        // const sl1p1 = new Position(sl1p1X, sl1p1Y);
        // const sl2p1 = new Position(sl2p1X, sl2p1Y);
    
    
        // //l1s1p2 and l1s1p2 
    
        // const sl1p2X = p2.x + adj; 
        // const sl1p2Y = p2.y + opp; 
    
        // const sl2p2X = p2.x - adj; 
        // const sl2p2Y = p2.y - opp; 
    
    
        // const sl1p2 = new Position(sl1p2X, sl1p2Y);
        // const sl2p2 = new Position(sl2p2X, sl2p2Y);
        
        this.sideline1Points = sideLinePoints[0];
        this.sideline2Points = sideLinePoints[1];
    }

    createSeg():Seg{
        return new Wall(this.nodes); //will be overriden
    }

    cloneWithoutNodes():Seg{        
        const segmentClone = this.createSeg();
        segmentClone.id = this.id;
        segmentClone.numero = this.numero;
        segmentClone.elementNameForRendering = this.elementNameForRendering;
        segmentClone.nameTextVisibility = this.nameTextVisibility;
        segmentClone.nameTextPosition = {x:this.nameTextPosition.x, y:this.nameTextPosition.y};
        segmentClone.nameTextFontSize = this.nameTextFontSize;
        segmentClone.nameTextRotation = this.nameTextRotation;

        segmentClone.sideline1Points = [
            new Position(this.sideline1Points[0].x, this.sideline1Points[0].y),
            new Position(this.sideline1Points[1].x, this.sideline1Points[1].y),
        ];
        segmentClone.sideline2Points = [
            new Position(this.sideline2Points[0].x, this.sideline2Points[0].y),
            new Position(this.sideline2Points[1].x, this.sideline2Points[1].y),
        ];
        return segmentClone;
    }
}


export class Wall extends Seg{
    public readonly NAME:string = "Wall";
    public readonly NAME_FOR_RENDERING:string = "Mur";
    width: number = 30;
    color: string = "#000000";
    sinisterColor:string = "#7030A0"
    sinister: boolean = false;
    constructor(nodes:[SegNode, SegNode]){
        super(nodes);
        this.elementNameForRendering = this.NAME_FOR_RENDERING;
        this.setSidelinesPoints();
    }

    override createSeg():Wall{
        return new Wall(this.nodes);
    }

    cloneWithoutNodes():Wall{        
        const segmentClone = this.createSeg();
        segmentClone.id = this.id;
        segmentClone.numero = this.numero;
        segmentClone.elementNameForRendering = this.elementNameForRendering;
        segmentClone.nameTextVisibility = this.nameTextVisibility;
        segmentClone.nameTextPosition = {x:this.nameTextPosition.x, y:this.nameTextPosition.y};
        segmentClone.nameTextFontSize = this.nameTextFontSize;
        segmentClone.nameTextRotation = this.nameTextRotation;
        segmentClone.sinister = this.sinister;

        segmentClone.sideline1Points = [
            new Position(this.sideline1Points[0].x, this.sideline1Points[0].y),
            new Position(this.sideline1Points[1].x, this.sideline1Points[1].y),
        ];
        segmentClone.sideline2Points = [
            new Position(this.sideline2Points[0].x, this.sideline2Points[0].y),
            new Position(this.sideline2Points[1].x, this.sideline2Points[1].y),
        ];

        return segmentClone;
    }

}

export enum ResArrowStatus {None, Forwards, Backwards}

export abstract class Res extends Seg{
    // public readonly NAME:SegClassName = SegClassName.Wall;
    width: number = RES_WIDTH;
    arrowStatus: ResArrowStatus = ResArrowStatus.None;
    constructor(nodes:[SegNode, SegNode]){
        super(nodes);
        // this.instantiatedSegClassName = this.NAME;
        this.setSidelinesPoints();
    }

    override cloneWithoutNodes():Res{        
        const segmentClone:Res = this.createSeg() as Res;
        segmentClone.id = this.id;
        segmentClone.numero = this.numero;
        segmentClone.elementNameForRendering = this.elementNameForRendering;
        segmentClone.nameTextVisibility = this.nameTextVisibility;
        segmentClone.nameTextPosition = {x:this.nameTextPosition.x, y:this.nameTextPosition.y};
        segmentClone.nameTextFontSize = this.nameTextFontSize;
        segmentClone.nameTextRotation = this.nameTextRotation;

        segmentClone.arrowStatus = this.arrowStatus;

        segmentClone.sideline1Points = [
            new Position(this.sideline1Points[0].x, this.sideline1Points[0].y),
            new Position(this.sideline1Points[1].x, this.sideline1Points[1].y),
        ];
        segmentClone.sideline2Points = [
            new Position(this.sideline2Points[0].x, this.sideline2Points[0].y),
            new Position(this.sideline2Points[1].x, this.sideline2Points[1].y),
        ];
        return segmentClone;
    }
}

export class REP extends Res{
    public readonly NAME:string = "REP";
    public readonly NAME_FOR_RENDERING:string = "REP";
    color: string = "#00b050";
    constructor(nodes:[SegNode, SegNode]){
        super(nodes);
        this.elementNameForRendering = this.NAME_FOR_RENDERING;
        this.setSidelinesPoints();
    }

    override createSeg():REP{
        return new REP(this.nodes);
    }
}

export class REU extends Res{
    public readonly NAME:string = "REU";
    public readonly NAME_FOR_RENDERING:string = "REU";
    color: string = "#c65911";
    constructor(nodes:[SegNode, SegNode]){
        super(nodes);
        this.elementNameForRendering = this.NAME_FOR_RENDERING;
        this.setSidelinesPoints();
    }

    override createSeg():REU{
        return new REU(this.nodes);
    }
}

export class AEP extends Res{
    public readonly NAME:string = "AEP";
    public readonly NAME_FOR_RENDERING:string = "RAEP";
    color: string = "#00b0f0";
    constructor(nodes:[SegNode, SegNode]){
        super(nodes);
        this.elementNameForRendering = this.NAME_FOR_RENDERING;
        this.setSidelinesPoints();
    }

    override createSeg():AEP{
        return new AEP(this.nodes);
    }
}

export class Gutter extends Res{
    public readonly NAME:string = "Gutter";
    public readonly NAME_FOR_RENDERING:string = "G";
    color: string = "#00b050";
    constructor(nodes:[SegNode, SegNode]){
        super(nodes);
        this.elementNameForRendering = this.NAME_FOR_RENDERING;
        this.setSidelinesPoints();
    }

    override createSeg():Gutter{
        return new Gutter(this.nodes);
    }
}

export class Pool extends Res{
    public readonly NAME:string = "Pool";
    public readonly NAME_FOR_RENDERING:string = "RP";
    color: string = "#305496";
    constructor(nodes:[SegNode, SegNode]){
        super(nodes);
        this.elementNameForRendering = this.NAME_FOR_RENDERING;
        this.setSidelinesPoints();
    }

    override createSeg():Pool{
        return new Pool(this.nodes);
    }
}

export class RoadDrain extends Res{
    public readonly NAME:string = "RoadDrain";
    public readonly NAME_FOR_RENDERING:string = "DR";
    color: string = "#bfbfbf";
    constructor(nodes:[SegNode, SegNode]){
        super(nodes);
        this.elementNameForRendering = this.NAME_FOR_RENDERING;
        this.setSidelinesPoints();
    }

    override createSeg():RoadDrain{
        return new RoadDrain(this.nodes);
    }
}

export class AgrDrain extends Res{
    public readonly NAME:string = "AgrDrain";
    public readonly NAME_FOR_RENDERING:string = "DA";
    color: string = "#ffc000";
    constructor(nodes:[SegNode, SegNode]){
        super(nodes);
        this.elementNameForRendering = this.NAME_FOR_RENDERING;
        this.setSidelinesPoints();
    }

    override createSeg():AgrDrain{
        return new AgrDrain(this.nodes);
    }
}

export class TestPoint{
    id:string;
    x:number;
    y:number;
    color:string;

    constructor(id: string, x:number, y:number, color:string){
        this.id = id;
        this.x = x;
        this.y = y;
        this.color = color;
    } 
}

// export enum PlanElementSheetTypeName {Seg, REP};
export interface PlanElementSheetData{
    planElementId: string,
    segId: string | undefined,
    segNum:string
    resNum: string | undefined,
  }
  

export class AddSegSession{
    jointSegs:JointSegs;
    seg:Seg;
    draggingNode:SegNode;

    constructor(jointSegs:JointSegs, seg:Seg, draggingNode:SegNode){
        this.jointSegs = jointSegs;
        this.seg = seg;
        this.draggingNode = draggingNode;
    }
}

export interface linePoints {
    p1: Vector2D,
    p2: Vector2D,
}

export interface MagnetData{
    activeOnAxes: boolean,
    node:SegNode | null,
    seg: Seg | null,
    linePoints: linePoints | null,
}


// export enum SheetDataChildClassName {Seg, Wall, REP, REU};

export abstract class SheetData {
    // public readonly NAME: SheetDataChildClassName= SheetDataChildClassName.Seg;
    planElementId:string | undefined;
    constructor(planElementId?:string){
        this.planElementId = planElementId;
    }
}


export abstract class SheetDataSeg extends SheetData{
    // public readonly NAME: SheetDataChildClassName= SheetDataChildClassName.Seg;
    // instantiatedSegClassName:SheetDataChildClassName | undefined;
    segId: string | undefined;
    constructor(planElementId?:string, segId?: string){
        super(planElementId);
        this.segId = segId;
    }
}

export abstract class SheetDataRes extends SheetDataSeg{
    constructor(planElementId?:string, segId?: string){
        super(planElementId, segId);
    }
}

export class SheetDataWall extends SheetDataSeg {
    // public readonly NAME: SheetDataChildClassName= SheetDataChildClassName.Wall;
    constructor(planElementId?:string, segId?: string){
        super(planElementId, segId);
        // this.instantiatedSegClassName = this.NAME;
    }
}

export class SheetDataREP extends SheetDataRes {
    // public readonly NAME: SheetDataChildClassName= SheetDataChildClassName.REP;
    constructor(planElementId?:string, segId?: string){
        super(planElementId, segId);
        // this.instantiatedSegClassName = this.NAME;
    }
}

export class SheetDataREU extends SheetDataRes {
    // public readonly NAME: SheetDataChildClassName= SheetDataChildClassName.REU;
    constructor(planElementId?:string, segId?: string){
        super(planElementId, segId);
        // this.instantiatedSegClassName = this.NAME;
    }
}

export class SheetDataAEP extends SheetDataRes {
    // public readonly NAME: SheetDataChildClassName= SheetDataChildClassName.REU;
    constructor(planElementId?:string, segId?: string){
        super(planElementId, segId);
        // this.instantiatedSegClassName = this.NAME;
    }
}

export class SheetDataGutter extends SheetDataRes {
    // public readonly NAME: SheetDataChildClassName= SheetDataChildClassName.REU;
    constructor(planElementId?:string, segId?: string){
        super(planElementId, segId);
        // this.instantiatedSegClassName = this.NAME;
    }
}

export class SheetDataPool extends SheetDataRes {
    // public readonly NAME: SheetDataChildClassName= SheetDataChildClassName.REU;
    constructor(planElementId?:string, segId?: string){
        super(planElementId, segId);
        // this.instantiatedSegClassName = this.NAME;
    }
}

export class SheetDataRoadDrain extends SheetDataRes {
    // public readonly NAME: SheetDataChildClassName= SheetDataChildClassName.REU;
    constructor(planElementId?:string, segId?: string){
        super(planElementId, segId);
        // this.instantiatedSegClassName = this.NAME;
    }
}

export class SheetDataAgrDrain extends SheetDataRes {
    // public readonly NAME: SheetDataChildClassName= SheetDataChildClassName.REU;
    constructor(planElementId?:string, segId?: string){
        super(planElementId, segId);
        // this.instantiatedSegClassName = this.NAME;
    }
}

export type SegOnCreationData = {
    segClassName: SegClassName,
    numero: string,
    nameTextVisibility: boolean,
    resArrowStatus: ResArrowStatus,
    nameTextFontSize: number,
    nameTextRotation: number,
    sinister: boolean,
}

export type Size = {
    width: number,
    height: number,
}

export type CoordSize = {
    x1:number,
    y1:number,
    x2:number,
    y2:number,
}


export type AppDynamicProps = {
    planSize:Size,
    planPosition:Vector2D;
    planScale: number,
    leftMenuWidth: number
}




export abstract class Symbol {
    id:string;
    position:Vector2D;
    size:Size;
    
    constructor(id:string, position:Vector2D, size:Size){
        this.id = id;
        this.position = position;
        this.size = size;
    }
}

class A extends Symbol{
    public readonly NAME:string = "A";
    public readonly NAME_FOR_RENDERING:string = "Anomalie"; 
}

class DEP extends Symbol{
    public readonly NAME:string = "DEP";
    public readonly NAME_FOR_RENDERING:string = "Descente d'eau pluviale"; 
}

class RVEP extends Symbol{
    public readonly NAME:string = "RVEP";
    public readonly NAME_FOR_RENDERING:string = "Regard de visite d'eaux pluviales"; 
}

class RVEU extends Symbol{
    public readonly NAME:string = "RVEU";
    public readonly NAME_FOR_RENDERING:string = "Regard de visite d'eaux usées"; 
}

class RB extends Symbol{
    public readonly NAME:string = "RB";
    public readonly NAME_FOR_RENDERING:string = "Regard borgne"; 
}

class FS extends Symbol{
    public readonly NAME:string = "FS";
    public readonly NAME_FOR_RENDERING:string = "Fosse sceptique"; 
}

class CR extends Symbol{
    public readonly NAME:string = "CR";
    public readonly NAME_FOR_RENDERING:string = "Cuve récupération eau plvuiale"; 
}

class VAAEP extends Symbol{
    public readonly NAME:string = "VAAEP";
    public readonly NAME_FOR_RENDERING:string = "Vanne d'arrêt AEP"; 
}

class CAEP extends Symbol{
    public readonly NAME:string = "Compteur AEP";
    public readonly NAME_FOR_RENDERING:string = "Anomalie"; 
}

class Compass extends Symbol{
    public readonly NAME:string = "Compass";
    public readonly NAME_FOR_RENDERING:string = "Boussole"; 
}

class PoolSymbol extends Symbol{
    public readonly NAME:string = "Pool";
    public readonly NAME_FOR_RENDERING:string = "Piscine"; 
}

class Gate extends Symbol{
    public readonly NAME:string = "Gate";
    public readonly NAME_FOR_RENDERING:string = "Portail"; 
}

class Door extends Symbol{
    public readonly NAME:string = "Door";
    public readonly NAME_FOR_RENDERING:string = "Porte"; 
}

class ADJ extends Symbol{
    public readonly NAME:string = "ADJ";
    public readonly NAME_FOR_RENDERING:string = "Abri de jardin"; 
}