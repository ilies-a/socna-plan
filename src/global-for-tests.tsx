import { JointSegs, SegNode, PlanElement, Position, AllJointSegs } from "./entities";
import { v4 } from "uuid";


// const node1 = new SegNode(v4(), new Position(10, 10), []);
// const node2 = new SegNode(v4(), new Position(100, 100), []);
// const node3 = new SegNode(v4(), new Position(200, 150), []);
// const node4 = new SegNode(v4(), new Position(100, 300), []);
// const node5 = new SegNode(v4(), new Position(50, 400), []);
// const node6 = new SegNode(v4(), new Position(200, 350), []);
// const node7 = new SegNode(v4(), new Position(250, 150), []);
// const node8 = new SegNode(v4(), new Position(400, 50), []);


// node1.linkedNodes.push(node2);

// node2.linkedNodes.push(node1);
// node2.linkedNodes.push(node3);
// node2.linkedNodes.push(node4);
// node2.linkedNodes.push(node5);

// node3.linkedNodes.push(node2);
// node3.linkedNodes.push(node4);

// node4.linkedNodes.push(node2);
// node4.linkedNodes.push(node3);

// node4.linkedNodes.push(node6);
// node4.linkedNodes.push(node7);
// node4.linkedNodes.push(node8);

// node5.linkedNodes.push(node2);
// node6.linkedNodes.push(node4);

// node7.linkedNodes.push(node4);
// node8.linkedNodes.push(node4);


export const initialPlanElements: PlanElement[] = [
    new AllJointSegs(v4())
    // new JointSegs(
    //     v4(), {
    //         [node1.id]: node1,
    //         [node2.id]: node2,
    //         [node3.id]: node3,
            // [node4.id]: node4,
            // [node5.id]: node5,
            // [node6.id]: node6,
            // [node7.id]: node7,
            // [node8.id]: node8,
    //     })
    // line,
    // new Line(v4(), [new Point(50,50), new Point(300,50), new Point(400,300)], 25),
    // new Line(v4(), [new Point(500,500), new Point(600,510), new Point(700,530)], 25),

    // new Rectangle(v4(), 500, 110, 100, 100)
];
